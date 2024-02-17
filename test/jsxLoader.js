import babel from '@babel/core';
import { readFile } from 'node:fs/promises';

// Transform the source of .jsx files using Babel
async function transformWithBabel(source, filename) {
    const { code } = await babel.transformAsync(source, { filename });

    return code;
}

// eslint-disable-next-line import/prefer-default-export
export async function load(url, context, nextLoad) {
    if (url.endsWith('.jsx')) {
        // Read the original source code from the file
        const source = await readFile(new URL(url), 'utf8');

        // Transform the source using Babel
        const transformedSource = await transformWithBabel(source, url);

        return {
            format: 'module', // Indicate that the transformed source is an ES module
            shortCircuit: true, // Signals that this hook provides the final transformation
            source: transformedSource,
        };
    }

    // For all other files, defer to the next hook in the chain.
    return nextLoad(url, context);
}
