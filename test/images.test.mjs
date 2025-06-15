// Tests pour le service de gestion des images
import { describe, test, expect } from '@jest/globals';
import { validateImageFile, generateJacketFilename } from '../services/images.js';

describe('Images Service - Unit Tests', () => {
    const testBookId = 'test-book-uuid-123';

    describe('validateImageFile', () => {
        test('should accept valid JPEG file', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 1024 * 1024, // 1MB
            };
            expect(() => validateImageFile(mockFile)).not.toThrow();
        });

        test('should accept valid PNG file', () => {
            const mockFile = {
                mimetype: 'image/png',
                size: 1024 * 1024, // 1MB
            };
            expect(() => validateImageFile(mockFile)).not.toThrow();
        });

        test('should accept valid WebP file', () => {
            const mockFile = {
                mimetype: 'image/webp',
                size: 1024 * 1024, // 1MB
            };
            expect(() => validateImageFile(mockFile)).not.toThrow();
        });

        test('should reject unsupported file type', () => {
            const mockFile = {
                mimetype: 'image/gif',
                size: 1024 * 1024,
            };
            expect(() => validateImageFile(mockFile)).toThrow('Format de fichier non supporté');
        });

        test('should reject file too large', () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                size: 15 * 1024 * 1024, // 15MB (plus que la limite de 10MB)
            };
            expect(() => validateImageFile(mockFile)).toThrow('Fichier trop volumineux');
        });

        test('should reject non-image file', () => {
            const mockFile = {
                mimetype: 'text/plain',
                size: 1024,
            };
            expect(() => validateImageFile(mockFile)).toThrow('Format de fichier non supporté');
        });
    });

    describe('generateJacketFilename', () => {
        test('should generate filename with book ID', () => {
            const filename = generateJacketFilename(testBookId);
            expect(filename).toMatch(/^jacket_test-book-uuid-123_\d+$/);
        });

        test('should generate unique filenames', async () => {
            const filename1 = generateJacketFilename(testBookId);
            // Attendre 1ms pour s'assurer que le timestamp est différent
            await new Promise(resolve => setTimeout(resolve, 1));
            const filename2 = generateJacketFilename(testBookId);
            expect(filename1).not.toBe(filename2);
        });
    });
});
