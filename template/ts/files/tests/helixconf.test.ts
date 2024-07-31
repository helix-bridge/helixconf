import { HelixChain } from "../src/";
import { ethers } from "ethers";
import abiErc20 from "./abis/erc20.json";

describe("helixconf_test", () => {
  test("test_chainId", () => {
    expect(42161n).toStrictEqual(HelixChain.arbitrum.id);
    expect(46n).toStrictEqual(HelixChain.darwiniaDvm.id);
    expect(44n).toStrictEqual(HelixChain.crabDvm.id);
    // console.log(abiErc20);
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
