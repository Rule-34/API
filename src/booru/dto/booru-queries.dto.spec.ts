import { BadRequestException } from '@nestjs/common'
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

    it('should normalize array tag inputs and keep tag array shape', () => {
      const dto = plainToInstance(booruQueryValuesPostsDTO, {
        tags: ['panty_%26_stocking_with_garterbelt|rating%3Asafe', 'score%3A%3E100']
      })

      expect(dto.tags).toEqual([
        'panty_&_stocking_with_garterbelt',
        'rating:safe',
        'score:>100'
      ])
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

    it('should throw BadRequestException when encoded tag decoding fails', () => {
      expect(() =>
        plainToInstance(booruQueryValuesPostsDTO, {
          tags: 'bad%25%'
        })
      ).toThrow(BadRequestException)

      expect(() =>
        plainToInstance(booruQueryValuesPostsDTO, {
          tags: 'bad%25%'
        })
      ).toThrow('Invalid tag encoding')
    })
  })
})
