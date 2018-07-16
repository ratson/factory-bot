import FactoryGirl from './FactoryGirl'

export { default as ObjectAdapter } from './adapters/ObjectAdapter'
export { default as BookshelfAdapter } from './adapters/BookshelfAdapter'
export { default as DefaultAdapter } from './adapters/DefaultAdapter'
export { default as MongodbAdapter } from './adapters/MongodbAdapter'
export { default as MongooseAdapter } from './adapters/MongooseAdapter'
export { default as MonkAdapter } from './adapters/MonkAdapter'
export { default as SequelizeAdapter } from './adapters/SequelizeAdapter'
export { default as ReduxORMAdapter } from './adapters/ReduxORMAdapter'

const factory = new FactoryGirl()
factory.FactoryGirl = FactoryGirl

export { factory }

export default factory
