import '../test-helper/testUtils'
import { expect } from 'chai'
import ObjectAdapter from '../../src/adapters/ObjectAdapter'
import DummyModel from '../test-helper/DummyModel'
import asyncFunction from '../test-helper/asyncFunction'

describe('ObjectAdapter', () => {
  it('can be created', () => {
    const adapter = new ObjectAdapter()
    expect(adapter).to.be.an.instanceof(ObjectAdapter)
  })
  const adapter = new ObjectAdapter()

  describe('#build', () => {
    it(
      'builds the model',
      asyncFunction(async () => {
        const model = adapter.build(DummyModel, { a: 1, b: 2 })
        expect(model).to.be.an.instanceof(DummyModel)
        expect(model.a).to.be.equal(1)
        expect(model.b).to.be.equal(2)
      }),
    )
  })
  describe('#save', () => {
    it('returns a promise', () => {
      const model = new DummyModel()
      const savedModelP = adapter.save(model, DummyModel)
      expect(savedModelP.then).to.be.a('function')
      return expect(savedModelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to the object itself',
      asyncFunction(async () => {
        const model = new DummyModel()
        const savedModel = await adapter.save(model, DummyModel)
        expect(savedModel).to.be.equal(model)
      }),
    )
  })
  describe('#destroy', () => {
    it('returns a promise', () => {
      const model = new DummyModel()
      const destroyedModelP = adapter.destroy(model, DummyModel)
      expect(destroyedModelP.then).to.be.a('function')
      return expect(destroyedModelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to the object itself',
      asyncFunction(async () => {
        const model = new DummyModel()
        const destroyedModel = await adapter.destroy(model, DummyModel)
        expect(destroyedModel).to.be.equal(model)
      }),
    )
  })
})
