import ObjectAdapter from './ObjectAdapter'

export default class MongodbAdapter extends ObjectAdapter {
  constructor(db) {
    super()

    this.db = db
  }

  build(Model, props) {
    const model = {}
    this.set(props, model, Model)
    return model
  }

  async save(model, Model) {
    const c = this.db.collection(Model)

    if (model._id) {
      await c.findOneAndUpdate(model._id, { $set: model }, { upsert: true })
      return c.findOne(model._id)
    }
    const { insertedId } = await c.insertOne(model)
    return c.findOne(insertedId)
  }

  async destroy(model, Model) {
    return this.db.collection(Model).deleteOne(model)
  }
}
