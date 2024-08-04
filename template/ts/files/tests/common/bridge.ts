import {
  CSigner, LayerZeroMessagerContract,
  LnBridgeContract,
  LnDefaultBridgeContract,
  LnOppositeBridgeContract,
  Lnv3BridgeContract
} from "./contracts";
import {ChainToken, HelixChainConf, HelixProtocol} from "../../src";
import {Messager} from "./messager";


export class BridgeEndpoint {

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

  async dao(): Promise<string> {
    return await this.bridgeContract.dao();
  }

  async operator(): Promise<string> {
    return await this.bridgeContract.operator();
  }

  async isTokenRegistered(
    tokenFrom: ChainToken,
    tokenTo: ChainToken,
    targetChain: HelixChainConf
  ): Promise<boolean> {
    return await this.bridgeContract.tokenRegistered(
      targetChain.id,
      tokenFrom.address,
      tokenTo.address,
      tokenFrom.decimals,
      tokenTo.decimals,
    );
  }

}

export class Bridge {
  constructor(
    private readonly sourceChain: HelixChainConf,
    private readonly targetChain: HelixChainConf,
    private readonly sourceBridgeEndpoint: BridgeEndpoint,
    private readonly targetBridgeEndpoint: BridgeEndpoint,
    private readonly sourceMessager: Messager,
    private readonly targetMessager: Messager,
    private readonly protocol: HelixProtocol,
  ) {
  }

  async isSourceConnectedTarget(): Promise<boolean> {
    return await this.sourceMessager.isConnected(this.targetChain, this.targetMessager.address());
  }

  async isTargetConnectedSource(): Promise<boolean> {
    return await this.targetMessager.isConnected(this.sourceChain, this.sourceMessager.address());
  }

  async isSourceAppConnectedTarget(): Promise<boolean> {
    return this.sourceMessager[
      this.protocol.name === 'lnv2-default'
        ? 'remoteAppIsReceiver'
        : 'remoteAppIsSender'
      ](
      this.targetChain.id,
      this.sourceBridgeEndpoint.address,
      this.targetBridgeEndpoint.address,
    );
  }

  async isTargetAppConnectedSource(): Promise<boolean> {
    return this.targetMessager[
      this.protocol.name === 'lnv2-default'
        ? 'remoteAppIsSender'
        : 'remoteAppIsReceiver'
      ](
      this.sourceChain.id,
      this.targetBridgeEndpoint.address,
      this.sourceBridgeEndpoint.address,
    )
  }
}
