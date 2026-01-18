/**
 * =============================================================================
 * APP COMPONENT
 * =============================================================================
 * Root component that sets up the application layout and context providers.
 *
 * LAYOUT: Flexbox split-screen view
 * - Builder Sidebar (Left) with independent scrolling
 * - Live Preview (Right) - The actual runtime form
 * =============================================================================
 */

import { BuilderProvider, FormRuntimeProvider } from './context';
import { FormBuilderSidebar } from './components/builder';
import { LivePreview } from './components/runtime';
import './styles/main.css';

function App() {
  return (
    <BuilderProvider>
      <FormRuntimeProvider>
        <div className="app-layout">
          {/* Builder Domain - Left Sidebar */}
          <FormBuilderSidebar />

          {/* Runtime Domain - Right Preview */}
          <main className="main-content">
            <LivePreview />
          </main>
        </div>
      </FormRuntimeProvider>
    </BuilderProvider>
  );
}

export default App;
