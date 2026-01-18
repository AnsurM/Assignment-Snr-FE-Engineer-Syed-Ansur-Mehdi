/**
 * =============================================================================
 * CONSTRAINT HEADER - FORM RUNTIME CONTEXT (RUNTIME DOMAIN)
 * =============================================================================
 * This context manages USER INPUT DATA - the actual form values entered by users.
 * It is STRICTLY ISOLATED from the Builder Domain (schema tree).
 *
 * HARD CONSTRAINTS:
 * - NO form libraries (React Hook Form, Formik)
 * - Uses "Intelligent Merging" when schema changes
 * - Must sync with schema changes without losing user input
 * - Validation runs against the schema from Builder Domain
 * =============================================================================
 */

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from 'react';
import {
    type FlatFormData,
    createInitialFormData,
    mergeFormData,
    validateFormData,
} from '../utils/dataMerging';
import { useSchema } from './BuilderContext';

/**
 * Shape of the Runtime Context value
 */
interface FormRuntimeContextValue {
    /** Current form data (user input values) */
    formData: FlatFormData;
    /** Validation errors by field ID */
    errors: Record<string, string>;
    /** Whether the form has been touched/modified */
    isDirty: boolean;
    /** Set a single field's value */
    setFieldValue: (id: string, value: string | number) => void;
    /** Set multiple field values at once */
    setFieldValues: (values: FlatFormData) => void;
    /** Reset form to initial state based on current schema */
    resetForm: () => void;
    /** Validate all fields and return true if valid */
    validateForm: () => boolean;
    /** Get the current form data as a clean object */
    getFormData: () => FlatFormData;
}

/**
 * Runtime Context - do not use directly, use useFormRuntime() hook
 */
const FormRuntimeContext = createContext<FormRuntimeContextValue | null>(null);

/**
 * Props for FormRuntimeProvider
 */
interface FormRuntimeProviderProps {
    children: ReactNode;
}

/**
 * Form Runtime Context Provider
 * Manages user input data, isolated from the Builder Domain
 * Automatically syncs with schema changes using Intelligent Merging
 */
export function FormRuntimeProvider({ children }: FormRuntimeProviderProps) {
    // Get schema from Builder Domain (read-only dependency)
    const schema = useSchema();

    // Form data state
    const [formData, setFormData] = useState<FlatFormData>(() =>
        createInitialFormData(schema.fields)
    );

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Track if form has been modified
    const [isDirty, setIsDirty] = useState(false);

    /**
     * Intelligent Merging: When schema changes, preserve existing user input
     * for fields that still exist, initialize new fields, remove obsolete ones
     */
    useEffect(() => {
        setFormData((currentData) => mergeFormData(currentData, schema));
        // Re-validate after schema change
        setErrors({});
    }, [schema]);

    /**
     * Set a single field's value
     */
    const setFieldValue = useCallback((id: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
        setIsDirty(true);
        // Clear error for this field when user types
        setErrors((prev) => {
            if (prev[id]) {
                const next = { ...prev };
                delete next[id];
                return next;
            }
            return prev;
        });
    }, []);

    /**
     * Set multiple field values at once
     */
    const setFieldValues = useCallback((values: FlatFormData) => {
        setFormData((prev) => ({
            ...prev,
            ...values,
        }));
        setIsDirty(true);
    }, []);

    /**
     * Reset form to initial state based on current schema
     */
    const resetForm = useCallback(() => {
        setFormData(createInitialFormData(schema.fields));
        setErrors({});
        setIsDirty(false);
    }, [schema]);

    /**
     * Validate all fields and update errors state
     * Returns true if form is valid, false otherwise
     */
    const validateForm = useCallback((): boolean => {
        const validationErrors = validateFormData(formData, schema.fields);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [formData, schema.fields]);

    /**
     * Get the current form data (for submission)
     */
    const getFormData = useCallback((): FlatFormData => {
        return { ...formData };
    }, [formData]);

    /**
     * Memoized context value
     */
    const contextValue = useMemo<FormRuntimeContextValue>(
        () => ({
            formData,
            errors,
            isDirty,
            setFieldValue,
            setFieldValues,
            resetForm,
            validateForm,
            getFormData,
        }),
        [
            formData,
            errors,
            isDirty,
            setFieldValue,
            setFieldValues,
            resetForm,
            validateForm,
            getFormData,
        ]
    );

    return (
        <FormRuntimeContext.Provider value={contextValue}>
            {children}
        </FormRuntimeContext.Provider>
    );
}

/**
 * Custom hook to access Form Runtime Context
 * Throws if used outside of FormRuntimeProvider
 */
export function useFormRuntime(): FormRuntimeContextValue {
    const context = useContext(FormRuntimeContext);

    if (context === null) {
        throw new Error(
            'useFormRuntime must be used within a FormRuntimeProvider'
        );
    }

    return context;
}

/**
 * Custom hook to get a specific field's value and setter
 * Optimized for single-field access patterns
 */
export function useFieldValue(
    fieldId: string
): [string | number, (value: string | number) => void, string | undefined] {
    const { formData, errors, setFieldValue } = useFormRuntime();

    const value = formData[fieldId] ?? '';
    const error = errors[fieldId];

    const setValue = useCallback(
        (newValue: string | number) => {
            setFieldValue(fieldId, newValue);
        },
        [fieldId, setFieldValue]
    );

    return [value, setValue, error];
}
