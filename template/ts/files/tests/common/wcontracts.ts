import {Erc20, ProxyAdmin} from "./contracts";

export class WProxyAdmin extends ProxyAdmin {

  private _owner?: string;

  async owner(): Promise<string> {
    this._owner ||= await super.owner();
    return this._owner;
  }

  async getProxyAdmin(proxy: string): Promise<string> {
    return super.getProxyAdmin(proxy);
  }
}

export class WErc20 extends Erc20 {

  private _symbol?: string;
  private _name?: string;
  private _decimals?: number;

  async symbol(): Promise<string> {
    this._symbol ||= await super.symbol();
    return this._symbol;
  }

  async name(): Promise<string> {
    this._name ||= await super.name();
    return this._name;
  }

  async decimals(): Promise<number> {
    this._decimals ||= await super.decimals();
    return this._decimals;
  }

  async balanceOf(address: string): Promise<bigint> {
    return super.balanceOf(address);
  }
}

