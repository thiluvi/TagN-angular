import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('CPF Validator', () => {
    it('should validate a valid CPF', () => {
      // CPF válido gerado para testes (ex: 52998224725)
      const control = new FormControl('529.982.247-25');
      expect(CustomValidators.cpf(control)).toBeNull();
    });

    it('should reject CPF with less than 11 digits', () => {
      const control = new FormControl('123.456.78');
      expect(CustomValidators.cpf(control)).toEqual({ cpfInvalid: 'CPF deve conter 11 dígitos' });
    });

    it('should reject CPF with all repeated digits', () => {
      const control = new FormControl('111.111.111-11');
      expect(CustomValidators.cpf(control)).toEqual({ cpfInvalid: 'CPF inválido (dígitos repetidos)' });
    });

    it('should reject CPF with invalid check digits', () => {
      const control = new FormControl('123.456.789-00');
      expect(CustomValidators.cpf(control)).toEqual({ cpfInvalid: 'CPF inválido' });
    });
  });

  describe('Email Validator', () => {
    it('should validate a valid email address with @ and domain', () => {
      const control = new FormControl('paciente@clinica.com.br');
      expect(CustomValidators.email(control)).toBeNull();
    });

    it('should reject email without @', () => {
      const control = new FormControl('pacienteclinica.com');
      expect(CustomValidators.email(control)).toBeTruthy();
    });

    it('should reject email without domain', () => {
      const control = new FormControl('paciente@');
      expect(CustomValidators.email(control)).toBeTruthy();
    });
  });

  describe('Phone Validator', () => {
    it('should validate 11-digit mobile phone with DDD', () => {
      const control = new FormControl('(11) 98765-4321');
      expect(CustomValidators.phone(control)).toBeNull();
    });

    it('should validate 10-digit landline with DDD', () => {
      const control = new FormControl('(11) 3456-7890');
      expect(CustomValidators.phone(control)).toBeNull();
    });

    it('should reject phone with insufficient digits', () => {
      const control = new FormControl('98765-4321');
      expect(CustomValidators.phone(control)).toEqual({ phoneInvalid: 'Celular deve ter DDD + 8 ou 9 dígitos' });
    });

    it('should reject phone with invalid DDD', () => {
      const control = new FormControl('(05) 98765-4321');
      expect(CustomValidators.phone(control)).toEqual({ phoneInvalid: 'DDD inválido' });
    });
  });

  describe('BirthDate Validator', () => {
    it('should accept a valid past birth date', () => {
      const control = new FormControl('1990-05-15');
      expect(CustomValidators.birthDate(control)).toBeNull();
    });

    it('should reject a future birth date', () => {
      const control = new FormControl('2099-01-01');
      expect(CustomValidators.birthDate(control)).toEqual({
        birthDateInvalid: 'Data de nascimento não pode ser futura',
      });
    });
  });

  describe('MatchValues Validator', () => {
    it('should pass when password and confirmation match', () => {
      const group = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('secret123', [CustomValidators.matchValues('password')]),
      });
      group.get('confirmPassword')?.updateValueAndValidity();

      expect(group.get('confirmPassword')?.errors).toBeNull();
    });

    it('should fail when password and confirmation do not match', () => {
      const group = new FormGroup({
        password: new FormControl('secret123'),
        confirmPassword: new FormControl('different', [CustomValidators.matchValues('password')]),
      });
      group.get('confirmPassword')?.updateValueAndValidity();

      expect(group.get('confirmPassword')?.errors).toEqual({
        mismatch: 'As senhas não coincidem',
      });
    });
  });

  describe('Formatters', () => {
    it('should format CPF correctly', () => {
      expect(CustomValidators.formatCpf('12345678901')).toBe('123.456.789-01');
    });

    it('should format phone correctly', () => {
      expect(CustomValidators.formatPhone('11987654321')).toBe('(11) 98765-4321');
    });
  });

  describe('ResetCode Validator', () => {
    it('should validate 6-digit numeric code', () => {
      const control = new FormControl('123456');
      expect(CustomValidators.resetCode(control)).toBeNull();
    });

    it('should reject code with less than 6 digits', () => {
      const control = new FormControl('12345');
      expect(CustomValidators.resetCode(control)).toEqual({
        codeInvalid: 'O código deve conter exatamente 6 números',
      });
    });

    it('should reject non-numeric code', () => {
      const control = new FormControl('12A456');
      expect(CustomValidators.resetCode(control)).toEqual({
        codeInvalid: 'O código deve conter exatamente 6 números',
      });
    });
  });
});
