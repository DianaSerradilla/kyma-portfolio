import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A reload always starts at the top (the header): no scroll restoration, no leftover #section.
const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
if (navigation?.type === 'reload' && location.hash) {
  history.replaceState(null, '', location.pathname + location.search)
}
// Set after replaceState: changing the history entry can reset the mode to "auto".
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

// The mode is stored per history entry (anchor links create new ones), so also rewind
// right before the page unloads: whatever position the browser remembers is the top.
window.addEventListener('beforeunload', () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
