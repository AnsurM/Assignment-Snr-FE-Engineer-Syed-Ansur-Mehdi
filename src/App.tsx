/**
 * =============================================================================
 * APP COMPONENT
 * =============================================================================
 * Root component that sets up the application layout and context providers.
 *
 * LAYOUT: Flexbox split-screen view
 * - Builder Sidebar (Left) with independent scrolling
 * - Live Preview (Right) - placeholder until Phase 4
 * =============================================================================
 */

import { BuilderProvider, FormRuntimeProvider } from './context';
import { FormBuilderSidebar } from './components/builder';
import './styles/main.css';

function App() {
  return (
    <BuilderProvider>
      <FormRuntimeProvider>
        <div className="app-layout">
          {/* Builder Domain - Left Sidebar */}
          <FormBuilderSidebar />

          {/* Runtime Domain - Right Preview (Phase 4) */}
          <main className="main-content">
            <div className="preview-container">
              <header className="preview-header">
                <h2 className="preview-title">Live Preview</h2>
                <p className="preview-subtitle">
                  Your form will appear here as you build it
                </p>
              </header>

              {/* Placeholder until Phase 4 */}
              <div className="preview-empty">
                <div className="preview-empty-icon">👁️</div>
                <p className="font-medium">Preview Coming Soon</p>
                <p className="text-sm text-muted mt-sm">
                  Runtime components will be added in Phase 4
                </p>
              </div>
            </div>
          </main>
        </div>
      </FormRuntimeProvider>
    </BuilderProvider>
  );
}

export default App;
