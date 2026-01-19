/**
 * =============================================================================
 * CONSTRAINT HEADER - LIVE PREVIEW
 * =============================================================================
 * Main container for the Runtime Domain UI.
 * Displays the generated form and handles submission/validation.
 *
 * HARD CONSTRAINTS:
 * - Updates immediately upon structure changes (via Context)
 * - Handles invalid data predictably
 * - NO UI frameworks
 * =============================================================================
 */

import { memo, useCallback, useState } from 'react';
import { useSchema } from '../../context/BuilderContext';
import { useFormRuntime } from '../../context/FormRuntimeContext';
import FieldRenderer from './FieldRenderer';

/**
 * LivePreview - The main runtime form component
 */
const LivePreview = memo(function LivePreview() {
    const schema = useSchema();
    const { validateForm, getFormData, resetForm } = useFormRuntime();
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submittedData, setSubmittedData] = useState<string | null>(null);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        const isValid = validateForm();

        if (isValid) {
            const data = getFormData();
            setSubmittedData(JSON.stringify(data, null, 2));
            setSubmitStatus('success');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
            }, 3000);
        } else {
            setSubmitStatus('error');
            setSubmittedData(null);
        }
    }, [validateForm, getFormData]);

    const handleReset = useCallback(() => {
        resetForm();
        setSubmitStatus('idle');
        setSubmittedData(null);
    }, [resetForm]);

    return (
        <div className="preview-container animate-fade-in">
            <header className="preview-header">
                <h2 className="preview-title">Live Preview</h2>
                <p className="preview-subtitle">
                    This is how your users will see the form
                </p>
            </header>

            {schema.fields.length === 0 ? (
                <div className="preview-empty">
                    <div className="preview-empty-icon">👈</div>
                    <p className="font-medium">Form is empty</p>
                    <p className="text-sm text-muted mt-sm">
                        Add fields from the builder sidebar to see them here
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="preview-form" noValidate>
                    <div className="card">
                        {/* Form Fields */}
                        <div className="card-body">
                            <div className="flex flex-col gap-lg">
                                {schema.fields.map((field) => (
                                    <FieldRenderer key={field.id} field={field} />
                                ))}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="card-footer flex justify-between items-center bg-gray-50">
                            <button
                                type="button"
                                className="btn btn-ghost text-danger"
                                onClick={handleReset}
                            >
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                            >
                                Submit Form
                            </button>
                        </div>
                    </div>

                    {/* Submission Feedback */}
                    {submitStatus === 'error' && (
                        <div className="p-md rounded-md bg-red-50 border border-red-200 text-danger animate-fade-in">
                            Please correct the errors above.
                        </div>
                    )}

                    {submitStatus === 'success' && submittedData && (
                        <div className="animate-fade-in">
                            <div className="p-md rounded-md bg-green-50 border border-green-200 text-success mb-sm">
                                Form submitted successfully!
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="text-sm font-semibold">Submitted Data</h3>
                                </div>
                                <pre className="card-body text-xs overflow-auto bg-gray-50" style={{ maxHeight: '200px' }}>
                                    {submittedData}
                                </pre>
                            </div>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
});

export default LivePreview;
