/**
 * =============================================================================
 * CONSTRAINT HEADER - FORM BUILDER SIDEBAR
 * =============================================================================
 * Main container for the Builder Domain UI.
 * Provides controls for adding fields, importing/exporting JSON.
 *
 * HARD CONSTRAINTS:
 * - NO UI frameworks (Tailwind, Bootstrap)
 * - References types/schema.ts as Single Source of Truth
 * - Independent scrolling from preview panel
 * =============================================================================
 */

import { useState, useCallback, type ChangeEvent, memo } from 'react';
import { useBuilder } from '../../context';
import FormBuilderItem from './FormBuilderItem';

/**
 * FormBuilderSidebar - Main sidebar container for the form builder
 */
const FormBuilderSidebar = memo(function FormBuilderSidebar() {
    const { schema, addField, importSchema, exportSchema } = useBuilder();
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    /**
     * Handle adding a root-level field
     */
    const handleAddTextField = useCallback(() => {
        addField('text', null);
    }, [addField]);

    const handleAddNumberField = useCallback(() => {
        addField('number', null);
    }, [addField]);

    const handleAddGroupField = useCallback(() => {
        addField('group', null);
    }, [addField]);

    /**
     * Handle export - copies to clipboard and shows in textarea
     */
    const handleExport = useCallback(() => {
        const json = exportSchema();
        setImportText(json);
        setShowImport(true);
        setImportError(null);
        // Also copy to clipboard
        navigator.clipboard.writeText(json).catch(() => {
            // Silently fail if clipboard access is denied
        });
    }, [exportSchema]);

    /**
     * Handle import text change
     */
    const handleImportTextChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            setImportText(e.target.value);
            setImportError(null);
        },
        []
    );

    /**
     * Handle import action
     */
    const handleImport = useCallback(() => {
        if (!importText.trim()) {
            setImportError('Please paste a valid JSON schema');
            return;
        }

        const success = importSchema(importText);
        if (success) {
            setShowImport(false);
            setImportText('');
            setImportError(null);
        } else {
            setImportError('Invalid JSON format. Please check your schema.');
        }
    }, [importText, importSchema]);

    /**
     * Toggle import section visibility
     */
    const toggleImport = useCallback(() => {
        setShowImport((prev) => !prev);
        setImportError(null);
    }, []);

    return (
        <aside className="sidebar" aria-label="Form Builder">
            {/* Header */}
            <header className="sidebar-header">
                <h1 className="text-xl font-bold">Form Builder</h1>
                <p className="text-sm text-muted mt-xs">Build your form by adding fields below</p>
            </header>

            {/* Scrollable content */}
            <div className="sidebar-content">
                {/* Add field toolbar */}
                <section aria-label="Add new fields">
                    <div className="add-field-toolbar">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleAddTextField}
                        >
                            + Text
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleAddNumberField}
                        >
                            + Number
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleAddGroupField}
                        >
                            + Group
                        </button>
                    </div>
                </section>

                {/* Field list */}
                <section aria-label="Form fields">
                    {schema.fields.length === 0 ? (
                        <div className="preview-empty mt-md">
                            <div className="preview-empty-icon">📝</div>
                            <p className="font-medium">No fields yet</p>
                            <p className="text-sm text-muted mt-sm">
                                Click the buttons above to add your first field
                            </p>
                        </div>
                    ) : (
                        <div role="list" aria-label="Form field configuration">
                            {schema.fields.map((field, index) => (
                                <FormBuilderItem
                                    key={field.id}
                                    field={field}
                                    depth={0}
                                    isFirst={index === 0}
                                    isLast={index === schema.fields.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Import/Export section */}
                <section className="export-section" aria-label="Import and export">
                    <div className="flex gap-sm mb-md">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleExport}
                        >
                            📤 Export JSON
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={toggleImport}
                        >
                            📥 {showImport ? 'Hide Import' : 'Import JSON'}
                        </button>
                    </div>

                    {showImport && (
                        <div className="animate-fade-in">
                            <label htmlFor="import-json" className="input-label mb-sm block">
                                Paste JSON Schema
                            </label>
                            <textarea
                                id="import-json"
                                className={`export-textarea ${importError ? 'input--error' : ''}`}
                                value={importText}
                                onChange={handleImportTextChange}
                                placeholder='{"fields": [...]}'
                                aria-describedby={importError ? 'import-error' : undefined}
                            />
                            {importError && (
                                <p id="import-error" className="input-error-message mt-sm">
                                    {importError}
                                </p>
                            )}
                            <div className="export-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleImport}
                                >
                                    Import Schema
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setImportText('');
                                        setImportError(null);
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </aside>
    );
});

export default FormBuilderSidebar;
