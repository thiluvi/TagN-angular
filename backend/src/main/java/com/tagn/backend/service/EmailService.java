package com.tagn.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Service
public class EmailService {

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:TagN Odonto <onboarding@resend.dev>}")
    private String fromEmail;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void sendPasswordResetCode(String toEmail, String recipientName, String code) {
        log.info("🔐 [RESET CODE] Código de recuperação gerado para {}: {}", toEmail, code);

        if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.startsWith("re_placeholder")) {
            log.warn("⚠️ RESEND_API_KEY não configurada ou placeholder no .env. Use o código exibido no log acima para testes.");
            return;
        }

        try {
            String subject = "Código de Recuperação de Senha - TagN Odonto";
            String htmlContent = buildResetEmailHtml(recipientName, code);

            String bodyJson = """
                    {
                      "from": "%s",
                      "to": ["%s"],
                      "subject": "%s",
                      "html": %s
                    }
                    """.formatted(
                    escapeJson(fromEmail),
                    escapeJson(toEmail),
                    escapeJson(subject),
                    escapeJsonStringAsJson(htmlContent)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("✅ E-mail de recuperação enviado com sucesso via Resend para {}", toEmail);
            } else {
                log.error("❌ Falha ao enviar e-mail via Resend. Status: {}, Resposta: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("❌ Erro inesperado ao tentar disparar e-mail via Resend: {}", e.getMessage(), e);
        }
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    private String escapeJsonStringAsJson(String raw) {
        return "\"" + escapeJson(raw) + "\"";
    }

    private String buildResetEmailHtml(String name, String code) {
        String displayName = (name != null && !name.isBlank()) ? name : "Paciente";
        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fbf8f5; margin: 0; padding: 24px; color: #57413a; }
                    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #dccfc6; border-radius: 8px; padding: 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
                    .header { text-align: center; border-bottom: 1px solid #f3ece6; padding-bottom: 20px; }
                    .title { font-size: 22px; font-weight: 600; color: #755b53; margin: 0; }
                    .subtitle { font-size: 13px; color: #88736b; margin-top: 4px; }
                    .content { padding: 24px 0; font-size: 14px; line-height: 1.6; color: #57413a; }
                    .code-box { background-color: #f3ece6; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0; }
                    .code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #755b53; }
                    .footer { font-size: 12px; color: #957c73; text-align: center; border-top: 1px solid #f3ece6; padding-top: 16px; margin-top: 24px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1 class="title">TagN Odonto e Harmonização</h1>
                      <div class="subtitle">Drª. Marcela Medeiros</div>
                    </div>
                    <div class="content">
                      <p>Olá, <strong>%s</strong>!</p>
                      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Use o código de 6 dígitos abaixo para continuar:</p>
                      <div class="code-box">
                        <span class="code">%s</span>
                      </div>
                      <p>Este código expira em <strong>15 minutos</strong>. Se você não fez essa solicitação, por favor desconsidere este e-mail.</p>
                    </div>
                    <div class="footer">
                      Cuidado que respeita quem você é.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(displayName, code);
    }
}
