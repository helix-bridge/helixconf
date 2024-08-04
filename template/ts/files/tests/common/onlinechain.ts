import {ethers} from "ethers";

import {ChainMessager, ChainToken, HelixChainConf, HelixProtocol} from "../../src/";
import {Erc20, ProxyAdmin} from "./contracts"
import {
  DarwiniaMsglineMessager,
  Eth2ArbReceiveService,
  Eth2ArbSendService,
  LayerZeroMessager,
  Messager
} from "./messager";
import {BridgeEndpoint} from "./bridge";

export interface OnlineChainContract {
  proxyAdmin?: ProxyAdmin
  erc20?: Record<string, Erc20>
}

export interface OnlineChainInfo {
  chain: HelixChainConf,
  provider: ethers.JsonRpcProvider
  contract: OnlineChainContract
}

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
    const contract = chain.contract;

    let contractProxyAdmin;
    if (contract["proxy-admin"]) {
      contractProxyAdmin = new ProxyAdmin(contract["proxy-admin"], provider);
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

  messager(oci: OnlineChainInfo, cm: ChainMessager): Messager {
    switch (cm.name) {
      case "eth2arb-receive":
        return new Eth2ArbReceiveService(cm.address!, oci.provider);
      case "eth2arb-send":
        return new Eth2ArbSendService(cm.address!, oci.provider);
      case "msgline":
        return new DarwiniaMsglineMessager(cm.address!, oci.provider);
      case "layerzero":
        return new LayerZeroMessager(cm.address!, oci.provider);
    }
  }

  bridgeEndpoint(oci: OnlineChainInfo, protocol: HelixProtocol): BridgeEndpoint {
    return new BridgeEndpoint(protocol, oci.provider);
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
