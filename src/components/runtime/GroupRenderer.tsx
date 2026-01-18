/**
 * =============================================================================
 * CONSTRAINT HEADER - GROUP RENDERER
 * =============================================================================
 * Recursively renders groups of fields.
 *
 * HARD CONSTRAINTS:
 * - Must use semantic <fieldset> and <legend> for accessibility
 * - Handles recursive nesting
 * - NO UI frameworks
 * =============================================================================
 */

import { memo } from 'react';
import type { GroupField } from '../../types/schema';
import FieldRenderer from './FieldRenderer';

interface GroupRendererProps {
    field: GroupField;
}

/**
 * GroupRenderer - Renders a fieldset with a legend and recursively renders children
 */
const GroupRenderer = memo(function GroupRenderer({ field }: GroupRendererProps) {
    return (
        <fieldset className="fieldset">
            <legend className="fieldset-legend">
                {field.label}
                {field.required && <span className="text-danger"> *</span>}
            </legend>

            <div className="flex flex-col gap-lg">
                {field.children.length === 0 ? (
                    <p className="text-muted text-sm italic">Empty group</p>
                ) : (
                    field.children.map((child) => (
                        <FieldRenderer key={child.id} field={child} />
                    ))
                )}
            </div>
        </fieldset>
    );
});

export default GroupRenderer;
