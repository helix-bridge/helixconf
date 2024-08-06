import {pascalCase} from "change-case";

export type HelixProtocolName = 'lnv2-default' | 'lnv2-opposite' | 'lnv3';
export type TokenType = 'native' | 'erc20';
export type _NetworkType = 'mainnets' | 'testnets';
export type ChainIndexerType = 'thegraph' | 'ponder' | 'hyperindex';


export interface ChainMessager {
  name: string
  address?: string
}

export interface ChainToken {
  symbol: string
  name: string
  address: string
  decimals: number
  type: TokenType
  alias: string[]
  logo: string
}

export interface ChainRpcOptions {
  provider: string
  endpoint: string
}

export interface ChainIndexer {
  type: ChainIndexerType
  endpoint: string
}

export interface ChainCouple {
  category: string
  messager: ChainMessager
  fee: string
  protocol: HelixProtocol
  symbol: CoupleSymbol
  chain: CoupleChain
  hidden?: boolean
}

export interface CoupleChain {
  id: bigint
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

export interface PickRPCOptions {
  strategy: PickRPCStrategy
  auth: AuthOptions
  picker?: (rpcs: string[]) => Promise<string>
}

export interface PickRPCOptionsSync {
  strategy: PickRPCStrategy
  auth?: AuthOptions
  picker?: (rpcs: string[]) => string,
}

export enum PickRPCStrategy {
  Custom,
  First,
  Best,
  Random,
  PrivateFirst,
  PublicFirst,
}

export interface HelixChainConfType {
  _network: _NetworkType
  id: bigint
  code: string
  name: string
  rpcs: ChainRpc[]
  protocol: Partial<Record<HelixProtocolName, string>>
  messagers: ChainMessager[]
  indexers: ChainIndexer[],
  tokens: ChainToken[]
  couples: ChainCouple[]
}

export interface AuthOptions {
  key?: string
  ankrKey?: string
  infuraKey?: string
  alchemyKey?: string
  blastKey?: string
}

export class ChainRpc {
  constructor(
    private readonly options: ChainRpcOptions
  ) {
  }

  public static fromOptions(options: ChainRpcOptions[]): ChainRpc[] {
    return options.map(item => new ChainRpc(item));
  }

  get provider(): string {
    return this.options.provider;
  }

  get endpoint(): string {
    return this.options.endpoint;
  }

  private readEnv(key: string): string {
    const isNodeEnv = process && process['env'];
    return isNodeEnv ? (process.env[key] ?? '') : '';
  }

  rpc(options?: AuthOptions): string | undefined {
    const {provider, endpoint} = this.options;
    if (!endpoint) return;
    if (!provider) {
      return endpoint.indexOf('$') >= -1
        ? undefined
        : endpoint;
    }
    const stdProvider = provider.toLowerCase();
    let replaceVar, authKey;
    switch (stdProvider) {
      case 'public':
        break;
      case 'ankr':
        replaceVar = '$ANKR_KEY';
        authKey = options?.ankrKey ?? options?.key ?? this.readEnv('ANKR_KEY');
        break;
      case 'alchemy':
        replaceVar = '$ALCHEMY_KEY';
        authKey = options?.alchemyKey ?? options?.key ?? this.readEnv('ALCHEMY_KEY');
        break;
      case 'infura':
        replaceVar = '$INFURA_KEY';
        authKey = options?.infuraKey ?? options?.key ?? this.readEnv('INFURA_KEY');
        break;
      case 'blast':
        replaceVar = '$BLAST_KEY';
        authKey = options?.blastKey ?? options?.key ?? this.readEnv('BLAST_KEY');
        break;
      default:
        return undefined;
    }
    if (replaceVar && authKey) {
      return endpoint.replace(replaceVar, authKey);
    }
    return stdProvider === 'public'
      ? endpoint
      : undefined;
  }

}

export class HelixChainConf {
  private readonly _data: HelixChainConfType;

  constructor(initialData: HelixChainConfType) {
    this._data = initialData;
  }

  get _network(): _NetworkType {
    return this._data._network;
  }

  get testnet(): boolean {
    return this._network === 'testnets';
  }

  get nativeCurrency(): ChainToken {
    return this.tokens.find(item => item.type === 'native')!;
  }

  get id(): bigint {
    return this._data.id;
  }

  get code(): string {
    return this._data.code;
  }

  get name(): string {
    return this._data.name;
  }

  get indexers(): ChainIndexer[] {
    return this._data.indexers;
  }

  get rpcs(): string[] {
    return this.availableRpcs();
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

  get rpc(): string {
    return this.pickRpcSync();
  }

  get<K extends keyof HelixChainConfType>(key: K): HelixChainConfType[K] {
    return this._data[key];
  }

  // set<K extends keyof HelixChainConfType>(key: K, value: HelixChainConfType[K]): void {
  //   this._data[key] = value;
  // }

  private availableRpcs(options?: AuthOptions): string[] {
    const rpcs = [];
    for (const rpc of this._data.rpcs) {
      const endpoint = rpc.rpc(options);
      if (!endpoint) continue;
      rpcs.push(endpoint);
    }
    return rpcs;
  }

  pickRpcSync(options?: PickRPCOptionsSync): string {
    const strategy = options?.strategy ?? PickRPCStrategy.PrivateFirst;
    switch (strategy) {
      case PickRPCStrategy.Custom: {
        if (!(options?.picker)) {
          return this.rpcs[0];
        }
        return options.picker(this.rpcs);
      }
      case PickRPCStrategy.Random: {
        const len = this.rpcs.length;
        return this.rpcs[Math.floor(Math.random() * len)];
      }
      case PickRPCStrategy.PrivateFirst: {
        const privateRpcs = this._data.rpcs
          .filter(item => item.provider !== 'PUBLIC')
          .map(item => item.rpc(options?.auth));
        const firstWorkRpc = privateRpcs.find(item => item);
        const nextOptions = {
          ...options,
          strategy: PickRPCStrategy.First,
        };
        return firstWorkRpc
          ? firstWorkRpc
          : this.pickRpcSync(nextOptions)
      }
      case PickRPCStrategy.PublicFirst: {
        const privateRpcs = this._data.rpcs
          .filter(item => item.provider === 'PUBLIC')
          .map(item => item.rpc(options?.auth));
        const firstWorkRpc = privateRpcs.find(item => item);
        const nextOptions = {
          ...options,
          strategy: PickRPCStrategy.First,
        };
        return firstWorkRpc
          ? firstWorkRpc
          : this.pickRpcSync(nextOptions)
      }
      case PickRPCStrategy.Best: // todo: pick best rpc url, maybe check latency
      case PickRPCStrategy.First:
      default:
        return this.rpcs[0];
    }
  }

  async pickRpc(options?: PickRPCOptions): Promise<string> {
    const strategy = options?.strategy ?? PickRPCStrategy.PrivateFirst;
    if (strategy === PickRPCStrategy.Custom) {
      if (!(options?.picker)) {
        return this.rpcs[0];
      }
      return await options.picker(this.rpcs);
    }
    return this.pickRpcSync({strategy: strategy});
  }

  indexer(type: ChainIndexerType): ChainIndexer | undefined {
    return this.indexers.find(item => item.type === type);
  }

  keys(): Array<keyof HelixChainConfType> {
    return Object.keys(this._data) as Array<keyof HelixChainConfType>;
  }

  token(symbol: string): ChainToken | undefined {
    for (const token of this.tokens) {
      if (token.alias.find(item => _equalsIgnoreCase(item, symbol))) {
        return token;
      }
    }
  }

  messager(name: string): ChainMessager | undefined {
    const uppercaseMessagerName = name.toUpperCase();
    for (const messager of this.messagers) {
      if (messager.name.toUpperCase() === uppercaseMessagerName) {
        return messager;
      }
    }
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

  filterCouples(filter: CoupleFilter): ChainCouple[] {
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
      indexers: this.indexers,
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
      rpcs: ChainRpc.fromOptions(json.rpcs),
      indexers: json.indexers,
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

