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