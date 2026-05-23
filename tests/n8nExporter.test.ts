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

// Output is { nodes, connections, pinData } — unwrap the first node for assertions
function parse(profile: RequestProfile) {
  const obj = JSON.parse(exportToN8n(profile))
  expect(obj).toHaveProperty('nodes')
  return obj.nodes[0]
}

describe('exportToN8n', () => {
  it('output is n8n workflow clipboard shape { nodes, connections, pinData }', () => {
    const obj = JSON.parse(exportToN8n(makeProfile()))
    expect(obj).toHaveProperty('nodes')
    expect(obj).toHaveProperty('connections')
    expect(obj).toHaveProperty('pinData')
    expect(obj.nodes).toHaveLength(1)
  })

  it('node has a uuid id field', () => {
    const node = parse(makeProfile())
    expect(node.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('exports typeVersion constant', () => {
    const node = parse(makeProfile())
    expect(node.typeVersion).toBe(N8N_HTTP_NODE_VERSION)
    expect(node.type).toBe('n8n-nodes-base.httpRequest')
  })

  it('GET with no body sets sendBody: false', () => {
    const node = parse(makeProfile())
    expect(node.parameters.sendBody).toBe(false)
    expect(node.parameters.method).toBe('GET')
  })

  it('POST with JSON body sets correct body fields', () => {
    const node = parse(makeProfile({
      method: 'POST',
      bodyType: 'json',
      body: '{"key":"value"}',
    }))
    expect(node.parameters.sendBody).toBe(true)
    expect(node.parameters.specifyBody).toBe('json')
    expect(node.parameters.contentType).toBe('json')
    expect(node.parameters.jsonBody).toBe('{"key":"value"}')
  })

  it('POST with form body sets contentType form-urlencoded', () => {
    const node = parse(makeProfile({
      method: 'POST',
      bodyType: 'form',
      body: 'key=value',
    }))
    expect(node.parameters.sendBody).toBe(true)
    expect(node.parameters.specifyBody).toBe('keypairs')
    expect(node.parameters.contentType).toBe('form-urlencoded')
  })

  it('Bearer auth sets authentication fields', () => {
    const node = parse(makeProfile({
      auth: { type: 'bearer', bearerToken: 'tok' },
    }))
    expect(node.parameters.authentication).toBe('genericCredentialType')
    expect(node.parameters.genericAuthType).toBe('httpBearerAuth')
  })

  it('Basic auth sets correct genericAuthType', () => {
    const node = parse(makeProfile({
      auth: { type: 'basic', basicUsername: 'u', basicPassword: 'p' },
    }))
    expect(node.parameters.genericAuthType).toBe('httpBasicAuth')
  })

  it('API Key auth sets httpHeaderAuth', () => {
    const node = parse(makeProfile({
      auth: { type: 'apiKey', apiKeyName: 'X-API-Key', apiKeyValue: 'secret' },
    }))
    expect(node.parameters.genericAuthType).toBe('httpHeaderAuth')
  })

  it('disabled headers are excluded', () => {
    const node = parse(makeProfile({
      headers: [
        { id: '1', key: 'X-Active', value: 'yes', enabled: true },
        { id: '2', key: 'X-Disabled', value: 'no', enabled: false },
      ],
    }))
    const names = node.parameters.headerParameters.parameters.map((p: { name: string }) => p.name)
    expect(names).toContain('X-Active')
    expect(names).not.toContain('X-Disabled')
  })

  it('active query params are included', () => {
    const node = parse(makeProfile({
      queryParams: [
        { id: '1', key: 'page', value: '1', enabled: true },
      ],
    }))
    expect(node.parameters.sendQuery).toBe(true)
    expect(node.parameters.queryParameters.parameters[0]).toEqual({ name: 'page', value: '1' })
  })

  it('no headers → sendHeaders false', () => {
    const node = parse(makeProfile())
    expect(node.parameters.sendHeaders).toBe(false)
  })

  it('position is hardcoded to [0,0]', () => {
    const node = parse(makeProfile())
    expect(node.position).toEqual([0, 0])
  })
})
