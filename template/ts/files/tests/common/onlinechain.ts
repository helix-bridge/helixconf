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

type CheckCallback = (code: string, oci: OnlineChainInfo) => Promise<void>;

export class Onlinechain {

  private readonly onlineChainMap: Record<string, OnlineChainInfo> = {};


  constructor(
    private readonly chains: HelixChainConf[],
  ) {
  }

  async init() {
    for (const chain of this.chains) {
      const provider = await new ethers.JsonRpcProvider(chain.rpcs[0]);
      const cct = chain.contract;

      let contractProxyAdmin;
      if (cct["proxy-admin"]) {
        contractProxyAdmin = new ProxyAdmin(cct["proxy-admin"], provider);
      }

      this.onlineChainMap[chain.code] = {
        chain,
        provider,
        contract: {
          proxyAdmin: contractProxyAdmin,
        },
      } as OnlineChainInfo;
    }
  }

  private async _run(callback: CheckCallback) {
    const names = Object.keys(this.onlineChainMap);
    for (const name of names) {
      await callback(name, this.onlineChainMap[name]);
    }
  }

  async checkProxyAdmin() {
    await this._run(async (code: string, oci: OnlineChainInfo) => {
      const {chain, contract} = oci;
      console.log(chain.code);
      const owner = await contract.proxyAdmin?.owner();
      console.log(owner, chain.additional['dao']);
    });
  }

}
