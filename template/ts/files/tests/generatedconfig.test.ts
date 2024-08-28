import {TestSource} from "./common/testsource";
import {HelixChain, PickRPCStrategy} from "../src";


describe.each(TestSource.chains())('helix chain config check -> $_data.code', (chain) => {

  test('native token should be configured', () => {
    expect(chain.nativeCurrency).toBeTruthy();
  });

  test('should be defined field', () => {
    expect(chain.testnet).toBeDefined();
    expect(chain.rpc).toBeDefined();

    expect(chain.keys()).toBeDefined();
  });

  test('test functions', () => {
    for (const indexer of chain.indexers) {
      expect(chain.indexer(indexer.type)).toBeDefined();
    }
    for (const token of chain.tokens) {
      expect(chain.token(token.symbol)).toBeDefined();
      for (const alias of token.alias) {
        expect(chain.token(alias)).toBeDefined();
      }
    }
    for (const messager of chain.messagers) {
      expect(chain.messager(messager.name)).toBeDefined();
    }
    const categories = chain.categories();
    for (const category of categories) {
      const couples = chain.filterCouples({category});
      expect(couples.length).toBeGreaterThan(0);
    }

    expect(chain.filterCouples()).toBeDefined();
    expect(chain.filterCouples({messager: 'msgline'})).toBeDefined();
    expect(chain.filterCouples({protocol: 'lnv3'})).toBeDefined();
    expect(chain.filterCouples({chain: '1'})).toBeDefined();
    expect(chain.filterCouples({symbolFrom: 'ETH'})).toBeDefined();
    expect(chain.filterCouples({symbolTo: 'ETH'})).toBeDefined();
    expect(chain.filterCouples({symbol: 'ETH'})).toBeDefined();

    expect(chain.toJSON()).toBeDefined();


    for (const code of HelixChain.codes()) {
      expect(HelixChain.get(code)).toBeDefined();
    }

    expect(HelixChain.get(1)).toBeDefined();
    expect(HelixChain.get(1n)).toBeDefined();
  });

  test('try pick rpc', async () => {
    expect(chain.pickRpcSync()).toBeTruthy();
    expect(chain.pickRpcSync({strategy: PickRPCStrategy.First})).toBeTruthy();
    expect(chain.pickRpcSync({strategy: PickRPCStrategy.Best})).toBeTruthy();
    expect(chain.pickRpcSync({strategy: PickRPCStrategy.Random})).toBeTruthy();
    expect(chain.pickRpcSync({strategy: PickRPCStrategy.Custom,})).toBeTruthy();
    expect(chain.pickRpcSync({
      strategy: PickRPCStrategy.Custom, picker(rpcs) {
        return rpcs[0]
      },
    })).toBeTruthy();
    expect(await chain.pickRpc()).toBeTruthy();
    expect(await chain.pickRpc({strategy: PickRPCStrategy.First})).toBeTruthy();
    expect(await chain.pickRpc({strategy: PickRPCStrategy.Best})).toBeTruthy();
    expect(await chain.pickRpc({strategy: PickRPCStrategy.Random})).toBeTruthy();
    expect(await chain.pickRpc({strategy: PickRPCStrategy.Custom})).toBeTruthy();
    expect(await chain.pickRpc({
      strategy: PickRPCStrategy.Custom, async picker(rpcs) {
        return rpcs[0]
      },
    })).toBeTruthy();
  });

  if (chain.indexers.length) {
    test.each(chain.indexers)('should be defined correct indexer', (indexer) => {
      expect(Object.values(['thegraph', 'ponder', 'hyperindex'])).toContain(indexer.type);
    });
  }

  test.each(chain.messagers)('should be defined messagers address', (messager) => {
    expect(messager.address).toBeTruthy();
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

  test("couple messager address should be configured", () => {
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
