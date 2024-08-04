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

  abstract remoteAppIsSender(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean>;

  abstract remoteAppIsReceiver(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean>;
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

  async remoteAppIsSender(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }

  async remoteAppIsReceiver(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
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

  async remoteAppIsSender(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.appPair(localApp);
  }

  async remoteAppIsReceiver(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return false;
  }
}

export class LayerZeroMessager extends Messager {
  public contract: LayerZeroMessagerContract;

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

  async remoteAppIsSender(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppSender(remoteChainId, localApp);
  }

  async remoteAppIsReceiver(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppReceiver(remoteChainId, localApp);
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

  async remoteAppIsSender(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppSender(remoteChainId, localApp);
  }

  async remoteAppIsReceiver(remoteChainId: bigint, localApp: string, remoteApp: string): Promise<boolean> {
    return remoteApp.toLowerCase() === await this.contract.remoteAppReceiver(remoteChainId, localApp);
  }
}
