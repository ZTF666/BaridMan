export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type BodyType = 'none' | 'json' | 'form'

export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey'

export interface KeyValueRow {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface AuthConfig {
  type: AuthType
  bearerToken?: string
  basicUsername?: string
  basicPassword?: string
  apiKeyName?: string
  apiKeyValue?: string
}

export interface RequestProfile {
  method: HttpMethod
  url: string
  headers: KeyValueRow[]
  queryParams: KeyValueRow[]
  body: string
  bodyType: BodyType
  auth: AuthConfig
}

export interface HttpResponse {
  status: number
  statusText: string
  body: string
  headers: Record<string, string>
  durationMs: number
  error?: string
}
