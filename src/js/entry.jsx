import React from 'react';
import { createRoot } from 'react-dom/client';

import App from 'js/components/App';

// Render application (global APP_NAME comes from DefinePlugin)
const root = createRoot(document.getElementById('mount'));
root.render(<App name={APP_NAME} />);
