# 🦷 TagN Odonto e Harmonização — Drª. Marcela Medeiros

Sistema web completo para a clínica odontológica e estética **TagN**, composto por um **Frontend em Angular** moderno e um **Backend em Spring Boot (Java 25)** conectado ao **Supabase PostgreSQL** com autenticação JWT e recuperação de senha via **Resend**.

---

## 🏗️ Arquitetura do Projeto

```
TagN angular/
├── TagN/                # Frontend (Angular 20+, Standalone Components, Signals, SCSS)
├── backend/             # Backend (Spring Boot 4, Java 25, Spring Security, JWT, JPA)
│   ├── .env             # Variáveis de ambiente locais (não comitar no Git!)
│   ├── .env.example     # Modelo de variáveis de ambiente
│   └── pom.xml
└── README.md
```

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado na sua máquina:

1. **Java JDK 25** (ou JDK 21 LTS caso sua máquina ainda não suporte Java 25).
   - Verifique com: `java -version`
2. **Node.js** (versão 20 LTS ou superior) e **npm**.
   - Verifique com: `node -v` e `npm -v`
3. **Git** para versionamento.

---

## ⚙️ 1. Configuração do Backend (Primeira Execução)

O backend depende de credenciais de banco e serviços externos configurados em um arquivo `.env` dentro da pasta `backend/`.

1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie ou edite o arquivo `.env` (você pode copiar o modelo de `.env.example`):
   ```env
   # ── Supabase PostgreSQL ──────────────────────────────────────────────────
   SUPABASE_HOST=db.tkxrktltgmukcmctrkmh.supabase.co
   SUPABASE_PORT=5432
   SUPABASE_DB=postgres
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=SuaSenhaDoBancoAqui

   # ── JWT Security ─────────────────────────────────────────────────────────
   JWT_SECRET=tagn-super-secret-key-change-in-production-must-be-32-chars

   # ── Resend E-mail (Recuperação de Senha) ──────────────────────────────────
   # Obtenha uma chave gratuita em https://resend.com/api-keys
   RESEND_API_KEY=re_sua_chave_aqui
   RESEND_FROM_EMAIL=TagN Odonto <onboarding@resend.dev>
   ```

> [!NOTE]
> Enquanto a chave da Resend não for configurada ou se estiver em modo de teste, o backend **sempre imprimirá o código de 6 dígitos diretamente no terminal** com o emoji 🔐 para facilitar os testes da equipe.

---

## 🚀 2. Como Iniciar a Aplicação

Para rodar o projeto, você precisará de **dois terminais abertos**: um para o Backend e outro para o Frontend.

### Terminal 1: Backend (Spring Boot)

#### Opção A — Pelo Terminal (Recomendado para todos):

* **No Windows (PowerShell):**
  ```powershell
  cd backend

  # Carrega as variáveis do .env na sessão atual:
  Get-Content .env | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object { $k, $v = $_ -split "=", 2; [System.Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), "Process") }

  # Inicia o servidor Spring Boot:
  .\mvnw.cmd spring-boot:run
  ```

* **No Linux / macOS (Bash/Zsh):**
  ```bash
  cd backend
  export $(cat .env | xargs)
  ./mvnw spring-boot:run
  ```

O backend estará ativo em: **`http://localhost:8080`**  
*(Teste de saúde: `http://localhost:8080/api/health` deve responder `{"status":"UP"}`)*.

---

#### Opção B — Pelo botão "Play" da IDE (IntelliJ IDEA):

Por padrão, a IDE não carrega arquivos `.env` automaticamente. Para rodar direto pelo `BackendApplication.java`:
1. Instale o plugin **EnvFile** (*Settings → Plugins → Marketplace → busque por "EnvFile"*).
2. Na barra superior, clique na configuração de execução do `BackendApplication` → **Edit Configurations...**.
3. Na aba **EnvFile**, marque a opção **Enable EnvFile**.
4. Clique no ícone `+` e selecione o arquivo `backend/.env`.
5. Agora basta clicar no botão verde de **Play** ou **Debug**!

---

### Terminal 2: Frontend (Angular)

1. Abra um segundo terminal e acesse a pasta `TagN`:
   ```bash
   cd TagN
   ```
2. Instale as dependências (necessário apenas na primeira vez):
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

O frontend estará disponível no navegador em: **`http://localhost:4200`**

---

## 🧪 3. Como Testar as Funcionalidades

### A. Cadastro de Paciente:
- Acesse `http://localhost:4200` e clique no ícone de perfil no topo à direita.
- Selecione **Criar conta**.
- Preencha os campos com validações ativas:
  - **Nome completo**: mínimo 3 caracteres.
  - **E-mail**: exige formato com `@` e domínio válido.
  - **Celular**: máscara automática `(XX) 9XXXX-XXXX`.
  - **CPF**: algoritmo da Receita Federal (dígitos verificadores válidos).
  - **Senha e Confirmação**: mínimo 6 dígitos e conferência em tempo real.
- Ao salvar, uma **caixa verde de sucesso** será exibida e você será redirecionado para a aba de **Login** com o e-mail preenchido!

### B. Recuperação de Senha ("Esqueci minha senha"):
1. No modal de Login, clique em **Esqueci minha senha**.
2. Digite o e-mail cadastrado e clique em **Enviar Código de Recuperação**.
3. Verifique o código de 6 dígitos:
   - **No seu e-mail** (se cadastrado na sua conta Resend); OU
   - **No terminal do Backend**, onde aparecerá a linha:
     ```text
     🔐 [RESET CODE] Código de recuperação gerado para usuario@email.com: 123456
     ```
4. Digite os 6 números no campo centralizado do modal, defina a nova senha e confirme.
5. Pronto! Senha redefinida no Supabase e retorno para o Login.

### C. Agendamento de Consultas:
- Acesse `/agendamento` ou clique no botão de consulta da página inicial.
- Se não estiver logado, o sistema solicita autenticação.
- Se autenticado, selecione o serviço (*Odontologia* ou *Harmonização*), data, horário e observações.
- As consultas ficam listadas no painel lateral em tempo real.

---

## 🛠️ Comandos Úteis

### Frontend (`TagN/`):
```bash
# Rodar todos os testes unitários (Vitest / Angular build):
npm test -- --watch=false

# Gerar build de produção otimizado:
npm run build
```

### Backend (`backend/`):
```bash
# Compilar e validar tipos sem subir o servidor:
.\mvnw.cmd compile
```

---

## 📌 Endpoints da API REST (Backend)

| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Pública | Status da API |
| `POST` | `/api/auth/register` | Pública | Cadastro de novo paciente |
| `POST` | `/api/auth/login` | Pública | Autenticação JWT |
| `POST` | `/api/auth/forgot-password` | Pública | Solicitação de código de 6 dígitos |
| `POST` | `/api/auth/reset-password` | Pública | Validação do código e troca de senha |
| `GET` | `/api/users/me` | Bearer Token | Dados do paciente logado |
| `POST` | `/api/appointments` | Bearer Token | Criar novo agendamento |
| `GET` | `/api/appointments/me` | Bearer Token | Listar agendamentos do paciente |
