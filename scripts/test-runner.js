#!/usr/bin/env node
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';

const jestPath = resolve('node_modules/jest/bin/jest.js');
await import(pathToFileURL(jestPath).href);
