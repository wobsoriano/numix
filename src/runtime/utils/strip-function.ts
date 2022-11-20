import _stripFunction from 'acorn-strip-function'
import * as esbuild from 'esbuild'

export function stripFunction(code: string, fnName: 'loader' | 'action') {
  const stripped = _stripFunction(code, fnName)

  const res = esbuild.transformSync(stripped, {
    format: 'esm',
    treeShaking: true,
    loader: 'ts',
  })

  return res.code
}
