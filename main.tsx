
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root')!;
const appTree = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Hydrate if pre-rendered content exists, otherwise create fresh root
if (rootElement.innerHTML.trim().length > 0) {
  ReactDOM.hydrateRoot(rootElement, appTree);
} else {
  ReactDOM.createRoot(rootElement).render(appTree);
}
