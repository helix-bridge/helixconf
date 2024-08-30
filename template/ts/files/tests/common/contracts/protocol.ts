import {abiLnDefaultBridge, abiLnOppositeBridge, abiLnv3Bridge, CAbi, EthereumContract,} from "./base";
import {OnlineChainInfo} from "../onlinechain";
import {ethers,} from "ethers";

export interface MessagerService {
  sendService: string;
  receiveService: string;
}

export interface TokenRegisteredInfo {
  sourceDecimals: bigint
  targetDecimals: bigint
  protocolFee: bigint
  buildTokenKey: string
  indexToTokenKey: string
}


export interface Lnv3TokenConfigure {
  protocolFee: bigint;
  penalty: number;
  sourceDecimals: bigint;
  targetDecimals: bigint;
}

export interface Lnv3TokenInfo {
  config: Lnv3TokenConfigure;
  index: number;
  sourceToken: string;
  targetToken: string;
  protocolFeeIncome: number;
}


export class LnAccessController extends EthereumContract {
  constructor(address: string, abi: CAbi, oci: OnlineChainInfo) {
    super(address, abi, oci);
  }

  async dao(): Promise<string> {
    return await this.contract['dao']().catch(e => console.error(e));
  }

  async operator(): Promise<string> {
    return await this.contract['operator']().catch(e => console.error(e));
  }

  async callerWhiteList(sender: string): Promise<boolean> {
    return await this.contract['callerWhiteList'](sender).catch(e => console.error(e));
  }
}

export abstract class LnBridgeContract extends LnAccessController {
  constructor(address: string, abi: CAbi, oci: OnlineChainInfo) {
    super(address, abi, oci);
  }

  async paused(): Promise<boolean> {
    return await this.contract['paused']().catch(e => console.error(e));
  }

  abstract messager(remoteChainId: bigint): Promise<MessagerService>;

  abstract tokenRegistered(
    remoteChainId: bigint,
    srcToken: string,
    dstToken: string,
  ): Promise<TokenRegisteredInfo | undefined>;
}

export class LnDefaultBridgeContract extends LnBridgeContract {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiLnDefaultBridge, oci);
  }

  async messager(remoteChainId: bigint): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId).catch(e => console.error(e));
  }

  async tokenRegistered(
    remoteChainId: bigint,
    srcToken: string,
    dstToken: string,
  ): Promise<TokenRegisteredInfo | undefined> {
    // TODO
    return undefined;
  }
}


export class LnOppositeBridgeContract extends LnBridgeContract {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiLnOppositeBridge, oci);
  }

  async messager(remoteChainId: bigint): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId).catch(e => console.error(e));
  }

  async tokenRegistered(
    remoteChainId: bigint,
    srcToken: string,
    dstToken: string,
  ): Promise<TokenRegisteredInfo | undefined> {
    // TODO
    return undefined;
  }
}


export class Lnv3BridgeContract extends LnBridgeContract {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiLnv3Bridge, oci);
  }

  private tokenKey(remoteChainId: bigint, sourceToken: string, targetToken: string): string {
    return ethers.solidityPackedKeccak256([
      "uint256",
      "address",
      "address",
    ], [remoteChainId, sourceToken, targetToken]);
  }

  async messager(remoteChainId: bigint): Promise<MessagerService> {
    return await this.contract['messagers'](remoteChainId).catch(e => console.error(e));
  }

  async tokenRegistered(
    remoteChainId: bigint,
    srcToken: string,
    dstToken: string,
  ): Promise<TokenRegisteredInfo | undefined> {
    const tokenInfo = await this.tokenInfo(remoteChainId, srcToken, dstToken);
    const tokenKey = this.tokenKey(remoteChainId, srcToken, dstToken);
    const indexToTokenKey = await this.indexToTokenKey(tokenInfo.index);
    return {
      sourceDecimals: tokenInfo.config.sourceDecimals,
      targetDecimals: tokenInfo.config.targetDecimals,
      protocolFee: tokenInfo.config.protocolFee,
      buildTokenKey: tokenKey.toLowerCase(),
      indexToTokenKey: indexToTokenKey.toLowerCase(),
    };
  }

  async tokenInfo(remoteChainId: bigint, sourceToken: string, targetToken: string): Promise<Lnv3TokenInfo> {
    const encode = this.tokenKey(remoteChainId, sourceToken, targetToken);
    return await this.contract['tokenInfos'](encode).catch(e => console.error(e));
  }

  async indexToTokenKey(index: number): Promise<string> {
    return await this.contract['tokenIndexer'](index).catch(e => console.error(e));
  }
}

