import { isEmail, isStrongPassword } from 'validator';

export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!isEmail(value)) return 'Invalid email address';
  return true;
};

export const passwordRules = {
  minLength: 8,
  maxLength: 64,
  requireNumbers: true,
  requireUppercase: true,
  requireSymbols: true
};

export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (
    !isStrongPassword(value, {
      minLength: passwordRules.minLength,
      minNumbers: passwordRules.requireNumbers ? 1 : 0,
      minUppercase: passwordRules.requireUppercase ? 1 : 0,
      minSymbols: passwordRules.requireSymbols ? 1 : 0
    })
  ) {
    return 'Password must include uppercase, number, and symbol';
  }
  return true;
};

export const validateRequired = (value, label = 'Field') => {
  if (!value) return `${label} is required`;
  if (typeof value === 'string' && !value.trim()) return `${label} cannot be empty`;
  return true;
};

export const validateDateRange = (start, end) => {
  if (!start || !end) return 'Both start and end dates are required';
  if (new Date(start) > new Date(end)) return 'Start date must be before end date';
  return true;
};

export const validationMessages = {
  required: 'Please fill out this field',
  invalidEmail: 'Please enter a valid email address',
  invalidPassword: 'Password does not meet requirements'
};
