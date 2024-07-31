
import {
  Wallet,
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

export class EthereumContract {
  protected contract: Contract;
  public address: string;
  constructor(
    address: string,
    abi: Interface | InterfaceAbi,
    signer: ContractRunner
  ) {
    this.contract = new Contract(address, abi, signer);
    this.address = address;
  }
}

export class ProxyAdmin extends EthereumContract {
  constructor(address: string, signer: ContractRunner) {
    super(address, abiProxyAdmin, signer);
  }

  async owner(): Promise<string> {
    return await this.contract.owner();
  }

  async getProxyAdmin(proxy: string): Promise<string> {
    return await this.contract.getProxyAdmin(proxy);
  }
}

