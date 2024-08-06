import {TestSource} from "./common/testsource";
import {HelixChain} from "../src";

import {oc} from './_base'


describe.each(TestSource.messagers())('helix chain messagers verify -> [$_chain]:$name', (message) => {
  const chain = HelixChain.get(message._chain)!;

  test(`check message dao > [${chain.code}]:${message.name}`, async () => {
    const oci = await oc.onlinechain(chain);
    const messager = await oc.messager(oci, message);
    const dao = await messager.dao();
    expect(chain.additional.dao.toLowerCase()).toBe(dao.toLowerCase());
  });

  test(`check message operator > [${chain.code}]:${message.name}`, async () => {
    const oci = await oc.onlinechain(chain);
    const messager = await oc.messager(oci, message);
    const operator = await messager.operator();
    expect(chain.additional.operator.toLowerCase()).toBe(operator.toLowerCase());
  });
});
