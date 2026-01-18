/**
 * =============================================================================
 * CONSTRAINT HEADER - ID GENERATOR
 * =============================================================================
 * Generates unique IDs for form fields without external dependencies.
 * =============================================================================
 */

/**
 * Generates a unique ID for form fields
 * Uses a combination of timestamp and random string for uniqueness
 */
export function generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `field_${timestamp}_${randomPart}`;
}
