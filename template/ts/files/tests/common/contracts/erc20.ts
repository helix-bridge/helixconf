import {OnlineChainInfo} from "../onlinechain";
import {_outputError, abiErc20, EthereumContract} from "./base";


export class Erc20 extends EthereumContract {
  constructor(address: string, oci: OnlineChainInfo,) {
    super(address, abiErc20, oci);
  }

  // view
  async symbol(): Promise<string> {
    return await this.contract['symbol']().catch(e => _outputError(this.oci, this.address, e));
  }

  async name(): Promise<string> {
    return await this.contract['name']().catch(e => _outputError(this.oci, this.address, e));
  }

  async decimals(): Promise<number> {
    return await this.contract['decimals']().catch(e => _outputError(this.oci, this.address, e));
  }

  async balanceOf(address: string): Promise<bigint> {
    return await this.contract['balanceOf'](address).catch(e => _outputError(this.oci, this.address, e));
  }
}
