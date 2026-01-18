/**
 * =============================================================================
 * CONTEXT BARREL EXPORT
 * =============================================================================
 * Re-exports all context providers and hooks for clean imports.
 * 
 * DOMAIN ISOLATION:
 * - BuilderContext: Builder Domain (schema tree)
 * - FormRuntimeContext: Runtime Domain (user input)
 * =============================================================================
 */

// Builder Domain
export { BuilderProvider, useBuilder, useSchema } from './BuilderContext';

// Runtime Domain
export {
    FormRuntimeProvider,
    useFormRuntime,
    useFieldValue,
} from './FormRuntimeContext';
