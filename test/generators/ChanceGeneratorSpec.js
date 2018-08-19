import '../test-helper/testUtils'
import { expect } from 'chai'
import ChanceGenerator from '../../src/generators/ChanceGenerator'
// import _debug from 'debug';
import asyncFunction from '../test-helper/asyncFunction'

// const debug = _debug('ChanceGeneratorSpec');

describe('ChanceGenerator', () => {
  describe('#constructor', () => {
    it('validates the passed chance method', () => {
      function invalidMethod() {
        new ChanceGenerator({}).generate('invalidMethodName')
      }

      function validMethod() {
        new ChanceGenerator({}).generate('bool')
      }

      expect(invalidMethod).to.throw(Error)
      expect(validMethod).to.not.throw(Error)
    })
  })
  describe('#generate', () => {
    it(
      'resolves to a value',
      asyncFunction(async () => {
        const chance = new ChanceGenerator({})
        const val = await chance.generate('bool', { likelihood: 30 })
        expect(val).to.exist
      }),
    )

    it(
      'supports multiple parameters',
      asyncFunction(async () => {
        const chance = new ChanceGenerator({})
        const val = await chance.generate('pickset', ['one', 'two', 'three'], 2)
        expect(val).to.exist
        expect(val.length).to.equal(2)
      }),
    )

    it(
      'supports function callback',
      asyncFunction(async () => {
        const chance = new ChanceGenerator({})
        const val = await chance.generate(c =>
          c.pickset(['one', 'two', 'three'], 2),
        )
        expect(val).to.exist
        expect(val.length).to.equal(2)
      }),
    )
  })
})
