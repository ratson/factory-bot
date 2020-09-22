import './test-helper/testUtils'
import { expect } from 'chai'
import sinon from 'sinon'
import FactoryGirl from '../src/FactoryGirl'
import Factory from '../src/Factory'
import DefaultAdapter from '../src/adapters/DefaultAdapter'
import Sequence from '../src/generators/Sequence'
import DummyModel from './test-helper/DummyModel'
import DummyAdapter from './test-helper/DummyAdapter'
import asyncFunction from './test-helper/asyncFunction'

describe('FactoryGirl', () => {
  describe('#constructor', () => {
    const factoryGirl = new FactoryGirl()
    it('can be created', () => {
      expect(factoryGirl).to.be.an.instanceof(FactoryGirl)
    })
    it('defines generator methods', () => {
      expect(factoryGirl.assoc).to.be.a('function')
      expect(factoryGirl.assocMany).to.be.a('function')
      expect(factoryGirl.assocAttrs).to.be.a('function')
      expect(factoryGirl.assocAttrsMany).to.be.a('function')
      expect(factoryGirl.sequence).to.be.a('function')
      expect(factoryGirl.seq).to.be.a('function')
      expect(factoryGirl.resetSeq).to.be.a('function')
      expect(factoryGirl.resetSequence).to.be.a('function')
      expect(factoryGirl.chance).to.be.a('function')
      expect(factoryGirl.oneOf).to.be.a('function')
    })
    it('defines default adapter', () => {
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter)
    })
  })
  describe('#define', () => {
    const factoryGirl = new FactoryGirl()
    it('can define factory', () => {
      factoryGirl.define('factory1', DummyModel, {})
      expect(factoryGirl.getFactory('factory1', false)).to.exist
      expect(factoryGirl.getFactory('factory1', false)).to.be.an.instanceof(
        Factory,
      )
    })
    it('can not define factory with same name', () => {
      function nameRepeated() {
        factoryGirl.define('factory1', DummyModel, {})
      }

      expect(nameRepeated).to.throw(Error)
    })
  })
  describe('#extend', () => {
    let factoryGirl
    beforeEach(() => {
      factoryGirl = new FactoryGirl()
      factoryGirl.define('parent', DummyModel, {
        parent: true,
        override: 'parent',
      })
    })
    it('can extend defined factory', async () => {
      factoryGirl.extend('parent', 'factory1', {
        child: true,
        override: 'child',
      })
      expect(factoryGirl.getFactory('factory1', false)).to.exist
      expect(factoryGirl.getFactory('factory1', false)).to.be.an.instanceof(
        Factory,
      )
      const model = await factoryGirl.build('factory1')
      expect(model).to.be.an.instanceOf(Object)
      expect(model.attrs.parent).to.equal(true, 'initializer is inherited')
      expect(model.attrs.child).to.equal(true, 'child initializer')
      expect(model.attrs.override).to.equal('child', 'child overrides parent')
    })
    it('model can be overridden', () => {
      factoryGirl.extend(
        'parent',
        'factory1',
        {
          child: true,
          override: 'child',
        },
        {
          model: Object,
        },
      )
      const model = factoryGirl.build('factory1')
      expect(model).to.be.an.instanceOf(Object)
    })
    it('can not define factory with same name', () => {
      function nameRepeated() {
        factoryGirl.extend('parent', 'parent', {})
      }
      expect(nameRepeated).to.throw(Error)
    })
    it('inherits buildOptions', async () => {
      const spy = sinon.spy()
      const dummyBuildOptions = { afterBuild: spy }
      factoryGirl.define(
        'parentWithAfterBuild',
        Object,
        {
          parent: true,
        },
        dummyBuildOptions,
      )
      factoryGirl.extend('parentWithAfterBuild', 'childWithParentAfterBuild', {
        child: true,
        override: 'child',
      })
      await factoryGirl.build('childWithParentAfterBuild')
      expect(spy).to.have.been.calledOnce
    })
    it('can extend with an initializer function', async () => {
      factoryGirl.define('parentWithObjectInitializer', Object, {
        parent: true,
      })
      factoryGirl.extend(
        'parentWithObjectInitializer',
        'childWithFunctionInitializer',
        buildOptions => ({ child: true, option: buildOptions.option }),
      )
      const model = await factoryGirl.build(
        'childWithFunctionInitializer',
        {},
        { option: true },
      )
      expect(model.parent).to.equal(true, 'parent initializer')
      expect(model.child).to.equal(true, 'child initializer')
      expect(model.option).to.equal(true, 'build options')
    })
    it('can extend a parent that has an initializer function', async () => {
      factoryGirl.define(
        'parentWithFunctionInitializer',
        Object,
        buildOptions => ({ parent: true, option: buildOptions.option }),
      )
      factoryGirl.extend(
        'parentWithFunctionInitializer',
        'childWithObjectInitializer',
        { child: true },
      )
      const model = await factoryGirl.build(
        'childWithObjectInitializer',
        {},
        { option: true },
      )
      expect(model.parent).to.equal(true, 'parent initializer')
      expect(model.child).to.equal(true, 'child initializer')
      expect(model.option).to.equal(true, 'build options')
    })
  })
  describe('#getFactory', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, {})

    it('returns requested factory', () => {
      const factory = factoryGirl.getFactory('factory1')
      expect(factory).to.exist
      expect(factory).to.be.an.instanceof(Factory)
    })
    it('throws error if factory does not exists', () => {
      function factoryNotExists() {
        factoryGirl.getFactory('factory2')
      }

      expect(factoryNotExists).to.throw(Error)
    })
  })
  describe('#setAdapter', () => {
    it('sets the default adapter', () => {
      const factoryGirl = new FactoryGirl()
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter)
      const dummyAdapter = new DummyAdapter()
      factoryGirl.setAdapter(dummyAdapter)
      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DummyAdapter)
    })
    it('sets adapter for factories correctly', () => {
      const factoryGirl = new FactoryGirl()
      factoryGirl.define('factory1', DummyModel, {})
      factoryGirl.define('factory2', DummyModel, {})

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DefaultAdapter,
      )

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter,
      )

      const dummyAdapter = new DummyAdapter()
      factoryGirl.setAdapter(dummyAdapter, 'factory1')

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DummyAdapter,
      )

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter,
      )

      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter)
    })
    it('sets adapter for multiple factories', () => {
      const factoryGirl = new FactoryGirl()
      factoryGirl.define('factory1', DummyModel, {})
      factoryGirl.define('factory2', DummyModel, {})

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DefaultAdapter,
      )

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DefaultAdapter,
      )

      const dummyAdapter = new DummyAdapter()

      factoryGirl.setAdapter(dummyAdapter, ['factory1', 'factory2'])

      expect(factoryGirl.getAdapter('factory1')).to.be.an.instanceof(
        DummyAdapter,
      )

      expect(factoryGirl.getAdapter('factory2')).to.be.an.instanceof(
        DummyAdapter,
      )

      expect(factoryGirl.getAdapter()).to.be.an.instanceof(DefaultAdapter)
    })
  })
  describe('#getAdapter', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, {})
    factoryGirl.define('factory2', DummyModel, {})
    const dummyAdapter = new DummyAdapter()
    factoryGirl.setAdapter(dummyAdapter, 'factory1')

    it('gets adapter correctly', () => {
      const adapter1 = factoryGirl.getAdapter('factory2')
      expect(adapter1).to.be.equal(factoryGirl.getAdapter())
      const adapter2 = factoryGirl.getAdapter('factory1')
      expect(adapter2).to.be.equal(dummyAdapter)
    })
  })
  describe('#attrs', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory',
      asyncFunction(async () => {
        const spy = sinon.spy(factoryGirl, 'getFactory')
        await factoryGirl.attrs('factory1')
        expect(spy).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
      }),
    )

    it(
      'calls attrs on the factory with attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'attrs')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        await factoryGirl.attrs('factory1', dummyAttrs, dummyBuildOptions)
        expect(spy).to.have.been.calledWith(dummyAttrs, dummyBuildOptions)
        factory.attrs.restore()
      }),
    )

    it('returns a promise', () => {
      const attrsP = factoryGirl.attrs('factory1')
      expect(attrsP.then).to.be.a('function')
      return expect(attrsP).to.be.eventually.fulfilled
    })
    it(
      'resolves to attrs correctly',
      asyncFunction(async () => {
        const attrs = await factoryGirl.attrs('factory1')
        expect(attrs).to.be.eql({
          name: 'Mark',
          age: 40,
        })
      }),
    )
  })
  describe('#build', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory and adapter',
      asyncFunction(async () => {
        const spy1 = sinon.spy(factoryGirl, 'getFactory')
        const spy2 = sinon.spy(factoryGirl, 'getAdapter')
        await factoryGirl.build('factory1')
        expect(spy1).to.have.been.calledWith('factory1')
        expect(spy2).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
        factoryGirl.getAdapter.restore()
      }),
    )

    it(
      'calls build on the factory with adapter, attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'build')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const adapter = factoryGirl.getAdapter('factory1')
        await factoryGirl.build('factory1', dummyAttrs, dummyBuildOptions)
        expect(spy).to.have.been.calledWith(
          adapter,
          dummyAttrs,
          dummyBuildOptions,
        )
        factory.build.restore()
      }),
    )

    it('returns a promise', () => {
      const modelP = factoryGirl.build('factory1')
      expect(modelP.then).to.be.a('function')
      return expect(modelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to model correctly',
      asyncFunction(async () => {
        const model = await factoryGirl.build('factory1')
        expect(model).to.be.an.instanceof(DummyModel)
        expect(model.attrs.name).to.be.equal('Mark')
        expect(model.attrs.age).to.be.equal(40)
      }),
    )

    it(
      'invokes afterBuild callback option if any',
      asyncFunction(async () => {
        const spy = sinon.spy(model => model)
        factoryGirl.withOptions({ afterBuild: spy })
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const model = await factoryGirl.build(
          'factory1',
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.been.calledWith(
          model,
          dummyAttrs,
          dummyBuildOptions,
        )
      }),
    )

    it(
      'accepts afterBuild callback returning a promise',
      asyncFunction(async () => {
        factoryGirl.withOptions({ afterBuild: model => Promise.resolve(model) })
        const model = await factoryGirl.build('factory1')
        expect(model).to.be.an.instanceof(DummyModel)
      }),
    )
  })
  describe('#create', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory and adapter',
      asyncFunction(async () => {
        const spy1 = sinon.spy(factoryGirl, 'getFactory')
        const spy2 = sinon.spy(factoryGirl, 'getAdapter')
        await factoryGirl.create('factory1')
        expect(spy1).to.have.been.calledWith('factory1')
        expect(spy2).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
        factoryGirl.getAdapter.restore()
      }),
    )

    it(
      'calls create on the factory with adapter, attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'create')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const adapter = factoryGirl.getAdapter('factory1')
        await factoryGirl.create('factory1', dummyAttrs, dummyBuildOptions)
        expect(spy).to.have.been.calledWith(
          adapter,
          dummyAttrs,
          dummyBuildOptions,
        )
        factory.create.restore()
      }),
    )

    it('returns a promise', () => {
      const modelP = factoryGirl.create('factory1')
      expect(modelP.then).to.be.a('function')
      return expect(modelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to model correctly',
      asyncFunction(async () => {
        const model = await factoryGirl.create('factory1')
        expect(model).to.be.an.instanceof(DummyModel)
        expect(model.attrs.name).to.be.equal('Mark')
        expect(model.attrs.age).to.be.equal(40)
      }),
    )

    it(
      'invokes afterCreate callback option if any',
      asyncFunction(async () => {
        const spy = sinon.spy(model => model)
        factoryGirl.withOptions({ afterCreate: spy })
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const model = await factoryGirl.create(
          'factory1',
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.been.calledWith(
          model,
          dummyAttrs,
          dummyBuildOptions,
        )
      }),
    )

    it(
      'accepts afterCreate callback returning a promise',
      asyncFunction(async () => {
        factoryGirl.withOptions({
          afterCreate: model => Promise.resolve(model),
        })
        const model = await factoryGirl.create('factory1')
        expect(model).to.be.an.instanceof(DummyModel)
      }),
    )
  })
  describe('#attrsMany', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory',
      asyncFunction(async () => {
        const spy = sinon.spy(factoryGirl, 'getFactory')
        await factoryGirl.attrsMany('factory1', 10)
        expect(spy).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
      }),
    )

    it(
      'calls attrsMany on the factory with num, attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'attrsMany')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        await factoryGirl.attrsMany(
          'factory1',
          10,
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.been.calledWith(10, dummyAttrs, dummyBuildOptions)
        factory.attrsMany.restore()
      }),
    )

    it('returns a promise', () => {
      const attrsP = factoryGirl.attrsMany('factory1', 1)
      expect(attrsP.then).to.be.a('function')
      return expect(attrsP).to.be.eventually.fulfilled
    })
    it(
      'resolves to attrs array correctly',
      asyncFunction(async () => {
        const attrs = await factoryGirl.attrsMany('factory1', 10)
        expect(attrs).to.be.an('array')
        expect(attrs).to.have.lengthOf(10)
        attrs.forEach(attr => {
          expect(attr).to.be.eql({
            name: 'Mark',
            age: 40,
          })
        })
      }),
    )
  })
  describe('#buildMany', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory and adapter',
      asyncFunction(async () => {
        const spy1 = sinon.spy(factoryGirl, 'getFactory')
        const spy2 = sinon.spy(factoryGirl, 'getAdapter')
        await factoryGirl.buildMany('factory1', 2)
        expect(spy1).to.have.been.calledWith('factory1')
        expect(spy2).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
        factoryGirl.getAdapter.restore()
      }),
    )

    it(
      'calls factory#buildMany with adapter, num, attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'buildMany')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const adapter = factoryGirl.getAdapter('factory1')
        await factoryGirl.buildMany(
          'factory1',
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.been.calledWith(
          adapter,
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        factory.buildMany.restore()
      }),
    )

    it('returns a promise', () => {
      const modelP = factoryGirl.buildMany('factory1', 2)
      expect(modelP.then).to.be.a('function')
      return expect(modelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to models array correctly',
      asyncFunction(async () => {
        const models = await factoryGirl.buildMany('factory1', 5)
        expect(models).to.be.an('array')
        models.forEach(model => {
          expect(model).to.be.an.instanceof(DummyModel)
          expect(model.attrs.name).to.be.equal('Mark')
          expect(model.attrs.age).to.be.equal(40)
        })
      }),
    )

    it(
      'invokes afterBuild callback option if any for each model',
      asyncFunction(async () => {
        const spy = sinon.spy(model => model)
        factoryGirl.withOptions({ afterBuild: spy })
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const models = await factoryGirl.buildMany(
          'factory1',
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.callCount(5)
        for (let i = 0; i < 5; i++) {
          expect(spy.getCall(i)).to.have.been.calledWith(
            models[i],
            dummyAttrs,
            dummyBuildOptions,
          )
        }
      }),
    )

    it(
      'accepts afterBuild callback returning a promise',
      asyncFunction(async () => {
        factoryGirl.withOptions({ afterBuild: model => Promise.resolve(model) })
        const models = await factoryGirl.buildMany('factory1', 5)
        expect(models).to.be.an('array')
        models.forEach(model => {
          expect(model).to.be.an.instanceof(DummyModel)
        })
      }),
    )
  })
  describe('#createMany', () => {
    const factoryGirl = new FactoryGirl()
    factoryGirl.define('factory1', DummyModel, { name: 'Mark', age: 40 })

    it(
      'requests correct factory and adapter',
      asyncFunction(async () => {
        const spy1 = sinon.spy(factoryGirl, 'getFactory')
        const spy2 = sinon.spy(factoryGirl, 'getAdapter')
        await factoryGirl.createMany('factory1', 2)
        expect(spy1).to.have.been.calledWith('factory1')
        expect(spy2).to.have.been.calledWith('factory1')
        factoryGirl.getFactory.restore()
        factoryGirl.getAdapter.restore()
      }),
    )

    it(
      'calls factory#createMany with adapter, num, attrs and buildOptions',
      asyncFunction(async () => {
        const factory = factoryGirl.getFactory('factory1')
        const spy = sinon.spy(factory, 'createMany')
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const adapter = factoryGirl.getAdapter('factory1')
        await factoryGirl.createMany(
          'factory1',
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.been.calledWith(
          adapter,
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        factory.createMany.restore()
      }),
    )

    it('returns a promise', () => {
      const modelP = factoryGirl.createMany('factory1', 2)
      expect(modelP.then).to.be.a('function')
      return expect(modelP).to.be.eventually.fulfilled
    })
    it(
      'resolves to models array correctly',
      asyncFunction(async () => {
        const models = await factoryGirl.createMany('factory1', 5)
        expect(models).to.be.an('array')
        models.forEach(model => {
          expect(model).to.be.an.instanceof(DummyModel)
          expect(model.attrs.name).to.be.equal('Mark')
          expect(model.attrs.age).to.be.equal(40)
        })
      }),
    )

    it(
      'invokes afterCreate callback option if any for each model',
      asyncFunction(async () => {
        const spy = sinon.spy(model => model)
        factoryGirl.withOptions({ afterCreate: spy })
        const dummyAttrs = {}
        const dummyBuildOptions = {}
        const models = await factoryGirl.createMany(
          'factory1',
          5,
          dummyAttrs,
          dummyBuildOptions,
        )
        expect(spy).to.have.callCount(5)
        for (let i = 0; i < 5; i++) {
          expect(spy.getCall(i)).to.have.been.calledWith(
            models[i],
            dummyAttrs,
            dummyBuildOptions,
          )
        }
      }),
    )

    it(
      'accepts afterCreate callback returning a promise',
      asyncFunction(async () => {
        factoryGirl.withOptions({
          afterCreate: model => Promise.resolve(model),
        })
        const models = await factoryGirl.createMany('factory1', 5)
        expect(models).to.be.an('array')
        models.forEach(model => {
          expect(model).to.be.an.instanceof(DummyModel)
        })
      }),
    )
  })
  describe('#withOptions', () => {
    it('can replace options', () => {
      const factoryGirl = new FactoryGirl({ a: 1 })
      const newOptions = { hello: 'world' }
      factoryGirl.withOptions(newOptions)
      expect(factoryGirl.options).to.be.eql(newOptions)
    })
    it('can merge options', () => {
      const originalOptions = { a: 1 }
      const factoryGirl = new FactoryGirl(originalOptions)
      const newOptions = { hello: 'world' }
      factoryGirl.withOptions(newOptions, true)
      expect(factoryGirl.options).to.be.eql({
        ...originalOptions,
        ...newOptions,
      })
    })
  })
  describe('#addToCreatedList', () => {
    const factoryGirl = new FactoryGirl()
    const dummyAdapter = new DummyAdapter()

    it('adds one model to the list', () => {
      const spy = sinon.spy(factoryGirl.created, 'add')
      const dummyModel = new DummyModel()
      factoryGirl.addToCreatedList(dummyAdapter, dummyModel)
      expect(spy).to.have.been.calledWith([dummyAdapter, dummyModel])
      factoryGirl.created.add.restore()
    })
    it('adds multiple models to the list', () => {
      const spy = sinon.spy(factoryGirl.created, 'add')
      const dummyModels = [new DummyModel(), new DummyModel(), new DummyModel()]
      factoryGirl.addToCreatedList(dummyAdapter, dummyModels)
      expect(spy).to.have.callCount(3)
      spy.args.forEach((arg, index) => {
        expect(arg[0]).to.be.eql([dummyAdapter, dummyModels[index]])
      })
      factoryGirl.created.add.restore()
    })
  })
  describe('#cleanup', () => {
    it('cleans up the factory', () => {
      const factoryGirl = new FactoryGirl()
      const dummyAdapter = new DummyAdapter()
      const dummyAdapter2 = new DummyAdapter()
      const dummyModels = [new DummyModel(), new DummyModel(), new DummyModel()]
      const dummyModel1 = new DummyModel()
      const dummyModel2 = new DummyModel()
      const spy1 = sinon.spy(dummyAdapter, 'destroy')
      const spy2 = sinon.spy(dummyAdapter2, 'destroy')
      const spy3 = sinon.spy(factoryGirl.created, 'clear')

      expect(factoryGirl.created.size).to.be.equal(0)
      factoryGirl.addToCreatedList(dummyAdapter, dummyModels)
      factoryGirl.addToCreatedList(dummyAdapter, dummyModel1)
      factoryGirl.addToCreatedList(dummyAdapter2, dummyModel2)
      expect(factoryGirl.created.size).to.be.equal(5)

      Sequence.sequences['some.id.1'] = 2
      expect(Sequence.sequences['some.id.1']).to.exist

      return factoryGirl.cleanUp().then(() => {
        expect(spy1).to.have.callCount(4)
        expect(spy2).to.have.callCount(1)
        expect(spy2).to.have.been.calledWith(dummyModel2, DummyModel)
        expect(spy3).to.have.callCount(1)

        expect(factoryGirl.created.size).to.be.equal(0)
        expect(Sequence.sequences['some.id.1']).to.not.exist
      })
    })
  })
  describe('#chance', () => {
    const factoryGirl = new FactoryGirl()
    it('follows a seed', () => {
      const makeName = factoryGirl.chance('word')

      factoryGirl.chance.seed(42)
      const firstWords = new Array(5).fill().map(makeName)

      factoryGirl.chance.seed(42)
      const secondWords = new Array(5).fill().map(makeName)

      expect(firstWords).to.deep.equal(secondWords)
    })
  })
})
