export interface PassedData {
    url?: string
    template?: string
    domain: string
    isJson?: boolean
    limit?: number
    useCorsProxy?: boolean

    // Optional
    data: string | object
  }
  