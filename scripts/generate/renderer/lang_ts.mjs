const Mustache = require('mustache');

export async function render(lifecycle) {
  const {workdir, conf} = lifecycle
  const langTs = {
    templateDir: `${workdir}/template/ts/templates`,
    filesDir: `${workdir}/template/ts/files`,
    baseDir: `${workdir}/generated/typescript`,
    srcDir: `${workdir}/generated/typescript/src`,
  };
  lifecycle.langTs = langTs;

  await fs.mkdirp(langTs.srcDir);
  await clean(lifecycle);
  await copyFiles(lifecycle);
  await renderChain(lifecycle);
}

async function clean(lifecycle) {
  const {langTs} = lifecycle;
  const files = await fs.readdir(langTs.baseDir);
  for (const file of files) {
    if (file === 'node_modules') continue;
    const path = `${langTs.baseDir}/${file}`;
    await fs.remove(path);
  }
}

async function renderChain(lifecycle) {
  const {conf, langTs} = lifecycle;
  const chainCodes = Object.keys(conf);
  const chainTpl = await fs.readFile(`${langTs.templateDir}/chain.ts.mustache`, 'utf8');

  const chainList = [];
  for (const code of chainCodes) {
    const cf = conf[code];
    const networkDir = `${langTs.srcDir}/${cf._network}`;
    await fs.mkdirp(networkDir);
    const output = Mustache.render(chainTpl, {chain: cf});
    await fs.writeFile(`${networkDir}/${code}.ts`, output);
    chainList.push({network: cf._network, code: code, name: cf.name});
  }
  chainList[chainList.length - 1].last = true

  const indexTpl = await fs.readFile(`${langTs.templateDir}/helpers.ts.mustache`, 'utf8');
  const output = Mustache.render(indexTpl, {chains: chainList});
  await fs.writeFile(`${langTs.srcDir}/helpers.ts`, output);
}

async function copyFiles(lifecycle) {
  const {workdir, conf, langTs} = lifecycle;
  const notCopies = [
    '/node_modules'
  ];
  await fs.copy(langTs.filesDir, langTs.baseDir, {
    overwrite: true,
    filter: (src, dest) => {
      for (const nc of notCopies) {
        if (src.indexOf(nc) > -1) return false;
      }
      return true;
    },
  });
  await fs.copy(`${workdir}/abis`, `${langTs.baseDir}/tests/abis`);
}
