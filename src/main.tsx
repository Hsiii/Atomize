import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { router } from './router';

import './base.css';
import './theme.css';

registerSW({ immediate: true });

const rootElement = document.querySelector('#root');

if (!rootElement) {
    throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
        <Analytics />
    </React.StrictMode>
);
