import Factory from './Factory'
import Sequence from './generators/Sequence'
import Assoc from './generators/Assoc'
import AssocAttrs from './generators/AssocAttrs'
import AssocMany from './generators/AssocMany'
import AssocAttrsMany from './generators/AssocAttrsMany'
import ChanceGenerator from './generators/ChanceGenerator'
import OneOf from './generators/OneOf'
import DefaultAdapter from './adapters/DefaultAdapter'

export function generatorThunk(factoryGirl, SomeGenerator) {
  const generator = new SomeGenerator(factoryGirl)
  return (...args) => () => generator.generate(...args)
}

export default class FactoryGirl {
  constructor(options = {}) {
    this.factories = {}
    this.options = {}
    this.adapters = {}
    this.created = new Set()

    this.assoc = generatorThunk(this, Assoc)
    this.assocMany = generatorThunk(this, AssocMany)
    this.assocAttrs = generatorThunk(this, AssocAttrs)
    this.assocAttrsMany = generatorThunk(this, AssocAttrsMany)
    this.seq = this.sequence = (...args) =>
      generatorThunk(this, Sequence)(...args)
    this.resetSeq = this.resetSequence = id => {
      Sequence.reset(id)
    }
    this.chance = generatorThunk(this, ChanceGenerator)
    this.oneOf = generatorThunk(this, OneOf)

    this.defaultAdapter = new DefaultAdapter()
    this.options = options
  }

  define(name, Model, initializer, options = {}) {
    if (this.getFactory(name, false)) {
      throw new Error(`Factory ${name} already defined`)
    }
    const factory = (this.factories[name] = new Factory(
      Model,
      initializer,
      options,
    ))
    return factory
  }

  remove(name) {
    delete this.factories[name]
  }

  extend(parent, name, childInitializer, options = {}) {
    if (this.getFactory(name, false)) {
      throw new Error(`Factory ${name} already defined`)
    }
    const parentFactory = this.getFactory(parent, true)
    const Model = options.model || parentFactory.Model
    const jointOptions = { ...parentFactory.options, ...options }
    let jointInitializer

    function resolveInitializer(initializer, buildOptions) {
      return typeof initializer === 'function'
        ? initializer(buildOptions)
        : initializer
    }

    if (
      typeof parentFactory.initializer === 'function' ||
      typeof childInitializer === 'function'
    ) {
      jointInitializer = function initializer(buildOptions = {}) {
        return Object.assign(
          {},
          resolveInitializer(parentFactory.initializer, buildOptions),
          resolveInitializer(childInitializer, buildOptions),
        )
      }
    } else {
      jointInitializer = Object.assign(
        {},
        parentFactory.initializer,
        childInitializer,
      )
    }

    const factory = (this.factories[name] = new Factory(
      Model,
      jointInitializer,
      jointOptions,
    ))
    return factory
  }

  async attrs(name, attrs, buildOptions = {}) {
    return this.getFactory(name).attrs(attrs, buildOptions)
  }

  async build(name, attrs = {}, buildOptions = {}) {
    const adapter = this.getAdapter(name)
    return this.getFactory(name)
      .build(adapter, attrs, buildOptions)
      .then(model =>
        (this.options.afterBuild
          ? this.options.afterBuild(model, attrs, buildOptions)
          : model),
      )
  }

  async create(name, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name)
    return this.getFactory(name)
      .create(adapter, attrs, buildOptions)
      .then(createdModel => this.addToCreatedList(adapter, createdModel))
      .then(model =>
        (this.options.afterCreate
          ? this.options.afterCreate(model, attrs, buildOptions)
          : model),
      )
  }

  attrsMany(name, num, attrs, buildOptions = {}) {
    return this.getFactory(name).attrsMany(num, attrs, buildOptions)
  }

  async buildMany(name, num, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name)
    return this.getFactory(name)
      .buildMany(adapter, num, attrs, buildOptions)
      .then(models =>
        (this.options.afterBuild
          ? Promise.all(
            models.map(model =>
              this.options.afterBuild(model, attrs, buildOptions),
            ),
          )
          : models),
      )
  }

  async createMany(name, num, attrs, buildOptions = {}) {
    const adapter = this.getAdapter(name)
    return this.getFactory(name)
      .createMany(adapter, num, attrs, buildOptions)
      .then(models => this.addToCreatedList(adapter, models))
      .then(models =>
        (this.options.afterCreate
          ? Promise.all(
            models.map(model =>
              this.options.afterCreate(model, attrs, buildOptions),
            ),
          )
          : models),
      )
  }

  getFactory(name, throwError = true) {
    if (!this.factories[name] && throwError) {
      throw new Error(`Invalid factory '${name}' requested`)
    }
    return this.factories[name]
  }

  withOptions(options, merge = false) {
    this.options = merge ? { ...this.options, ...options } : options
  }

  getAdapter(factory) {
    return factory
      ? this.adapters[factory] || this.defaultAdapter
      : this.defaultAdapter
  }

  addToCreatedList(adapter, models) {
    if (!Array.isArray(models)) {
      this.created.add([adapter, models])
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const model of models) {
        this.created.add([adapter, model])
      }
    }
    return models
  }

  cleanUp() {
    const createdArray = []
    // eslint-disable-next-line no-restricted-syntax
    for (const c of this.created) {
      createdArray.unshift(c)
    }
    const promise = createdArray.reduce(async (prev, [adapter, model]) => {
      await prev
      if (model === null) {
        return
      }
      await adapter.destroy(model, model.constructor)
    }, Promise.resolve())
    this.created.clear()
    this.resetSeq()
    return promise
  }

  setAdapter(adapter, factoryNames = null) {
    if (!factoryNames) {
      this.defaultAdapter = adapter
    } else {
      factoryNames = Array.isArray(factoryNames) ? factoryNames : [factoryNames]
      factoryNames.forEach(name => {
        this.adapters[name] = adapter
      })
    }
    return adapter
  }
}
