// Validation utilities for ConnectHub

/**
 * Validates a user's name
 * @param {string} name - The name to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must not exceed 50 characters' };
  }

  return { valid: true };
};

/**
 * Validates a user's bio
 * @param {string} bio - The bio to validate (optional)
 * @returns {object} - { valid: boolean, error?: string }
 */
export const validateBio = (bio) => {
  // Bio is optional
  if (!bio || typeof bio !== 'string') {
    return { valid: true };
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length > 200) {
    return { valid: false, error: 'Bio must not exceed 200 characters' };
  }

  return { valid: true };
};
