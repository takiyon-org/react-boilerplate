import React from 'react';
import { createRoot } from 'react-dom/client';

import App from 'js/components/App';

// Render application (global APP_NAME comes from DefinePlugin)
const container = document.getElementById('mount');
if (container) {
  const root = createRoot(container);
  root.render(<App name={APP_NAME} />);
}
