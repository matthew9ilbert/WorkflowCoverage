import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import PageTitleUpdater from './PageTitleUpdater';

ReactDOM.render(
  <React.StrictMode>
    <PageTitleUpdater />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
