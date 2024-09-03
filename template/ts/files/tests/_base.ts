import {Onlinechain, OnlineChainInfo} from "./common/onlinechain";
import {TestChainCouple, TestChainToken, TestSource} from "./common/testsource";
import {
  DarwiniaMsglineMessager,
  Erc20,
  Eth2ArbReceiveService,
  Eth2ArbSendService,
  LayerZeroMessager,
  LnBridgeContract,
  LnDefaultBridgeContract,
  LnOppositeBridgeContract,
  Lnv3BridgeContract,
  Messager,
  MessagerService,
  ProxyAdmin,
  RemoteMessager,
  TokenRegisteredInfo
} from "./common/contracts";
import {ChainMessager, CoupleFilter, HelixChain, HelixChainConf, HelixProtocol} from "../src";
import {setTimeout} from "timers/promises";

type MulticallType = 'contract-proxy-admin-owner'
  | 'contract-erc20-decimals'
  | 'contract-protocol-messager'
  | 'contract-protocol-dao'
  | 'contract-protocol-token-registered'
  | 'contract-messager-remote-messager'
  | 'contract-messager-remote-appsender'
  | 'contract-messager-remote-appreceiver'
  ;

interface Multicaller {
  type: MulticallType
  call: Promise<any>
  chain: HelixChainConf
  result?: any
  token?: TestChainToken
  couple?: TestChainCouple
}

interface HelixContractOnlineData {
  proxyAdminOwner: Record<string, string>
  tokenDecimals: Record<string, bigint>
  protocolMessager: Record<string, MessagerService>
  protocolDao: Record<string, string>
  protocolRegistered: Record<string, TokenRegisteredInfo>
  messagerRemoteMessager: Record<string, RemoteMessager>
  messagerRemoteAppsender: Record<string, string>
  messagerRemoteAppreceiver: Record<string, string>
}


function _ckChain(chain: HelixChainConf): string {
  return chain.code;
}

function _ckToken(token: TestChainToken): string {
  return `${token._chain}__${token.symbol}`;
}

function _ckCouple(couple: TestChainCouple): string {
  return `${couple._chain}__${couple.chain.code}__${couple.symbol.from}_${couple.symbol.to}`;
}

class HelixConfContractInitializer {

  private _oc: Onlinechain = new Onlinechain();

  get oc(): Onlinechain {
    return this._oc;
  }

  async init(): Promise<HelixContractOnlineData> {
    const chains = TestSource.chains();

    const multicalls: Multicaller[] = [];
    for (const chain of chains) {
      const oci = await this.oc.onlinechain(chain);
      const contract = chain.contract;
      const contractProxyAdmin = new ProxyAdmin(contract["proxy-admin"], oci);
      multicalls.push({
        type: 'contract-proxy-admin-owner',
        call: contractProxyAdmin.owner(),
        chain,
      });

      await this._initTokens(multicalls, oci, chain);
      await this._initCouples(multicalls, oci, chain);

    }

    const callrets = await Promise.all(multicalls.map(item => item.call));
    for (let i = multicalls.length; i-- > 0;) {
      multicalls[i].result = callrets[i];
    }

    const _cProxyAdminOwner: Record<string, string> = {};
    const _cTokenDecimals: Record<string, bigint> = {};
    const _cProtocolMessager: Record<string, MessagerService> = {};
    const _cProtocolDao: Record<string, string> = {};
    const _cProtocolRegistered: Record<string, TokenRegisteredInfo> = {};
    const _cMessagerRemoteMessager: Record<string, RemoteMessager> = {};
    const _cMessagerRemoteAppsender: Record<string, string> = {};
    const _cMessagerRemoteAppreceiver: Record<string, string> = {};

    for (const mc of multicalls) {
      const result = mc.result;
      if (result === undefined) continue;
      const {chain, token, couple} = mc;

      let ckChain = _ckChain(chain);
      let ckToken = token ? _ckToken(token) : null;
      let ckCouple = couple ? _ckCouple(couple) : null;
      switch (mc.type) {
        case "contract-proxy-admin-owner":
          _cProxyAdminOwner[ckChain] = result;
          break;
        case "contract-erc20-decimals":
          _cTokenDecimals[ckToken!] = BigInt(result);
          break;
        case "contract-protocol-messager":
          _cProtocolMessager[ckCouple!] = result;
          break;
        case "contract-protocol-dao":
          _cProtocolDao[ckCouple!] = result;
          break;
        case "contract-protocol-token-registered":
          _cProtocolRegistered[ckCouple!] = result;
          break;
        case "contract-messager-remote-messager":
          _cMessagerRemoteMessager[ckCouple!] = result;
          break;
        case "contract-messager-remote-appsender":
          _cMessagerRemoteAppsender[ckCouple!] = result;
          break;
        case "contract-messager-remote-appreceiver":
          _cMessagerRemoteAppreceiver[ckCouple!] = result;
          break;
      }
    }

    return {
      proxyAdminOwner: _cProxyAdminOwner,
      tokenDecimals: _cTokenDecimals,
      protocolMessager: _cProtocolMessager,
      protocolDao: _cProtocolDao,
      protocolRegistered: _cProtocolRegistered,
      messagerRemoteMessager: _cMessagerRemoteMessager,
      messagerRemoteAppsender: _cMessagerRemoteAppsender,
      messagerRemoteAppreceiver: _cMessagerRemoteAppreceiver,
    };
  }

  async _initTokens(multicalls: Multicaller[], oci: OnlineChainInfo, chain: HelixChainConf) {
    const tokens = TestSource.tokens({chains: [chain.code]});
    for (const token of tokens) {
      if (token.type === 'native') continue;
      const contractErc20 = new Erc20(token.address, oci);
      multicalls.push({
        type: 'contract-erc20-decimals',
        call: contractErc20.decimals(),
        chain,
        token,
      });
    }
  }

  async _initCouples(multicalls: Multicaller[], oci: OnlineChainInfo, chain: HelixChainConf) {
    const couples = TestSource.couples({chains: [chain.code]});
    for (const couple of couples) {
      const {protocol} = couple;
      const toci = await this.oc.onlinechain(HelixChain.get(couple.chain.code)!);

      const contractProtocol: LnBridgeContract = this._prepareProtocolContract(oci, protocol);
      const contractMessager: Messager = this._prepareMessagerContract(oci, couple.messager);

      const tokenFrom = oci.chain.token(couple.symbol.from)!;
      const tokenTo = toci.chain.token(couple.symbol.to)!;
      multicalls.push(...[
        {
          type: 'contract-protocol-messager' as MulticallType,
          call: contractProtocol.messager(toci.chain.id),
          chain,
          couple,
        },
        {
          type: 'contract-protocol-dao' as MulticallType,
          call: contractProtocol.dao(),
          chain,
          couple,
        },
        {
          type: 'contract-protocol-token-registered' as MulticallType,
          call: contractProtocol.tokenRegistered(toci.chain.id, tokenFrom.address, tokenTo.address),
          chain,
          couple,
        },
        {
          type: 'contract-messager-remote-messager' as MulticallType,
          call: contractMessager.remoteMessager(toci.chain),
          chain,
          couple,
        },
        {
          type: 'contract-messager-remote-appsender' as MulticallType,
          call: contractMessager.remoteAppSender(toci.chain, protocol.address),
          chain,
          couple,
        },
        {
          type: 'contract-messager-remote-appreceiver' as MulticallType,
          call: contractMessager.remoteAppReceiver(toci.chain, protocol.address),
          chain,
          couple,
        },
      ]);
    }
  }

  _prepareMessagerContract(oci: OnlineChainInfo, cm: ChainMessager): Messager {
    switch (cm.name) {
      case "eth2arb-receive":
        return new Eth2ArbReceiveService(cm.address!, oci);
      case "eth2arb-send":
        return new Eth2ArbSendService(cm.address!, oci);
      case "msgline":
        return new DarwiniaMsglineMessager(cm.address!, oci);
      case "layerzero":
        return new LayerZeroMessager(cm.address!, oci);
      default:
        throw new Error(`unknown protocol: ${cm.name}`);
    }
  }

  _prepareProtocolContract(oci: OnlineChainInfo, protocol: HelixProtocol): LnBridgeContract {
    switch (protocol.name) {
      case "lnv2-default":
        return new LnDefaultBridgeContract(protocol.address, oci);
      case "lnv2-opposite":
        return new LnOppositeBridgeContract(protocol.address, oci);
      case "lnv3":
        return new Lnv3BridgeContract(protocol.address, oci);
      default:
        throw new Error(`unknown protocol: ${protocol.name}`);
    }
  }
}


class HelixConfTestBase {
  private readonly initializer: HelixConfContractInitializer;

  private _lock: boolean = false;
  private _hcod: HelixContractOnlineData | undefined = undefined;

  constructor() {
    this.initializer = new HelixConfContractInitializer();
  }

  get oc(): Onlinechain {
    return this.initializer.oc;
  }

  private async hcod(): Promise<HelixContractOnlineData> {
    if (this._hcod) return this._hcod;

    let times = 0;
    while (this._lock) {
      times += 1;
      if (times > 20)
        throw new Error('many times to try init helixocnf contract data');
      await setTimeout(300);
    }

    this._lock = true;
    this._hcod = await this.initializer.init();
    this._lock = false;
    return this._hcod;
  }

  async targetCouple(couple: TestChainCouple): Promise<TestChainCouple | undefined> {
    const toci = await this.oc.onlinechain(HelixChain.get(couple.chain.code)!);
    const filterCoupleOptions: CoupleFilter = {
      chain: couple._chain,
      symbolFrom: couple.symbol.to,
      symbolTo: couple.symbol.from,
    };
    if (couple.protocol.name === 'lnv2-opposite' || couple.protocol.name === 'lnv2-default') {
      filterCoupleOptions.relatedProtocol = couple.protocol.name;
    } else {
      filterCoupleOptions.protocol = couple.protocol.name;
    }
    const targetCouples = toci.chain.filterCouples(filterCoupleOptions);
    if (targetCouples.length !== 1)
      throw new Error(`couples size ${targetCouples.length} invalid [${toci.chain.code}>${couple._chain}] [${couple.symbol.to}>${couple.symbol.from}]`);
    const targetCouple = targetCouples[0];
    return {
      _chain: toci.chain.code,
      ...targetCouple,
    }
  }

  async proxyAdminOwner(chain: HelixChainConf): Promise<string | undefined> {
    return (await this.hcod()).proxyAdminOwner[_ckChain(chain)];
  }

  async erc20Decimals(token: TestChainToken): Promise<bigint | undefined> {
    return (await this.hcod()).tokenDecimals[_ckToken(token)];
  }

  async protocolDao(couple: TestChainCouple): Promise<string | undefined> {
    return (await this.hcod()).protocolDao[_ckCouple(couple)];
  }

  async protocolMessager(couple: TestChainCouple): Promise<MessagerService | undefined> {
    return (await this.hcod()).protocolMessager[_ckCouple(couple)];
  }

  async messagerRemoteMessager(couple: TestChainCouple): Promise<RemoteMessager | undefined> {
    return (await this.hcod()).messagerRemoteMessager[_ckCouple(couple)];
  }

  async messagerRemoteAppsender(couple: TestChainCouple): Promise<string | undefined> {
    return (await this.hcod()).messagerRemoteAppsender[_ckCouple(couple)];
  }

  async messagerRemoteAppreceiver(couple: TestChainCouple): Promise<string | undefined> {
    return (await this.hcod()).messagerRemoteAppreceiver[_ckCouple(couple)];
  }

  async protocolTokenRegistered(couple: TestChainCouple): Promise<TokenRegisteredInfo | undefined> {
    return (await this.hcod()).protocolRegistered[_ckCouple(couple)];
  }

}

export default new HelixConfTestBase();
