import {
  LnAccessController,
  Eth2ArbSendServiceContract,
  Eth2ArbReceiveServiceContract,
  LayerZeroMessagerContract,
  DarwiniaMsglineMessagerContract, CSigner,
} from "./contracts";
import {HelixChainConf} from "../../src";

export abstract class Messager {
  public name: string;
  public lnAccessController: LnAccessController;

  constructor(name: string, messagerContract: LnAccessController) {
    this.name = name;
    this.lnAccessController = messagerContract;
  }

  address(): string {
    return this.lnAccessController.address.toLowerCase();
  }

  async dao(): Promise<string> {
    return await this.lnAccessController.dao()
  }

  async operator(): Promise<string> {
    return await this.lnAccessController.operator();
  }

  abstract isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean>;

  abstract remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean>;

  abstract remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean>;
}

export class Eth2ArbSendService extends Messager {
  public contract: Eth2ArbSendServiceContract;

  constructor(address: string, signer: CSigner) {
    const contract = new Eth2ArbSendServiceContract(address, signer);
    super("arbitrumL1ToL2", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    return remoteMessager.toLowerCase() === await this.contract.remoteMessager();
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.appPair(localApp);
  }
}

export class Eth2ArbReceiveService extends Messager {
  public contract: Eth2ArbReceiveServiceContract;

  constructor(address: string, signer: CSigner) {
    const contract = new Eth2ArbReceiveServiceContract(address, signer);
    super("arbitrumL1ToL2", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    const remoteAddress = await this.contract.remoteMessager();
    return remoteAddress === remoteMessager;
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.appPair(localApp);
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }
}

export class LayerZeroMessager extends Messager {
  public contract: LayerZeroMessagerContract;
  private _onlineAppSenderMap: Record<string, string> = {};
  private _onlineAppRecverMap: Record<string, string> = {};

  constructor(address: string, signer: CSigner) {
    const contract = new LayerZeroMessagerContract(address, signer);
    super("layerzero", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    const remote = await this.contract.remoteMessager(remoteChain.id);
    return remote.messager.toLowerCase() === remoteMessager.toLowerCase()
      && BigInt(remote.lzRemoteChainId) === remoteChain.lzid;
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `s-${remoteChain.lzid}-${localApp}`;
    if (!this._onlineAppSenderMap[key]) {
        this._onlineAppSenderMap[key] = await this.contract.remoteAppSender(remoteChain.lzid!, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppSenderMap[key];
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    const key = `r-${remoteChain.lzid}-${localApp}`;
    if (!this._onlineAppRecverMap[key]) {
        this._onlineAppRecverMap[key] = await this.contract.remoteAppReceiver(remoteChain.lzid!, localApp);
    }
    return remoteApp.toLowerCase() === this._onlineAppRecverMap[key];
  }
}

export class DarwiniaMsglineMessager extends Messager {
  public contract: DarwiniaMsglineMessagerContract;

  constructor(address: string, signer: CSigner) {
    const contract = new DarwiniaMsglineMessagerContract(address, signer);
    super("msgline", contract);
    this.contract = contract;
  }

  async isConnected(remoteChain: HelixChainConf, remoteMessager: string): Promise<boolean> {
    const remote = await this.contract.remoteMessager(remoteChain.id);
    return remote.messager.toLowerCase() === remoteMessager.toLowerCase();
  }

  async remoteAppIsSender(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppSender(remoteChain.id, localApp);
  }

  async remoteAppIsReceiver(remoteChain: HelixChainConf, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppReceiver(remoteChain.id, localApp);
  }
}
