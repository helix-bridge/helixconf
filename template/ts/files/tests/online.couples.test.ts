import {TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import base from './_base'

const validCategories = TestSource.validCategories()

const couples = TestSource.couples({});

describe.each(couples)
(`helix chain couples check -> [$_chain->$chain.code]: $symbol.from->$symbol.to <$protocol.name>`, (couple) => {
  const chain = HelixChain.get(couple._chain)!;


  test(
    `check bridge protocol dao > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;
      expect(true).toBe(validCategories.includes(couple.category));

      const dao = await base.protocolDao(couple);
      expect(chain.additional.dao!.toLowerCase()).toBe(dao!.toLowerCase());
    }, 60000);


  test(
    `test bridge messager service > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;

      const pm = await base.protocolMessager(couple);

      // if protocol is lnv2-default please compare with pm.sendService
      expect(couple.messager.address!.toLowerCase()).toBe(pm!.receiveService.toLowerCase());

      const mrm = await base.messagerRemoteMessager(couple);
      const tc = await base.targetCouple(couple);
      expect(tc!.messager.address!.toLowerCase()).toBe(mrm!.messager.toLowerCase());

      const mras = await base.messagerRemoteAppsender(couple);
      const mrar = await base.messagerRemoteAppreceiver(couple);
      expect(tc!.protocol.address.toLowerCase()).toBe(mras!.toLowerCase())
      expect(tc!.protocol.address.toLowerCase()).toBe(mrar!.toLowerCase())
    }, 60000);


  test(
    `test lnv3 token registerd > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;

      const ptr = await base.protocolTokenRegistered(couple);

      const sourceToken = chain.token(couple.symbol.from)!;
      const targetChain = HelixChain.get(couple.chain.code)!;
      const targetToken = targetChain.token(couple.symbol.to)!;

      expect(ptr).toBeTruthy();
      expect(sourceToken.decimals.toString()).toBe(ptr!.sourceDecimals.toString());
      expect(targetToken.decimals.toString()).toBe(ptr!.targetDecimals.toString());
      expect(couple.fee.toString()).toBe(ptr!.protocolFee.toString());
      expect(ptr!.buildTokenKey).toBe(ptr!.indexToTokenKey);
    },
    60000);

});
