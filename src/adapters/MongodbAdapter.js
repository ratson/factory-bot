import ObjectAdapter from './ObjectAdapter'

const __Model__ = Symbol('Model')

const enhanceModel = Model => model => {
  if (!model) {
    return model
  }
  Object.defineProperty(model, __Model__, {
    enumerable: false,
    value: Model,
  })
  return model
}

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
      return c.findOne(model._id).then(enhanceModel(Model))
    }
    const { insertedId } = await c.insertOne(model)
    return c.findOne(insertedId).then(enhanceModel(Model))
  }

  async destroy(model) {
    return this.db.collection(model[__Model__]).deleteOne(model)
  }
}
