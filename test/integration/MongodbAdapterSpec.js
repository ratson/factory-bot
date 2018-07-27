import '../test-helper/testUtils'
import { MongoClient } from 'mongodb'
import { expect } from 'chai'
import MongodbAdapter from '../../src/adapters/MongodbAdapter'
import { factory as factoryDefault } from '../../src'

describe('MongodbAdapterIntegration', () => {
  let mongoUnavailable = false

  const factory = new factoryDefault.FactoryGirl()
  let db
  let adapter

  before(async () => {
    try {
      const client = await MongoClient.connect(
        'mongodb://localhost:27017/factory_girl_test_db',
        { useNewUrlParser: true },
      )
      db = client.db()
    } catch (err) {
      mongoUnavailable = true
    }

    adapter = new MongodbAdapter(db)
    factory.setAdapter(adapter)

    factory.define('kitten', 'kitten', {
      name: factory.chance('name'),
    })
  })

  it('builds models and access attributes correctly', async function t() {
    mongoUnavailable && this.skip()

    expect(factory.build('kitten')).to.be.instanceof(Promise)

    const k = await factory.build('kitten', { name: 'fluffy' })
    expect(k.name).to.be.equal('fluffy')
    expect(k).not.to.have.property('_id')
  })

  it('saves models correctly', async function t() {
    mongoUnavailable && this.skip()

    const kitten = await adapter.build('kitten', { name: 'fluffy' })
    const k = await adapter.save(kitten, 'kitten')
    expect(k).to.have.property('_id')
  })
})
