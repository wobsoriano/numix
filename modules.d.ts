declare module 'acorn-strip-function' {
  const stripFunction: (code: string, fn: string) => string
  export {
    stripFunction as default
  }
}
