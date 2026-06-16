import { sanitizePlainText } from './todoValidation.js';

export const EMAIL_MAX_LENGTH = 120;
export const PASSWORD_MAX_LENGTH = 128;

export function prepareEmail(email) {
  const sanitizedEmail = sanitizePlainText(email).toLowerCase();

  if (!sanitizedEmail) {
    return { email: '', error: 'Enter your email address.' };
  }

  if (sanitizedEmail.length > EMAIL_MAX_LENGTH) {
    return { email: '', error: `Keep email under ${EMAIL_MAX_LENGTH} characters.` };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    return { email: '', error: 'Enter a valid email address.' };
  }

  return { email: sanitizedEmail, error: '' };
}

export function getPasswordError(password) {
  if (!password) {
    return 'Enter your password.';
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Keep password under ${PASSWORD_MAX_LENGTH} characters.`;
  }

  return '';
}
