import { describe, it, expect } from 'vitest'
import { exportToN8n, N8N_HTTP_NODE_VERSION } from '../app/utils/n8nExporter'
import type { RequestProfile } from '../types'

function makeProfile(overrides: Partial<RequestProfile> = {}): RequestProfile {
  return {
    method: 'GET',
    url: 'https://api.example.com',
    headers: [],
    queryParams: [],
    body: '',
    bodyType: 'none',
    auth: { type: 'none' },
    ...overrides,
  }
}

describe('exportToN8n', () => {
  it('exports typeVersion constant', () => {
    const result = JSON.parse(exportToN8n(makeProfile()))
    expect(result.typeVersion).toBe(N8N_HTTP_NODE_VERSION)
    expect(result.type).toBe('n8n-nodes-base.httpRequest')
  })

  it('GET with no body sets sendBody: false', () => {
    const result = JSON.parse(exportToN8n(makeProfile()))
    expect(result.parameters.sendBody).toBe(false)
    expect(result.parameters.method).toBe('GET')
  })

  it('POST with JSON body sets correct body fields', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      method: 'POST',
      bodyType: 'json',
      body: '{"key":"value"}',
    })))
    expect(result.parameters.sendBody).toBe(true)
    expect(result.parameters.contentType).toBe('json')
    expect(result.parameters.body).toBe('{"key":"value"}')
  })

  it('POST with form body sets contentType form-urlencoded', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      method: 'POST',
      bodyType: 'form',
      body: 'key=value',
    })))
    expect(result.parameters.sendBody).toBe(true)
    expect(result.parameters.contentType).toBe('form-urlencoded')
  })

  it('Bearer auth sets authentication fields', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      auth: { type: 'bearer', bearerToken: 'tok' },
    })))
    expect(result.parameters.authentication).toBe('genericCredentialType')
    expect(result.parameters.genericAuthType).toBe('httpBearerAuth')
  })

  it('Basic auth sets correct genericAuthType', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      auth: { type: 'basic', basicUsername: 'u', basicPassword: 'p' },
    })))
    expect(result.parameters.genericAuthType).toBe('httpBasicAuth')
  })

  it('API Key auth sets httpHeaderAuth', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      auth: { type: 'apiKey', apiKeyName: 'X-API-Key', apiKeyValue: 'secret' },
    })))
    expect(result.parameters.genericAuthType).toBe('httpHeaderAuth')
  })

  it('disabled headers are excluded', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      headers: [
        { id: '1', key: 'X-Active', value: 'yes', enabled: true },
        { id: '2', key: 'X-Disabled', value: 'no', enabled: false },
      ],
    })))
    const names = result.parameters.headerParameters.parameters.map((p: { name: string }) => p.name)
    expect(names).toContain('X-Active')
    expect(names).not.toContain('X-Disabled')
  })

  it('active query params are included', () => {
    const result = JSON.parse(exportToN8n(makeProfile({
      queryParams: [
        { id: '1', key: 'page', value: '1', enabled: true },
      ],
    })))
    expect(result.parameters.sendQuery).toBe(true)
    expect(result.parameters.queryParameters.parameters[0]).toEqual({ name: 'page', value: '1' })
  })

  it('no headers → sendHeaders false', () => {
    const result = JSON.parse(exportToN8n(makeProfile()))
    expect(result.parameters.sendHeaders).toBe(false)
  })

  it('position is hardcoded to [0,0]', () => {
    const result = JSON.parse(exportToN8n(makeProfile()))
    expect(result.position).toEqual([0, 0])
  })
})
