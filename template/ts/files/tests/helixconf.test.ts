
import {Onlinechain} from "./common/onlinechain";
import {Category, TestSource} from "./common/testsource";

describe("helixconf-test", () => {

  const oc = new Onlinechain();

  test.each(TestSource.chains({category: Category.ProxyAdmin}))
  ('proxy admin -> [$_data.code]', async (chain) => {
    console.log('-----> ', chain.code, chain.rpcs);
    const oci = await oc.onlinechain(chain);
    const owner = await oc.proxyAdminOwner(oci);
    expect(chain.additional.dao).toBe(owner);
  });

  test.each(TestSource.chains())('token -> [$_data.code]', async (chain) => {
    const oci = await oc.onlinechain(chain);
  });

});

// describe.each(HelixChain.chains())(`$_data.name`, ({ tokens, code, rpcs, couples }) => {
//   if (couples.length) {
//     test('Native token should be configured', () => {
//       expect(tokens.some((t) => t.type === 'native')).toBeTruthy();
//     });
//   }
//
//   describe.each(tokens)(`$name`, (token) => {
//     test("The logo field should be configured", () => {
//       expect(token.logo).toBeDefined();
//     });
//
//     if (code === "taiko" || code === "bera") {
//       // Oops
//     } else {
//       test("Should configure the correct decimals", async () => {
//         if (token.type === "native") {
//           expect(token.decimals).toBe(18);
//         } else {
//           const rpc = rpcs[0];
//           const provider = await new ethers.JsonRpcProvider(rpc);
//           const contract = new ethers.Contract(
//             token.address,
//             erc20Abi,
//             provider
//           );
//           const contractDecimals = await contract.decimals();
//           expect(contractDecimals).toBe(BigInt(token.decimals));
//         }
//       });
//     }
//   });
// });





// describe.each(HelixChain.chains())(`$_data.name`, ({ tokens, code, id, rpcs, couples }) => {
//   if (couples.length) {
//     test('Native token should be configured', () => {
//       expect(tokens.some((t) => t.type === 'native')).toBeTruthy();
//     });
//   }
//
//   describe.each(tokens)(`$symbol`, (token) => {
//     test("The logo field should be configured", () => {
//       expect(token.logo).toBeDefined();
//     });
//
//     if (code === "taiko" || code === "bera") {
//       // Oops
//     } else {
//       test("Should configure the correct decimals and symbol", async () => {
//         if (token.type === "native") {
//           expect(token.decimals).toBe(18);
//         } else {
//           const rpc = rpcs[0];
//           const provider = await new ethers.JsonRpcProvider(rpc);
//           const contract = new ethers.Contract(
//             token.address,
//             erc20Abi,
//             provider
//           );
//           const contractDecimals = await contract.decimals();
//           expect(contractDecimals).toBe(BigInt(token.decimals));
//
//           if (id.toString() === '1' && token.symbol === 'RING') {
//             // https://etherscan.io/address/0x9469D013805bFfB7D3DEBe5E7839237e535ec483#readContract#F8
//           } else {
//             expect(await contract.symbol()).toBe(token.symbol);
//           }
//         }
//       });
//     }
//   });
//
//   describe.each(couples)(`Couple $chain.code::$protocol.name::$symbol.from::$symbol.to`, (couple) => {
//     test("Target chain should be configured", () => {
//       expect(HelixChain.chains().findIndex((c) => c.code === couple.chain.code)).not.toBe(-1);
//     });
//
//     test("The target chain should not be configured as the source chain", () => {
//       expect(couple.chain.code).not.toBe(code)
//     })
//
//     test("Source token should be configured", () => {
//       expect(tokens.findIndex((t) => t.symbol === couple.symbol.from)).not.toBe(-1);
//     });
//
//     const targetChain = HelixChain.chains().find((c) => c.code === couple.chain.code);
//     if (targetChain) {
//       test("Target token should be configured", () => {
//         expect(targetChain.tokens.findIndex((t) => t.symbol === couple.symbol.to)).not.toBe(-1);
//       });
//     }
//   })
// });
