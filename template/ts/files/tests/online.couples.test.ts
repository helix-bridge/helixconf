import {TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import {oc} from './_base'

const validCategorys = TestSource.validCategorys();

const couples = TestSource.couples({

});

describe.each(couples)
(`helix chain couples check -> [$_chain->$chain.code]: $symbol.from->$symbol.to <$protocol.name>`, (couple) => {
  const chain = HelixChain.get(couple._chain)!;

  test(
    `check bridge protocol dao > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;
      expect(true).toBe(validCategorys.includes(couple.category));

      const oci = await oc.onlinechain(chain);
      const be = oc.protocol(oci, couple.protocol);
      const dao = await be.dao();
      expect(chain.additional.dao!.toLowerCase()).toBe(dao.toLowerCase());
    }, 60000);

  test(
    `test bridge messager service > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;

      const soci = await oc.onlinechain(chain);
      const bridge = await oc.bridge(soci, couple);

      const sourceMessagerFromChain = await bridge.getSourceMessagerFromChain();
      expect(couple.messager.address!.toLowerCase()).toBe(sourceMessagerFromChain.toLowerCase());

      const isSourceConnectedTarget = await bridge.isSourceConnectedTarget();
      expect(true).toBe(isSourceConnectedTarget);

      const isSourceAppConnectedTarget = await bridge.isSourceAppConnectedTarget();
      expect(true).toBe(isSourceAppConnectedTarget);
    }, 60000);

  test(
    `test lnv3 token registerd > [${chain.code}->${couple.chain.code}]: ${couple.symbol.from}->${couple.symbol.to} (${couple.protocol.name})`,
    async () => {
      if (couple.protocol.name !== 'lnv3') return;

      const oci = await oc.onlinechain(chain);
      const protocol = oc.protocol(oci, couple.protocol);

      const sourceToken = chain.token(couple.symbol.from)!;
      const targetChain = HelixChain.get(couple.chain.code)!;
      const targetToken = targetChain.token(couple.symbol.to)!;

      const tokenRegistered = await protocol.tokenRegistered(
        sourceToken,
        targetToken,
        targetChain
      );
      expect(tokenRegistered).toBeTruthy();
      expect(sourceToken.decimals.toString()).toBe(tokenRegistered!.sourceDecimals.toString());
      expect(targetToken.decimals.toString()).toBe(tokenRegistered!.targetDecimals.toString());
      expect(couple.fee.toString()).toBe(tokenRegistered!.protocolFee.toString());
      expect(tokenRegistered!.buildTokenKey).toBe(tokenRegistered!.indexToTokenKey);
    },
    60000
  )

});
