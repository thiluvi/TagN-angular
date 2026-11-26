import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Valida CPF com base no algoritmo oficial da Receita Federal (dígitos verificadores).
   */
  static cpf(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const cleanCpf = String(value).replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      return { cpfInvalid: 'CPF deve conter 11 dígitos' };
    }

    // Impede sequências repetidas (ex: 00000000000, 11111111111...)
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return { cpfInvalid: 'CPF inválido (dígitos repetidos)' };
    }

    // Primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i), 10) * (10 - i);
    }
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.charAt(9), 10)) {
      return { cpfInvalid: 'CPF inválido' };
    }

    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i), 10) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.charAt(10), 10)) {
      return { cpfInvalid: 'CPF inválido' };
    }

    return null;
  }

  /**
   * Valida e-mail exigindo @ e domínio válido (ex: nome@dominio.com).
   */
  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(value).trim())) {
      return { emailInvalid: 'Insira um e-mail válido com @ e domínio (ex: usuario@email.com)' };
    }

    return null;
  }

  /**
   * Valida celular brasileiro com DDD (10 ou 11 dígitos).
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const cleanPhone = String(value).replace(/\D/g, '');

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { phoneInvalid: 'Celular deve ter DDD + 8 ou 9 dígitos' };
    }

    const ddd = parseInt(cleanPhone.substring(0, 2), 10);
    if (ddd < 11 || ddd > 99) {
      return { phoneInvalid: 'DDD inválido' };
    }

    return null;
  }

  /**
   * Valida se a data de nascimento é válida, não está no futuro e o usuário tem pelo menos 18 anos.
   */
  static birthDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const strValue = String(value).trim();
    let selectedDate: Date;

    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(strValue);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);
      selectedDate = new Date(year, month - 1, day);
      if (
        selectedDate.getFullYear() !== year ||
        selectedDate.getMonth() !== month - 1 ||
        selectedDate.getDate() !== day
      ) {
        return { birthDateInvalid: 'Data de nascimento inválida' };
      }
    } else {
      selectedDate = new Date(strValue);
      if (isNaN(selectedDate.getTime())) {
        return { birthDateInvalid: 'Data de nascimento inválida' };
      }
    }

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (selectedDate > todayEnd) {
      return { birthDateInvalid: 'Data de nascimento não pode ser futura' };
    }

    const minDate = new Date(1900, 0, 1);
    if (selectedDate < minDate) {
      return { birthDateInvalid: 'Data de nascimento fora do intervalo válido' };
    }

    const maxAdultDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    if (selectedDate > maxAdultDate) {
      return { birthDateInvalid: 'É necessário ter pelo menos 18 anos para se cadastrar' };
    }

    return null;
  }

  /**
   * Validador de igualdade para confirmação de senha.
   */
  static matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const targetControl = control.parent.get(matchTo);
      if (!targetControl) return null;

      return control.value === targetControl.value ? null : { mismatch: 'As senhas não coincidem' };
    };
  }

  /**
   * Valida código de recuperação de senha com exatamente 6 dígitos numéricos.
   */
  static resetCode(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const clean = String(value).trim();
    if (!/^\d{6}$/.test(clean)) {
      return { codeInvalid: 'O código deve conter exatamente 6 números' };
    }

    return null;
  }

  /**
   * Formata CPF em tempo real (000.000.000-00).
   */
  static formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  /**
   * Formata telefone/celular em tempo real ((00) 00000-0000).
   */
  static formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
}