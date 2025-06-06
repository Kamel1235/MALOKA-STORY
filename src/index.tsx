import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './contexts/DataContext'; // Import DataProvider
// import './index.css'; // Tailwind is loaded via CDN in index.html

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider> {/* Wrap App with DataProvider */}
      <App />
    </DataProvider>
  </React.StrictMode>
);
