import ObjectAdapter from './ObjectAdapter'

export default class MonkAdapter extends ObjectAdapter {
  async build(Model, props) {
    await Model.insert(props)
    return props
  }

  async save(model, Model) {
    if (model._id) {
      await Model.findOneAndUpdate(model._id, model, { upsert: true })
      return Model.findOne(model._id)
    }
    const { _id } = await Model.insert(model)
    return Model.findOne(_id)
  }

  async destroy(model, Model) {
    return Model.remove(model)
  }
}
