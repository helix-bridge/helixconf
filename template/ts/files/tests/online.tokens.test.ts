import {Category, TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import base from './_base'

const tokens = TestSource.tokens({});

describe.each(tokens)('helix chain tokens verify -> [$_chain]:$symbol', (token) => {
  const chain = HelixChain.get(token._chain)!;

  test(`should configure the correct token info > [${chain.code}]:${token.symbol}`, async () => {
    if (TestSource.isSkip({category: Category.TokenDecimals, chain})) {
      return;
    }
    if (token.type === 'native') {
      expect(token.decimals).toBe(18);
      return;
    }
    const contractDecimals = await base.erc20Decimals(token);
    expect(contractDecimals!.toString()).toBe(token.decimals.toString());

    //if (!TestSource.isSkip({category: Category.TokenSymbol, chain, token})) {
    //const contractSymbol = await erc20.symbol();
    //expect(contractSymbol).toBe(token.symbol);
    //}
  }, 60000);
});
