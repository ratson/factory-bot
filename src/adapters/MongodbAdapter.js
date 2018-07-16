import ObjectAdapter from './ObjectAdapter'

export default class MongodbAdapter extends ObjectAdapter {
  constructor(db) {
    super()

    this.db = db
  }

  async build(Model, props) {
    this.db.collection(Model).insertOne(props)
    return props
  }

  async save(model, Model) {
    const c = this.db.collection(Model)

    if (model._id) {
      await c.findOneAndUpdate(model._id, model, { upsert: true })
      return c.findOne(model._id)
    }
    const { _id } = await c.insert(model)
    return c.findOne(_id)
  }

  async destroy(model, Model) {
    return this.db.collection(Model).deleteOne(model)
  }
}
