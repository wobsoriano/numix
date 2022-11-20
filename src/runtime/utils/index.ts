import _stripFunction from 'acorn-strip-function'
import * as esbuild from 'esbuild'

export function stripFunction(code: string, fnName: 'loader' | 'action') {
  const stripped = _stripFunction(code, fnName)

  const result = transform(stripped)

  return result
}

export function transform(code: string) {
  const res = esbuild.transformSync(code, {
    format: 'esm',
    treeShaking: true,
    loader: 'ts',
  })

  return res.code
}

export * from './dom'
