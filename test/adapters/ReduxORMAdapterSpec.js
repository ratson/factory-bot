import '../test-helper/testUtils'
import { expect } from 'chai'
import { ORM } from 'redux-orm'
import ReduxORMAdapter from '../../src/adapters/ReduxORMAdapter'
import DummyReduxORMModel from '../test-helper/DummyReduxORMModel'
import asyncFunction from '../test-helper/asyncFunction'

const orm = new ORM()
orm.register(DummyReduxORMModel)
const session = orm.session()

describe('ReduxORMAdapter', () => {
  const adapter = new ReduxORMAdapter(session)
  it('can be created', () => {
    expect(adapter).to.be.an.instanceof(ReduxORMAdapter)
  })
  describe('#build', () => {
    it(
      'builds the model',
      asyncFunction(async () => {
        const model = adapter.build('DummyReduxORMModel', {
          id: 1,
          type: 'City',
          name: 'Vic',
          country: 'ES',
        })
        expect(model).to.be.an.instanceof(DummyReduxORMModel)
      }),
    )
  })
  describe('#save', () => {
    it(
      'resolves to the object itself',
      asyncFunction(async () => {
        const model = adapter.build('DummyReduxORMModel', {
          id: 1,
          type: 'City',
          name: 'Vic',
          country: 'ES',
        })
        const savedModel = adapter.save(model, DummyReduxORMModel)
        return expect(savedModel).to.eventually.equal(model)
      }),
    )
    it('returns a promise', () => {
      const model = adapter.build('DummyReduxORMModel', {
        id: 1,
        type: 'City',
        name: 'Vic',
        country: 'ES',
      })
      const savedModelP = adapter.save(model, DummyReduxORMModel)
      expect(savedModelP.then).to.be.a('function')
      return expect(savedModelP).to.be.eventually.fulfilled
    })
  })
  //
  describe('#destroy', () => {
    it(
      'calls remove on the model',
      asyncFunction(async () => {
        const model = adapter.build('DummyReduxORMModel', {
          id: 1,
          type: 'City',
          name: 'Vic',
          country: 'ES',
        })
        const destroyedModel = await adapter.destroy(model, DummyReduxORMModel)
        expect(destroyedModel).to.be.equal(true)
      }),
    )

    it('returns a promise', () => {
      const model = adapter.build('DummyReduxORMModel', {
        id: 1,
        type: 'City',
        name: 'Vic',
        country: 'ES',
      })
      const destroyedModelP = adapter.destroy(model, DummyReduxORMModel)
      expect(destroyedModelP.then).to.be.a('function')
      return expect(destroyedModelP).to.be.eventually.fulfilled
    })
  })
})
