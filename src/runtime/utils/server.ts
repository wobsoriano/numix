import * as esbuild from 'esbuild'

export function transform(code: string, options?: esbuild.TransformOptions) {
  const res = esbuild.transformSync(code, {
    format: 'esm',
    treeShaking: true,
    loader: 'ts',
    ...options,
  })

  return res.code
}
