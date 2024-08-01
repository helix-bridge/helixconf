
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

export type CSigner = ContractRunner | ethers.JsonRpcProvider;

export class EthereumContract {
  protected contract: Contract;
  public address: string;
  constructor(
    address: string,
    abi: Interface | InterfaceAbi,
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

