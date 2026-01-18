/**
 * =============================================================================
 * CONSTRAINT HEADER - FIELD RENDERER
 * =============================================================================
 * Renders individual form fields based on their type.
 *
 * HARD CONSTRAINTS:
 * - NO UI frameworks (Tailwind, Bootstrap)
 * - Uses semantic HTML (<input>, <label>)
 * - Connects to FormRuntimeContext for value/change handling
 * - Implements validation visualization (red border, error message)
 * =============================================================================
 */

import { memo, useCallback, type ChangeEvent } from 'react';
import type { Field, TextField, NumberField } from '../../types/schema';
import { isGroupField, isNumberField } from '../../types/schema';
import { useFieldValue } from '../../context';
import GroupRenderer from './GroupRenderer';

interface FieldRendererProps {
    field: Field;
}

/**
 * Renders a Text Input field
 */
const TextInput = memo(function TextInput({ field }: { field: TextField }) {
    const [value, setValue, error] = useFieldValue(field.id);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        [setValue]
    );

    return (
        <div className="input-group">
            <label
                htmlFor={field.id}
                className={`input-label ${field.required ? 'input-label--required' : ''}`}
            >
                {field.label}
            </label>
            <input
                id={field.id}
                type="text"
                className={`input ${error ? 'input--error' : ''}`}
                value={value as string}
                onChange={handleChange}
                placeholder={field.placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
            />
            {error && (
                <span id={`${field.id}-error`} className="input-error-message">
                    {error}
                </span>
            )}
        </div>
    );
});

/**
 * Renders a Number Input field
 */
const NumberInput = memo(function NumberInput({ field }: { field: NumberField }) {
    const [value, setValue, error] = useFieldValue(field.id);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        [setValue]
    );

    return (
        <div className="input-group">
            <label
                htmlFor={field.id}
                className={`input-label ${field.required ? 'input-label--required' : ''}`}
            >
                {field.label}
            </label>
            <input
                id={field.id}
                type="number"
                className={`input ${error ? 'input--error' : ''}`}
                value={value as string | number}
                onChange={handleChange}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
            />
            {error && (
                <span id={`${field.id}-error`} className="input-error-message">
                    {error}
                </span>
            )}
        </div>
    );
});

/**
 * FieldRenderer - Dispatches rendering to the correct component based on field type
 */
const FieldRenderer = memo(function FieldRenderer({ field }: FieldRendererProps) {
    if (isGroupField(field)) {
        return <GroupRenderer field={field} />;
    }

    if (isNumberField(field)) {
        return <NumberInput field={field} />;
    }

    return <TextInput field={field} />;
});

export default FieldRenderer;
