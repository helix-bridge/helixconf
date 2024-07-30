export function standardization(global, ccf) {
  _stdGeneric(global, ccf);
  _stdTokens(global, ccf);
  _stdCouples(global, ccf);
  _cleanConf(global, ccf);
  _stdContracts(global, ccf);
}

function _stdGeneric(global, ccf) {
  if (!ccf.messagers) ccf.messagers = [];
  if (!ccf.couples) ccf.couples = [];
  if (!ccf.tokens) ccf.tokens = [];
  if (!ccf.rpcs) ccf.rpcs = [];
  if (!ccf.protocol) ccf.protocol = {};
  if (!ccf.contracts) ccf.contracts = {};
}

function _stdContracts(global, ccf) {
  // ccf.contracts;
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
    token.symbol = token.symbol.toUpperCase();
    if (!token.name) {
      token.name = token.symbol;
    }
    const alias = token.alias || [];
    const stdAlias = [];
    for (let i = alias.length; i-- > 0;) {
      if (!alias[i]) continue;
      stdAlias.push(alias[i].toUpperCase());
    }
    if (stdAlias.indexOf(token.symbol) == -1) {
      stdAlias.push(token.symbol);
    }
    token.alias = stdAlias;
  }
}

function _stdSymbol(global, ccf, couple) {
  const rawSymbol = couple.symbol;
  if (typeof rawSymbol === 'string') {
    const pairs = rawSymbol.split('/');
    if (pairs.length === 1) {
      couple.symbol = {
        from: pairs[0].toUpperCase(),
        to: pairs[0].toUpperCase(),
      };
      return;
    }
    couple.symbol = {
      from: pairs[0].toUpperCase(),
      to: pairs[1].toUpperCase(),
    };
    return;
  }
  if (rawSymbol.from && rawSymbol.to) {
    rawSymbol.from = rawSymbol.from.toUpperCase();
    rawSymbol.to = rawSymbol.to.toUpperCase();
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
  couple.category = couple.symbol.from;
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
