/*!
 * Original code by the Nuxt team
 * MIT Licensed, Copyright 2016-present - Nuxt Team, see https://github.com/nuxt/nuxt/blob/main/LICENSE for details
 *
 * Credits to the Nuxt team for the pages to routes function:
 * https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/pages/utils.ts
 */
import { extname, relative, resolve } from 'pathe'
import { encodePath } from 'ufo'
import { resolveFiles, useNuxt } from '@nuxt/kit'
import escapeRE from 'escape-string-regexp'
import type { NuxtPage } from 'nuxt/schema'

enum SegmentParserState {
  initial,
  static,
  dynamic,
  optional,
  catchall,
}

enum SegmentTokenType {
  static,
  dynamic,
  optional,
  catchall,
}

interface SegmentToken {
  type: SegmentTokenType
  value: string
}

function uniqueBy<T, K extends keyof T>(arr: T[], key: K) {
  const res: T[] = []
  const seen = new Set<T[K]>()
  for (const item of arr) {
    if (seen.has(item[key]))
      continue
    seen.add(item[key])
    res.push(item)
  }
  return res
}

export async function resolvePagesRoutes(): Promise<NuxtPage[]> {
  const nuxt = useNuxt()

  const pagesDirs = nuxt.options._layers.map(
    layer => resolve(layer.config.srcDir, layer.config.dir?.pages || 'pages'),
  )

  const allRoutes = (await Promise.all(
    pagesDirs.map(async (dir) => {
      const files = await resolveFiles(dir, `**/*{${nuxt.options.extensions.join(',')}}`)
      // Sort to make sure parent are listed first
      files.sort()
      return generateRoutesFromFiles(files, dir)
    }),
  )).flat()

  return mergeByChildren(uniqueBy(allRoutes, 'path'))
}
export function generateRoutesFromFiles(files: string[], pagesDir: string): NuxtPage[] {
  const routes: NuxtPage[] = []

  for (const file of files) {
    const segments = relative(pagesDir, file)
      .replace(new RegExp(`${escapeRE(extname(file))}$`), '')
      .split('/')

    const route: NuxtPage = {
      name: '',
      path: '',
      file,
      children: [],
    }

    // Array where routes should be added, useful when adding child routes
    let parent = routes

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      const tokens = parseSegment(segment)
      const segmentName = tokens.map(({ value }) => value).join('')

      // ex: parent/[slug].vue -> parent-slug
      route.name += (route.name && '/') + segmentName

      // ex: parent.vue + parent/child.vue
      const child = parent.find(parentRoute => parentRoute.name === route.name && !parentRoute.path.endsWith('(.*)*'))

      if (child && child.children) {
        parent = child.children
        route.path = ''
      }
      else if (segmentName === 'index' && !route.path) {
        route.path += '/'
      }
      else if (segmentName !== 'index') {
        route.path += getRoutePath(tokens)
      }
    }

    parent.push(route)
  }

  return prepareRoutes(routes)
}

function getRoutePath(tokens: SegmentToken[]): string {
  return tokens.reduce((path, token) => {
    return (
      path
      + (token.type === SegmentTokenType.optional
        ? `:${token.value}?`
        : token.type === SegmentTokenType.dynamic
          ? `:${token.value}()`
          : token.type === SegmentTokenType.catchall
            ? `:${token.value}(.*)*`
            : encodePath(token.value))
    )
  }, '/')
}

const PARAM_CHAR_RE = /[\w\d_.]/

function parseSegment(segment: string) {
  let state: SegmentParserState = SegmentParserState.initial
  let i = 0

  let buffer = ''
  const tokens: SegmentToken[] = []

  function consumeBuffer() {
    if (!buffer)
      return

    if (state === SegmentParserState.initial)
      throw new Error('wrong state')

    tokens.push({
      type:
        state === SegmentParserState.static
          ? SegmentTokenType.static
          : state === SegmentParserState.dynamic
            ? SegmentTokenType.dynamic
            : state === SegmentParserState.optional
              ? SegmentTokenType.optional
              : SegmentTokenType.catchall,
      value: buffer,
    })

    buffer = ''
  }

  while (i < segment.length) {
    const c = segment[i]

    switch (state) {
      case SegmentParserState.initial:
        buffer = ''
        if (c === '[') {
          state = SegmentParserState.dynamic
        }
        else {
          i--
          state = SegmentParserState.static
        }
        break

      case SegmentParserState.static:
        if (c === '[') {
          consumeBuffer()
          state = SegmentParserState.dynamic
        }
        else {
          buffer += c
        }
        break

      case SegmentParserState.catchall:
      case SegmentParserState.dynamic:
      case SegmentParserState.optional:
        if (buffer === '...') {
          buffer = ''
          state = SegmentParserState.catchall
        }
        if (c === '[' && state === SegmentParserState.dynamic)
          state = SegmentParserState.optional

        if (c === ']' && (state !== SegmentParserState.optional || buffer[buffer.length - 1] === ']')) {
          if (!buffer)
            throw new Error('Empty param')

          else
            consumeBuffer()

          state = SegmentParserState.initial
        }
        else if (PARAM_CHAR_RE.test(c)) {
          buffer += c
        }
        else {

          // console.debug(`[pages]Ignored character "${c}" while building param "${buffer}" from "segment"`)
        }
        break
    }
    i++
  }

  if (state === SegmentParserState.dynamic)
    throw new Error(`Unfinished param "${buffer}"`)

  consumeBuffer()

  return tokens
}

function findRouteByName(name: string, routes: NuxtPage[]): NuxtPage | undefined {
  for (const route of routes) {
    if (route.name === name)
      return route
  }
  return findRouteByName(name, routes)
}

function prepareRoutes(routes: NuxtPage[], parent?: NuxtPage, names = new Set<string>()) {
  for (const route of routes) {
    // Remove -index
    if (route.name) {
      route.name = route.name
        .replace(/\/index$/, '')
        .replace(/\//g, '-')

      if (names.has(route.name)) {
        const existingRoute = findRouteByName(route.name, routes)
        const extra = existingRoute?.name ? `is the same as \`${existingRoute.file}\`` : 'is a duplicate'
        console.warn(`[nuxt] Route name generated for \`${route.file}\` ${extra}. You may wish to set a custom name using \`definePageMeta\` within the page file.`)
      }
    }

    // Remove leading / if children route
    if (parent && route.path.startsWith('/'))
      route.path = route.path.slice(1)

    if (route.children?.length)
      route.children = prepareRoutes(route.children, route, names)

    if (route.children?.find(childRoute => childRoute.path === ''))
      delete route.name

    if (route.name)
      names.add(route.name)
  }

  return routes
}

function mergeByChildren(routes: NuxtPage[]) {
  let result: NuxtPage[] = []

  routes.forEach((item) => {
    result.push(item)

    if (Array.isArray(item.children) && item.children.length > 0) {
      const mergedChildren = mergeByChildren(item.children.flat())
      result = result.concat(mergedChildren)
    }
  })

  return result
}
