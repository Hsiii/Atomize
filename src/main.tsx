import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';

import './base.css';
import './theme.css';

registerSW({ immediate: true });

function loadAnalytics() {
    import('@vercel/analytics')
        .then(({ inject }) => {
            inject();
        })
        .catch(() => undefined);
}

function scheduleAnalytics() {
    if ('requestIdleCallback' in globalThis) {
        globalThis.requestIdleCallback(loadAnalytics, { timeout: 2000 });
        return;
    }

    globalThis.setTimeout(loadAnalytics, 1200, undefined);
}

const rootElement = document.querySelector('#root');

if (!rootElement) {
    throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

scheduleAnalytics();
