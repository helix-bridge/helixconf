import {Onlinechain} from "./common/onlinechain";
import {Category, TestSource} from "./common/testsource";
import {BridgeProtocol} from "./common/bridge";
import {HelixChain} from "../src";

const oc = new Onlinechain();

// describe.each(TestSource.chains())
// ('helix chain config check -> $_data.code', (chain) => {
//   const {tokens, code, rpcs, couples} = chain;
//
//   test('native token should be configured', () => {
//     expect(tokens.some((t) => t.type === 'native')).toBeTruthy();
//   });
//
//   describe.each(tokens)(`check token [${code}]:$symbol`, (token) => {
//     test(`the logo field should be configured > [${code}]:${token.symbol}`, () => {
//       expect(token.logo).toBeDefined();
//     });
//   });
//
//   describe.each(couples)
//   (`couple [$chain.code] <$protocol.name> $symbol.from>$symbol.to`, (couple) => {
//     test("target chain should be configured", () => {
//       expect(TestSource.chains().findIndex((c) => c.code === couple.chain.code)).not.toBe(-1);
//     });
//
//     test("target chain should not be configured as the source chain", () => {
//       expect(couple.chain.code).not.toBe(code)
//     })
//
//     test("source token should be configured", () => {
//       expect(tokens.findIndex((t) => t.symbol === couple.symbol.from)).not.toBe(-1);
//     });
//
//     const targetChain = TestSource.chains().find((c) => c.code === couple.chain.code);
//     if (targetChain) {
//       test("target token should be configured", () => {
//         expect(targetChain.tokens.findIndex((t) => t.symbol === couple.symbol.to)).not.toBe(-1);
//       });
//     }
//   });
//
// });

describe.each(TestSource.chains())
('helix chain contract verify -> $_data.code', (chain) => {
  const {tokens, code, rpcs, couples, messagers} = chain;

  // describe.each(tokens)(`check token [${code}]:$symbol`, (token) => {
  //   test(`should configure the correct token info > [${code}]:${token.symbol}`, async () => {
  //     if (TestSource.isSkip({category: Category.TokenDecimals, chain})) {
  //       return;
  //     }
  //     if (token.type === 'native') {
  //       expect(token.decimals).toBe(18);
  //       return;
  //     }
  //     const oci = await oc.onlinechain(chain);
  //     const erc20 = await oc.erc20(oci, token);
  //     const contractDecimals = await erc20.decimals();
  //     expect(BigInt(contractDecimals)).toBe(BigInt(token.decimals));
  //
  //     if (!TestSource.isSkip({category: Category.TokenSymbol, chain, token})) {
  //       const contractSymbol = await erc20.symbol();
  //       expect(contractSymbol).toBe(token.symbol);
  //     }
  //   });
  // });
  //
  // test(`should configure the correct proxy admin dao > ${code}`, async () => {
  //   if (TestSource.isSkip({category: Category.ProxyAdmin, chain})) {
  //     return;
  //   }
  //   const oci = await oc.onlinechain(chain);
  //   const owner = await oc.proxyAdminOwner(oci);
  //   expect(chain.additional.dao.toLowerCase()).toBe(owner.toLowerCase());
  // });
  //
  // describe.each(messagers)(`check messager [${code}]: $name`, message => {
  //   test(`check message dao > [${code}]:${message.name}`, async () => {
  //     const oci = await oc.onlinechain(chain);
  //     const messager = await oc.messager(oci, message);
  //     const mdao = await messager.dao();
  //     expect(chain.additional.dao.toLowerCase()).toBe(mdao.toLowerCase());
  //   });
  //
  //   test(`check message operator > [${code}]:${message.name}`, async () => {
  //     const oci = await oc.onlinechain(chain);
  //     const messager = await oc.messager(oci, message);
  //     const moperator = await messager.operator();
  //     expect(chain.additional.operator.toLowerCase()).toBe(moperator.toLowerCase());
  //   });
  // });

  describe.each(couples)(`check coupe [${code}->$chain.code]: $symbol.from->$symbol.to`, couple => {
    test(`check bridge dao > [${code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to}`, async () => {
      for (const c of [
        chain,
        HelixChain.get(couple.chain.code)!
      ]) {
        const oci = await oc.onlinechain(c);
        const be = oc.protocol(oci, couple.protocol);
        const bdao = await be.dao();
        expect(c.additional.dao.toLowerCase()).toBe(bdao.toLowerCase());
      }
    });
  });

});

