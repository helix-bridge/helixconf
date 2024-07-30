import * as helper from './_helper.mjs'
import * as stdconf from './stdconf.mjs'
import * as renderer from './renderer/index.mjs'

$.verbose = argv['V'] || argv['verbose'];

const BIN_PATH = path.resolve(__filename, '../');
const WORK_PATH = path.resolve(BIN_PATH, '../../');

async function readConf(lifecycle) {
  const chainMap = {};
  for (const network of lifecycle.networks) {
    const pathNetwork = `${WORK_PATH}/conf/${network}`;
    const rawDefinition = await fs.readFile(`${pathNetwork}/$.yml`, 'utf8');
    const global = YAML.parse(rawDefinition);

    const filesOfNetwork = await fs.readdir(pathNetwork);
    for (const fileName of filesOfNetwork) {
      if (fileName === '$.yml') continue;
      if (!(fileName.toLowerCase().endsWith('.yml') || fileName.toLowerCase().endsWith('.yaml'))) {
        continue;
      }
      const rawNetwork = await fs.readFile(`${pathNetwork}/${fileName}`, 'utf8');
      const networkConf = YAML.parse(rawNetwork);
      chainMap[networkConf.code] = {
        ...networkConf,
        _network: network,
        _global: global,
      };
    }
  }
  return chainMap;
}

function reorganizationConf(conf) {
  const names = Object.keys(conf);
  const newChainConf = {};
  for (const name of names) {
    const ccf = conf[name];
    const nccf = helper.mergeObjects(ccf._global, ccf);
    stdconf.standardization(conf, nccf);

    newChainConf[name] = nccf;
  }
  return newChainConf;
}


async function generateLangauge(lifecycle) {
  const language = (argv['language'] || 'js').toUpperCase();
  await renderer.render(lifecycle, language);
}

async function main() {
  const _networkArg = argv['network'];
  const networks = _networkArg
    ? (typeof _networkArg) === 'string' ? [_networkArg] : _networkArg
    : ['mainnets', 'testnets'];
  const lifecycle = {
    workdir: WORK_PATH,
    networks,
  };
  const baseConf = await readConf(lifecycle);
  lifecycle.conf = reorganizationConf(baseConf);
  await fs.mkdirp(`${WORK_PATH}/_tmp`);
  await fs.writeFile(`${WORK_PATH}/_tmp/output.json`, JSON.stringify(lifecycle.conf, null, 2));

  await generateLangauge(lifecycle);
}

await main();




