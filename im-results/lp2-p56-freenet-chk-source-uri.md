# Solved p56 512-bit value as historical Freenet CHK address: exact source-only construction

**Agent 6, 11 November 2026. Status: a reproducible, unverified continuation locator.** The 512-bit value is authentic to already-solved LP2 p56. Its binary decomposition yields syntactically valid candidate Freenet/Hyphanet 0.7 CHK routing and decryption fields, but **no p56 destination, unknown LP2 plaintext, fetched content, historical key, or cipher was recovered.**

## What would a 2014 solver actually see?

Physical LP2 p56 prints five consecutive ASCII hex lines after stating that a deep-web page “hashes to” their value. The pinned transcript is in [resources/external/Liber Primus 57.txt](../resources/external/Liber%20Primus%2057.txt). A 2014-era anonymized storage network might instead store a *content-addressed locator* a player could copy directly. Historical Freenet 0.7, today preserved as Hyphanet, is one possibility. A Freenet CHK address has two 32-byte binary fields: a routing/content key and a decryption key, encoded in modified Base64. A **third five-byte settings field** is needed and is *missing* from printed p56.

The single frozen construction splits the entire original printed 64-byte value into two consecutive halves, then Freenet-modified-Base64 encodes each without padding. There are no fitted cipher keys or plaintext guesses.

**Original p56 hex value, 128 characters:**

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

**First 32 source bytes as Freenet modified Base64:**

```text
NjZ3Y6tzeDx68oREbFlGa0zWUyOaMRy3EW1GGN7gmoQ
```

**Second 32 source bytes as Freenet modified Base64:**

```text
JYk9x1ALRk~a8Wcte-9eiRxuInRWiSakn7T0UTLCqLQ
```

Each field is 43 unpadded characters and decodes to exactly 32 bytes. One **hypothetical** complete 0.7 CHK URI using the historically observed *but unsourced to p56* five-byte settings `AAIC--8` is:

```text
freenet:CHK@NjZ3Y6tzeDx68oREbFlGa0zWUyOaMRy3EW1GGN7gmoQ,JYk9x1ALRk~a8Wcte-9eiRxuInRWiSakn7T0UTLCqLQ,AAIC--8
```

The other common documented settings `AAMC--8` and the possible reversed field allocation produce three additional bounded variants, all in the [executable source test](../sims/lp2_p56_freenet_chk_uri_sft.cjs). The two assumed extras encode `000202fbef` and `000302fbef` respectively, five bytes each. Neither appears in p56. These are candidate address strings, not validated object identifiers.

## External format, limitations, and decisive next step

The historic [FreenetURI interface](https://javadoc.freenetproject.org/freenet/keys/FreenetURI.html) specifies the modified-Base64 routing and crypto keys, and the [Freenet ClientCHK implementation](https://www.javatips.net/api/fred-master/src/freenet/keys/ClientCHK.java) requires 32+32+5 bytes. [Hyphanet 0.7 documentation](https://www.hyphanet.org/pages/documentation.html) explains CHK fetching through a locally connected FProxy node. The incompatible successor sold as Freenet in 2023 [explicitly does not support old keys](https://freenet.org/faq/), so use Hyphanet, the project maintaining the original protocol.

**Strongest objection:** p56's actual phrase says the page *hashes to* the value, suggesting a page-content hash rather than a Freenet URI. **Every arbitrary 64-byte string splits into two well-formed 32-byte CHK fields, so the syntactic match itself has zero discriminating evidential value.** No original inscription says Freenet, CHK, or the missing settings bytes. A 2014 CHK could also have vanished from the unmaintained distributed datastore. Web searches for the complete exact 43-character encoded fields surfaced no indexed original CHK.

**Decisive experiment:** attempt all four frozen candidates through a live, connected *Hyphanet 0.7* node, simultaneously successfully fetching a documented public working-control CHK to distinguish network failures. Actual success would return a validated content block, whose content must then reveal a historically meaningful page and a path to original LP2 plaintext or a key. A failure would constrain these four candidate locators *at that time*, without disproving alternative deep-web hashes or past content. **No network fetch succeeded or was performed here.**

**Disposition:** preserve as a finite testable external-destination hypothesis, not an LP2 decipherment or recovered destination. Do not search arbitrary variant fragment orders, prefixes, or missing extras without a source selector. 

## Reproduction

The [single runnable CommonJS test](../sims/lp2_p56_freenet_chk_uri_sft.cjs) extracts the original five p56 hex lines, asserts the 128 characters, constructs and reverses the exact two 32-byte fields, verifies base64 and five-byte settings round trips, and prints four complete URI strings. Node.js 22, built-in modules, no network, no file writes.
