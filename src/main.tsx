import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Redirect all auto-generated Vercel preview URLs to the main production domain
// This ensures Firebase Authentication works perfectly when clicking GitHub deployment links
const MAIN_DOMAIN = 'carbonwise-ai-five.vercel.app';
if (
  window.location.hostname.endsWith('.vercel.app') &&
  window.location.hostname !== MAIN_DOMAIN
) {
  window.location.replace(`https://${MAIN_DOMAIN}${window.location.pathname}${window.location.search}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
