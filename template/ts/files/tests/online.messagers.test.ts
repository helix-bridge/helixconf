import {TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import {oc} from './_base'

const messagers = TestSource.messagers({});

describe.each(messagers)('helix chain messagers verify -> [$_chain]:$name', (message) => {
  const chain = HelixChain.get(message._chain)!;

  test(`check message dao > [${chain.code}]:${message.name}`, async () => {
    const oci = await oc.onlinechain(chain);
    const messager = await oc.messager(oci, message);
    const dao = await messager.dao();
    expect(chain.additional.dao.toLowerCase()).toBe(dao.toLowerCase());
  }, 120000);
});
