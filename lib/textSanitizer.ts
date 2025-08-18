/**
 * Sanitizes text input for TTS API consumption
 * Handles special characters, line breaks, and encoding issues
 */

/**
 * Replace smart quotes and special punctuation with ASCII equivalents
 */
export function replaceSmartCharacters(text: string): string {
  const replacements: Record<string, string> = {
    // Smart quotes
    '\u2019': "'",  // Right single quotation mark (U+2019)
    '\u2018': "'",  // Left single quotation mark (U+2018)
    '\u201C': '"',  // Left double quotation mark (U+201C)
    '\u201D': '"',  // Right double quotation mark (U+201D)
    '\u201A': "'",  // Single low-9 quotation mark (U+201A)
    '\u201E': '"',  // Double low-9 quotation mark (U+201E)
    
    // Dashes
    '–': '-',  // En dash (U+2013)
    '—': '--', // Em dash (U+2014)
    '―': '--', // Horizontal bar (U+2015)
    
    // Ellipsis
    '…': '...', // Horizontal ellipsis (U+2026)
    
    // Other punctuation
    '•': '*',   // Bullet (U+2022)
    '°': ' degrees ', // Degree sign (U+00B0)
    '™': 'TM',  // Trademark (U+2122)
    '®': '(R)', // Registered (U+00AE)
    '©': '(C)', // Copyright (U+00A9)
    '×': 'x',   // Multiplication sign (U+00D7)
    '÷': '/',   // Division sign (U+00F7)
    
    // Special spaces
    '\u00A0': ' ', // Non-breaking space
    '\u2009': ' ', // Thin space
    '\u200A': ' ', // Hair space
    '\u200B': '',  // Zero-width space
    '\u2028': '\n', // Line separator
    '\u2029': '\n', // Paragraph separator
  };

  let sanitized = text;
  for (const [char, replacement] of Object.entries(replacements)) {
    sanitized = sanitized.replace(new RegExp(char, 'g'), replacement);
  }
  
  return sanitized;
}

/**
 * Normalize line breaks to standard format
 * Preserves intentional line breaks for pausing
 */
export function normalizeLineBreaks(text: string): string {
  // Convert various line break formats to \n
  let normalized = text
    .replace(/\r\n/g, '\n')  // Windows
    .replace(/\r/g, '\n')    // Old Mac
    .replace(/\n{3,}/g, '\n\n'); // Limit consecutive breaks to 2
  
  // Ensure single line breaks have proper spacing
  // This helps TTS engines pause appropriately
  normalized = normalized
    .split('\n')
    .map(line => line.trim())
    .filter((line, index, array) => {
      // Remove empty lines unless they're intentional paragraph breaks
      if (line === '') {
        return index > 0 && index < array.length - 1 && array[index - 1] !== '';
      }
      return true;
    })
    .join('\n');
  
  return normalized;
}

/**
 * Remove or replace non-ASCII characters
 */
export function sanitizeNonAscii(text: string): string {
  // First apply smart character replacements
  let sanitized = replaceSmartCharacters(text);
  
  // Then handle any remaining non-ASCII characters
  // Replace common accented characters with ASCII equivalents
  const accentMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a', 'ā': 'a',
    'è': 'e', 'é': 'e', 'ë': 'e', 'ê': 'e', 'ē': 'e', 'ė': 'e', 'ę': 'e',
    'ì': 'i', 'í': 'i', 'ï': 'i', 'î': 'i', 'ī': 'i', 'į': 'i',
    'ò': 'o', 'ó': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o', 'ō': 'o',
    'ù': 'u', 'ú': 'u', 'ü': 'u', 'û': 'u', 'ū': 'u',
    'ñ': 'n', 'ň': 'n', 'ń': 'n',
    'ç': 'c', 'č': 'c', 'ć': 'c',
    'ž': 'z', 'ź': 'z', 'ż': 'z',
    'š': 's', 'ś': 's',
    'ÿ': 'y', 'ý': 'y',
    'À': 'A', 'Á': 'A', 'Ä': 'A', 'Â': 'A', 'Ã': 'A', 'Å': 'A', 'Ā': 'A',
    'È': 'E', 'É': 'E', 'Ë': 'E', 'Ê': 'E', 'Ē': 'E',
    'Ì': 'I', 'Í': 'I', 'Ï': 'I', 'Î': 'I', 'Ī': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ö': 'O', 'Ô': 'O', 'Õ': 'O', 'Ō': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ü': 'U', 'Û': 'U', 'Ū': 'U',
    'Ñ': 'N', 'Ň': 'N', 'Ń': 'N',
    'Ç': 'C', 'Č': 'C', 'Ć': 'C',
    'Ž': 'Z', 'Ź': 'Z', 'Ż': 'Z',
    'Š': 'S', 'Ś': 'S',
    'Ÿ': 'Y', 'Ý': 'Y',
  };
  
  for (const [char, replacement] of Object.entries(accentMap)) {
    sanitized = sanitized.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Remove any remaining characters outside ASCII range
  // This is a last resort - ideally all characters should be mapped above
  sanitized = sanitized.replace(/[^\x00-\x7F]/g, '');
  
  return sanitized;
}

/**
 * Clean excessive whitespace
 */
export function cleanWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')  // Multiple spaces/tabs to single space
    .replace(/^ +/gm, '')      // Leading spaces on each line
    .replace(/ +$/gm, '')      // Trailing spaces on each line
    .trim();                   // Overall trim
}

/**
 * Main sanitization function for TTS input
 */
export function sanitizeForTTS(text: string): string {
  if (!text) return '';
  
  let sanitized = text;
  
  // Apply sanitization in order
  sanitized = normalizeLineBreaks(sanitized);
  sanitized = sanitizeNonAscii(sanitized);
  sanitized = cleanWhitespace(sanitized);
  
  // Ensure the text isn't empty after sanitization
  if (!sanitized.trim()) {
    throw new Error('Text is empty after sanitization');
  }
  
  return sanitized;
}

/**
 * Sanitize prompt/instruction text (more aggressive cleaning)
 */
export function sanitizePrompt(text: string): string {
  if (!text) return '';
  
  let sanitized = text;
  
  // For prompts, we want single line, no special formatting
  sanitized = sanitizeNonAscii(sanitized);
  sanitized = sanitized.replace(/\n/g, ' '); // Convert all line breaks to spaces
  sanitized = cleanWhitespace(sanitized);
  
  return sanitized;
}

/**
 * Validate text length after sanitization
 */
export function validateTextLength(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to cut at a sentence boundary
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentenceEnd > maxLength * 0.8) {
    // If we have a sentence end in the last 20%, use it
    return truncated.slice(0, lastSentenceEnd + 1).trim();
  }
  
  // Otherwise, try to cut at a word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.9) {
    return truncated.slice(0, lastSpace).trim() + '...';
  }
  
  // Last resort: hard cut with ellipsis
  return truncated.trim() + '...';
}