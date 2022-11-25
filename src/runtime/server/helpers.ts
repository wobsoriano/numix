import type { H3Event } from 'h3'
import { sendRedirect, setHeader, setResponseHeader } from 'h3'

export function redirect(event: H3Event, location: string, code?: number) {
  setResponseHeader(event, 'x-numix-redirect', location)
  return sendRedirect(event, location, code)
}
