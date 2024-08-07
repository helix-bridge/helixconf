import {ethers} from "ethers";

import {ChainCouple, ChainMessager, ChainToken, HelixChain, HelixChainConf, HelixProtocol} from "../../src/";
import {Erc20, ProxyAdmin} from "./contracts"
import {
  DarwiniaMsglineMessager,
  Eth2ArbReceiveService,
  Eth2ArbSendService,
  LayerZeroMessager,
  Messager
} from "./messager";
import {Bridge, BridgeProtocol} from "./bridge";

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
  private readonly _messagerMap: Record<string, Messager> = {};
  private readonly _protocolMap: Record<string, BridgeProtocol> = {};

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
    const mapKey = `${oci.chain.code}:${cm.address || cm.name}`;
    let messager: Messager = this._messagerMap[mapKey]
    if (messager) {
      return messager;
    }
    switch (cm.name) {
      case "eth2arb-receive":
        messager = new Eth2ArbReceiveService(cm.address!, oci.provider);
        break;
      case "eth2arb-send":
        messager = new Eth2ArbSendService(cm.address!, oci.provider);
        break;
      case "msgline":
        messager = new DarwiniaMsglineMessager(cm.address!, oci.provider);
        break;
      case "layerzero":
        messager = new LayerZeroMessager(cm.address!, oci.provider);
        break;
    }
    this._messagerMap[mapKey] = messager;
    return messager;
  }

  protocol(oci: OnlineChainInfo, protocol: HelixProtocol): BridgeProtocol {
    const mapKey = `${oci.chain.code}:${protocol.address}`;
    let bp = this._protocolMap[mapKey];
    if (bp) {
      return bp;
    }
    bp = new BridgeProtocol(protocol, oci.provider);
    this._protocolMap[mapKey] = bp;
    return bp;
  }

  async bridge(soci: OnlineChainInfo, couple: ChainCouple): Promise<Bridge> {
    const toci = await this.onlinechain(HelixChain.get(couple.chain.code)!);
    const targetCouples = toci.chain.filterCouples({
      chain: soci.chain.code,
      symbolFrom: couple.symbol.to,
      symbolTo: couple.symbol.from,
      protocol: couple.protocol.name,
    });
    if (targetCouples.length !== 1)
      throw new Error(`couples size ${targetCouples.length} invalid [${toci.chain.code}>${soci.chain.code}] [${couple.symbol.to}>${couple.symbol.from}]`);
    const targetCouple = targetCouples[0];
    const targetMessager = this.messager(toci, targetCouple.messager);
    return new Bridge({
      sourceChain: soci.chain,
      targetChain: toci.chain,
      sourceBridgeProtocol: this.protocol(soci, couple.protocol),
      targetBridgeProtocol: this.protocol(toci, targetCouple.protocol),
      sourceMessager: this.messager(soci, couple.messager),
      targetMessager: targetMessager,
      sourceProtocol: couple.protocol,
      targetProtocol: targetCouple.protocol,
    });
  }

  async proxyAdminOwner(oci: OnlineChainInfo): Promise<string | undefined> {
    const {contract} = oci;
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
