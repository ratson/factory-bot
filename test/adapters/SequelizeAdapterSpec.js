import '../test-helper/testUtils'
import { expect } from 'chai'
import SequelizeAdapter from '../../src/adapters/SequelizeAdapter'
import DummySequelizeModel from '../test-helper/DummySequelizeModel'
import asyncFunction from '../test-helper/asyncFunction'

describe('SequelizeAdapter', () => {
  it('can be created', () => {
    const adapter = new SequelizeAdapter()
    expect(adapter).to.be.an.instanceof(SequelizeAdapter)
  })
  const adapter = new SequelizeAdapter()

  describe('#build', () => {
    it(
      'builds the model',
      asyncFunction(async () => {
        const model = adapter.build(DummySequelizeModel, {})
        expect(model).to.be.an.instanceof(DummySequelizeModel)
        expect(model.constructorCalled).to.be.equal(true)
      }),
    )
  })
  describe('#save', () => {
    it(
      'calls save on the model',
      asyncFunction(async () => {
        const model = new DummySequelizeModel()
        const savedModel = await adapter.save(model, DummySequelizeModel)
        expect(savedModel.saveCalled).to.be.equal(true)
      }),
    )

    it('returns a promise', () => {
      const model = new DummySequelizeModel()
      const savedModelP = adapter.save(model, DummySequelizeModel)
      expect(savedModelP.then).to.be.a('function')
      return expect(savedModelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to the object itself',
      asyncFunction(async () => {
        const model = new DummySequelizeModel()
        const savedModel = await adapter.save(model, DummySequelizeModel)
        expect(savedModel).to.be.equal(model)
      }),
    )
  })
  describe('#destroy', () => {
    it(
      'calls destroy on the model',
      asyncFunction(async () => {
        const model = new DummySequelizeModel()
        const destroyedModel = await adapter.destroy(model, DummySequelizeModel)
        expect(destroyedModel.destroyCalled).to.be.equal(true)
      }),
    )

    it('returns a promise', () => {
      const model = new DummySequelizeModel()
      const destroyedModelP = adapter.destroy(model, DummySequelizeModel)
      expect(destroyedModelP.then).to.be.a('function')
      return expect(destroyedModelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to the object itself',
      asyncFunction(async () => {
        const model = new DummySequelizeModel()
        const destroyedModel = await adapter.destroy(model, DummySequelizeModel)
        expect(destroyedModel).to.be.equal(model)
      }),
    )
  })
})
