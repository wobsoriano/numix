import _stripFunction from 'acorn-strip-function'
import * as esbuild from 'esbuild'

export function stripFunction(code: string, fnName: 'loader' | 'action', options?: esbuild.TransformOptions) {
  const stripped = _stripFunction(code, fnName)

  const result = transform(stripped, options)

  return result
}

export function transform(code: string, options?: esbuild.TransformOptions) {
  const res = esbuild.transformSync(code, {
    format: 'esm',
    treeShaking: true,
    loader: 'ts',
    ...options,
  })

  return res.code
}

export * from './dom'
