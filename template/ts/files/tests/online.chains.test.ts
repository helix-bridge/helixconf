import {Category, TestSource} from "./common/testsource";

import {oc} from './_base'


const chains = TestSource.chains({
  category: Category.ProxyAdmin
});

describe.each(chains)('helix chain contract verify -> $_data.code', (chain) => {
  const {tokens, code, rpcs, couples, messagers} = chain;

  test(`should configure the correct proxy admin dao > ${code}`, async () => {
    if (TestSource.isSkip({category: Category.ProxyAdmin, chain})) {
      return;
    }
    const oci = await oc.onlinechain(chain);
    const owner = await oc.proxyAdminOwner(oci);
    expect(owner).toBeTruthy();
    expect(chain.additional.dao.toLowerCase()).toBe(owner!.toLowerCase());
  }, 60000);

});