/**
 * =============================================================================
 * CONSTRAINT HEADER - INTELLIGENT DATA MERGING
 * =============================================================================
 * This file implements the "Intelligent Merging" strategy for the Runtime Domain.
 * When the schema changes, existing user input must be preserved where possible.
 *
 * HARD CONSTRAINTS:
 * - Runtime Domain is ISOLATED from Builder Domain
 * - NO form libraries (React Hook Form, Formik)
 * - Preserve user input when schema structure changes
 * =============================================================================
 */

import type { Field, FormSchema } from '../types/schema';
import { isGroupField } from '../types/schema';

/**
 * Runtime form data structure
 * Maps field IDs to their current values
 */
export type FlatFormData = Record<string, string | number>;

/**
 * Recursively creates initial form data from a schema
 * Sets all fields to their default empty values
 */
export function createInitialFormData(fields: Field[]): FlatFormData {
    const data: FlatFormData = {};

    for (const field of fields) {
        if (isGroupField(field)) {
            // Recursively process group children
            const childData = createInitialFormData(field.children);
            Object.assign(data, childData);
        } else {
            // Initialize with empty value
            data[field.id] = '';
        }
    }

    return data;
}

/**
 * Intelligently merges existing form data with a new schema
 * Preserves values for fields that still exist in the new schema
 * Initializes new fields with default values
 * Removes data for fields that no longer exist
 */
export function mergeFormData(
    currentData: FlatFormData,
    newSchema: FormSchema
): FlatFormData {
    // Get all field IDs from the new schema
    const newFieldIds = new Set<string>();

    function collectIds(fields: Field[]): void {
        for (const field of fields) {
            if (isGroupField(field)) {
                collectIds(field.children);
            } else {
                newFieldIds.add(field.id);
            }
        }
    }

    collectIds(newSchema.fields);

    // Create new data object
    const mergedData: FlatFormData = {};

    // First, create initial data for all fields in new schema
    const initialData = createInitialFormData(newSchema.fields);

    // Then, preserve existing values where field IDs match
    for (const [id, value] of Object.entries(initialData)) {
        if (id in currentData) {
            // Preserve existing value
            mergedData[id] = currentData[id];
        } else {
            // Use initial value for new fields
            mergedData[id] = value;
        }
    }

    return mergedData;
}

/**
 * Validates a required field
 */
function validateRequired(value: string | number | undefined | null, label: string): string | null {
    const isActuallyEmpty = value === '' || value === undefined || value === null;
    const isWhitespaceOnly = typeof value === 'string' && value.trim() === '';

    if (isActuallyEmpty || isWhitespaceOnly) {
        return `${label} is required`;
    }
    return null;
}

/**
 * Validates a number field
 */
function validateNumber(
    value: string | number | undefined | null,
    field: { label: string; min?: number; max?: number }
): string | null {
    // Skip if empty (handled by validateRequired if needed)
    if (value === '' || value === undefined || value === null) {
        return null;
    }

    // Handle special sentinel for invalid browser input (e.g. "2.3e")
    if (value === '__INVALID_NUMBER__') {
        return `${field.label} must be a valid number`;
    }

    const numValue = Number(value);
    const isNotANumber = isNaN(numValue);

    if (isNotANumber) {
        return `${field.label} must be a valid number`;
    }

    const isBelowMin = field.min !== undefined && numValue < field.min;
    if (isBelowMin) {
        return `${field.label} must be at least ${field.min}`;
    }

    const isAboveMax = field.max !== undefined && numValue > field.max;
    if (isAboveMax) {
        return `${field.label} must be at most ${field.max}`;
    }

    return null;
}

/**
 * Validates form data against a schema
 * Returns a map of field IDs to error messages
 */
export function validateFormData(data: FlatFormData, fields: Field[]): Record<string, string> {
    const errors: Record<string, string> = {};

    function validateField(field: Field): void {
        if (isGroupField(field)) {
            for (const child of field.children) {
                validateField(child);
            }
            return;
        }

        const value = data[field.id];

        // 1. Required validation
        if (field.required) {
            const requiredError = validateRequired(value, field.label);
            if (requiredError) {
                errors[field.id] = requiredError;
                return;
            }
        }

        // 2. Type-specific validation
        if (field.type === 'number') {
            const numberError = validateNumber(value, field);
            if (numberError) {
                errors[field.id] = numberError;
                return;
            }
        }
    }

    for (const field of fields) {
        validateField(field);
    }

    return errors;
}
