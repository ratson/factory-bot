import '../test-helper/testUtils'
import { expect } from 'chai'
import sinon from 'sinon'
import AssocAttrs from '../../src/generators/AssocAttrs'
import DummyFactoryGirl from '../test-helper/DummyFactoryGirl'
import asyncFunction from '../test-helper/asyncFunction'

describe('AssocAttrs', () => {
  describe('#generate', () => {
    const factoryGirl = new DummyFactoryGirl()
    const name = 'someModel'
    const key = 'someKey'
    const dummyAttrs = {}
    const dummyBuildOptions = {}
    const assocAttrs = new AssocAttrs(factoryGirl)

    it(
      'calls attrs on the factoryGirl object',
      asyncFunction(async () => {
        const spy = sinon.spy(factoryGirl, 'attrs')
        await assocAttrs.generate(name, key, dummyAttrs, dummyBuildOptions)
        expect(spy).to.have.been.calledWith(name, dummyAttrs, dummyBuildOptions)
        factoryGirl.attrs.restore()
      }),
    )

    it('returns a promise', () => {
      const modelP = assocAttrs.generate(
        name,
        key,
        dummyAttrs,
        dummyBuildOptions,
      )
      expect(modelP.then).to.be.a('function')
      return expect(modelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to the object returned by factory if key is null',
      asyncFunction(async () => {
        const assocAttrsWithNullKey = new AssocAttrs(factoryGirl)
        const model = await assocAttrsWithNullKey.generate(name)
        expect(model).to.be.an('object')
      }),
    )

    it(
      'resolves to the object property returned by factory if key is not null',
      asyncFunction(async () => {
        const assocAttrsWithKey = new AssocAttrs(factoryGirl)
        const modelA = await assocAttrsWithKey.generate(name, 'name')
        expect(modelA).to.be.equal('Bill')
      }),
    )
  })
})
