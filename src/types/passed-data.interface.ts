export interface IPassedData {
    url?: string
    template?: string
    domain: string
    isJson?: boolean
    limit?: number
    useCorsProxy?: boolean
    corsProxyUrl?: string

    // Optional
    data?: string | object
  }
  