import { describe, it, expect } from 'vitest'
import { parseCurl } from '../app/utils/curlParser'

describe('parseCurl', () => {
  it('parses a simple GET', () => {
    const result = parseCurl('curl https://api.example.com')
    expect(result.url).toBe('https://api.example.com')
    expect(result.method).toBe('GET')
  })

  it('parses -X POST with header and body', () => {
    const result = parseCurl(
      `curl -X POST -H "Content-Type: application/json" -d '{"k":"v"}' https://api.example.com`
    )
    expect(result.method).toBe('POST')
    expect(result.url).toBe('https://api.example.com')
    expect(result.headers?.[0]).toMatchObject({ key: 'Content-Type', value: 'application/json', enabled: true })
    expect(result.body).toBe('{"k":"v"}')
    expect(result.bodyType).toBe('json')
  })

  it('infers POST when -d is present without -X', () => {
    const result = parseCurl(`curl https://api.example.com -d 'body'`)
    expect(result.method).toBe('POST')
  })

  it('parses -u user:pass as basic auth', () => {
    const result = parseCurl('curl -u user:secret https://api.example.com')
    expect(result.auth?.type).toBe('basic')
    expect(result.auth?.basicUsername).toBe('user')
    expect(result.auth?.basicPassword).toBe('secret')
  })

  it('parses --user user:pass', () => {
    const result = parseCurl('curl --user admin:pass123 https://api.example.com')
    expect(result.auth?.basicUsername).toBe('admin')
    expect(result.auth?.basicPassword).toBe('pass123')
  })

  it('parses multiple headers', () => {
    const result = parseCurl(
      `curl -H "Accept: application/json" -H "X-Custom: val" https://example.com`
    )
    expect(result.headers).toHaveLength(2)
  })

  it('handles line continuation backslash', () => {
    const result = parseCurl(
      'curl -X GET \\\n  -H "Accept: application/json" \\\n  https://api.example.com'
    )
    expect(result.url).toBe('https://api.example.com')
    expect(result.method).toBe('GET')
  })

  it('returns empty partial for malformed input without throwing', () => {
    expect(() => parseCurl('')).not.toThrow()
    expect(() => parseCurl('not a curl command')).not.toThrow()
    const result = parseCurl('garbage input here')
    expect(result.url).toBeUndefined()
  })

  it('handles --data-raw', () => {
    const result = parseCurl(`curl -X POST --data-raw 'raw body' https://example.com`)
    expect(result.body).toBe('raw body')
  })
})
