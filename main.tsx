
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

// The pre-rendered HTML (scripts/prerender.mjs) is a build-time SEO snapshot,
// not a true server render. Its markup depends on runtime state (localStorage,
// auth, welcome modal, cookie banner) that differs on the client, so hydrating
// it causes React hydration mismatches (errors #418 / #423) and leaves the UI
// stuck. We therefore always do a fresh client render: crawlers still receive
// the pre-rendered HTML, while browsers render cleanly with no mismatch.
rootElement.innerHTML = '';
ReactDOM.createRoot(rootElement).render(appTree);
