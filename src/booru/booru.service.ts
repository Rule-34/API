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
  constructor(
    private readonly configService: ConfigService,
    private readonly authManager: BooruAuthManagerService
  ) {}

  public buildApiClass(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BooruTypes {
    return this.buildApiWithContext(params, queries).api
  }

  public async executeWithAuthStrategy<T>(
    params: BooruEndpointParamsDTO,
    queries: booruQueriesDTO,
    operation: (api: BooruTypes, authResolution: ResolvedAuthCredentials) => Promise<T>
  ): Promise<T> {
    if (this.hasQueryCredentials(queries)) {
      const explicitContext = this.buildApiWithContext(params, queries)
      return operation(explicitContext.api, explicitContext.authResolution)
    }

    return this.executeManagedCredentialFailover(params, queries, operation)
  }

  public buildApiWithContext(params: BooruEndpointParamsDTO, queries: booruQueriesDTO): BuiltBooruApi {
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

    // Resolve authentication credentials
    const authResolution = this.resolveAuthCredentials(queries)

    const options: Partial<IBooruOptions> = {}

    if (queries.httpScheme) {
      options.HTTPScheme = queries.httpScheme
    }

    if (authResolution.auth) {
      options.auth = authResolution.auth
    }

    const Api = new booruClass(
      endpoints,
      defaultQueryIdentifiers as Partial<IBooruQueryIdentifiers>,
      undefined,
      options
    )

    return {
      api: Api,
      authResolution
    }
  }

  private resolveAuthCredentials(queries: booruQueriesDTO): ResolvedAuthCredentials {
    // Priority 1: Query parameters
    if (this.hasQueryCredentials(queries)) {
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

    // Priority 2: Environment variables through auth manager
    const envCredentials = this.authManager.getAvailableCredential(queries.baseEndpoint)

    if (envCredentials) {
      return {
        auth: {
          username: envCredentials.user,
          apiKey: envCredentials.password
        },
        source: 'env',
        selectedCredential: envCredentials
      }
    }

    // Priority 3: No authentication
    return {
      source: 'none'
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
      const context = this.buildApiWithContext(params, queries)
      const selectedCredential = context.authResolution.selectedCredential

      if (context.authResolution.source !== 'env' || !selectedCredential) {
        throw this.createPoolUnavailableError(queries.baseEndpoint)
      }

      const credentialKey = `${selectedCredential.user}:${selectedCredential.password}`

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

    if (stats.available === 0 && stats.cooldown > 0) {
      return new ManagedCredentialPoolUnavailableError(
        domain,
        'cooldown_exhausted',
        this.authManager.getMinCooldownSeconds(domain)
      )
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
    if (typeof error.message === 'string' && error.message.length > 0) {
      return error.message
    }

    return error.toString()
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
