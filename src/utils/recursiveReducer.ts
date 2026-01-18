/**
 * =============================================================================
 * CONSTRAINT HEADER - RECURSIVE REDUCER (LOGIC STANDARD)
 * =============================================================================
 * This file implements the Recursive Map approach for tree updates.
 * 
 * HARD CONSTRAINTS:
 * - NO "dot notation" paths - use recursive traversal instead
 * - MUST preserve object references for unchanged branches (structural sharing)
 * - This enables React.memo to effectively skip re-renders
 * - NO external state management libraries (Redux, Zustand)
 * =============================================================================
 */

import type { Field, FormSchema, GroupField } from '../types/schema';
import { isGroupField } from '../types/schema';

/**
 * Action types for the builder reducer
 */
export type BuilderAction =
    | { type: 'ADD_FIELD'; payload: { parentId: string | null; field: Field } }
    | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<Field> } }
    | { type: 'DELETE_FIELD'; payload: { id: string } }
    | { type: 'MOVE_FIELD'; payload: { id: string; direction: 'up' | 'down' } }
    | { type: 'SET_SCHEMA'; payload: FormSchema };

/**
 * Recursively maps over the field tree, applying a transformation function.
 * Preserves object references for unchanged branches (structural sharing).
 * 
 * @param fields - Array of fields to traverse
 * @param fn - Transformation function applied to each field
 * @returns New array with transformed fields (unchanged branches keep references)
 */
export function recursiveMap(
    fields: Field[],
    fn: (field: Field) => Field | null
): Field[] {
    const result: Field[] = [];

    for (const field of fields) {
        const transformed = fn(field);

        // If fn returns null, the field is being deleted
        if (transformed === null) {
            continue;
        }

        // If it's a group, recursively process children
        if (isGroupField(transformed)) {
            const newChildren = recursiveMap(transformed.children, fn);

            // Structural sharing: only create new object if children changed
            if (newChildren !== transformed.children) {
                result.push({ ...transformed, children: newChildren });
            } else {
                result.push(transformed);
            }
        } else {
            result.push(transformed);
        }
    }

    return result;
}

/**
 * Finds a field by ID in the tree structure
 */
export function findFieldById(fields: Field[], id: string): Field | null {
    for (const field of fields) {
        if (field.id === id) {
            return field;
        }
        if (isGroupField(field)) {
            const found = findFieldById(field.children, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Finds the parent array containing a field with the given ID
 * Returns both the array and the index of the field
 */
export function findFieldContext(
    fields: Field[],
    id: string
): { parent: Field[]; index: number } | null {
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].id === id) {
            return { parent: fields, index: i };
        }
        const field = fields[i];
        if (isGroupField(field)) {
            const found = findFieldContext(field.children, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Adds a field to a specific parent (null = root level)
 */
function addField(
    fields: Field[],
    parentId: string | null,
    newField: Field
): Field[] {
    if (parentId === null) {
        // Add to root level
        return [...fields, newField];
    }

    return fields.map((field) => {
        if (field.id === parentId && isGroupField(field)) {
            // Found the target group, add the new field to its children
            return {
                ...field,
                children: [...field.children, newField],
            };
        }
        if (isGroupField(field)) {
            // Recursively search in children
            const newChildren = addField(field.children, parentId, newField);
            // Structural sharing
            if (newChildren !== field.children) {
                return { ...field, children: newChildren };
            }
        }
        return field;
    });
}

/**
 * Updates a field by ID with partial updates
 */
function updateField(
    fields: Field[],
    id: string,
    updates: Partial<Field>
): Field[] {
    return recursiveMap(fields, (field) => {
        if (field.id === id) {
            return { ...field, ...updates } as Field;
        }
        return field;
    });
}

/**
 * Deletes a field by ID from the tree
 */
function deleteField(fields: Field[], id: string): Field[] {
    return recursiveMap(fields, (field) => {
        if (field.id === id) {
            return null; // Signal deletion
        }
        return field;
    });
}

/**
 * Moves a field up or down within its parent array
 */
function moveField(
    fields: Field[],
    id: string,
    direction: 'up' | 'down'
): Field[] {
    // Helper to swap in an array
    const swapInArray = (arr: Field[], idx: number, dir: 'up' | 'down'): Field[] => {
        const newIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= arr.length) {
            return arr; // Can't move, return unchanged
        }
        const newArr = [...arr];
        [newArr[idx], newArr[newIdx]] = [newArr[newIdx], newArr[idx]];
        return newArr;
    };

    // Check if field is at root level
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].id === id) {
            return swapInArray(fields, i, direction);
        }
    }

    // Recursively search in groups
    return fields.map((field) => {
        if (isGroupField(field)) {
            // Check if target is in this group's children
            for (let i = 0; i < field.children.length; i++) {
                if (field.children[i].id === id) {
                    const newChildren = swapInArray(field.children, i, direction);
                    if (newChildren !== field.children) {
                        return { ...field, children: newChildren };
                    }
                    return field;
                }
            }
            // Recursively search deeper
            const newChildren = moveField(field.children, id, direction);
            if (newChildren !== field.children) {
                return { ...field, children: newChildren };
            }
        }
        return field;
    });
}

/**
 * Main reducer function for the Builder Domain
 * Uses recursive approach - NO dot notation paths
 */
export function builderReducer(
    state: FormSchema,
    action: BuilderAction
): FormSchema {
    switch (action.type) {
        case 'ADD_FIELD':
            return {
                ...state,
                fields: addField(state.fields, action.payload.parentId, action.payload.field),
            };

        case 'UPDATE_FIELD':
            return {
                ...state,
                fields: updateField(state.fields, action.payload.id, action.payload.updates),
            };

        case 'DELETE_FIELD':
            return {
                ...state,
                fields: deleteField(state.fields, action.payload.id),
            };

        case 'MOVE_FIELD':
            return {
                ...state,
                fields: moveField(state.fields, action.payload.id, action.payload.direction),
            };

        case 'SET_SCHEMA':
            return action.payload;

        default:
            return state;
    }
}
