import {HelixChain, _NetworkType, HelixChainConf, ChainToken, ChainCouple, ChainMessager} from "../../src";


export enum Category {
  Default = 'default',
  ProxyAdmin = 'proxy-admin',
  TokenDecimals = 'token-decimals',
  TokenSymbol = 'token-symbol',
}

export interface TestSourceChainsOptions {
  category?: Category
  network?: _NetworkType
  chains?: string[]
}

export interface IsSkipOptions {
  chain: HelixChainConf
  category: Category
  token?: ChainToken,
}

export interface TestChainToken extends ChainToken {
  _chain: string
}

export interface TestChainCouple extends ChainCouple {
  _chain: string
}

export interface TestChainMessager extends ChainMessager {
  _chain: string
}

export class TestSource {
  public static chains(options?: TestSourceChainsOptions): HelixChainConf[] {
    let chains = HelixChain.chains({network: options?.network ?? 'mainnets'});
    const allows = (options?.chains ?? []).filter(item => item.toLowerCase());
    if (allows.length) {
      chains = chains.filter(
        item => allows.includes(item.id.toString()) || allows.includes(item.code.toLowerCase().toString())
      );
    }
    const category = options?.category ?? Category.Default;
    switch (category) {
      case Category.ProxyAdmin:
        return chains.filter(item => !TestSource.isSkip({category: Category.ProxyAdmin, chain: item}))
      case Category.Default:
      default:
        return chains;
    }
  }

  public static tokens(options?: TestSourceChainsOptions): TestChainToken[] {
    const chains = TestSource.chains(options);
    const tokens = [];
    for (const chain of chains) {
      const chainTokens = chain.tokens.map(item => {
        return {...item, _chain: chain.code,} as TestChainToken
      });
      tokens.push(...chainTokens);
    }
    return tokens;
  }

  public static couples(options?: TestSourceChainsOptions): TestChainCouple[] {
    const chains = TestSource.chains(options);
    const couples = [];
    for (const chain of chains) {
      const chainCouples = chain.couples.map(item => {
        return {...item, _chain: chain.code} as TestChainCouple
      });
      couples.push(...chainCouples);
    }
    return couples;
  }

  public static validCategories(): string[] {
    return ["USDT", "RING", "DAI", "LINK", "ETH", "BTC", "USDC", "PINK"];
  }

  // public static messagers(options?: TestSourceChainsOptions): TestChainMessager[] {
  //   const chains = TestSource.chains(options);
  //   const messagers = [];
  //   for (const chain of chains) {
  //     const chainMessagers = chain.messagers.map(item => {
  //       return {...item, _chain: chain.code} as TestChainMessager
  //     });
  //     messagers.push(...chainMessagers);
  //   }
  //   return messagers;
  // }


  public static isSkip(options: IsSkipOptions) {
    const {category, chain} = options;
    switch (category) {
      case Category.ProxyAdmin:
        return ['taiko'].indexOf(chain.code) > -1;
      case Category.TokenDecimals:
        return ['taiko'].indexOf(chain.code) > -1;
      case Category.TokenSymbol:
        // https://etherscan.io/address/0x9469D013805bFfB7D3DEBe5E7839237e535ec483#readContract#F8
        return chain.code === 'ethereum' && options.token?.symbol === 'RING';
      default:
        return false;
    }
  }
}
