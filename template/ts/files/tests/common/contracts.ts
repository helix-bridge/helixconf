import {
  ethers,
  Contract,
  Interface , InterfaceAbi,
  ContractRunner,
} from "ethers";

const abiDarwiniaMsgLine = require('../abis/abiDarwiniaMsgLine.json');
const abiEth2ArbReceiveService = require('../abis/abiEth2ArbReceiveService.json');
const abiEth2ArbSendService = require('../abis/abiEth2ArbSendService.json');
const abiErc20 = require('../abis/erc20.json');
const abiLayerZeroMessager = require('../abis/layerZeroMessager.json');
const abiLnAccessController = require('../abis/lnAccessController.json');
const abiLnDefaultBridge = require('../abis/lnDefaultBridge.json');
const abiLnOppositeBridge = require('../abis/lnOppositeBridge.json');
const abiLnv3Bridge = require('../abis/lnv3Bridge.json');
const abiProxyAdmin = require('../abis/proxyAdmin.json');

export type CAbi = Interface | InterfaceAbi;
export type CSigner = ContractRunner | ethers.JsonRpcProvider;

export class EthereumContract {
  protected contract: Contract;
  public address: string;
  constructor(
    address: string,
    abi: CAbi,
    signer: CSigner
  ) {
    this.contract = new Contract(address, abi, signer);
    this.address = address;
  }
}

export class ProxyAdmin extends EthereumContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiProxyAdmin, signer);
  }

  async owner(): Promise<string> {
    return await this.contract['owner']();
  }

  async getProxyAdmin(proxy: string): Promise<string> {
    return await this.contract['getProxyAdmin'](proxy);
  }
}

export class Erc20 extends EthereumContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiErc20, signer);
  }

  // view
  async symbol(): Promise<string> {
    return await this.contract['symbol']();
  }

  async name(): Promise<string> {
    return await this.contract['name']();
  }

  async decimals(): Promise<number> {
    return await this.contract['decimals']();
  }

  async balanceOf(address: string): Promise<bigint> {
    return await this.contract['balanceOf'](address);
  }
}



export class LnAccessController extends EthereumContract {
  constructor(address: string, abi: CAbi, signer: CSigner) {
    super(address, abi, signer);
  }

  async dao(): Promise<string> {
    return await this.contract['dao']();
  }

  async operator(): Promise<string> {
    return await this.contract['operator']();
  }

  async callerWhiteList(sender: string): Promise<boolean> {
    return await this.contract['callerWhiteList'](sender);
  }
}

export class MessagerContract extends LnAccessController {
  private messagerType: string;
  constructor(address: string, abi: CAbi, signer: CSigner, messagerType: string) {
    super(address, abi, signer);
    this.messagerType = messagerType;
  }
}

export class Eth2ArbSendServiceContract extends MessagerContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiEth2ArbSendService, signer, "Eth2ArbSendService");
  }
  async remoteMessager(): Promise<string> {
    return (await this.contract['remoteMessager']()).toLowerCase();
  }
  async appPair(localApp: string): Promise<string> {
    return (await this.contract['appPairs'](localApp)).toLowerCase();
  }
}

export class Eth2ArbReceiveServiceContract extends MessagerContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiEth2ArbReceiveService, signer, "Eth2ArbReceiveService");
  }
  async remoteMessagerAlias(): Promise<string> {
    return (await this.contract['remoteMessagerAlias']()).toLowerCase();
  }

  async remoteMessager(): Promise<string> {
    const remoteAlias = await this.remoteMessagerAlias();
    const remoteAddress = BigInt(remoteAlias) - BigInt('0x1111000000000000000000000000000000001111');
    return remoteAddress.toString(16);
  }

  async appPair(localApp: string): Promise<string> {
    return (await this.contract['appPairs'](localApp)).toLowerCase();
  }
}

export interface RemoteMessager {
  lzRemoteChainId: number;
  messager: string;
}

export class LayerZeroMessagerContract extends MessagerContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiLayerZeroMessager, signer, "layerzero");
  }

  async remoteMessager(remoteChainId: bigint): Promise<RemoteMessager> {
    return await this.contract['remoteMessagers'](remoteChainId);
  }

  async remoteAppReceiver(remoteChainId: bigint, localApp: string): Promise<string> {
    const remoteMessager = await this.remoteMessager(remoteChainId);
    const hash = ethers.solidityPackedKeccak256([
      "uint16",
      "address",
    ], [remoteMessager.lzRemoteChainId, localApp]);

    return (await this.contract['remoteAppReceivers'](hash)).toLowerCase();
  }

  async remoteAppSender(remoteChainId: bigint, localApp: string): Promise<string> {
    const remoteMessager = await this.remoteMessager(remoteChainId);
    const hash = ethers.solidityPackedKeccak256([
      "uint16",
      "address",
    ], [remoteMessager.lzRemoteChainId, localApp]);

    return (await this.contract['remoteAppSenders'](hash)).toLowerCase();
  }
}

export interface MsglineRemoteMessager {
  msglineRemoteChainId: number;
  messager: string;
}

export class DarwiniaMsglineMessagerContract extends MessagerContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiDarwiniaMsgLine, signer, "msgline");
  }

  async remoteMessager(remoteChainId: bigint): Promise<MsglineRemoteMessager> {
    return await this.contract['remoteMessagers'](remoteChainId);
  }

  async remoteAppReceiver(remoteChainId: bigint, localApp: string): Promise<string> {
    const remoteMessager = await this.remoteMessager(remoteChainId);
    const hash = ethers.solidityPackedKeccak256([
      "uint256",
      "address",
    ], [remoteMessager.msglineRemoteChainId, localApp]);

    return (await this.contract['remoteAppReceivers'](hash)).toLowerCase();
  }

  async remoteAppSender(remoteChainId: bigint, localApp: string): Promise<string> {
    const remoteMessager = await this.remoteMessager(remoteChainId);
    const hash = ethers.solidityPackedKeccak256([
      "uint256",
      "address",
    ], [remoteMessager.msglineRemoteChainId, localApp]);

    return (await this.contract['remoteAppSenders'](hash)).toLowerCase();
  }
}

export interface MessagerService {
  sendService: string;
  receiveService: string;
}

export abstract class LnBridgeContract extends LnAccessController {
  constructor(address: string, abi: CAbi, signer: CSigner) {
    super(address, abi, signer);
  }

  async paused(): Promise<boolean> {
    return await this.contract['paused']();
  }

  abstract messager(remoteChainId: number): Promise<MessagerService>;
  abstract tokenRegistered(remoteChainId: number, srcToken: string, dstToken: string, srcDecimals: number, dstDecimals: number): Promise<boolean>;
}

export class LnDefaultBridgeContract extends LnBridgeContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiLnDefaultBridge, signer);
  }
  async messager(remoteChainId: number): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId);
  }
  async tokenRegistered(remoteChainId: number, srcToken: string, dstToken: string, srcDecimals: number, dstDecimals: number): Promise<boolean> {
    // TODO
    return true;
  }
}

export class LnOppositeBridgeContract extends LnBridgeContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiLnOppositeBridge, signer);
  }
  async messager(remoteChainId: number): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId);
  }
  async tokenRegistered(remoteChainId: number, srcToken: string, dstToken: string, srcDecimals: number, dstDecimals: number): Promise<boolean> {
    // TODO
    return true;
  }
}

export interface Lnv3TokenConfigure {
  protocolFee: number;
  penalty: number;
  sourceDecimals: number;
  targetDecimals: number;
}

export interface Lnv3TokenInfo {
  config: Lnv3TokenConfigure;
  index: number;
  sourceToken: string;
  targetToken: string;
  protocolFeeIncome: number;
}

export class Lnv3BridgeContract extends LnBridgeContract {
  constructor(address: string, signer: CSigner) {
    super(address, abiLnv3Bridge, signer);
  }
  private tokenKey(remoteChainId: number, sourceToken: string, targetToken: string): string {
    return ethers.solidityPackedKeccak256([
      "uint256",
      "address",
      "address",
    ], [remoteChainId, sourceToken, targetToken]);
  }
  async messager(remoteChainId: number): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId);
  }
  async tokenRegistered(remoteChainId: number, srcToken: string, dstToken: string, srcDecimals: number, dstDecimals: number): Promise<boolean> {
    const tokenInfo = await this.tokenInfo(remoteChainId, srcToken, dstToken);
    const tokenKey = this.tokenKey(remoteChainId, srcToken, dstToken);
    return tokenInfo.config.sourceDecimals === srcDecimals && tokenInfo.config.targetDecimals === dstDecimals && tokenKey === await this.indexToTokenKey(tokenInfo.index);
  }
  async tokenInfo(remoteChainId: number, sourceToken: string, targetToken: string): Promise<Lnv3TokenInfo> {
    const encode = this.tokenKey(remoteChainId, sourceToken, targetToken);
    return await this.contract['tokenInfos'](encode);
  }
  async indexToTokenKey(index: number): Promise<string> {
    return await this.contract['tokenIndexer'](index);
  }
}




