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
export interface FormData {
    [key: string]: string | number;
}

/**
 * Flattened form data for simpler access patterns
 * Maps field IDs directly to primitive values
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
 * Validates form data against a schema
 * Returns a map of field IDs to error messages
 */
export function validateFormData(
    data: FlatFormData,
    fields: Field[]
): Record<string, string> {
    const errors: Record<string, string> = {};

    function validateField(field: Field): void {
        if (isGroupField(field)) {
            // Recursively validate children
            for (const child of field.children) {
                validateField(child);
            }
            return;
        }

        const value = data[field.id];

        // Check required fields
        if (field.required) {
            if (value === '' || value === undefined || value === null) {
                errors[field.id] = `${field.label} is required`;
                return;
            }
        }

        // Type-specific validation
        if (field.type === 'number' && value !== '') {
            const numValue = Number(value);

            if (isNaN(numValue)) {
                errors[field.id] = `${field.label} must be a valid number`;
                return;
            }

            if (field.min !== undefined && numValue < field.min) {
                errors[field.id] = `${field.label} must be at least ${field.min}`;
                return;
            }

            if (field.max !== undefined && numValue > field.max) {
                errors[field.id] = `${field.label} must be at most ${field.max}`;
                return;
            }
        }
    }

    for (const field of fields) {
        validateField(field);
    }

    return errors;
}
