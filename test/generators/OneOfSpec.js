import { expect } from 'chai'
import OneOf from '../../src/generators/OneOf'
import asyncFunction from '../test-helper/asyncFunction'

describe('OneOf', () => {
  describe('#constructor', () => {
    it('can be created', () => {
      const oneOf = new OneOf({})
      expect(oneOf).to.be.instanceof(OneOf)
    })
  })
  describe('#generate', () => {
    it('validates possible values', () => {
      const oneOf = new OneOf({})
      const invalidValuesArrayP = oneOf.generate(23)
      const emptyValuesArrayP = oneOf.generate([])
      const validValuesArrayP = oneOf.generate([1, 2, 3])

      return Promise.all([
        expect(invalidValuesArrayP).to.be.eventually.rejected,
        expect(emptyValuesArrayP).to.be.eventually.rejected,
        expect(validValuesArrayP).to.be.eventually.fulfilled,
      ])
    })
    it('returns a promise', () => {
      const possibleValues = [1, 'two', 'III']
      const oneOf = new OneOf({})

      const valP = oneOf.generate(possibleValues)
      expect(valP.then).to.be.a('function')
      return expect(valP).to.be.eventually.fulfilled
    })
    it(
      'always generates one of the passed values',
      asyncFunction(async () => {
        const possibleValues = [1, 'two', 'III']
        const oneOf = new OneOf({})

        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < 5; i++) {
          const aValue = await oneOf.generate(possibleValues)
          expect(possibleValues.indexOf(aValue) > -1).to.be.true
        }
        /* eslint-enable no-await-in-loop */
      }),
    )

    it(
      'can accept functions as values',
      asyncFunction(async () => {
        const possibleValues = [() => 23]
        const oneOf = new OneOf({})

        const val = await oneOf.generate(possibleValues)
        expect(val).to.be.equal(23)
      }),
    )

    it(
      'can accept async functions as values',
      asyncFunction(async () => {
        const possibleValues = [async () => 23]
        const oneOf = new OneOf({})

        const val = await oneOf.generate(possibleValues)
        expect(val).to.be.equal(23)
      }),
    )

    it(
      'can accept functions returning promises as values',
      asyncFunction(async () => {
        const possibleValues = [() => Promise.resolve(23)]
        const oneOf = new OneOf({})

        const val = await oneOf.generate(possibleValues)
        expect(val).to.be.equal(23)
      }),
    )

    it(
      'can accept promises as values',
      asyncFunction(async () => {
        const possibleValues = [Promise.resolve(23)]
        const oneOf = new OneOf({})

        const val = await oneOf.generate(possibleValues)
        expect(val).to.be.equal(23)
      }),
    )
  })
})
