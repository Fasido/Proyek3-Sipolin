/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const d = new Date(date);

  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'datetime':
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and message
 */
export const validatePassword = (password) => {
  let score = 0;
  let message = '';

  if (!password) {
    return { valid: false, score: 0, message: 'Password is required' };
  }

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  const messages = {
    1: 'Weak - Add uppercase, numbers, or special characters',
    2: 'Fair - Add more variety to characters',
    3: 'Good - Password is adequate',
    4: 'Strong - Password is strong',
    5: 'Very Strong - Excellent password',
  };

  return {
    valid: score >= 2,
    score,
    message: messages[score] || 'Weak',
  };
};

/**
 * Get status badge color
 * @param {string} status - Status value
 * @returns {object} Color object with bg and text
 */
export const getStatusColor = (status) => {
  const colors = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
    submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    reviewed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    approved: { bg: 'bg-green-100', text: 'text-green-700' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
};

/**
 * Get priority badge color
 * @param {string} priority - Priority value
 * @returns {object} Color object with bg and text
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: { bg: 'bg-blue-100', text: 'text-blue-700' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700' },
    critical: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  return colors[priority] || { bg: 'bg-gray-100', text: 'text-gray-700' };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Handle API errors
 * @param {object} error - Axios error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.statusText) {
    return error.response.statusText;
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred';
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
