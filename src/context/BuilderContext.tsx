/**
 * =============================================================================
 * CONSTRAINT HEADER - BUILDER CONTEXT (BUILDER DOMAIN)
 * =============================================================================
 * This context manages the SCHEMA TREE state - the form structure definition.
 * It is STRICTLY ISOLATED from the Runtime Domain (user input data).
 *
 * HARD CONSTRAINTS:
 * - NO state management libraries (Redux, Zustand)
 * - Uses useReducer with recursive reducer pattern
 * - Must reference types/schema.ts as Single Source of Truth
 * - Wrap consumers in React.memo for structural sharing benefits
 * =============================================================================
 */

import {
    createContext,
    useContext,
    useReducer,
    useCallback,
    useMemo,
    type ReactNode,
    type Dispatch,
} from 'react';
import type { Field, FieldType, FormSchema } from '../types/schema';
import { builderReducer, type BuilderAction } from '../utils/recursiveReducer';
import { generateId } from '../utils/idGenerator';

/**
 * Shape of the Builder Context value
 */
interface BuilderContextValue {
    /** Current form schema (the tree structure) */
    schema: FormSchema;
    /** Dispatch function for schema updates */
    dispatch: Dispatch<BuilderAction>;
    /** Helper: Add a new field to the schema */
    addField: (type: FieldType, parentId?: string | null) => void;
    /** Helper: Update an existing field */
    updateField: (id: string, updates: Partial<Field>) => void;
    /** Helper: Delete a field from the schema */
    deleteField: (id: string) => void;
    /** Helper: Move a field up or down within its parent */
    moveField: (id: string, direction: 'up' | 'down') => void;
    /** Helper: Import schema from JSON */
    importSchema: (json: string) => boolean;
    /** Helper: Export schema to JSON */
    exportSchema: () => string;
}

/**
 * Initial empty schema
 */
const initialSchema: FormSchema = {
    fields: [],
};

/**
 * Builder Context - do not use directly, use useBuilder() hook
 */
const BuilderContext = createContext<BuilderContextValue | null>(null);

/**
 * Props for BuilderProvider
 */
interface BuilderProviderProps {
    children: ReactNode;
    /** Optional initial schema for hydration */
    initialState?: FormSchema;
}

/**
 * Builder Context Provider
 * Manages the form schema (structure) state using useReducer
 */
export function BuilderProvider({
    children,
    initialState = initialSchema,
}: BuilderProviderProps) {
    const [schema, dispatch] = useReducer(builderReducer, initialState);

    /**
     * Add a new field with default values based on type
     */
    const addField = useCallback(
        (type: FieldType, parentId: string | null = null) => {
            const id = generateId();

            let newField: Field;

            switch (type) {
                case 'text':
                    newField = {
                        id,
                        type: 'text',
                        label: 'New Text Field',
                        required: false,
                        placeholder: '',
                    };
                    break;
                case 'number':
                    newField = {
                        id,
                        type: 'number',
                        label: 'New Number Field',
                        required: false,
                        placeholder: '',
                        min: undefined,
                        max: undefined,
                    };
                    break;
                case 'group':
                    newField = {
                        id,
                        type: 'group',
                        label: 'New Group',
                        required: false,
                        children: [],
                    };
                    break;
                default:
                    throw new Error(`Unknown field type: ${type}`);
            }

            dispatch({
                type: 'ADD_FIELD',
                payload: { parentId, field: newField },
            });
        },
        []
    );

    /**
     * Update a field's properties
     */
    const updateField = useCallback((id: string, updates: Partial<Field>) => {
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { id, updates },
        });
    }, []);

    /**
     * Delete a field by ID
     */
    const deleteField = useCallback((id: string) => {
        dispatch({
            type: 'DELETE_FIELD',
            payload: { id },
        });
    }, []);

    /**
     * Move a field up or down within its parent
     */
    const moveField = useCallback((id: string, direction: 'up' | 'down') => {
        dispatch({
            type: 'MOVE_FIELD',
            payload: { id, direction },
        });
    }, []);

    /**
     * Import schema from JSON string
     * Returns true if successful, false if parsing fails
     */
    const importSchema = useCallback((json: string): boolean => {
        try {
            const parsed = JSON.parse(json) as FormSchema;

            // Basic validation
            if (!parsed || !Array.isArray(parsed.fields)) {
                console.error('Invalid schema format: missing fields array');
                return false;
            }

            dispatch({
                type: 'SET_SCHEMA',
                payload: parsed,
            });

            return true;
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return false;
        }
    }, []);

    /**
     * Export current schema to JSON string
     */
    const exportSchema = useCallback((): string => {
        return JSON.stringify(schema, null, 2);
    }, [schema]);

    /**
     * Memoized context value to prevent unnecessary re-renders
     */
    const contextValue = useMemo<BuilderContextValue>(
        () => ({
            schema,
            dispatch,
            addField,
            updateField,
            deleteField,
            moveField,
            importSchema,
            exportSchema,
        }),
        [schema, addField, updateField, deleteField, moveField, importSchema, exportSchema]
    );

    return (
        <BuilderContext.Provider value={contextValue}>
            {children}
        </BuilderContext.Provider>
    );
}

/**
 * Custom hook to access Builder Context
 * Throws if used outside of BuilderProvider
 */
export function useBuilder(): BuilderContextValue {
    const context = useContext(BuilderContext);

    if (context === null) {
        throw new Error('useBuilder must be used within a BuilderProvider');
    }

    return context;
}

/**
 * Custom hook to access only the schema (for read-only consumers)
 * This allows components to subscribe to schema changes only
 */
export function useSchema(): FormSchema {
    const { schema } = useBuilder();
    return schema;
}
