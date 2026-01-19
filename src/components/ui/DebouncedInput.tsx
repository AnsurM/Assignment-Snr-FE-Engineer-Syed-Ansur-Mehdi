/**
 * =============================================================================
 * CONSTRAINT HEADER - DEBOUNCED INPUTS
 * =============================================================================
 * Reusable input components that debounce their onChange events.
 *
 * HARD CONSTRAINTS:
 * - Maintains local state for immediate UI feedback
 * - Syncs with external value prop updates
 * - Debounces calls to the onChange prop
 * - Handles text and number types specifically
 * =============================================================================
 */

import { useEffect, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';

// Default debounce delay in milliseconds
const DEFAULT_DELAY = 300;

/**
 * Props shared by both input types
 */
interface BaseDebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    /** Debounce delay in milliseconds */
    debounceDelay?: number;
}

/**
 * Props for DebouncedTextInput
 */
interface DebouncedTextInputProps extends BaseDebouncedInputProps {
    value: string;
    onChange: (value: string) => void;
}

/**
 * DebouncedTextInput - A text input that updates its parent after a delay
 */
export function DebouncedTextInput({
    value,
    onChange,
    debounceDelay = DEFAULT_DELAY,
    ...props
}: DebouncedTextInputProps) {
    const [localValue, setLocalValue] = useState<string>(value);

    // Sync local state when external value changes (e.g. Reset Form)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only trigger if the local value is different from the prop value
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceDelay);

        return () => clearTimeout(timer);
    }, [localValue, value, debounceDelay, onChange]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            {...props}
        />
    );
}

/**
 * Props for DebouncedNumberInput
 */
interface DebouncedNumberInputProps extends BaseDebouncedInputProps {
    value: number | string | undefined;
    onChange: (value: number | string | undefined) => void;
    min?: number;
    max?: number;
}

/**
 * DebouncedNumberInput - A number input that updates its parent after a delay
 * Handles special cases like empty strings and invalid number inputs
 */
export function DebouncedNumberInput({
    value,
    onChange,
    debounceDelay = DEFAULT_DELAY,
    ...props
}: DebouncedNumberInputProps) {
    // Convert undefined/null to empty string for the input element
    const displayValue = value === undefined || value === null ? '' : value;

    const [localValue, setLocalValue] = useState<string | number>(displayValue);

    // Sync local state when external value changes
    useEffect(() => {
        setLocalValue(value === undefined || value === null ? '' : value);
    }, [value]);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            // Normalize external value for comparison
            const normalizedPropValue = value === undefined || value === null ? '' : value;

            // Only trigger if the local value is different from the prop value
            if (localValue !== normalizedPropValue) {
                // If local value is empty string, pass undefined to signify "no value"
                if (localValue === '') {
                    onChange(undefined);
                } else {
                    onChange(localValue);
                }
            }
        }, debounceDelay);

        return () => clearTimeout(timer);
    }, [localValue, value, debounceDelay, onChange]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        // Allow empty string (clearing the input)
        if (val === '') {
            setLocalValue('');
            return;
        }

        // Otherwise set the value
        const parsed = Number(val);
        if (!isNaN(parsed)) {
            setLocalValue(parsed);
        } else {
            setLocalValue(val);
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={handleChange}
            {...props}
        />
    );
}
