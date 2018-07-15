import '../test-helper/testUtils'
import { expect } from 'chai'
import sinon from 'sinon'
import Sequence from '../../src/generators/Sequence'
import asyncFunction from '../test-helper/asyncFunction'

describe('Sequence', () => {
  describe('#constructor', () => {
    it('can be created', () => {
      const sequence = new Sequence({})
      expect(sequence).to.be.instanceof(Sequence)
    })
  })
  describe('#reset', () => {
    it('reset the sequence for all if id not provided', () => {
      Sequence.sequences['some.id.1'] = 2
      Sequence.sequences['some.id.2'] = 2
      Sequence.reset()
      expect(Sequence.sequences['some.id.1']).to.not.exist
      expect(Sequence.sequences['some.id.2']).to.not.exist
    })
    it('reset the sequence for id', () => {
      Sequence.sequences['some.id.1'] = 2
      Sequence.sequences['some.id.2'] = 2
      Sequence.reset('some.id.1')
      expect(Sequence.sequences['some.id.1']).to.not.exist
      expect(Sequence.sequences['some.id.2']).to.be.equal(2)
      Sequence.reset('some.id.2')
    })
  })
  describe('#generate', () => {
    it('generates an id if not provided', () => {
      const sequence = new Sequence({})
      sequence.generate()
      expect(sequence.id).to.exist
      expect(Sequence.sequences[sequence.id]).to.equal(2)
    })
    it('initialises the sequence for id', () => {
      expect(Sequence.sequences['some.id.1']).to.not.exist
      const sequence = new Sequence({})
      sequence.generate('some.id.1')
      expect(Sequence.sequences['some.id.1']).to.exist
      expect(Sequence.sequences['some.id.1']).to.be.equal(2)
    })
    it('does not reset the sequence for id', () => {
      expect(Sequence.sequences['some.id.2']).to.not.exist
      Sequence.sequences['some.id.2'] = 2
      const sequence = new Sequence({})
      sequence.generate('some.id.2')
      expect(Sequence.sequences['some.id.2']).to.exist
      expect(Sequence.sequences['some.id.2']).to.be.equal(3)
    })
    it(
      'generates numbers sequentially',
      asyncFunction(async () => {
        const sequence = new Sequence({})
        const seq1 = await sequence.generate()
        const seq2 = await sequence.generate()
        const seq3 = await sequence.generate()
        expect(seq2 - seq1).to.be.equal(1)
        expect(seq3 - seq2).to.be.equal(1)
      }),
    )

    it(
      'generates numbers sequentially and calls callback',
      asyncFunction(async () => {
        const callback = sinon.spy(n => `value${n}`)
        const sequence = new Sequence({})
        const seq1 = await sequence.generate(callback)
        const seq2 = await sequence.generate(callback)
        expect(seq1).to.be.equal('value1')
        expect(seq2).to.be.equal('value2')
        expect(callback).to.be.calledTwice
      }),
    )
  })
})
