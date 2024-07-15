import {HelixChain} from "helixconf";


async function main() {
  const keys = HelixChain.darwiniaDvm.keys();
  for (const key of keys) {
    const v = HelixChain.darwiniaDvm[key];
    console.log(`${key}: `)
    if (typeof v == 'object') {
      console.log(JSON.stringify(v));
    } else {
      console.log(v);
    }
    console.log('--------- seg  ---------');
  }

  console.log('categories: ')
  console.log(HelixChain.darwiniaDvm.categories());
  console.log('--------- seg  ---------');
  console.log('filterCouple: ')
  console.log(JSON.stringify(HelixChain.darwiniaDvm.filterCouple({symbol: 'ring'})));
  console.log('--------- seg  ---------');
}


main().then(() => console.log('done')).catch(e => console.log(e));
