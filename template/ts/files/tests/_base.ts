import {Onlinechain} from "./common/onlinechain";
import {TestChainToken, TestSource} from "./common/testsource";
import {HelixChain, HelixChainConf} from "../src";
import {WErc20, WProxyAdmin} from "./common/wcontracts";

export const oc = new Onlinechain();


const _cProxyAdmin: Record<string, WProxyAdmin> = {};
const _cErc20: Record<string, WErc20> = {};

class Initializer {

  async init() {
    const chains = TestSource.chains({});
    const couples = TestSource.couples({});
    const tokens = TestSource.tokens({});

    for (const chain of chains) {
      await this.initProxyAdmin(chain);
    }
    for (const token of tokens) {
      await this.initErc20(token);
    }

  }

  private async initProxyAdmin(chain: HelixChainConf) {
    const oci = await oc.onlinechain(chain);
    const _ck = oci.chain.code;
    const contract = chain.contract;
    const proxyAdminAddress = contract["proxy-admin"];
    if (!proxyAdminAddress) {
      console.warn(`not found proxy admin contract address for [${chain.code}]`);
      return;
    }
    const wpa = new WProxyAdmin(proxyAdminAddress, oci.provider);
    await wpa.prepare();
    _cProxyAdmin[_ck] = wpa;
  }

  private async initErc20(token: TestChainToken) {
    if (token.type === 'native') return;
    const chain = HelixChain.get(token._chain)!;
    const _ck = `${chain.code}__${token.address}`;
    const oci = await oc.onlinechain(chain);
    const {provider} = oci;
    const contractErc20 = new WErc20(token.address, provider);
    await contractErc20.prepare();
    _cErc20[_ck] = contractErc20;
  }

}


