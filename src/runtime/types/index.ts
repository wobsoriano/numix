import type { H3Event } from 'h3'

export interface LoaderEvent extends H3Event {
  params: Record<string, string>
}

export interface ActionEvent extends H3Event {
  params: Record<string, string>
}
