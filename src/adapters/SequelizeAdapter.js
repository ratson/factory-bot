import DefaultAdapter from './DefaultAdapter'

export default class SequelizeAdapter extends DefaultAdapter {
  build(Model, props) {
    return Model.build(props)
  }
}
