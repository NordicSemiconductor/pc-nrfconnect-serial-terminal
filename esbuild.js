/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { sassPlugin } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');

Promise.all([
    esbuild
        .build({
            entryPoints: ['./main/index.ts'],
            outfile: './dist/main-bundle.js',
            target: 'node14',
            platform: 'node',
            external: ['fs', 'electron'],
            bundle: true,
            write: true,
            watch: {
                onRebuild(error, result) {
                    if (error) {
                        console.error('watch build failed:', error);
                    } else {
                        console.log('Rebuilt main');
                    }
                },
            },
        })
        .then(() => {
            console.log('Built main');
        }),
    esbuild
        .build({
            outfile: './dist/terminal-bundle.js',
            target: 'chrome89',
            sourcemap: true,
            external: ['fs', 'electron'],
            bundle: true,
            write: true,
            watch: {
                onRebuild(error, result) {
                    if (error) {
                        console.error('watch build failed:', error);
                    } else {
                        console.log('Rebuilt terminal');
                    }
                },
            },
            plugins: [sassPlugin()],
        })
        .then(() => {
            console.log('Built terminal');
        }),
]).catch(({ errors, warnings }) => {
    if (errors.length) {
        console.error(errors);
    }
    if (warnings.length) {
        console.warn(warnings);
    }

    console.log('Started watching');
});
