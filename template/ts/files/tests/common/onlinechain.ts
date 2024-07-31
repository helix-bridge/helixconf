import { HelixChainConf } from "../../src/";

export class Onlinechain {

  constructor(
    private readonly chains: HelixChainConf[],
  ) {
  }

  async init() {
    console.log('init this.chains');
  }

  async test() {
    console.log('---> test');
  }

}
