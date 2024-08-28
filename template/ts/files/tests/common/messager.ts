import {
  CSigner,
  DarwiniaMsglineMessagerContract,
  Eth2ArbReceiveServiceContract,
  Eth2ArbSendServiceContract,
  LayerZeroMessagerContract,
  LnAccessController,
  RemoteMessager,
} from "./contracts";
import {HelixChainConf} from "../../src";

export abstract class Messager {
  public name: string;
  public lnAccessController: LnAccessController;

  private _daoOnChain?: string;
  private _operatorOnChain?: string;

  constructor(name: string, messagerContract: LnAccessController) {
    this.name = name;
    this.lnAccessController = messagerContract;
  }

  address(): string {
    return this.lnAccessController.address.toLowerCase();
  }

  async dao(): Promise<string> {
    this._daoOnChain ||= await this.lnAccessController.dao();
    return this._daoOnChain;
  }

  async operator(): Promise<string> {
    this._operatorOnChain ||= await this.lnAccessController.operator();
    return this._operatorOnChain;
  }

  abstract isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean>;

  abstract remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean>;

  abstract remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean>;
}

export class Eth2ArbSendService extends Messager {
  public contract: Eth2ArbSendServiceContract;

  private _messagerAddress?: string;
  private _onlineAppRecverMap: Record<string, string> = {};

  constructor(address: string, signer: CSigner) {
    const contract = new Eth2ArbSendServiceContract(address, signer);
    super("arbitrumL1ToL2", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    this._messagerAddress ||= await this.contract.remoteMessager();
    return remoteMessager.toLowerCase() === this._messagerAddress;
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `r-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppRecverMap[key]) {
      this._onlineAppRecverMap[key] = await this.contract.appPair(localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppRecverMap[key];
  }
}

export class Eth2ArbReceiveService extends Messager {
  public contract: Eth2ArbReceiveServiceContract;

  private _messagerAddress?: string;
  private _onlineAppSenderMap: Record<string, string> = {};

  constructor(address: string, signer: CSigner) {
    const contract = new Eth2ArbReceiveServiceContract(address, signer);
    super("arbitrumL1ToL2", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    this._messagerAddress ||= await this.contract.remoteMessager();
    return remoteMessager.toLowerCase() === this._messagerAddress;
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `s-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppSenderMap[key]) {
      this._onlineAppSenderMap[key] = await this.contract.appPair(localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppSenderMap[key];
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }
}

export class LayerZeroMessager extends Messager {
  public contract: LayerZeroMessagerContract;

  private _messagerMap: Record<string, RemoteMessager> = {};
  private _onlineAppSenderMap: Record<string, string> = {};
  private _onlineAppRecverMap: Record<string, string> = {};

  constructor(address: string, signer: CSigner) {
    const contract = new LayerZeroMessagerContract(address, signer);
    super("layerzero", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    const key = `m-${remoteChain.code}`;
    if (!this._messagerMap[key]) {
      this._messagerMap[key] = await this.contract.remoteMessager(remoteChain.id);
    }
    const remote = this._messagerMap[key];
    return remote.messager.toLowerCase() === remoteMessager.toLowerCase()
      && BigInt(remote.lzRemoteChainId) === remoteChain.lzid;
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `s-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppSenderMap[key]) {
      this._onlineAppSenderMap[key] = await this.contract.remoteAppSender(remoteChain.lzid!, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppSenderMap[key];
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `r-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppRecverMap[key]) {
      this._onlineAppRecverMap[key] = await this.contract.remoteAppReceiver(remoteChain.lzid!, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppRecverMap[key];
  }
}

export class DarwiniaMsglineMessager extends Messager {
  public contract: DarwiniaMsglineMessagerContract;

  private _messagerMap: Record<string, string> = {};
  private _onlineAppSenderMap: Record<string, string> = {};
  private _onlineAppRecverMap: Record<string, string> = {};

  constructor(address: string, signer: CSigner) {
    const contract = new DarwiniaMsglineMessagerContract(address, signer);
    super("msgline", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    const key = `m-${remoteChain.code}`;
    if (!this._messagerMap[key]) {
      const remote = await this.contract.remoteMessager(remoteChain.id);
      this._messagerMap[key] = remote.messager.toLowerCase();
    }
    return this._messagerMap[key] === remoteMessager.toLowerCase();
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `s-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppSenderMap[key]) {
      this._onlineAppSenderMap[key] = await this.contract.remoteAppSender(remoteChain.id, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppSenderMap[key];
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `r-${remoteChain.code}-${localApp}`;
    if (!this._onlineAppRecverMap[key]) {
      this._onlineAppRecverMap[key] = await this.contract.remoteAppReceiver(remoteChain.id, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppRecverMap[key];
  }
}
