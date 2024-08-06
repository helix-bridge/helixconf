import {Category, TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import {oc} from './_base'

describe.each(TestSource.tokens())('helix chain tokens verify -> [$_chain]:$symbol', (token) => {
  const chain = HelixChain.get(token._chain)!;

  test(`should configure the correct token info > [${chain.code}]:${token.symbol}`, async () => {

    if (TestSource.isSkip({category: Category.TokenDecimals, chain})) {
      return;
    }
    if (token.type === 'native') {
      expect(token.decimals).toBe(18);
      return;
    }
    const oci = await oc.onlinechain(chain);
    const erc20 = await oc.erc20(oci, token);
    const contractDecimals = await erc20.decimals();
    expect(BigInt(contractDecimals)).toBe(BigInt(token.decimals));

    if (!TestSource.isSkip({category: Category.TokenSymbol, chain, token})) {
      const contractSymbol = await erc20.symbol();
      expect(contractSymbol).toBe(token.symbol);
    }
  });
});
