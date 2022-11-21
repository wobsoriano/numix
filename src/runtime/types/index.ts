import type { H3Event } from 'h3'

export type AppData = any

export interface LoaderEvent extends H3Event {
  params: Record<string, string>
}

export interface LoaderFunction {
  (event: LoaderEvent): Promise<AppData> | AppData
}

export interface ActionEvent extends H3Event {
  params: Record<string, string>
}

export interface ActionFunction {
  (args: ActionEvent): Promise<AppData> | AppData
}
