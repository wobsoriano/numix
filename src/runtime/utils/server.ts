// @ts-expect-error: Missing types
import _stripFunction from 'acorn-strip-function'
import * as esbuild from 'esbuild'

export function stripFunction(code: string, fn: string[], options?: esbuild.TransformOptions) {
  let stripped = code

  fn.forEach((name) => {
    stripped = _stripFunction(stripped, name)
  })

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
