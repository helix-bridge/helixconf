import {OnlineChainInfo} from "../onlinechain";
import {Contract, ContractRunner, ethers, Interface, InterfaceAbi} from "ethers";


export const abiDarwiniaMsgLine = require('../../abis/abiDarwiniaMsgLine.json');
export const abiEth2ArbReceiveService = require('../../abis/abiEth2ArbReceiveService.json');
export const abiEth2ArbSendService = require('../../abis/abiEth2ArbSendService.json');
export const abiErc20 = require('../../abis/erc20.json');
export const abiLayerZeroMessager = require('../../abis/layerZeroMessager.json');
export const abiLnAccessController = require('../../abis/lnAccessController.json');
export const abiLnDefaultBridge = require('../../abis/lnDefaultBridge.json');
export const abiLnOppositeBridge = require('../../abis/lnOppositeBridge.json');
export const abiLnv3Bridge = require('../../abis/lnv3Bridge.json');
export const abiProxyAdmin = require('../../abis/proxyAdmin.json');

export type CAbi = Interface | InterfaceAbi;
export type CSigner = ContractRunner | ethers.JsonRpcProvider;


export function _outputError(oci: OnlineChainInfo, address: string, e: any) {
  console.error(`[${oci.chain.code}] [${address}]`, e);
}


export class EthereumContract {
  protected contract: Contract;
  public address: string;
  public oci: OnlineChainInfo;

  constructor(
    address: string,
    abi: CAbi,
    oci: OnlineChainInfo,
  ) {
    this.oci = oci;
    this.contract = new Contract(address, abi, oci.provider);
    this.address = address;
  }
}

