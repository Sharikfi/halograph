import {
  createError,
  defineEventHandler,
  getQuery,
  setHeader,
} from 'h3'
import type { H3Event } from 'h3'

const ALLOWED_ORIGINS = [
  'https://',
  'http://localhost',
  'http://127.0.0.1',
]

function isAllowedUrl(url: string): boolean {
  return ALLOWED_ORIGINS.some(origin => url.startsWith(origin))
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const url = query.url
  if (typeof url !== 'string' || !url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url query' })
  }
  if (!isAllowedUrl(url)) {
    throw createError({ statusCode: 403, statusMessage: 'URL not allowed' })
  }
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    })
  }
  const contentType = response.headers.get('content-type') ?? 'image/png'
  const buffer = await response.arrayBuffer()
  setHeader(event, 'content-type', contentType)
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return Buffer.from(buffer)
})
