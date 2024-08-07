import {
  CSigner, LayerZeroMessagerContract,
  LnBridgeContract,
  LnDefaultBridgeContract,
  LnOppositeBridgeContract,
  Lnv3BridgeContract, MessagerService, TokenRegisteredInfo
} from "./contracts";
import {ChainToken, HelixChainConf, HelixProtocol} from "../../src";
import {Messager} from "./messager";


export class BridgeProtocol {

  public _daoOnChain?: string;
  public _operatorOnChain?: string;

  private readonly bridgeContract: LnBridgeContract;

  constructor(
    protocol: HelixProtocol,
    signer: CSigner
  ) {
    switch (protocol.name) {
      case "lnv2-default":
        this.bridgeContract = new LnDefaultBridgeContract(protocol.address, signer);
        break
      case "lnv2-opposite":
        this.bridgeContract = new LnOppositeBridgeContract(protocol.address, signer);
        break
      case "lnv3":
        this.bridgeContract = new Lnv3BridgeContract(protocol.address, signer);
        break
    }
  }

  get address(): string {
    return this.bridgeContract.address;
  }

  messager(remoteChainId: bigint): Promise<MessagerService> {
    return this.bridgeContract.messager(remoteChainId);
  }

  async dao(): Promise<string> {
    this._daoOnChain ||= await this.bridgeContract.dao();
    return this._daoOnChain;
  }

  async operator(): Promise<string> {
    this._operatorOnChain ||= await this.bridgeContract.operator();
    return this._operatorOnChain;
  }

  async tokenRegistered(
    tokenFrom: ChainToken,
    tokenTo: ChainToken,
    targetChain: HelixChainConf
  ): Promise<TokenRegisteredInfo | undefined> {
    return await this.bridgeContract.tokenRegistered(
      targetChain.id,
      tokenFrom.address,
      tokenTo.address,
    );
  }

}

export interface BridgeOptions {
  sourceChain: HelixChainConf
  targetChain: HelixChainConf
  sourceBridgeProtocol: BridgeProtocol
  targetBridgeProtocol: BridgeProtocol
  sourceMessager: Messager
  targetMessager: Messager
  sourceProtocol: HelixProtocol
  targetProtocol: HelixProtocol
}

export class Bridge {
  constructor(
    private readonly options: BridgeOptions,
  ) {
  }

  get sourceChain(): HelixChainConf {
    return this.options.sourceChain
  }

  get targetChain(): HelixChainConf {
    return this.options.targetChain
  }

  get sourceBridgeProtocol(): BridgeProtocol {
    return this.options.sourceBridgeProtocol
  }

  get targetBridgeProtocol(): BridgeProtocol {
    return this.options.targetBridgeProtocol
  }

  get sourceMessager(): Messager {
    return this.options.sourceMessager
  }

  get targetMessager(): Messager {
    return this.options.targetMessager
  }

  get sourceProtocol(): HelixProtocol {
    return this.options.sourceProtocol
  }

  get targetProtocol(): HelixProtocol {
    return this.options.targetProtocol
  }

  async getSourceMessagerFromChain(): Promise<string> {
    const messager = await this.sourceBridgeProtocol.messager(this.targetChain.id);
    return this.sourceProtocol.name === 'lnv2-default'
      ? messager.sendService
      : messager.receiveService;
  }

  // async getTargetMessagerFromChain(): Promise<string> {
  //   const messager = await this.targetBridgeProtocol.messager(this.sourceChain.id);
  //   return this.targetProtocol.name === 'lnv2-default'
  //     ? messager.receiveService
  //     : messager.sendService;
  // }

  async isSourceConnectedTarget(): Promise<boolean> {
    return await this.sourceMessager.isConnected(this.targetChain, this.targetMessager.address());
  }

  async isSourceAppConnectedTarget(): Promise<boolean> {
    if (this.sourceProtocol.name === 'lnv3') {
        return await this.sourceMessager.remoteAppIsReceiver(
            this.targetChain,
            this.sourceBridgeProtocol.address,
            this.targetBridgeProtocol.address
        ) && await this.sourceMessager.remoteAppIsSender(
            this.targetChain,
            this.sourceBridgeProtocol.address,
            this.targetBridgeProtocol.address
        );
    } else if (this.sourceProtocol.name === 'lnv2-default') {
        return await this.sourceMessager.remoteAppIsReceiver(
            this.targetChain,
            this.sourceBridgeProtocol.address,
            this.targetBridgeProtocol.address
        );
    } else {
        return await this.sourceMessager.remoteAppIsSender(
            this.targetChain,
            this.sourceBridgeProtocol.address,
            this.targetBridgeProtocol.address
        );
    }
  }
}