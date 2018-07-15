import Chance from 'chance'
import Generator from './Generator'

const chance = new Chance()

export default class ChanceGenerator extends Generator {
  generate(chanceMethod, ...options) {
    if (typeof chance[chanceMethod] !== 'function') {
      throw new TypeError('Invalid chance method requested')
    }
    return chance[chanceMethod](...options)
  }
}
