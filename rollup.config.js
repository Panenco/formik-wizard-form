import path from 'path';

import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';

import packageJson from './package.json';

const paths = {};

paths.root = path.resolve(__dirname, '.');
paths.nodeModules = path.join(paths.root, 'node_modules');
paths.src = path.join(paths.root, 'src');
paths.entryPoint = path.join(paths.src, 'index.tsx');

const external = Object.keys(packageJson.peerDependencies).concat(['util']);

export default {
  input: paths.entryPoint,
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: packageJson.module,
      format: 'esm',
      exports: 'named',
      sourcemap: true
    }
  ],
  external,
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      customResolveOptions: {
        moduleDirectory: ['node_modules', paths.src],
      },
    }),
    typescript({
        clean: true
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
};
