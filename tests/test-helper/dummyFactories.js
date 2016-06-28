/**
 * Created by chetanv on 08/06/16.
 */

import Factory from '../../src';
// import _debug from 'debug';
import { User, Address, PhoneNumber } from './dummyModels';

// const debug = _debug('dummyFactories');

Factory.define('PhoneNumber', PhoneNumber, {
  type: 'mobile',
  number: '1234567890',
});

Factory.define('PhoneNumber2', PhoneNumber, function (buildOptions) {
  const attrs = {
    type: 'mobile',
    number: Factory.seq('PhoneNumber2.number', n => `1234567890-${n}`),
  };

  if (buildOptions.landline) {
    attrs.type = 'landline';
  }

  return attrs;
});

Factory.define('Address', Address, function () {
  const attrs = {
    id: Factory.seq('Address.id', n => `address_${n}_id`),
    street: Factory.seq('Address.street', n => `street-${n}`),
    laneNo: Factory.sequence('Address.laneNo'),
    landlineNumber: Factory.assocBuild('PhoneNumber2', {}, { landline: true }),
  };
  return attrs;
});

Factory.define('User', User, function () {
  const attrs = {
    name: Factory.chance('name'),
    email: Factory.seq('User.email', n => `user${n}@email.com`),
    mobile: Factory.assocBuildMany(
      'PhoneNumber', 2, null, {
        number: Factory.seq('User.mobile', n => `123456-${n}`),
      }),
    address: Factory.assocMany('Address', 3, 'id'),
    bio: Factory.chance('paragraph', { sentences: 2 }),
  };

  return attrs;
});
