import {ethers} from "ethers";

import {ChainCouple, ChainMessager, ChainToken, HelixChain, HelixChainConf, HelixProtocol} from "../../src/";
import {MulticallWrapper} from "ethers-multicall-provider";

export interface OnlineChainInfo {
  chain: HelixChainConf,
  provider: ethers.JsonRpcProvider
}

export class Onlinechain {

  private readonly _onlinechainMap: Record<string, OnlineChainInfo> = {};

  public async onlinechain(chain: HelixChainConf): Promise<OnlineChainInfo> {
    await this.init(chain);
    return this._onlinechainMap[chain.code];
  }

  private async init(chain: HelixChainConf) {
    if (this._onlinechainMap[chain.code]) {
      return;
    }

    const ethersProvider = await new ethers.JsonRpcProvider(chain.rpc);
    const provider = MulticallWrapper.wrap(ethersProvider);

    this._onlinechainMap[chain.code] = {
      chain,
      provider,
    } as OnlineChainInfo;
  }

}
