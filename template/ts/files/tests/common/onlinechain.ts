import { ethers } from "ethers";

import { HelixChainConf } from "../../src/";
import { ProxyAdmin } from "./contracts"

export interface OnlineChainContract {
  proxyAdmin?: ProxyAdmin
}

export interface OnlineChainInfo {
  chain: HelixChainConf,
  provider: ethers.JsonRpcProvider
  contract: OnlineChainContract
}

// type CheckCallback = (code: string, oci: OnlineChainInfo) => Promise<void>;

export class Onlinechain {

  private readonly _onlinechainMap: Record<string, OnlineChainInfo> = {};


  constructor(
  ) {
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
      },
    } as OnlineChainInfo;
    // console.log(`pushed ${chain.code} to onlinechains`);
  }

  async proxyAdminOwner(oci: OnlineChainInfo) {
    const {chain, contract} = oci;
    return await contract.proxyAdmin?.owner();
  }

}
