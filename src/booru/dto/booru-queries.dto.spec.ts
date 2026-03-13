import { plainToInstance } from 'class-transformer'
import { booruQueryValuesPostsDTO } from './booru-queries.dto'

describe('booruQueryValuesPostsDTO', () => {
  describe('tags transform', () => {
    it('should decode URL-encoded ampersands in tags', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 'panty_%26_stocking_with_garterbelt'
      })

      expect(dto.tags).toEqual(['panty_&_stocking_with_garterbelt'])
    })

    it('should split pipe-separated tags and decode each one', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: 'panty_%26_stocking_with_garterbelt|rating%3Asafe'
      })

      expect(dto.tags).toEqual(['panty_&_stocking_with_garterbelt', 'rating:safe'])
    })
  })
})
