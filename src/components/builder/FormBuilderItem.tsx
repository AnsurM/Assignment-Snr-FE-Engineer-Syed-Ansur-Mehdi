/**
 * =============================================================================
 * CONSTRAINT HEADER - FORM BUILDER ITEM
 * =============================================================================
 * Constraint: Must be wrapped in React.memo for structural sharing.
 * This ensures that when the recursive reducer preserves object references
 * for unchanged branches, this component will skip re-renders.
 *
 * HARD CONSTRAINTS:
 * - Wrapped in React.memo
 * - References types/schema.ts as Single Source of Truth
 * - NO UI frameworks (Tailwind, Bootstrap)
 * - Uses semantic HTML for accessibility
 * =============================================================================
 */

import { memo, useCallback, type ChangeEvent } from 'react';
import type { Field, FieldType } from '../../types/schema';
import { isGroupField, isNumberField } from '../../types/schema';
import { useBuilder } from '../../context';

/**
 * Props for FormBuilderItem
 */
interface FormBuilderItemProps {
    /** The field to render */
    field: Field;
    /** Nesting depth for visual hierarchy */
    depth?: number;
    /** Whether this is the first item in its parent (disable move up) */
    isFirst?: boolean;
    /** Whether this is the last item in its parent (disable move down) */
    isLast?: boolean;
}

/**
 * Get the CSS class for the field type badge
 */
function getTypeClass(type: FieldType): string {
    switch (type) {
        case 'group':
            return 'builder-item-type builder-item-type--group';
        case 'number':
            return 'builder-item-type builder-item-type--number';
        default:
            return 'builder-item-type';
    }
}

/**
 * FormBuilderItem - Recursive component for rendering/editing a single field
 * Wrapped in React.memo for performance optimization with structural sharing
 */
const FormBuilderItem = memo(function FormBuilderItem({
    field,
    depth = 0,
    isFirst = false,
    isLast = false,
}: FormBuilderItemProps) {
    const { updateField, deleteField, moveField, addField } = useBuilder();

    /**
     * Handle label change
     */
    const handleLabelChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            updateField(field.id, { label: e.target.value });
        },
        [field.id, updateField]
    );

    /**
     * Handle required toggle
     */
    const handleRequiredChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            updateField(field.id, { required: e.target.checked });
        },
        [field.id, updateField]
    );

    /**
     * Handle placeholder change (for text/number fields)
     */
    const handlePlaceholderChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            updateField(field.id, { placeholder: e.target.value });
        },
        [field.id, updateField]
    );

    /**
     * Handle min value change (for number fields)
     */
    const handleMinChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            updateField(field.id, {
                min: value === '' ? undefined : Number(value),
            });
        },
        [field.id, updateField]
    );

    /**
     * Handle max value change (for number fields)
     */
    const handleMaxChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            updateField(field.id, {
                max: value === '' ? undefined : Number(value),
            });
        },
        [field.id, updateField]
    );

    /**
     * Handle delete
     */
    const handleDelete = useCallback(() => {
        deleteField(field.id);
    }, [field.id, deleteField]);

    /**
     * Handle move up
     */
    const handleMoveUp = useCallback(() => {
        moveField(field.id, 'up');
    }, [field.id, moveField]);

    /**
     * Handle move down
     */
    const handleMoveDown = useCallback(() => {
        moveField(field.id, 'down');
    }, [field.id, moveField]);

    /**
     * Handle adding child field to group
     */
    const handleAddChild = useCallback(
        (type: FieldType) => {
            addField(type, field.id);
        },
        [field.id, addField]
    );

    const isGroup = isGroupField(field);
    const isNumber = isNumberField(field);

    return (
        <div
            className={`builder-item ${isGroup ? 'builder-item--group' : ''} animate-fade-in`}
            role="listitem"
            aria-label={`${field.type} field: ${field.label}`}
        >
            {/* Header with type badge and actions */}
            <div className="builder-item-header">
                <span className={getTypeClass(field.type)}>
                    {field.type}
                </span>
                <div className="builder-item-actions">
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={handleMoveUp}
                        disabled={isFirst}
                        aria-label="Move field up"
                        title="Move up"
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={handleMoveDown}
                        disabled={isLast}
                        aria-label="Move field down"
                        title="Move down"
                    >
                        ↓
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={handleDelete}
                        aria-label={`Delete ${field.label}`}
                        title="Delete field"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Field configuration form */}
            <div className="builder-item-fields">
                {/* Label input */}
                <div className="input-group">
                    <label htmlFor={`${field.id}-label`} className="input-label">
                        Label
                    </label>
                    <input
                        id={`${field.id}-label`}
                        type="text"
                        className="input"
                        value={field.label}
                        onChange={handleLabelChange}
                        placeholder="Enter field label"
                    />
                </div>

                {/* Required checkbox */}
                <div className="checkbox-group">
                    <input
                        id={`${field.id}-required`}
                        type="checkbox"
                        className="checkbox"
                        checked={field.required}
                        onChange={handleRequiredChange}
                    />
                    <label htmlFor={`${field.id}-required`} className="checkbox-label">
                        Required field
                    </label>
                </div>

                {/* Placeholder for text/number fields */}
                {!isGroup && (
                    <div className="input-group">
                        <label htmlFor={`${field.id}-placeholder`} className="input-label">
                            Placeholder
                        </label>
                        <input
                            id={`${field.id}-placeholder`}
                            type="text"
                            className="input"
                            value={'placeholder' in field ? field.placeholder || '' : ''}
                            onChange={handlePlaceholderChange}
                            placeholder="Enter placeholder text"
                        />
                    </div>
                )}

                {/* Min/Max for number fields */}
                {isNumber && (
                    <>
                        <div className="flex gap-md">
                            <div className="input-group flex-grow">
                                <label htmlFor={`${field.id}-min`} className="input-label">
                                    Min Value
                                </label>
                                <input
                                    id={`${field.id}-min`}
                                    type="number"
                                    className="input"
                                    value={field.min ?? ''}
                                    onChange={handleMinChange}
                                    placeholder="No min"
                                />
                            </div>
                        </div>
                        <div className="flex gap-md">
                            <div className="input-group flex-grow">
                                <label htmlFor={`${field.id}-max`} className="input-label">
                                    Max Value
                                </label>
                                <input
                                    id={`${field.id}-max`}
                                    type="number"
                                    className="input"
                                    value={field.max ?? ''}
                                    onChange={handleMaxChange}
                                    placeholder="No max"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Children for group fields - recursive rendering */}
            {isGroup && (
                <div className="builder-item-children">
                    {/* Toolbar to add children */}
                    <div className="add-field-toolbar">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddChild('text')}
                        >
                            + Text
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddChild('number')}
                        >
                            + Number
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddChild('group')}
                        >
                            + Group
                        </button>
                    </div>

                    {/* Render children recursively */}
                    {field.children.length === 0 ? (
                        <p className="text-muted text-sm p-md">
                            No fields in this group. Add fields using the buttons above.
                        </p>
                    ) : (
                        <div role="list" aria-label={`Fields in ${field.label}`}>
                            {field.children.map((child, index) => (
                                <FormBuilderItem
                                    key={child.id}
                                    field={child}
                                    depth={depth + 1}
                                    isFirst={index === 0}
                                    isLast={index === field.children.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default FormBuilderItem;
