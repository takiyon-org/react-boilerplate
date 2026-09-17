import { registerHooks } from 'node:module';

import { load } from './jsxLoader.js';

// Register JSX loader so Mocha/Chai and load JSX files with ESM
registerHooks({ load });
