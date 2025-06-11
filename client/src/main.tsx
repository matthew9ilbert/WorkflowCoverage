import { createRoot } from "react-dom/client";
import React from 'react';
import './index.css';
import App from './App';
import PageTitleUpdater from './PageTitleUpdater';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PageTitleUpdater />
    <App />
  </React.StrictMode>
);
