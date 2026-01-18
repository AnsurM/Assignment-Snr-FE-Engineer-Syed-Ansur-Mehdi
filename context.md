This document serves as the Project Context and Implementation Roadmap for the "Vanilla React Configurable Form Builder." It integrates the core requirements from the assessment and the architectural plan established in our discussion.

--------------------------------------------------------------------------------
1. Project Core Objective
Build a ConfigurableFormBuilder component that allows users to interactively construct forms, manage nested groups, preview the form live, and export/import configurations via JSON.
2. Functional Requirements
• Field Support: Must support text, number, and group (recursive) types.
• Field Properties: Every field requires a Label and a required boolean. Numeric fields need optional min/max values. Groups must support an array of child fields.
• User Actions: Users must be able to delete fields and reorder them within the same group using "move up/move down" buttons.
• Live Preview: Must update immediately upon structure changes, validate required fields, and handle invalid data predictably.
• Data Portability: Provide an Export button (JSON output in a textarea) and an Import capability (pasting JSON to reconstruct the form).
3. Technical Constraints & Restrictions
• Strict No-Library Policy: You may not use state management libraries (Redux, Zustand) or form libraries (React Hook Form, Formik).
• No UI Frameworks (Bonus): Do not use Tailwind, Bootstrap, or Material UI; use pure CSS and Semantic HTML.
• Allowed React Features: Context API, custom hooks, and standard optimizations like memo, useCallback, and useMemo.
• Tech Stack: React 19, TypeScript, and Vite for scaffolding.
4. Architectural Strategy
• Isolated Domains: Separate the Builder Domain (global schema/tree state) from the Runtime Domain (local user input data) to ensure performance and prevent massive re-renders.
• Recursive Map Logic: Use a useReducer with a recursive approach to traverse and update the field tree immutably.
• Structural Sharing: Ensure the reducer preserves object references for unchanged branches so that React.memo can effectively skip re-renders.
• Intelligent Sync: The Runtime domain must use an "Intelligent Merging" strategy to update the form state when the schema changes without losing existing user input.
5. UI & Accessibility (A11y) Guidelines
• Layout: A flexbox split-screen view: Builder Sidebar (Left) with independent scrolling vs. Live Preview (Right).
• Visual Hierarchy: Use <fieldset> and <legend> for groups, applying a 20px indentation per nesting level and subtle background colors for distinction.
• "Good Enough" Styling: A centralized styles/main.css containing core utility classes (e.g., .btn, .input-group, .card).
• Native A11y: Rely on semantic HTML for screen readers and native browser focus outlines for keyboard navigation.
6. Directory Structure (Phase 1 Scaffolding)
src/
├── components/
│   ├── builder/ (FormBuilderSidebar.tsx, FormBuilderItem.tsx)
│   └── runtime/ (LivePreview.tsx, FieldRenderer.tsx, GroupRenderer.tsx)
├── context/ (BuilderContext.tsx, FormRuntimeContext.tsx)
├── hooks/
├── styles/ (main.css)
├── types/ (schema.ts)
└── utils/ (recursiveReducer.ts, dataMerging.ts)
7. Immediate Implementation Instructions
    1. Strictly adhere to the Field interface for the "Single Source of Truth".
    2. Prioritize performance by wrapping configuration items in React.memo.
    3. Ensure recursive rendering is handled by the GroupRenderer calling the FieldRenderer.