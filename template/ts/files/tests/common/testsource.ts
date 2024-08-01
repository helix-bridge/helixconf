import {HelixChain, _NetworkType, HelixChainConf, ChainToken} from "../../src";


export enum Category {
  Default = 'default',
  ProxyAdmin = 'proxy-admin',
  TokenDecimals = 'token-decimals',
  TokenSymbol = 'token-symbol',
}

export interface TestSourceChainsOptions {
  category?: Category
  network?: _NetworkType
}

export interface IsSkipOptions {
  chain: HelixChainConf
  category: Category
  token?: ChainToken,
}

export class TestSource {
  public static chains(options?: TestSourceChainsOptions): HelixChainConf[] {
    const chains = HelixChain.chains({network: options?.network ?? 'mainnets'});
    const category = options?.category ?? Category.Default;
    switch (category) {
      case Category.ProxyAdmin:
        return chains.filter(item => !TestSource.isSkip({category: Category.ProxyAdmin, chain: item}))
      case Category.Default:
      default:
        return chains;
    }
  }

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
