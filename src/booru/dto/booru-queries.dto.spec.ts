import { plainToInstance } from 'class-transformer'
import { booruQueryValuesPostsDTO } from './booru-queries.dto'

describe('booruQueryValuesPostsDTO', () => {
  describe('tags transform', () => {
    it('should normalize a single tag string into an array', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 'panty_&_stocking_with_garterbelt'
      })

      expect(dto.tags).toEqual(['panty_&_stocking_with_garterbelt'])
    })

    it('should split pipe-separated tags', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 'panty_&_stocking_with_garterbelt|rating:safe'
      })

      expect(dto.tags).toEqual(['panty_&_stocking_with_garterbelt', 'rating:safe'])
    })

    it('should normalize array tag inputs and keep tag array shape', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: ['panty_&_stocking_with_garterbelt|rating:safe', 'score:>100']
      })

      expect(dto.tags).toEqual(['panty_&_stocking_with_garterbelt', 'rating:safe', 'score:>100'])
    })

    it('should normalize non-string tag input without throwing', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 123
      })

      expect(dto.tags).toEqual(['123'])
    })

    it('should keep non-encoded percent tags unchanged', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: '100%_real'
      })

      expect(dto.tags).toEqual(['100%_real'])
    })

    it('should keep malformed percent tag values unchanged', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 'bad%%'
      })

      expect(dto.tags).toEqual(['bad%%'])
    })

    it('should return undefined when tags is undefined', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {})

      expect(dto.tags).toBeUndefined()
    })

    it('should return null when tags is null', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: null
      })

      expect(dto.tags).toBeNull()
    })
  })
})
