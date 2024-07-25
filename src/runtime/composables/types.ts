export type PickFrom<T, K extends Array<string>> = T extends Array<unknown> ? T : T extends Record<string, unknown> ? keyof T extends K[number] ? T : K[number] extends never ? T : Pick<T, K[number]> : T
export type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>
