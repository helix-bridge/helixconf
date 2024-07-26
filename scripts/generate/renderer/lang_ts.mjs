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
  await copyFiles(lifecycle)
  await renderChain(lifecycle);
}

async function renderChain(lifecycle) {
  const {conf, langTs} = lifecycle;
  const chainNames = Object.keys(conf);
  const chainTpl = await fs.readFile(`${langTs.templateDir}/chain.ts.mustache`, 'utf8');

  const chainList = [];
  for (const name of chainNames) {
    const cf = conf[name];
    const networkDir = `${langTs.srcDir}/${cf._network}`;
    await fs.mkdirp(networkDir);
    const output = Mustache.render(chainTpl, {chain: cf});
    await fs.writeFile(`${networkDir}/${name}.ts`, output);
    chainList.push({network: cf._network, name: name, id: cf.id});
  }
  chainList[chainList.length - 1].last = true

  const indexTpl = await fs.readFile(`${langTs.templateDir}/helpers.ts.mustache`, 'utf8');
  const output = Mustache.render(indexTpl, {chains: chainList});
  await fs.writeFile(`${langTs.srcDir}/helpers.ts`, output);
}

async function copyFiles(lifecycle) {
  const {conf, langTs} = lifecycle;
  await fs.copy(langTs.filesDir, langTs.baseDir, {overwrite: true});
}
