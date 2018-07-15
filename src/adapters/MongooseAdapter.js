import DefaultAdapter from './DefaultAdapter'

export default class MongooseAdapter extends DefaultAdapter {
  async destroy(model, Model) {
    return model.remove()
  }
}
