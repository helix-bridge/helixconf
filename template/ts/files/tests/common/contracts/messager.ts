import {LnAccessController} from "./protocol";
import {OnlineChainInfo} from "../onlinechain";
import {abiDarwiniaMsgLine, abiEth2ArbReceiveService, abiEth2ArbSendService, abiLayerZeroMessager, CAbi} from "./base";

import {ethers,} from "ethers";
import {HelixChainConf} from "../../../src";


interface LzRemoteMessager {
  lzRemoteChainId: number;
  messager: string;
}

interface MsglineRemoteMessager {
  msglineRemoteChainId: number;
  messager: string;
}


export interface RemoteMessager {
  remoteChainId?: number
  messager: string
}

// ============================= contract

export abstract class Messager extends LnAccessController {

  constructor(address: string, abi: CAbi, oci: OnlineChainInfo) {
    super(address, abi, oci);
  }

  abstract remoteMessager(remoteChain: HelixChainConf): Promise<RemoteMessager>;

  abstract remoteAppSender(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined>;

  abstract remoteAppReceiver(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined>;
}

export class Eth2ArbSendService extends Messager {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiEth2ArbSendService, oci);
  }

  async remoteMessager(remoteChain: HelixChainConf): Promise<RemoteMessager> {
    const messager = await this.contract['remoteMessager']().catch(e => console.error(e));
    return {
      messager: messager.toLowerCase(),
    };
  }

  async appPair(localApp: string): Promise<string> {
    const pair = await this.contract['appPairs'](localApp).catch(e => console.error(e));
    return pair.toLowerCase();
  }

  remoteAppReceiver(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  remoteAppSender(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

}

export class Eth2ArbReceiveService extends Messager {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiEth2ArbReceiveService, oci);
  }

  async remoteMessagerAlias(): Promise<string> {
    const alias = await this.contract['remoteMessagerAlias']().catch(e => console.error(e));
    return alias.toLowerCase();
  }

  async remoteMessager(remoteChain: HelixChainConf): Promise<RemoteMessager> {
    const remoteAlias = await this.remoteMessagerAlias();
    const remoteAddress = BigInt(remoteAlias) - BigInt('0x1111000000000000000000000000000000001111');
    return {
      messager: remoteAddress.toString(16),
    };
  }

  async appPair(localApp: string): Promise<string> {
    const pair = await this.contract['appPairs'](localApp).catch(e => console.error(e));
    return pair.toLowerCase();
  }

  remoteAppReceiver(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  remoteAppSender(remoteChain: HelixChainConf, localApp: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

}


export class LayerZeroMessager extends Messager {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiLayerZeroMessager, oci);
  }

  async remoteMessager(remoteChain: HelixChainConf): Promise<RemoteMessager> {
    const lrm: LzRemoteMessager = await this.contract['remoteMessagers'](remoteChain.id).catch(e => console.error(e));
    return {
      remoteChainId: lrm.lzRemoteChainId,
      messager: lrm.messager,
    };
  }

  async remoteAppReceiver(remoteChain: HelixChainConf, localApp: string): Promise<string> {
    const hash = ethers.solidityPackedKeccak256([
      "uint16",
      "address",
    ], [remoteChain.lzid!, localApp]);

    const receiver = await this.contract['remoteAppReceivers'](hash).catch(e => console.error(e));
    return receiver.toLowerCase();
  }

  async remoteAppSender(remoteChain: HelixChainConf, localApp: string): Promise<string> {
    const hash = ethers.solidityPackedKeccak256([
      "uint16",
      "address",
    ], [remoteChain.lzid!, localApp]);

    const sender = await this.contract['remoteAppSenders'](hash).catch(e => console.error(e));
    return sender.toLowerCase();
  }
}


export class DarwiniaMsglineMessager extends Messager {
  constructor(address: string, oci: OnlineChainInfo) {
    super(address, abiDarwiniaMsgLine, oci);
  }

  async remoteMessager(remoteChain: HelixChainConf): Promise<RemoteMessager> {
    const mrm: MsglineRemoteMessager = await this.contract['remoteMessagers'](remoteChain.id).catch(e => console.error(e));
    return {
      remoteChainId: mrm.msglineRemoteChainId,
      messager: mrm.messager,
    };
  }

  async remoteAppReceiver(remoteChain: HelixChainConf, localApp: string): Promise<string> {
    const hash = ethers.solidityPackedKeccak256([
      "uint256",
      "address",
    ], [remoteChain.id, localApp]);

    const receiver = await this.contract['remoteAppReceivers'](hash).catch(e => console.error(e));
    return receiver.toLowerCase();
  }

  async remoteAppSender(remoteChain: HelixChainConf, localApp: string): Promise<string> {
    const hash = ethers.solidityPackedKeccak256([
      "uint256",
      "address",
    ], [remoteChain.id, localApp]);

    const sender = await this.contract['remoteAppSenders'](hash).catch(e => console.error(e));
    return sender.toLowerCase();
  }
}
