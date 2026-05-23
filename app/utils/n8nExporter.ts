import type { RequestProfile, KeyValueRow } from '~/types'

export const N8N_HTTP_NODE_VERSION = 4.2

function activeRows(rows: KeyValueRow[]): Array<{ name: string; value: string }> {
  return rows.filter(r => r.enabled && r.key).map(r => ({ name: r.key, value: r.value }))
}

export function exportToN8n(profile: RequestProfile): string {
  const parameters: Record<string, unknown> = {
    method: profile.method,
    url: profile.url,
  }

  const headerRows = activeRows(profile.headers)

  // Auth injects additional headers / parameters
  const auth = profile.auth
  if (auth.type === 'bearer') {
    parameters.authentication = 'genericCredentialType'
    parameters.genericAuthType = 'httpBearerAuth'
  } else if (auth.type === 'basic') {
    parameters.authentication = 'genericCredentialType'
    parameters.genericAuthType = 'httpBasicAuth'
  } else if (auth.type === 'apiKey') {
    parameters.authentication = 'genericCredentialType'
    parameters.genericAuthType = 'httpHeaderAuth'
  }

  if (headerRows.length > 0) {
    parameters.sendHeaders = true
    parameters.headerParameters = { parameters: headerRows }
  } else {
    parameters.sendHeaders = false
  }

  const queryRows = activeRows(profile.queryParams)
  if (queryRows.length > 0) {
    parameters.sendQuery = true
    parameters.queryParameters = { parameters: queryRows }
  } else {
    parameters.sendQuery = false
  }

  const hasBody = profile.bodyType !== 'none' && profile.body
  if (hasBody) {
    parameters.sendBody = true
    if (profile.bodyType === 'json') {
      parameters.contentType = 'json'
      parameters.body = profile.body
    } else if (profile.bodyType === 'form') {
      parameters.contentType = 'form-urlencoded'
      parameters.body = profile.body
    }
  } else {
    parameters.sendBody = false
  }

  const node = {
    parameters,
    id: crypto.randomUUID(),
    name: 'HTTP Request',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: N8N_HTTP_NODE_VERSION,
    position: [0, 0],
  }

  // n8n canvas Ctrl+V expects the same structure it writes when you copy a node
  return JSON.stringify({ nodes: [node], connections: {}, pinData: {} }, null, 2)
}
