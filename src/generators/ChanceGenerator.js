import Chance from 'chance'
import Generator from './Generator'

export default class ChanceGenerator extends Generator {
  constructor(factoryGirl, seedValue) {
    super(factoryGirl)

    if (seedValue) {
      this.seed(seedValue)
    } else {
      this.chance = new Chance()
    }
  }

  seed(value) {
    this.chance = new Chance(value)
  }

  generate(chanceMethod, ...options) {
    if (typeof chanceMethod === 'function') {
      return chanceMethod(this.chance, ...options)
    }

    if (typeof this.chance[chanceMethod] !== 'function') {
      throw new TypeError('Invalid chance method requested')
    }
    return this.chance[chanceMethod](...options)
  }
}
