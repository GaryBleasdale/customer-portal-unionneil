import { describe, it, expect } from 'vitest';
import { validateCPF } from '../validations';

describe('validateCPF', () => {
  it('should return formatted CPF when valid', () => {
    const validCPF = '39635726040';
    const result = validateCPF(validCPF);
    expect(result).toBe('396.357.260-40');
  });

  it('should return false for invalid CPF', () => {
    const invalidCPF = '12345678900';
    const result = validateCPF(invalidCPF);
    expect(result).toBe(false);
  });

  it('should handle CPF with formatting', () => {
    const formattedCPF = '156.128.640-00';
    const result = validateCPF(formattedCPF);
    expect(result).toBe('156.128.640-00');
  });
});
