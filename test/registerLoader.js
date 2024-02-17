import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register JSX loader so Mocha/Chai and load JSX files with ESM
register('./test/jsxLoader.js', pathToFileURL('./'));
