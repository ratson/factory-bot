import '../test-helper/testUtils'
import { expect } from 'chai'
import Generator from '../../src/generators/Generator'
// import _debug from 'debug';

// const debug = _debug('GeneratorSpec');

describe('Generator', () => {
  describe('#constructor', () => {
    it('can be created', () => {
      const generator = new Generator({})
      expect(generator).to.be.instanceof(Generator)
    })
    it('throws an error if factoryGirl is not passed', () => {
      function noFactoryGirl() {
        // eslint-disable-next-line no-new
        new Generator()
      }

      expect(noFactoryGirl).to.throw(Error)
    })
  })
  describe('#generate', () => {
    it('throws an error', () => {
      const generator = new Generator({})

      function notImplemented() {
        generator.generate()
      }

      expect(notImplemented).to.throw(Error)
    })
  })
})
