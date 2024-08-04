import * as helper from './_helper.mjs'

export function standardization(global, ccf) {
  _stdGeneric(global, ccf);
  _stdMessagers(global, ccf);
  _stdIndexers(global, ccf);
  _stdTokens(global, ccf);
  _stdCouples(global, ccf);
  _cleanConf(global, ccf);
}

function _stdGeneric(global, ccf) {
  if (!ccf.messagers) ccf.messagers = [];
  if (!ccf.couples) ccf.couples = [];
  if (!ccf.tokens) ccf.tokens = [];
  if (!ccf.rpcs) ccf.rpcs = [];
  if (!ccf.protocol) ccf.protocol = {};
  if (!ccf.indexers) ccf.indexers = [];
}

function _stdMessagers(global, ccf) {
  ccf.messagers = helper.filterArray(ccf.messagers, (one, two) => one.name === two.name);
}

function _stdIndexers(global, ccf) {
  ccf.indexers = helper.filterArray(ccf.indexers, (one, two) => one.type === two.type);
}

function _stdCouples(global, ccf) {
  if (!ccf.couples) return;
  for (const couple of ccf.couples) {
    _stdSymbol(global, ccf, couple);
    _stdMessager(global, ccf, couple);
    _stdProtocol(global, ccf, couple);
    _stdChain(global, ccf, couple);
    _stdCategory(global, ccf, couple);
  }
}

function _stdTokens(global, ccf) {
  for (const token of ccf.tokens) {
    const alias = token.alias || [];
    const stdAlias = [];
    for (let i = alias.length; i-- > 0;) {
      if (!alias[i]) continue;
      stdAlias.push(alias[i]);
    }
    if (!stdAlias.find(item => item.toUpperCase() === token.symbol.toUpperCase())) {
      stdAlias.push(token.symbol);
    }
    token.alias = stdAlias;
    if (!token.name) {
      token.name = token.symbol;
    }
    if (!token.logo) {
      token.logo = `https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/tokens/${token.symbol.toLowerCase()}.png`;
    }
    if (token.logo) {
      if (!token.logo.startsWith('http://') && !token.logo.startsWith("https://")) {
        token.logo = `https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/tokens/${token.logo}`;
      }
    }
  }
}

function _stdSymbol(global, ccf, couple) {
  const rawSymbol = couple.symbol;
  if (typeof rawSymbol === 'string') {
    const pairs = rawSymbol.split('/');
    if (pairs.length === 1) {
      couple.symbol = {
        from: pairs[0],
        to: pairs[0],
      };
      return;
    }
    couple.symbol = {
      from: pairs[0],
      to: pairs[1],
    };
    return;
  }
  if (rawSymbol.from && rawSymbol.to) {
    return;
  }
  console.log(chalk.red('missing symbol; symbol: {from, to}'));
  process.exit(1);
}

function _stdMessager(global, ccf, couple) {
  if (!couple.messager) return;
  couple.messager = __pickMessager(ccf, couple.messager);
}

function _stdProtocol(global, ccf, couple) {
  if (!ccf.protocol) {
    couple.protocol = {
      name: couple.protocol,
    };
    return;
  }
  const protocolAddress = ccf.protocol[couple.protocol];
  couple.protocol = {
    name: couple.protocol,
    address: protocolAddress,
  };
}

function _stdCategory(global, ccf, couple) {
  if (couple.category) {
    couple.category = couple.category.toUpperCase();
    return;
  }
  couple.category = couple.symbol.from.toUpperCase();
}

function _stdChain(global, ccf, couple) {
  const chainCode = couple.chain;
  const targetChain = global[chainCode];
  if (!targetChain) {
    console.log(chalk.red(`missing couple chain [${chainCode}] from [${ccf.code}], maybe you typed wrong chain code`));
    process.exit(1);
  }
  couple.chain = {
    id: targetChain.id,
    code: chainCode,
    name: targetChain.name,
  };
}

function _cleanConf(global, ccf) {
  delete ccf['_global'];
}

function __pickMessager(ccf, name) {
  if (!ccf.messagers) return {name};
  for (const messager of ccf.messagers) {
    if (messager.name === name) return messager;
  }
  return {name};
}
