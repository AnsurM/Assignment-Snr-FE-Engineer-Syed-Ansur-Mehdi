/**
 * =============================================================================
 * CONSTRAINT HEADER - SINGLE SOURCE OF TRUTH
 * =============================================================================
 * This file defines the Field Schema which is the authoritative contract for
 * the entire application. All components MUST reference this file before
 * writing any logic.
 *
 * HARD CONSTRAINTS:
 * - Groups are recursive (children?: Field[])
 * - Numeric fields have specific properties (min, max)
 * - Every field requires: id, type, label, required
 * - No external libraries for state management or forms
 * =============================================================================
 */

/**
 * Supported field types in the form builder
 */
export type FieldType = 'text' | 'number' | 'group';

/**
 * Base properties shared by all field types
 */
interface BaseField {
    /** Unique identifier for the field */
    id: string;
    /** Display label for the field */
    label: string;
    /** Whether the field is required for form submission */
    required: boolean;
}

/**
 * Text input field configuration
 */
export interface TextField extends BaseField {
    type: 'text';
    /** Optional placeholder text */
    placeholder?: string;
}

/**
 * Number input field configuration
 */
export interface NumberField extends BaseField {
    type: 'number';
    /** Optional minimum value constraint */
    min?: number;
    /** Optional maximum value constraint */
    max?: number;
    /** Optional placeholder text */
    placeholder?: string;
}

/**
 * Group field configuration - supports recursive nesting
 */
export interface GroupField extends BaseField {
    type: 'group';
    /** Nested child fields - enables recursive structure */
    children: Field[];
}

/**
 * Union type representing any valid field configuration
 * This is the primary type used throughout the application
 */
export type Field = TextField | NumberField | GroupField;

/**
 * Root schema representing the entire form structure
 */
export interface FormSchema {
    /** Array of top-level fields */
    fields: Field[];
}

/**
 * Type guard to check if a field is a GroupField
 */
export function isGroupField(field: Field): field is GroupField {
    return field.type === 'group';
}

/**
 * Type guard to check if a field is a NumberField
 */
export function isNumberField(field: Field): field is NumberField {
    return field.type === 'number';
}

/**
 * Type guard to check if a field is a TextField
 */
export function isTextField(field: Field): field is TextField {
    return field.type === 'text';
}
