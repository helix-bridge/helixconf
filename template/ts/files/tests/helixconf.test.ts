import { HelixChain } from "../src/";
import { ethers } from "ethers";

const erc20Abi = [
  {
    inputs: [
      { internalType: "string", name: "name_", type: "string" },
      { internalType: "string", name: "symbol_", type: "string" },
      { internalType: "uint8", name: "decimals_", type: "uint8" },
      { internalType: "uint256", name: "initialBalance_", type: "uint256" },
      {
        internalType: "address payable",
        name: "feeReceiver_",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

describe("helixconf_test", () => {
  test("test_chainId", () => {
    expect(42161n).toStrictEqual(HelixChain.arbitrum.id);
    expect(46n).toStrictEqual(HelixChain.darwiniaDvm.id);
    expect(44n).toStrictEqual(HelixChain.crabDvm.id);
  });
});

describe.each(HelixChain.chains())(`$_data.name`, ({ tokens, code, id, rpcs, couples }) => {
  describe.each(tokens)(`$symbol`, (token) => {
    test("The logo field should be configured", () => {
      expect(token.logo).toBeDefined();
    });

    if (code === "taiko" || code === "bera") {
      // Oops
    } else {
      test("Should configure the correct decimals and symbol", async () => {
        if (token.type === "native") {
          expect(token.decimals).toBe(18);
        } else {
          const rpc = rpcs[0];
          const provider = await new ethers.JsonRpcProvider(rpc);
          const contract = new ethers.Contract(
            token.address,
            erc20Abi,
            provider
          );
          const contractDecimals = await contract.decimals();
          expect(contractDecimals).toBe(BigInt(token.decimals));

          if (id.toString() === '1' && token.symbol === 'RING') {
            // https://etherscan.io/address/0x9469D013805bFfB7D3DEBe5E7839237e535ec483#readContract#F8
          } else {
            expect(await contract.symbol()).toBe(token.symbol);
          }
        }
      });
    }
  });

  describe.each(couples)(`Couple $chain.code::$protocol.name::$symbol.from::$symbol.to`, (couple) => {
    test("Target chain should be configured", () => {
      expect(HelixChain.chains().findIndex((c) => c.code === couple.chain.code)).not.toBe(-1);
    });

    test("The target chain should not be configured as the source chain", () => {
      expect(couple.chain.code).not.toBe(code)
    })

    test("Source token should be configured", () => {
      expect(tokens.findIndex((t) => t.symbol === couple.symbol.from)).not.toBe(-1);
    });

    const targetChain = HelixChain.chains().find((c) => c.code === couple.chain.code);
    if (targetChain) {
      test("Target token should be configured", () => {
        expect(targetChain.tokens.findIndex((t) => t.symbol === couple.symbol.to)).not.toBe(-1);
      });
    }
  })
});
