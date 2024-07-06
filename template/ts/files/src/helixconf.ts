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


export class HelixChainConf {
  private _network: _NetworkType;
  private id: BigInt;
  private code: string;
  private name: string;
  private rpcs: string[];
  private protocol: Partial<Record<HelixProtocolName, string>>;
  private messagers: ChainMessager[];
  private tokens: ChainToken[];
  private couples: ChainCouple[];

  static fromJson(json): HelixChainConf {
    const hcc = new HelixChainConf();
    hcc._network = json._network;
    hcc.id = BigInt(json.id);
    hcc.code = json.code;
    hcc.name = json.name;
    hcc.rpcs = json.rpcs;
    hcc.protocol = json.protocol;
    hcc.messagers = json.messagers;
    hcc.tokens = json.tokens;
    hcc.couples = json.couples;
    return hcc;
  }

  categories(): string[] {
    return this.couples.map(item => item.category);
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

}


function _equalsIgnoreCase(t1, t2) {
  if (!t1 || !t2) {
    return false;
  }
  return t1.toLowerCase() === t2.toLowerCase();
}

