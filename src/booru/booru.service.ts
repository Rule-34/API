import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  BooruTypes,
  BooruTypesStringEnum,
  Danbooru,
  Danbooru2,
  E621Net,
  Gelbooru,
  GelbooruCom,
  IBooruEndpoints,
  IBooruOptions,
  IBooruQueryIdentifiers,
  HttpError,
  Moebooru,
  RealBooruCom,
  Rule34PahealNet,
  Rule34Xxx
} from '@alejandroakbal/universal-booru-wrapper'
import { booruQueriesDTO } from './dto/booru-queries.dto'
import { BooruEndpointParamsDTO } from './dto/request-booru.dto'
import type { AuthFailureEvent } from './interfaces/auth-manager.interface'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'
import { SENSITIVE_AUTH_PARAMS } from './constants/sensitive-auth-params'

export interface ResolvedAuthCredentials {
  auth?: { username: string; apiKey: string }
  source: 'query' | 'env' | 'none'
  selectedCredential?: { user: string; password: string }
}

export interface BuiltBooruApi {
  api: BooruTypes
  authResolution: ResolvedAuthCredentials
}

interface BooruQueryIdentifierDefaults {
  posts?: Partial<NonNullable<IBooruQueryIdentifiers['posts']>>
  randomPosts?: Partial<NonNullable<IBooruQueryIdentifiers['randomPosts']>>
  singlePost?: Partial<NonNullable<IBooruQueryIdentifiers['singlePost']>>
  tags?: Partial<NonNullable<IBooruQueryIdentifiers['tags']>>
}

interface BooruOutboundProxyPolicy {
  baseUrl: string
  targetParam: string
}

type NormalizedBooruOutboundProxyConfig = Record<string, BooruOutboundProxyPolicy[]>

export class ManagedCredentialPoolUnavailableError extends Error {
  constructor(
    public readonly domain: string,
    public readonly reason: 'cooldown_exhausted' | 'permanent_exhausted',
    public readonly retryAfterSeconds?: number
  ) {
    super(`Managed credential pool unavailable for ${domain}`)
    this.name = 'ManagedCredentialPoolUnavailableError'
  }
}

@Injectable()
export class BooruService {
  private readonly sensitiveAuthParams = new Set<string>(SENSITIVE_AUTH_PARAMS)
  private outboundProxyConfig: NormalizedBooruOutboundProxyConfig | null | undefined
  private forwardProxyConfig: Record<string, string> | null | undefined
  private readonly outboundProxyCursors = new Map<string, number>()

  constructor(
    private readonly configService: ConfigService,
    private readonly authManager: BooruAuthManagerService
  ) {}

  public buildApiClass(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BooruTypes {
    return this.buildApiWithContext(params, queries, this.resolveQueryAuthCredentials(queries)).api
  }

  public async executeWithAuthStrategy<T>(
    params: BooruEndpointParamsDTO,
    queries: booruQueriesDTO,
    operation: (api: BooruTypes, authResolution: ResolvedAuthCredentials) => Promise<T>
  ): Promise<T> {
    if (this.hasQueryCredentials(queries)) {
      const explicitContext = this.buildApiWithContext(params, queries, this.resolveQueryAuthCredentials(queries))
      return operation(explicitContext.api, explicitContext.authResolution)
    }

    return this.executeManagedCredentialFailover(params, queries, operation)
  }

  public buildApiWithContext(
    params: BooruEndpointParamsDTO,
    queries: booruQueriesDTO,
    resolvedAuthOverride?: ResolvedAuthCredentials
  ): BuiltBooruApi {
    const booruClass = this.getApiClassByType(params.booruType)

    const endpoints: IBooruEndpoints = {
      base: queries.baseEndpoint,
      ...(queries.postsEndpoint !== undefined ? { posts: queries.postsEndpoint } : {}),
      ...(queries.randomPostsEndpoint !== undefined ? { randomPosts: queries.randomPostsEndpoint } : {}),
      ...(queries.singlePostEndpoint !== undefined ? { singlePost: queries.singlePostEndpoint } : {}),
      ...(queries.tagsEndpoint !== undefined ? { tags: queries.tagsEndpoint } : {})
    }

    const defaultQueryIdentifiers: BooruQueryIdentifierDefaults = {
      posts: {
        ...(queries.defaultQueryIdentifiersPostsLimit !== undefined
          ? { limit: queries.defaultQueryIdentifiersPostsLimit }
          : {}),
        ...(queries.defaultQueryIdentifiersPostsPageID !== undefined
          ? { pageID: queries.defaultQueryIdentifiersPostsPageID }
          : {}),
        ...(queries.defaultQueryIdentifiersPostsTags !== undefined
          ? { tags: queries.defaultQueryIdentifiersPostsTags }
          : {}),
        ...(queries.defaultQueryIdentifiersPostsRating !== undefined
          ? { rating: queries.defaultQueryIdentifiersPostsRating }
          : {}),
        ...(queries.defaultQueryIdentifiersPostsScore !== undefined
          ? { score: queries.defaultQueryIdentifiersPostsScore }
          : {}),
        ...(queries.defaultQueryIdentifiersPostsOrder !== undefined
          ? { order: queries.defaultQueryIdentifiersPostsOrder }
          : {})
      },

      randomPosts: {
        ...(queries.defaultQueryIdentifiersRandomPostsLimit !== undefined
          ? { limit: queries.defaultQueryIdentifiersRandomPostsLimit }
          : {}),
        ...(queries.defaultQueryIdentifiersRandomPostsPageID !== undefined
          ? { pageID: queries.defaultQueryIdentifiersRandomPostsPageID }
          : {}),
        ...(queries.defaultQueryIdentifiersRandomPostsTags !== undefined
          ? { tags: queries.defaultQueryIdentifiersRandomPostsTags }
          : {}),
        ...(queries.defaultQueryIdentifiersRandomPostsRating !== undefined
          ? { rating: queries.defaultQueryIdentifiersRandomPostsRating }
          : {}),
        ...(queries.defaultQueryIdentifiersRandomPostsScore !== undefined
          ? { score: queries.defaultQueryIdentifiersRandomPostsScore }
          : {}),
        ...(queries.defaultQueryIdentifiersRandomPostsOrder !== undefined
          ? { order: queries.defaultQueryIdentifiersRandomPostsOrder }
          : {})
      },

      singlePost: {
        ...(queries.defaultQueryIdentifiersSinglePostID !== undefined
          ? { id: queries.defaultQueryIdentifiersSinglePostID }
          : {})
      },

      tags: {
        ...(queries.defaultQueryIdentifiersTagsTag !== undefined
          ? { tag: queries.defaultQueryIdentifiersTagsTag }
          : {}),
        ...(queries.defaultQueryIdentifiersTagsTagEnding !== undefined
          ? { tagEnding: queries.defaultQueryIdentifiersTagsTagEnding }
          : {}),
        ...(queries.defaultQueryIdentifiersTagsLimit !== undefined
          ? { limit: queries.defaultQueryIdentifiersTagsLimit }
          : {}),
        ...(queries.defaultQueryIdentifiersTagsPageID !== undefined
          ? { pageID: queries.defaultQueryIdentifiersTagsPageID }
          : {}),
        ...(queries.defaultQueryIdentifiersTagsOrder !== undefined
          ? { order: queries.defaultQueryIdentifiersTagsOrder }
          : {})
      }
    }

    // No default QueryValues are needed

    const authResolution = resolvedAuthOverride ?? this.resolveQueryAuthCredentials(queries)

    const options: Partial<IBooruOptions> = {}

    if (queries.httpScheme) {
      options.HTTPScheme = queries.httpScheme
    }

    if (authResolution.auth) {
      options.auth = authResolution.auth
    }

    const forwardProxy = this.getForwardProxyForDomain(queries.baseEndpoint)
    if (typeof forwardProxy === 'string' && forwardProxy.length > 0) {
      options.proxy = forwardProxy
    }

    const domain = this.normalizeOutboundProxyDomain(queries.baseEndpoint)
    if (domain === 'e621.net' || domain === 'e926.net') {
      options.userAgent = 'Universal-Booru-Wrapper/0.15.26 (by AlejandroAkbal on e621)'
    } else {
      options.userAgent = 'Universal-Booru-Wrapper/0.15.26 (r34.app)'
    }

    const Api = new booruClass(
      endpoints,
      defaultQueryIdentifiers as Partial<IBooruQueryIdentifiers>,
      undefined,
      options
    )
    this.applyOutboundProxy(Api, queries.baseEndpoint)

    return {
      api: Api,
      authResolution
    }
  }

  private resolveQueryAuthCredentials(queries: booruQueriesDTO): ResolvedAuthCredentials {
    if (!this.hasQueryCredentials(queries)) {
      return { source: 'none' }
    }

    return {
      auth: {
        username: queries.auth_user,
        apiKey: queries.auth_pass
      },
      source: 'query',
      selectedCredential: {
        user: queries.auth_user,
        password: queries.auth_pass
      }
    }
  }

  private async executeManagedCredentialFailover<T>(
    params: BooruEndpointParamsDTO,
    queries: booruQueriesDTO,
    operation: (api: BooruTypes, authResolution: ResolvedAuthCredentials) => Promise<T>
  ): Promise<T> {
    const domainStats = this.authManager.getDomainStats(queries.baseEndpoint)

    if (domainStats.total === 0) {
      // No managed credentials configured for this domain: execute once without auth.
      const context = this.buildApiWithContext(params, queries)
      return operation(context.api, context.authResolution)
    }

    const maxAttempts = Math.min(domainStats.total, this.getManagedRetryCap())
    const attemptedCredentials = new Set<string>()

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const selectedCredential = await this.authManager.reserveAvailableCredential(queries.baseEndpoint)

      if (!selectedCredential) {
        throw this.createPoolUnavailableError(queries.baseEndpoint)
      }

      const authResolution: ResolvedAuthCredentials = {
        auth: {
          username: selectedCredential.user,
          apiKey: selectedCredential.password
        },
        source: 'env',
        selectedCredential
      }

      const context = this.buildApiWithContext(params, queries, authResolution)

      const credentialKey = JSON.stringify([selectedCredential.user, selectedCredential.password])

      if (attemptedCredentials.has(credentialKey)) {
        throw this.createPoolUnavailableError(queries.baseEndpoint)
      }

      try {
        return await operation(context.api, context.authResolution)
      } catch (error) {
        if (!this.isRetryableManagedCredentialFailure(error)) {
          throw error
        }

        const httpError = error

        const authFailure: AuthFailureEvent = {
          domain: queries.baseEndpoint,
          user: selectedCredential.user,
          password: selectedCredential.password,
          error: this.stringifyHttpError(httpError),
          failureKind: this.getFailureKind(httpError),
          timestamp: new Date()
        }

        const retryAfterSeconds = this.getRetryAfterSeconds(httpError)

        if (retryAfterSeconds !== undefined) {
          authFailure.retryAfterSeconds = retryAfterSeconds
        }

        this.authManager.reportAuthFailure(authFailure)

        attemptedCredentials.add(credentialKey)
      }
    }

    throw this.createPoolUnavailableError(queries.baseEndpoint)
  }

  private getManagedRetryCap(): number {
    const configuredCap = this.configService.get<string | number>('BOORU_MANAGED_RETRY_CAP')

    const parsedCap = typeof configuredCap === 'number' ? configuredCap : parseInt(configuredCap ?? '', 10)

    if (!Number.isFinite(parsedCap) || parsedCap < 1) {
      return 5
    }

    return Math.floor(parsedCap)
  }

  private hasQueryCredentials(
    queries: booruQueriesDTO
  ): queries is booruQueriesDTO & { auth_user: string; auth_pass: string } {
    return (
      queries.auth_user !== undefined &&
      queries.auth_user.length > 0 &&
      queries.auth_pass !== undefined &&
      queries.auth_pass.length > 0
    )
  }

  private createPoolUnavailableError(domain: string): ManagedCredentialPoolUnavailableError {
    const stats = this.authManager.getDomainStats(domain)
    const retryAfterSeconds = this.authManager.getMinCooldownSeconds(domain)

    if (retryAfterSeconds !== undefined || (stats.available === 0 && stats.cooldown > 0)) {
      return new ManagedCredentialPoolUnavailableError(domain, 'cooldown_exhausted', retryAfterSeconds)
    }

    return new ManagedCredentialPoolUnavailableError(domain, 'permanent_exhausted')
  }

  private isRetryableManagedCredentialFailure(error: unknown): error is HttpError {
    if (!(error instanceof HttpError)) {
      return false
    }

    const kind = this.getFailureKind(error)
    return kind === 'auth_invalid' || kind === 'auth_forbidden' || kind === 'rate_limited'
  }

  private stringifyHttpError(error: HttpError): string {
    const message = typeof error.message === 'string' && error.message.length > 0 ? error.message : error.toString()

    return this.sanitizeErrorMessage(message)
  }

  private sanitizeErrorMessage(message: string): string {
    if (!message) {
      return message
    }

    const urlPattern = /https?:\/\/[^\s]+/gi
    const sanitizedUrlMessage = message.replace(urlPattern, (url) => this.sanitizeUrl(url))
    return this.sanitizeKeyValueTokens(sanitizedUrlMessage)
  }

  private sanitizeKeyValueTokens(message: string): string {
    let sanitizedMessage = message

    for (const key of this.sensitiveAuthParams) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`\\b(${escapedKey})(\\s*=\\s*)([^\\s&#,;\\]\\)\\}]+)`, 'gi')
      sanitizedMessage = sanitizedMessage.replace(pattern, '$1$2REDACTED')
    }

    return sanitizedMessage
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)

      for (const [key] of urlObj.searchParams.entries()) {
        if (this.sensitiveAuthParams.has(key.toLowerCase())) {
          urlObj.searchParams.set(key, 'REDACTED')
        }
      }

      return urlObj.toString()
    } catch {
      return this.sanitizeRawUrl(url)
    }
  }

  private sanitizeRawUrl(url: string): string {
    let sanitizedUrl = url

    for (const key of this.sensitiveAuthParams) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`([?&]${escapedKey}=)[^&#\\s]*`, 'gi')
      sanitizedUrl = sanitizedUrl.replace(pattern, '$1REDACTED')
    }

    return sanitizedUrl
  }

  private getFailureKind(
    error: HttpError
  ): 'auth_invalid' | 'auth_forbidden' | 'rate_limited' | 'upstream_error' | 'network_error' | 'unknown' {
    return error.failureKind
  }

  private getRetryAfterSeconds(error: HttpError): number | undefined {
    if (typeof error.retryAfterSeconds === 'number') {
      return error.retryAfterSeconds
    }

    return undefined
  }

  private applyOutboundProxy(api: BooruTypes, domain: string): void {
    if (!this.hasOutboundProxyPolicy(domain)) {
      return
    }

    const apiWithInternals = api as unknown as Record<string, unknown>
    const queryMethodNames = ['addPostQueries', 'addRandomPostQueries', 'addSinglePostQueries', 'addTagsQueries']

    for (const methodName of queryMethodNames) {
      const originalMethod = apiWithInternals[methodName]

      if (typeof originalMethod !== 'function') {
        continue
      }

      apiWithInternals[methodName] = (...args: unknown[]) => {
        const upstreamUrl = originalMethod.apply(api, args) as URL
        const proxyPolicy = this.getOutboundProxyPolicy(domain)

        if (proxyPolicy === undefined) {
          return upstreamUrl
        }

        return this.createProxiedOutboundUrl(upstreamUrl, proxyPolicy)
      }
    }
  }

  private createProxiedOutboundUrl(upstreamUrl: URL, proxyPolicy: BooruOutboundProxyPolicy): URL {
    if (upstreamUrl.hostname === 'e621.net') {
      return upstreamUrl
    }

    const proxiedUrl = new URL(proxyPolicy.baseUrl)
    proxiedUrl.searchParams.set(proxyPolicy.targetParam, upstreamUrl.toString())

    return proxiedUrl
  }

  private hasOutboundProxyPolicy(domain: string): boolean {
    const config = this.getOutboundProxyConfig()

    if (config === null) {
      return false
    }

    const policies = config[this.normalizeOutboundProxyDomain(domain)]
    return policies !== undefined && policies.length > 0
  }

  private getOutboundProxyPolicy(domain: string): BooruOutboundProxyPolicy | undefined {
    const config = this.getOutboundProxyConfig()

    if (config === null) {
      return undefined
    }

    const normalizedDomain = this.normalizeOutboundProxyDomain(domain)
    const policies = config[normalizedDomain]

    if (policies === undefined || policies.length === 0) {
      return undefined
    }

    const cursor = this.outboundProxyCursors.get(normalizedDomain) ?? 0
    const policy = policies[cursor % policies.length]
    this.outboundProxyCursors.set(normalizedDomain, cursor + 1)

    return policy
  }

  private getOutboundProxyConfig(): NormalizedBooruOutboundProxyConfig | null {
    if (this.outboundProxyConfig !== undefined) {
      return this.outboundProxyConfig
    }

    const configJson = this.configService.get<string>('BOORU_OUTBOUND_PROXY_CONFIG')

    if (configJson === undefined || configJson.length === 0) {
      this.outboundProxyConfig = null
      return this.outboundProxyConfig
    }

    try {
      const parsedConfig = JSON.parse(configJson) as unknown
      this.outboundProxyConfig = this.validateOutboundProxyConfig(parsedConfig)
      return this.outboundProxyConfig
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse BOORU_OUTBOUND_PROXY_CONFIG', { cause: error })
      }

      throw error
    }
  }

  private validateOutboundProxyConfig(config: unknown): NormalizedBooruOutboundProxyConfig {
    if (!this.isPlainObject(config)) {
      throw new Error('Invalid BOORU_OUTBOUND_PROXY_CONFIG')
    }

    const outboundProxyConfig: NormalizedBooruOutboundProxyConfig = {}

    for (const [domain, policyOrPolicies] of Object.entries(config)) {
      const policies = Array.isArray(policyOrPolicies) ? policyOrPolicies : [policyOrPolicies]

      if (policies.length === 0) {
        throw new Error(`Invalid BOORU_OUTBOUND_PROXY_CONFIG policy for ${domain}`)
      }

      outboundProxyConfig[this.normalizeOutboundProxyDomain(domain)] = policies.map((policy) =>
        this.validateOutboundProxyPolicy(domain, policy)
      )
    }

    return outboundProxyConfig
  }

  private validateOutboundProxyPolicy(domain: string, policy: unknown): BooruOutboundProxyPolicy {
    if (!this.isPlainObject(policy)) {
      throw new Error(`Invalid BOORU_OUTBOUND_PROXY_CONFIG policy for ${domain}`)
    }

    const baseUrl = policy['baseUrl']
    const targetParam = policy['targetParam'] ?? 'q'

    if (typeof baseUrl !== 'string' || !URL.canParse(baseUrl)) {
      throw new Error(`Invalid BOORU_OUTBOUND_PROXY_CONFIG baseUrl for ${domain}`)
    }

    const parsedBaseUrl = new URL(baseUrl)

    if (parsedBaseUrl.protocol !== 'https:') {
      throw new Error(`Invalid BOORU_OUTBOUND_PROXY_CONFIG baseUrl for ${domain}`)
    }

    if (typeof targetParam !== 'string' || targetParam.length === 0) {
      throw new Error(`Invalid BOORU_OUTBOUND_PROXY_CONFIG targetParam for ${domain}`)
    }

    return {
      baseUrl: parsedBaseUrl.toString(),
      targetParam
    }
  }

  private normalizeOutboundProxyDomain(domain: string): string {
    if (URL.canParse(domain)) {
      return new URL(domain).hostname.toLowerCase()
    }

    return domain.toLowerCase()
  }

  private getForwardProxyForDomain(domain: string): string | undefined {
    const config = this.getForwardProxyConfig()
    if (config === null) {
      return undefined
    }

    const normalizedDomain = this.normalizeOutboundProxyDomain(domain)
    return config[normalizedDomain]
  }

  private getForwardProxyConfig(): Record<string, string> | null {
    if (this.forwardProxyConfig !== undefined) {
      return this.forwardProxyConfig
    }

    const configJson = this.configService.get<string>('BOORU_FORWARD_PROXY_CONFIG')
    if (configJson === undefined || configJson.length === 0) {
      this.forwardProxyConfig = null
      return this.forwardProxyConfig
    }

    try {
      const parsedConfig = JSON.parse(configJson) as unknown
      this.forwardProxyConfig = this.validateForwardProxyConfig(parsedConfig)
      return this.forwardProxyConfig
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse BOORU_FORWARD_PROXY_CONFIG', { cause: error })
      }

      throw error
    }
  }

  private validateForwardProxyConfig(config: unknown): Record<string, string> {
    if (!this.isPlainObject(config)) {
      throw new Error('Invalid BOORU_FORWARD_PROXY_CONFIG')
    }

    const forwardProxyConfig: Record<string, string> = {}

    for (const [domain, proxyUrl] of Object.entries(config)) {
      if (typeof proxyUrl !== 'string' || !URL.canParse(proxyUrl)) {
        throw new Error(`Invalid BOORU_FORWARD_PROXY_CONFIG proxy URL for ${domain}`)
      }

      const parsedUrl = new URL(proxyUrl)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error(`Invalid BOORU_FORWARD_PROXY_CONFIG protocol for ${domain}`)
      }

      forwardProxyConfig[this.normalizeOutboundProxyDomain(domain)] = parsedUrl.toString()
    }

    return forwardProxyConfig
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  private getApiClassByType(booruType: BooruTypesStringEnum) {
    switch (booruType) {
      case BooruTypesStringEnum.DANBOORU:
        return Danbooru

      case BooruTypesStringEnum.DANBOORU2:
        return Danbooru2

      case BooruTypesStringEnum.MOEBOORU:
        return Moebooru

      case BooruTypesStringEnum.GELBOORU:
        return Gelbooru

      case BooruTypesStringEnum.RULE_34_XXX:
        return Rule34Xxx

      case BooruTypesStringEnum.RULE34_PAHEAL_NET:
        return Rule34PahealNet

      case BooruTypesStringEnum.GELBOORU_COM:
        return GelbooruCom

      case BooruTypesStringEnum.E621_NET:
        return E621Net

      case BooruTypesStringEnum.REALBOORU_COM:
        return RealBooruCom
    }
  }
}
