import { transformSync } from '@babel/core';
import { readFileSync } from 'node:fs';

// Transform the source of .jsx files using Babel
function transformWithBabel(source, filename) {
    const { code } = transformSync(source, { filename });

    return code;
}

// eslint-disable-next-line import/prefer-default-export
export function load(url, context, nextLoad) {
    if (url.endsWith('.jsx')) {
        // Read the original source code from the file
        const source = readFileSync(new URL(url), 'utf8');

        // Transform the source using Babel
        const transformedSource = transformWithBabel(source, url);

        return {
            format: 'module', // Indicate that the transformed source is an ES module
            shortCircuit: true, // Signals that this hook provides the final transformation
            source: transformedSource,
        };
    }

    // For all other files, defer to the next hook in the chain.
    return nextLoad(url, context);
}
