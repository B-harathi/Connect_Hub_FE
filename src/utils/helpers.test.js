import {
  truncateText,
  capitalizeFirst,
  getInitials,
  validateEmail,
  validatePassword,
  validateRequired,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  getFileIcon,
  debounce,
  throttle,
  generateRandomId,
  copyToClipboard,
  deepClone,
  isEmpty,
  groupBy,
  sortBy,
  getNestedValue,
  getErrorMessage,
} from './helpers';

describe('Helpers Utility Functions', () => {
  describe('String Helpers', () => {
    describe('truncateText', () => {
      it('should return original text if shorter than maxLength', () => {
        expect(truncateText('Hello', 10)).toBe('Hello');
        expect(truncateText('Hello', 5)).toBe('Hello');
      });

      it('should truncate text and add ellipsis when exceeding maxLength', () => {
        expect(truncateText('Hello World', 5)).toBe('Hello...');
        expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
      });

      it('should handle empty and null values', () => {
        expect(truncateText('', 10)).toBe('');
        expect(truncateText(null, 10)).toBeNull();
        expect(truncateText(undefined, 10)).toBeUndefined();
      });

      it('should trim trailing spaces before adding ellipsis', () => {
        const result = truncateText('Hello World   ', 11);
        expect(result).toBe('Hello World...');
      });
    });

    describe('capitalizeFirst', () => {
      it('should capitalize first letter and lowercase the rest', () => {
        expect(capitalizeFirst('hello')).toBe('Hello');
        expect(capitalizeFirst('HELLO')).toBe('Hello');
        expect(capitalizeFirst('hELLO')).toBe('Hello');
      });

      it('should handle empty and null values', () => {
        expect(capitalizeFirst('')).toBe('');
        expect(capitalizeFirst(null)).toBe('');
        expect(capitalizeFirst(undefined)).toBe('');
      });
    });

    describe('getInitials', () => {
      it('should return initials from a full name', () => {
        expect(getInitials('John Doe')).toBe('JD');
        expect(getInitials('Alice')).toBe('A');
        // slice(0, 2) limits to first 2 words
        expect(getInitials('Bob Smith Jones')).toBe('BS');
      });

      it('should handle single word names', () => {
        expect(getInitials('John')).toBe('J');
      });

      it('should handle empty and null values', () => {
        expect(getInitials('')).toBe('');
        expect(getInitials(null)).toBe('');
        expect(getInitials(undefined)).toBe('');
      });

      it('should limit to 2 characters max', () => {
        expect(getInitials('John Paul Smith')).toBe('JP');
      });

      it('should convert to uppercase', () => {
        expect(getInitials('john doe')).toBe('JD');
      });
    });
  });

  describe('Validation Helpers', () => {
    describe('validateEmail', () => {
      it('should return true for valid emails', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(validateEmail('user+tag@example.org')).toBe(true);
      });

      it('should return false for invalid emails', () => {
        expect(validateEmail('')).toBe(false);
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail('invalid@')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
        expect(validateEmail('user@')).toBe(false);
        expect(validateEmail('user@.com')).toBe(false);
      });
    });

    describe('validatePassword', () => {
      it('should validate password requirements', () => {
        const result = validatePassword('Password123');
        expect(result.isValid).toBe(true);
        expect(result.minLength).toBe(true);
        expect(result.hasUpperCase).toBe(true);
        expect(result.hasLowerCase).toBe(true);
        expect(result.hasNumber).toBe(true);
      });

      it('should fail for short passwords', () => {
        const result = validatePassword('Pass1');
        expect(result.isValid).toBe(false);
        expect(result.minLength).toBe(false);
      });

      it('should detect missing uppercase', () => {
        const result = validatePassword('password123');
        expect(result.hasUpperCase).toBe(false);
      });

      it('should detect missing lowercase', () => {
        const result = validatePassword('PASSWORD123');
        expect(result.hasLowerCase).toBe(false);
      });

      it('should detect missing numbers', () => {
        const result = validatePassword('Password');
        expect(result.hasNumber).toBe(false);
      });
    });

    describe('validateRequired', () => {
      it('should return true for non-empty values', () => {
        expect(validateRequired('hello')).toBe(true);
        expect(validateRequired('  hello  ')).toBe(true);
        expect(validateRequired(123)).toBe(true);
        expect(validateRequired(true)).toBe(true);
      });

      it('should return falsy for empty values', () => {
        expect(validateRequired('')).toBeFalsy();
        expect(validateRequired('   ')).toBeFalsy();
        expect(validateRequired(null)).toBeFalsy();
        expect(validateRequired(undefined)).toBeFalsy();
      });
    });
  });

  describe('File Helpers', () => {
    describe('formatFileSize', () => {
      it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(500)).toBe('500 Bytes');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(1048576)).toBe('1 MB');
        expect(formatFileSize(1572864)).toBe('1.5 MB');
        expect(formatFileSize(1073741824)).toBe('1 GB');
      });

      it('should handle decimal places', () => {
        expect(formatFileSize(102400)).toBe('100 KB');
        expect(formatFileSize(1126400)).toBe('1.07 MB');
      });
    });

    describe('isValidFileType', () => {
      it('should return true for allowed types', () => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        expect(isValidFileType({ type: 'image/jpeg' }, allowedTypes)).toBe(true);
        expect(isValidFileType({ type: 'image/png' }, allowedTypes)).toBe(true);
      });

      it('should return false for disallowed types', () => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        expect(isValidFileType({ type: 'application/pdf' }, allowedTypes)).toBe(false);
        expect(isValidFileType({ type: 'image/gif' }, allowedTypes)).toBe(false);
      });
    });

    describe('isValidFileSize', () => {
      it('should return true for files within limit', () => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        expect(isValidFileSize({ size: 1024 }, maxSize)).toBe(true);
        expect(isValidFileSize({ size: 5 * 1024 * 1024 }, maxSize)).toBe(true);
      });

      it('should return false for files exceeding limit', () => {
        const maxSize = 5 * 1024 * 1024;
        expect(isValidFileSize({ size: 6 * 1024 * 1024 }, maxSize)).toBe(false);
      });
    });

    describe('getFileIcon', () => {
      it('should return correct icons for file types', () => {
        expect(getFileIcon('image/jpeg')).toBe('🖼️');
        expect(getFileIcon('video/mp4')).toBe('🎥');
        expect(getFileIcon('audio/mpeg')).toBe('🎵');
        expect(getFileIcon('application/pdf')).toBe('📄');
        expect(getFileIcon('application/msword')).toBe('📝');
        expect(getFileIcon('application/vnd.ms-excel')).toBe('📊');
        expect(getFileIcon('application/vnd.ms-powerpoint')).toBe('📋');
        expect(getFileIcon('application/zip')).toBe('🗂️');
      });

      it('should return default icon for unknown types', () => {
        expect(getFileIcon('application/octet-stream')).toBe('📎');
      });
    });
  });

  describe('Utility Helpers', () => {
    describe('debounce', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should delay function execution', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should only execute once for multiple rapid calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('throttle', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should execute immediately on first call', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should not execute again within the limit', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(50);
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(60);
        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(2);
      });
    });

    describe('generateRandomId', () => {
      it('should generate a string', () => {
        const id = generateRandomId();
        expect(typeof id).toBe('string');
      });

      it('should generate unique IDs', () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
          ids.add(generateRandomId());
        }
        expect(ids.size).toBe(100);
      });

      it('should have length of 9 characters', () => {
        const id = generateRandomId();
        expect(id.length).toBe(9);
      });
    });

    describe('copyToClipboard', () => {
      it('should be a function', () => {
        expect(typeof copyToClipboard).toBe('function');
      });
    });

    describe('deepClone', () => {
      it('should clone primitive values', () => {
        expect(deepClone(42)).toBe(42);
        expect(deepClone('hello')).toBe('hello');
        expect(deepClone(null)).toBe(null);
        expect(deepClone(undefined)).toBe(undefined);
        expect(deepClone(true)).toBe(true);
      });

      it('should clone arrays', () => {
        const arr = [1, 2, 3];
        const cloned = deepClone(arr);
        expect(cloned).toEqual(arr);
        expect(cloned).not.toBe(arr);
      });

      it('should clone objects', () => {
        const obj = { a: 1, b: { c: 2 } };
        const cloned = deepClone(obj);
        expect(cloned).toEqual(obj);
        expect(cloned).not.toBe(obj);
        expect(cloned.b).not.toBe(obj.b);
      });

      it('should clone Date objects', () => {
        const date = new Date('2024-01-01');
        const cloned = deepClone(date);
        expect(cloned).toEqual(date);
        expect(cloned).not.toBe(date);
      });
    });

    describe('isEmpty', () => {
      it('should return true for empty values', () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('   ')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
      });

      it('should return false for non-empty values', () => {
        expect(isEmpty('hello')).toBe(false);
        expect(isEmpty([1, 2])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(false)).toBe(false);
      });
    });
  });

  describe('Array Helpers', () => {
    describe('groupBy', () => {
      it('should group array items by key', () => {
        const items = [
          { type: 'a', value: 1 },
          { type: 'b', value: 2 },
          { type: 'a', value: 3 },
        ];
        const grouped = groupBy(items, 'type');
        expect(grouped.a).toEqual([{ type: 'a', value: 1 }, { type: 'a', value: 3 }]);
        expect(grouped.b).toEqual([{ type: 'b', value: 2 }]);
      });

      it('should handle nested keys', () => {
        const items = [
          { info: { category: 'x' } },
          { info: { category: 'y' } },
        ];
        const grouped = groupBy(items, 'info.category');
        expect(grouped.x).toEqual([{ info: { category: 'x' } }]);
        expect(grouped.y).toEqual([{ info: { category: 'y' } }]);
      });

      it('should handle function as key', () => {
        const items = [1, 2, 3, 4];
        const grouped = groupBy(items, (item) => (item % 2 === 0 ? 'even' : 'odd'));
        expect(grouped.odd).toEqual([1, 3]);
        expect(grouped.even).toEqual([2, 4]);
      });
    });

    describe('sortBy', () => {
      it('should sort array by key in ascending order', () => {
        const items = [{ a: 3 }, { a: 1 }, { a: 2 }];
        const sorted = sortBy(items, 'a');
        expect(sorted[0].a).toBe(1);
        expect(sorted[1].a).toBe(2);
        expect(sorted[2].a).toBe(3);
      });

      it('should sort array by key in descending order', () => {
        const items = [{ a: 3 }, { a: 1 }, { a: 2 }];
        const sorted = sortBy(items, 'a', 'desc');
        expect(sorted[0].a).toBe(3);
        expect(sorted[1].a).toBe(2);
        expect(sorted[2].a).toBe(1);
      });

      it('should handle nested keys', () => {
        const items = [{ info: { value: 3 } }, { info: { value: 1 } }];
        const sorted = sortBy(items, 'info.value');
        expect(sorted[0].info.value).toBe(1);
      });
    });

    describe('getNestedValue', () => {
      it('should get nested object values using dot notation', () => {
        const obj = { a: { b: { c: 42 } } };
        expect(getNestedValue(obj, 'a.b.c')).toBe(42);
        expect(getNestedValue(obj, 'a.b')).toEqual({ c: 42 });
      });

      it('should return undefined for non-existent paths', () => {
        const obj = { a: { b: 1 } };
        expect(getNestedValue(obj, 'a.c')).toBeUndefined();
        expect(getNestedValue(obj, 'x.y.z')).toBeUndefined();
      });

      it('should handle function as path', () => {
        const obj = { a: 1 };
        const fn = (o) => o.a;
        expect(getNestedValue(obj, fn)).toBe(1);
      });

      it('should return undefined for non-string/non-function path', () => {
        expect(getNestedValue({ a: 1 }, null)).toBeUndefined();
        expect(getNestedValue({ a: 1 }, 123)).toBeUndefined();
      });
    });
  });

  describe('Error Helpers', () => {
    describe('getErrorMessage', () => {
      it('should extract string error messages', () => {
        expect(getErrorMessage('simple error')).toBe('simple error');
      });

      it('should extract message from error object', () => {
        expect(getErrorMessage({ message: 'error object' })).toBe('error object');
      });

      it('should extract nested error messages', () => {
        const error = { response: { data: { message: 'nested error' } } };
        expect(getErrorMessage(error)).toBe('nested error');
      });

      it('should return default message for unknown error formats', () => {
        expect(getErrorMessage({})).toBe('An unexpected error occurred');
        expect(getErrorMessage(null)).toBe('An unexpected error occurred');
        expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      });
    });
  });
});
