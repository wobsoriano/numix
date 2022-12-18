import type { H3Event } from 'h3'
import { sendRedirect, setResponseHeader } from 'h3'

export function redirect(event: H3Event, location: string, code?: number) {
  setResponseHeader(event, 'X-NUMIX-REDIRECT', location)
  return sendRedirect(event, location, code)
}
