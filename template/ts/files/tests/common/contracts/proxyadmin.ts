import {OnlineChainInfo} from "../onlinechain";
import {_outputError, abiProxyAdmin, EthereumContract} from "./base";


export class ProxyAdmin extends EthereumContract {
  constructor(address: string, oci: OnlineChainInfo,) {
    super(address, abiProxyAdmin, oci);
  }

  async owner(): Promise<string> {
    return await this.contract['owner']().catch(e => _outputError(this.oci, this.address, e));
  }

  async getProxyAdmin(proxy: string): Promise<string> {
    return await this.contract['getProxyAdmin'](proxy).catch(e => _outputError(this.oci, this.address, e));
  }
}

