import { handleJsonRoute, MAX_BODY_CHARS, type JsonRouteOptions } from '@/lib/http/json-route'

export { MAX_BODY_CHARS }

export interface JsonPostOptions extends Pick<JsonRouteOptions, 'route' | 'limiter'> {
  /** Receives the parsed JSON body and builds the success (or validation failure) response. */
  readonly handle: (body: unknown) => Promise<Response>
}

/** POST flavour of `handleJsonRoute`: same-origin check, rate limit, bounded JSON parse, then the handler. */
export function handleJsonPost(request: Request, { route, limiter, handle }: JsonPostOptions): Promise<Response> {
  return handleJsonRoute(request, { route, limiter, handle: (body) => handle(body) })
}
