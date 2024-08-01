import {HelixChain, _NetworkType, HelixChainConf} from "../../src";


export enum Category {
  Default = 'default',
  ProxyAdmin = 'proxy-admin',
}

export interface TestSourceChainsOptions {
  category?: Category
  network?: _NetworkType
}

export class TestSource {
  public static chains(options?: TestSourceChainsOptions): HelixChainConf[] {
    const chains = HelixChain.chains({network: options?.network ?? 'mainnets'});
    const category = options?.category ?? Category.Default;
    switch (category) {
      case Category.ProxyAdmin:
        return chains.filter(item => !(['taiko'].indexOf(item.code) > -1))
      case Category.Default:
      default:
        return chains;
    }
  }
}
