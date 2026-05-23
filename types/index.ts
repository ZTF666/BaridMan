export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type BodyType = 'none' | 'json' | 'form' | 'schema'

export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey'

export type FieldType = 'string' | 'number' | 'boolean' | 'date'

export interface KeyValueRow {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface SchemaField {
  id: string
  name: string
  type: FieldType
  value: string
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
  schemaFields: SchemaField[]
  auth: AuthConfig
}

export interface HistoryEntry {
  id: string
  timestamp: number
  label: string
  profile: RequestProfile
}

export interface HttpResponse {
  status: number
  statusText: string
  body: string
  headers: Record<string, string>
  durationMs: number
  error?: string
}
