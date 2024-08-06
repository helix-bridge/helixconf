import {TestSource} from "./common/testsource";
import {HelixChain} from "../src";


describe.each(TestSource.chains())('helix chain config check -> $_data.code', (chain) => {
  const {tokens, code, rpcs, couples} = chain;

  test('native token should be configured', () => {
    expect(tokens.some((t) => t.type === 'native')).toBeTruthy();
  });
});


describe.each(TestSource.tokens())('helix chain tokens verify -> [$_chain]:$symbol', (token) => {
  const chain = HelixChain.get(token._chain)!;

  test(`the logo field should be configured > [${chain.code}]:${token.symbol}`, () => {
    expect(token.logo).toBeDefined();
  });
});

describe.each(TestSource.couples())
('helix chain couples check -> $_chain <$protocol.name> $symbol.from>$symbol.to', (couple) => {
  const chain = HelixChain.get(couple._chain)!;

  test("target chain should be configured", () => {
    expect(TestSource.chains().findIndex((c) => c.code === couple.chain.code)).not.toBe(-1);
  });

  test("target chain should not be configured as the source chain", () => {
    expect(couple.chain.code).not.toBe(chain.code)
  });

  test("messager address should be configured", () => {
    expect(couple.messager.address).toBeTruthy();
  });

  test("source token should be configured", () => {
    expect(chain.tokens.findIndex((t) => t.symbol === couple.symbol.from)).not.toBe(-1);
  });

  const targetChain = TestSource.chains().find((c) => c.code === couple.chain.code);
  if (targetChain) {
    test("target token should be configured", () => {
      expect(targetChain.tokens.findIndex((t) => t.symbol === couple.symbol.to)).not.toBe(-1);
    });
  }
});
