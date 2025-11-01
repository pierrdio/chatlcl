// Security utilities for chat application

// Sanitize text to prevent XSS attacks
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Remove potentially dangerous HTML tags and scripts
  let sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
  
  return sanitized;
}

// Validate username
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Имя пользователя не может быть пустым' };
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Имя пользователя должно содержать минимум 3 символа' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Имя пользователя слишком длинное (максимум 20 символов)' };
  }
  
  // Allow only alphanumeric characters, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { 
      valid: false, 
      error: 'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания' 
    };
  }
  
  return { valid: true };
}
