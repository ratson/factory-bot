import '../test-helper/testUtils'
import _bookshelf from 'bookshelf'
import _knex from 'knex'
import { expect } from 'chai'
import BookshelfAdapter from '../../src/adapters/BookshelfAdapter'

const knex = _knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

const bookshelf = _bookshelf(knex)

const Kitten = bookshelf.Model.extend({
  tableName: 'kittens',
})

describe('BookshelfAdapterIntegration', () => {
  const adapter = new BookshelfAdapter()

  before(done => {
    bookshelf.knex.schema
      .createTable('kittens', table => {
        table.increments()
        table.string('name')
      })
      .then(() => done())
  })
  it('builds models and access attributes correctly', done => {
    const kitten = adapter.build(Kitten, { name: 'fluffy' })
    expect(kitten).to.be.instanceof(Kitten)
    let name = adapter.get(kitten, 'name', Kitten)
    expect(name).to.be.equal('fluffy')

    adapter.set({ name: 'fluffy2' }, kitten, Kitten)
    name = adapter.get(kitten, 'name', Kitten)

    expect(name).to.be.equal('fluffy2')

    done()
  })
  it('saves models correctly', done => {
    const kitten = adapter.build(Kitten, { name: 'fluffy' })
    adapter
      .save(kitten, Kitten)
      .then(k => {
        expect(k).to.have.property('id')
        return k
      })
      .then(k => k.destroy())
      .then(() => done())
      .catch(err => done(err))
  })
  it('destroys models correctly', done => {
    const kitten = adapter.build(Kitten, { name: 'smellyCat' })
    adapter
      .save(kitten, Kitten)
      .then(() => Kitten.count())
      .then(count => expect(count).to.be.equal(1))
      .then(() => adapter.destroy(kitten, Kitten))
      .then(() => Kitten.count())
      .then(count => expect(count).to.be.equal(0))
      .then(() => done())
      .catch(err => done(err))
  })
})
