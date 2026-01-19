# Vanilla React Configurable Form Builder

A high-performance, accessible, and dependency-free form builder built with **React 19** and **TypeScript**. This project demonstrates advanced React patterns, strict domain isolation, and "Vanilla" mastery by avoiding external UI frameworks and state management libraries.

![Project Status](https://img.shields.io/badge/Status-Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_TypeScript_|_Vite-blue)
![Style](https://img.shields.io/badge/Style-Pure_CSS_|_Modules-purple)
[![Live Demo](https://img.shields.io/badge/Demo-Live_App-success?style=for-the-badge&logo=github)](https://ansurm.github.io/Assignment-Snr-FE-Engineer-Syed-Ansur-Mehdi/)

> **🔴 Live Demo:** [https://ansurm.github.io/Assignment-Snr-FE-Engineer-Syed-Ansur-Mehdi/](https://ansurm.github.io/Assignment-Snr-FE-Engineer-Syed-Ansur-Mehdi/)

---

## 🚀 Project Overview

This application allows users to:
1.  **Build Forms Interactively**: Add text, number, and nested group fields.
2.  **Manage Structure**: Reorder, delete, and configure field properties (labels, validation).
3.  **Live Preview**: Instantly test the form with real-time validation.
4.  **Import/Export**: Save and load form schemas via JSON.

### Key Engineering Decisions
*   **Zero Dependencies**: No Redux, Zustand, Formik, or Tailwind. Just pure React and CSS.
*   **Domain Isolation**: Strict separation between the **Builder Domain** (Schema Tree) and **Runtime Domain** (User Input).
*   **Performance First**: Heavy use of `React.memo`, structural sharing in reducers, and referential stability.

---

## 🛠️ Architecture & Concepts

### 1. Domain Isolation Strategy
We separated the application into two distinct contexts to prevent unnecessary re-renders:
*   **Builder Context**: Manages the `FormSchema` tree. Uses a **Recursive Reducer** pattern to handle deep updates immutably.
*   **Runtime Context**: Manages `FormData` (user input). Uses an **Intelligent Merging** strategy to preserve user input even when the schema structure changes.

### 2. Recursive Rendering
Instead of flat lists, we use a true recursive component structure:
*   `FormBuilderItem` renders itself for nested groups.
*   `GroupRenderer` uses `<fieldset>` nesting to create semantic hierarchy.

### 3. React 19 & Hooks Usage
*   **`useReducer`**: For complex state logic in the Builder (Add/Move/Delete/Update).
*   **`useContext`**: For dependency injection across the isolated domains.
*   **`useMemo` & `useCallback`**: To ensure referential stability and prevent wasted renders in `React.memo` components.
*   **`React.memo`**: Applied to all list items to ensure only changed fields re-render.

### 4. Performance Optimization
*   **Input Debouncing**: Implemented a reusable `DebouncedInput` component for all text and number inputs. This ensures that rapid typing does not trigger expensive global state updates or validation checks on every keystroke, keeping the UI responsive even with large forms.

---

## 🎨 Styling & Accessibility (A11y)

### Semantic HTML
We prioritize semantic elements over generic `div` soup:
*   **Groups**: Rendered as `<fieldset>` with `<legend>` for proper screen reader context.
*   **Collapsibles**: Native `<details>` and `<summary>` elements for accessible interactions.
*   **Forms**: Proper `<label>` association with inputs via `htmlFor`/`id`.
*   **Landmarks**: `<aside>` for the sidebar, `<main>` for the preview area.

### Pure CSS Architecture
*   **Design Tokens**: CSS Variables (`--color-primary`, `--space-md`) for consistent theming.
*   **Utility Classes**: A custom micro-framework (e.g., `.flex`, `.p-md`, `.card`) inspired by Tailwind but written from scratch.
*   **Animations**: Subtle CSS transitions and `@keyframes` for a premium feel.
*   **Focus Management**: Native focus outlines preserved for keyboard navigation.

---

## 📖 User Guide

### Building a Form
1.  **Add Fields**: Use the toolbar in the Left Sidebar to add **Text**, **Number**, or **Group** fields.
2.  **Edit Properties**:
    *   **Label**: Change the display name.
    *   **Required**: Toggle validation.
    *   **Min/Max**: Set constraints for number fields.
3.  **Structure**:
    *   Use **↑ / ↓** arrows to reorder fields.
    *   Click the **▶** arrow to collapse/expand groups.

### Exporting & Importing
1.  Click **📤 Export JSON** to generate the schema.
2.  Copy the JSON to save your form.
3.  To load a form, click **📥 Import JSON**, paste your schema, and hit **Import**.

### Live Preview
*   The Right Panel shows the form as users will see it.
*   **Validation**: Try submitting empty required fields to see error states.
*   **Data Preservation**: Modify the form in the builder (e.g., change a label) and notice your typed data remains!

---

## 📂 Directory Structure

```
src/
├── components/
│   ├── builder/
│   │   ├── FormBuilderSidebar.tsx    # Parent container for configuration
│   │   └── FormBuilderItem.tsx       # Individual field/group editor (Memoized)
│   ├── runtime/
│   │   ├── LivePreview.tsx           # Container for the form preview
│   │   ├── FieldRenderer.tsx         # Dispatches rendering based on field type
│   │   └── GroupRenderer.tsx         # Handles recursive group rendering
│   ├── ui/
│   │   └── DebouncedInput.tsx        # Reusable debounced input components
├── context/
│   ├── BuilderContext.tsx            # Global state for Form Schema (Tree)
│   └── FormRuntimeContext.tsx        # Local state for User Input (Key-Value)
├── styles/
│   └── main.css                      # Centralized Utility CSS & Layout
├── types/
│   └── schema.ts                     # TypeScript definitions for Fields and Data
└── utils/
    ├── recursiveReducer.ts           # Logic for immutable tree updates
    ├── dataMerging.ts                # Logic for intelligent schema/data sync
    └── idGenerator.ts                # Logic for generating unique IDs
```

---

## 🏃‍♂️ Running Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm install
    npm run build
    ```

---

## 🚀 Future Implementations & Engineering Standards

To ensure this project remains production-ready, maintainable, and follows industry standards, the following engineering practices and future enhancements are prioritized:

### 🛠️ Professionalism & Tooling
*   **Strict Type Safety**: Tightened TypeScript configuration (e.g., `noUncheckedIndexedAccess`, `noImplicitReturns`) to catch edge cases at compile-time.
*   **Linting & Formatting**: Integrated **Prettier** and enhanced **ESLint** rules (using `strictTypeChecked`) to enforce consistent code style and prevent common pitfalls. This ensures the codebase is not just functional but also follows high-quality industry standards.
*   **CI/CD Integration**: Future plans include GitHub Actions to automate linting, type-checking, and deployment on every push.

### 📈 Scalability & Optimization
*   **Advanced Focus Management**: Implementing more granular focus trapping for complex nested groups to enhance keyboard accessibility.
*   **Dynamic Theming**: Expanding the CSS variable system to support full dark/light mode switching and custom brand themes.
*   **Unit & Integration Testing**: Adding Vitest and React Testing Library to verify the recursive reducer logic and form validation states.

