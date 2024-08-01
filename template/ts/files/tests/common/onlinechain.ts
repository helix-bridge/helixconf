import { ethers } from "ethers";

import {ChainToken, HelixChainConf} from "../../src/";
import {Erc20, ProxyAdmin} from "./contracts"

export interface OnlineChainContract {
  proxyAdmin?: ProxyAdmin
  erc20?: Record<string, Erc20>
}

export interface OnlineChainInfo {
  chain: HelixChainConf,
  provider: ethers.JsonRpcProvider
  contract: OnlineChainContract
}

// type CheckCallback = (code: string, oci: OnlineChainInfo) => Promise<void>;

export class Onlinechain {

  private readonly _onlinechainMap: Record<string, OnlineChainInfo> = {};

  constructor() {
  }

  public get onlinechains(): OnlineChainInfo[] {
    return Object.values(this._onlinechainMap);
  }

  public async onlinechain(chain: HelixChainConf): Promise<OnlineChainInfo> {
    await this.init(chain);
    return this._onlinechainMap[chain.code];
  }

  private async init(chain: HelixChainConf) {
    if (this._onlinechainMap[chain.code]) {
      return;
    }

    const provider = await new ethers.JsonRpcProvider(chain.rpcs[0]);
    const cct = chain.contract;

    let contractProxyAdmin;
    if (cct["proxy-admin"]) {
      contractProxyAdmin = new ProxyAdmin(cct["proxy-admin"], provider);
    }

    this._onlinechainMap[chain.code] = {
      chain,
      provider,
      contract: {
        proxyAdmin: contractProxyAdmin,
        erc20: {},
      },
    } as OnlineChainInfo;
    // console.log(`pushed ${chain.code} to onlinechains`);
  }

  async proxyAdminOwner(oci: OnlineChainInfo) {
    const {chain, contract} = oci;
    return await contract.proxyAdmin?.owner();
  }

  async erc20(oci: OnlineChainInfo, token: ChainToken) {
    const {provider, contract} = oci;
    if (!contract.erc20) {
      contract.erc20 = {};
    }
    if (contract.erc20[token.symbol]) {
      return contract.erc20[token.symbol];
    }
    const contractErc20 = new Erc20(token.address, provider);
    contract.erc20[token.symbol] = contractErc20;
    return contractErc20;
  }

}
