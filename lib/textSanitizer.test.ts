// __tests__/lib/textSanitizer.test.ts

import { describe, it, expect } from '@jest/globals';

import {
  replaceSmartCharacters,
  normalizeLineBreaks,
  sanitizeNonAscii,
  cleanWhitespace,
  sanitizeForTTS,
  sanitizePrompt,
  validateTextLength
} from './textSanitizer';

describe('Text Sanitizer', () => {
  
  describe('replaceSmartCharacters', () => {
    it('should replace smart quotes with regular quotes', () => {
      const input = "He said 'hello' and \"goodbye\"";
      const expected = "He said 'hello' and \"goodbye\"";
      expect(replaceSmartCharacters(input)).toBe(expected);
    });

    it('should replace em dashes and en dashes', () => {
      const input = "The event—which was great—happened. Pages 1–10";
      const expected = "The event--which was great--happened. Pages 1-10";
      expect(replaceSmartCharacters(input)).toBe(expected);
    });

    it('should replace ellipsis character', () => {
      const input = "Wait… what?";
      const expected = "Wait... what?";
      expect(replaceSmartCharacters(input)).toBe(expected);
    });

    it('should handle special symbols', () => {
      const input = "Temperature: 25°. Product™ is ® and ©";
      const expected = "Temperature: 25 degrees . ProductTM is (R) and (C)";
      expect(replaceSmartCharacters(input)).toBe(expected);
    });
  });

  describe('normalizeLineBreaks', () => {
    it('should normalize different line break formats', () => {
      const input = "Line 1\r\nLine 2\rLine 3\nLine 4";
      const expected = "Line 1\nLine 2\nLine 3\nLine 4";
      expect(normalizeLineBreaks(input)).toBe(expected);
    });

    it('should limit consecutive line breaks', () => {
      const input = "Paragraph 1\n\n\n\nParagraph 2";
      const expected = "Paragraph 1\n\nParagraph 2";
      expect(normalizeLineBreaks(input)).toBe(expected);
    });

    it('should handle the test script with line breaks', () => {
      const input = `Hello there.  
This is a test of the text to speech system.  
We are checking how line breaks affect the output.  
Does the voice pause here?  
Now let's try a longer sentence, with a natural flow,  
to see if the pacing, emphasis, and tone sound correct.  
Finally, here is a short line.  
And another.  
Done.`;
      
      const result = normalizeLineBreaks(input);
      expect(result).toContain("Hello there.");
      expect(result).toContain("This is a test");
      expect(result.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeNonAscii', () => {
    it('should handle the problematic character at index 175', () => {
      // This is the right single quotation mark that was causing the error
      const input = "let's try this"; // Contains ' (U+2019)
      const expected = "let's try this";
      expect(sanitizeNonAscii(input)).toBe(expected);
    });

    it('should replace accented characters', () => {
      const input = "Café, naïve, résumé, Zürich";
      const expected = "Cafe, naive, resume, Zurich";
      expect(sanitizeNonAscii(input)).toBe(expected);
    });

    it('should remove unknown non-ASCII characters', () => {
      const input = "Test 你好 test"; // Contains Chinese characters
      const expected = "Test  test";
      expect(sanitizeNonAscii(input)).toBe(expected);
    });
  });

  describe('cleanWhitespace', () => {
    it('should replace multiple spaces with single space', () => {
      const input = "Too    many     spaces";
      const expected = "Too many spaces";
      expect(cleanWhitespace(input)).toBe(expected);
    });

    it('should remove leading and trailing spaces', () => {
      const input = "  Leading and trailing  ";
      const expected = "Leading and trailing";
      expect(cleanWhitespace(input)).toBe(expected);
    });

    it('should handle tabs', () => {
      const input = "Tab\t\there";
      const expected = "Tab here";
      expect(cleanWhitespace(input)).toBe(expected);
    });
  });

    describe('sanitizeForTTS', () => {
        it('should handle the complete problematic script', () => {
        const input = `Hello there.  
    This is a test of the text to speech system.  
    We are checking how line breaks affect the output.  
    Does the voice pause here?  
    Now let's try a longer sentence, with a natural flow,  
    to see if the pacing, emphasis, and tone sound correct.  
    Finally, here is a short line.  
    And another.  
    Done.`;

      const result = sanitizeForTTS(input);
    // Should not contain smart quotes
    expect(result).not.toContain('\u2018');
    expect(result).not.toContain('\u2019');
    expect(result).toContain("let's");
      
      // Should preserve line breaks
      expect(result.split('\n').length).toBeGreaterThan(1);
      
      // Should be clean ASCII
      for (let i = 0; i < result.length; i++) {
        const charCode = result.charCodeAt(i);
        expect(charCode).toBeLessThanOrEqual(127);
      }
    });

    it('should throw error for empty text after sanitization', () => {
      const input = "​​​"; // Zero-width spaces only
      expect(() => sanitizeForTTS(input)).toThrow('Text is empty after sanitization');
    });

    it('should handle mixed problematic characters', () => {
      const input = "Test—with em-dash, 'smart quotes', and ellipsis… Plus 25° weather!";
      const result = sanitizeForTTS(input);
      
      expect(result).toBe("Test--with em-dash, 'smart quotes', and ellipsis... Plus 25 degrees weather!");
    });
  });

  describe('sanitizePrompt', () => {
    it('should convert line breaks to spaces', () => {
      const input = "Speak with\na calm\nand friendly tone";
      const expected = "Speak with a calm and friendly tone";
      expect(sanitizePrompt(input)).toBe(expected);
    });

    it('should handle all sanitization for prompts', () => {
      const input = "Use a 'friendly'  tone—speak   clearly\nand slowly";
      const expected = "Use a 'friendly' tone--speak clearly and slowly";
      expect(sanitizePrompt(input)).toBe(expected);
    });
  });

  describe('validateTextLength', () => {
    it('should return text unchanged if under limit', () => {
      const input = "Short text";
      expect(validateTextLength(input, 100)).toBe(input);
    });

    it('should truncate at sentence boundary when possible', () => {
      const input = "This is the first sentence. This is the second sentence. This is the third.";
      const result = validateTextLength(input, 60);
      expect(result).toBe("This is the first sentence. This is the second sentence.");
    });

    it('should truncate at word boundary when no good sentence break', () => {
      const input = "This is a very long sentence that goes on and on without any punctuation marks";
      const result = validateTextLength(input, 50);
      expect(result.length).toBeLessThanOrEqual(53); // 50 + "..."
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should handle question and exclamation marks', () => {
      const input = "Is this working? Yes it is! And this is extra text that should be cut.";
      const result = validateTextLength(input, 30);
      expect(result).toBe("Is this working? Yes it is!");
    });
  });
});