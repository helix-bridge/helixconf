import {HelixChain} from "helixconf";


async function main() {
  console.log('_network: ')
  console.log(HelixChain.darwiniaDvm._network);
  console.log('--------- seg  ---------');
  console.log('id: ')
  console.log(HelixChain.darwiniaDvm.id);
  console.log('--------- seg  ---------');
  console.log('code: ')
  console.log(HelixChain.darwiniaDvm.code);
  console.log('--------- seg  ---------');
  console.log('name: ')
  console.log(HelixChain.darwiniaDvm.name);
  console.log('--------- seg  ---------');
  console.log('rpcs: ')
  console.log(HelixChain.darwiniaDvm.rpcs);
  console.log('--------- seg  ---------');
  console.log('messagers: ')
  console.log(JSON.stringify(HelixChain.darwiniaDvm.messagers));
  console.log('--------- seg  ---------');
  console.log('protocol: ')
  console.log(JSON.stringify(HelixChain.darwiniaDvm.protocol));
  console.log('--------- seg  ---------');
  console.log('tokens: ')
  console.log(JSON.stringify(HelixChain.darwiniaDvm.tokens));
  console.log('--------- seg  ---------');
  console.log('categories: ')
  console.log(HelixChain.darwiniaDvm.categories());
  console.log('--------- seg  ---------');
  console.log('filterCouple: ')
  console.log(JSON.stringify(HelixChain.darwiniaDvm.filterCouple({symbol: 'ring'})));
  console.log('--------- seg  ---------');
}


main().then(() => console.log('done')).catch(e => console.log(e));
