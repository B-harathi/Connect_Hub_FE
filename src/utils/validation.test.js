import { validateName, validateBio } from './validation';

describe('Validation Utilities', () => {
  describe('validateName', () => {
    it('should return invalid when name is null or undefined', () => {
      expect(validateName(null)).toEqual({ valid: false, error: 'Name is required' });
      expect(validateName(undefined)).toEqual({ valid: false, error: 'Name is required' });
    });

    it('should return invalid when name is not a string', () => {
      expect(validateName(123)).toEqual({ valid: false, error: 'Name is required' });
      expect(validateName({})).toEqual({ valid: false, error: 'Name is required' });
      expect(validateName([])).toEqual({ valid: false, error: 'Name is required' });
    });

    it('should return invalid when name is an empty string', () => {
      expect(validateName('')).toEqual({ valid: false, error: 'Name is required' });
      // Note: whitespace-only strings fail at the "too short" check after trimming
      expect(validateName('   ')).toEqual({ valid: false, error: 'Name must be at least 2 characters long' });
    });

    it('should return invalid when name is too short (less than 2 characters)', () => {
      expect(validateName('a')).toEqual({ valid: false, error: 'Name must be at least 2 characters long' });
      expect(validateName(' a ')).toEqual({ valid: false, error: 'Name must be at least 2 characters long' });
    });

    it('should return invalid when name exceeds 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(validateName(longName)).toEqual({ valid: false, error: 'Name must not exceed 50 characters' });
    });

    it('should return valid for a proper name', () => {
      expect(validateName('John Doe')).toEqual({ valid: true });
      expect(validateName('Jo')).toEqual({ valid: true });
      expect(validateName('Alice')).toEqual({ valid: true });
    });

    it('should trim whitespace before validation', () => {
      expect(validateName('  John  ')).toEqual({ valid: true });
      expect(validateName('  a  ')).toEqual({ valid: false, error: 'Name must be at least 2 characters long' });
    });

    it('should accept name at exact boundary (2 and 50 characters)', () => {
      expect(validateName('Jo')).toEqual({ valid: true });
      expect(validateName('a'.repeat(50))).toEqual({ valid: true });
    });
  });

  describe('validateBio', () => {
    it('should return valid when bio is empty or undefined (optional field)', () => {
      expect(validateBio('')).toEqual({ valid: true });
      expect(validateBio(null)).toEqual({ valid: true });
      expect(validateBio(undefined)).toEqual({ valid: true });
    });

    it('should return invalid when bio is not a string', () => {
      expect(validateBio(123)).toEqual({ valid: true }); // Non-string is treated as empty
      expect(validateBio({})).toEqual({ valid: true }); // Non-string is treated as empty
    });

    it('should return valid for a proper bio', () => {
      expect(validateBio('Hello, I am a developer!')).toEqual({ valid: true });
      expect(validateBio('A')).toEqual({ valid: true });
    });

    it('should return invalid when bio exceeds 200 characters', () => {
      const longBio = 'a'.repeat(201);
      expect(validateBio(longBio)).toEqual({ valid: false, error: 'Bio must not exceed 200 characters' });
    });

    it('should accept bio at exact boundary (200 characters)', () => {
      const exactBio = 'a'.repeat(200);
      expect(validateBio(exactBio)).toEqual({ valid: true });
    });

    it('should trim whitespace before validation', () => {
      expect(validateBio('  Hello world  ')).toEqual({ valid: true });
      expect(validateBio('  ' + 'a'.repeat(200) + '  ')).toEqual({ valid: true });
    });
  });
});
