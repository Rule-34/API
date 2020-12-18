import { Injectable } from '@nestjs/common'
import {
  BooruTypesStringEnum,
  Danbooru,
  Danbooru2,
  E621,
  Gelbooru,
  Paheal,
} from '@alejandroakbal/universal-booru-wrapper'

@Injectable()
export class BooruService {
  public getApiClassByType(booruType: BooruTypesStringEnum) {
    switch (booruType) {
      case BooruTypesStringEnum.GELBOORU:
        return Gelbooru

      case BooruTypesStringEnum.PAHEAL:
        return Paheal

      // Moebooru and MyImouto are danbooru
      case BooruTypesStringEnum.DANBOORU:
        return Danbooru

      case BooruTypesStringEnum.DANBOORU2:
        return Danbooru2

      case BooruTypesStringEnum.E621:
        return E621
    }
  }
}
