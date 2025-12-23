import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ping } from './lib/appwrite';

// Ping Appwrite on startup to verify connectivity (non-blocking)
ping()
  .then(() => console.info('Appwrite ping succeeded'))
  .catch((err) => console.warn('Appwrite ping failed', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
