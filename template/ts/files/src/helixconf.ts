export type HelixProtocolName = 'lnv2-default' | 'lnv2-opposite' | 'lnv3';
export type TokenType = 'native' | 'erc20';
export type _NetworkType = 'mainnets' | 'testnets';


export interface ChainMessager {
  name: string
  address?: string
}

export interface ChainToken {
  symbol: string
  address: string
  decimals: number
  type: TokenType,
  name: string
}

export interface ChainCouple {
  category: string
  messager: ChainMessager
  fee: string
  protocol: HelixProtocol
  symbol: CoupleSymbol
  chain: CoupleChain
}

export interface CoupleChain {
  id: BigInt
  code: string
  name: string
}

export interface CoupleSymbol {
  from: string
  to: string
}

export interface HelixProtocol {
  name: HelixProtocolName,
  address: string
}

export interface CoupleFilter {
  category?: string
  messager?: string
  protocol?: string
  chain?: string
  symbolFrom?: string
  symbolTo?: string
  symbol?: string
}

export interface HelixChainConfType {
  _network: _NetworkType
  id: BigInt
  code: string
  name: string
  rpcs: string[]
  protocol: Partial<Record<HelixProtocolName, string>>
  messagers: ChainMessager[]
  tokens: ChainToken[]
  couples: ChainCouple[]
}

export class HelixChainConf {
  private readonly _data: HelixChainConfType;

  constructor(initialData: HelixChainConfType) {
    this._data = initialData;
  }

  get _network(): _NetworkType {
    return this._data._network;
  }

  get id(): BigInt {
    return this._data.id;
  }

  get code(): string {
    return this._data.code;
  }

  get name(): string {
    return this._data.name;
  }

  get rpcs(): string[] {
    return this._data.rpcs;
  }

  get protocol(): Partial<Record<HelixProtocolName, string>> {
    return this._data.protocol;
  }

  get messagers(): ChainMessager[] {
    return this._data.messagers;
  }

  get tokens(): ChainToken[] {
    return this._data.tokens;
  }

  get couples(): ChainCouple[] {
    return this._data.couples;
  }

  get<K extends keyof HelixChainConfType>(key: K): HelixChainConfType[K] {
    return this._data[key];
  }

  // set<K extends keyof HelixChainConfType>(key: K, value: HelixChainConfType[K]): void {
  //   this._data[key] = value;
  // }

  keys(): Array<keyof HelixChainConfType> {
    return Object.keys(this._data) as Array<keyof HelixChainConfType>;
  }

  categories(): string[] {
    const categories = this.couples.map(item => item.category);
    return categories.reduce((acc: string[], item: string) => {
      if (!acc.includes(item)) {
        acc.push(item);
      }
      return acc;
    }, []);
  }

  filterCouple(filter: CoupleFilter): ChainCouple[] {
    if (!filter) return this.couples;
    return this.couples.filter(item => {
      if (filter.category) {
        if (!_equalsIgnoreCase(item.category, filter.category)) {
          return false;
        }
      }
      if (filter.messager) {
        const eq = _equalsIgnoreCase(item.messager.name, filter.messager)
          || _equalsIgnoreCase(item.messager.address, filter.messager);
        if (!eq) return false;
      }
      if (filter.protocol) {
        const eq = _equalsIgnoreCase(item.protocol.name, filter.messager)
          || _equalsIgnoreCase(item.protocol.address, filter.messager);
        if (!eq) return false;
      }
      if (filter.chain) {
        const eq = _equalsIgnoreCase(item.chain.id.toString(), filter.chain)
          || _equalsIgnoreCase(item.chain.code, filter.chain)
          || _equalsIgnoreCase(item.chain.name, filter.chain);
        if (!eq) return false;
      }
      if (filter.symbolFrom) {
        if (!_equalsIgnoreCase(item.symbol.from, filter.symbolFrom)) return false;
      }
      if (filter.symbolTo) {
        if (!_equalsIgnoreCase(item.symbol.to, filter.symbolTo)) return false;
      }
      if (filter.symbol) {
        const eq = _equalsIgnoreCase(item.symbol.from, filter.symbol)
          || _equalsIgnoreCase(item.symbol.to, filter.symbol);
        if (!eq) return false;
      }
      return true;
    });
  }


  toJSON() {
    return {
      _network: this._network,
      id: this.id,
      code: this.code,
      name: this.name,
      rpcs: this.rpcs,
      protocol: this.protocol,
      messagers: this.messagers,
      tokens: this.tokens,
      couples: this.couples,
    };
  }


  static fromJson(json: any): HelixChainConf {
    return new HelixChainConf({
      _network: json._network,
      id: BigInt(json.id),
      code: json.code,
      name: json.name,
      rpcs: json.rpcs,
      protocol: json.protocol,
      messagers: json.messagers,
      tokens: json.tokens,
      couples: json.couples,
    });
  }

}


function _equalsIgnoreCase(t1?: string, t2?: string) {
  if (!t1 || !t2) {
    return false;
  }
  return t1.toLowerCase() === t2.toLowerCase();
}

