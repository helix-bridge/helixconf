import {HelixChain} from '../src/'

describe('helixconf_test', () => {
  test('test_chainId', () => {
    expect(42161n).toStrictEqual(HelixChain.arbitrum.id);
    expect(46n).toStrictEqual(HelixChain.darwiniaDvm.id);
    expect(44n).toStrictEqual(HelixChain.crabDvm.id);
  });
});

