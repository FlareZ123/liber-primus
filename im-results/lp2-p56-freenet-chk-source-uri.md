# Solved p56 512-bit value as historical content address: Freenet and GNUnet format gates

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

## Original-network probe and its decisive limitation

The [source-exact converter](../sims/lp2_p56_freenet_chk_uri_sft.cjs) was executed successfully in all three [manual-only test runs](../.github/workflows/lp2-p56-hyphanet-chk-live.yml). The first two 32-byte candidate fields, both five-byte external metadata assumptions and both field orders are stable across runs. Real network retrieval was attempted using a fresh **historical Hyphanet 0.7.5 build 1507** node started inside ephemeral GitHub Actions, with its native FProxy HTTP interface and a separately documented historical public CHK control. The [live runner](../sims/lp2_p56_hyphanet_live_fetch.cjs) has fixed candidates, a working-source input assertion, bounded response handling, and original HTTP response classification.

**The test has not reached an authenticated-network retrieval gate.** All three runs failed before the CHK lookup could be evaluated:

| GitHub Actions run | Technical observation | Evidential decision |
| --- | --- | --- |
| [43052624808](https://github.com/FlareZ123/liber-primus/actions/runs/43052624808) | Node/FProxy listening; public control and four candidates each HTTP **301**, body “Permanent redirect: Found elsewhere,” target **/wizard/**; no retrieved bytes | Node first-run wizard blocked every request |
| [43053105480](https://github.com/FlareZ123/liber-primus/actions/runs/43053105480) | Preconfigured wizard flag but Docker bridge/loopback networking prevented reaching FProxy; 42 readiness probes failed, no CHK request reached the node | Host/container network setup failure |
| [43054515961](https://github.com/FlareZ123/liber-primus/actions/runs/43054515961) | Host-loopback route fixed, original protocol node started, 180 seconds bootstrap; all five requests again received identical **301 /wizard/** redirects | Node still in first-run-wizard state despite preloaded flag |

The live probes therefore performed **zero validated Freenet CHK lookups**, against either control or manuscript candidates, and recovered **zero bytes of candidate content**. This is *not* a negative retrieval result for any address. Successful GitHub Actions job status only means the fail-closed script executed and uploaded an explicit inconclusive summary, not a solved destination. Captured run artifacts include [the third run's exact stdout/logs](https://github.com/FlareZ123/liber-primus/actions/runs/43054515961). Each original run's HTTP 301 body and SHA-256 is identical: `37931878675f7f3ff036d5f6a5c3ec5aaf1cacc48f51ba1d6b70467b470d721c`.

**Research decision:** the currently unresolved historical CHK theory is weakly selected because *any random 64-byte sequence admits the same two-field decomposition*, and the actual p56 language specifies a *hash* instead of Freenet. With zero successful CHK lookups, no positive evidence was gained from three node runs. **Do not rerun this CI solely to troubleshoot setup or try arbitrary extras.** Reconsider only if an independent original source points to Freenet or supplies the third field, or if a functioning legacy node with a verified fetched public-control CHK already exists. On such a node, fetch exactly the same four frozen candidates; require a cryptographically verified content block and original-LP2 plaintext or a key before promoting the hypothesis.

## Independent historical GNUnet CHK format gate (Agent31, 13 November 2026)

A separate pre-2014 decentralized content-sharing system is **GNUnet**, which had a documented CHK file-sharing URI in 2012. The public [2012 GNUnet mailing-list discussion](https://lists.gnu.org/archive/html/help-gnunet/2012-10/msg00007.html) identifies the paired content/query hash fields and asks explicitly about base32hex SHA-512 representation. The detailed [GNUnet file-sharing protocol documentation](https://docs.gnunet.org/v0.25.x/users/fs.html#content-hash-key-chk) specifies:

**gnunet://fs/chk/KEYHASH.QUERYHASH.SIZE**

Here **KEYHASH** is the SHA-512-sized plaintext top-block hash / decryption key, **QUERYHASH** is the separately SHA-512-sized encrypted top-block hash / DHT lookup key, and **SIZE** is the original file size needed to determine its content tree. GNUnet encodes hashes as base32hex rather than p56's literal hexadecimal, which is mechanically convertible without revealing any other information.

The original p56 inscription supplies **exactly one 64-byte (512-bit) value**, and no original file size. Even granting that its hash is an authentic GNUnet **KEYHASH** *or* **QUERYHASH**, it supplies only one of two independently required 64-byte values. With no second field and no SIZE, **the printed value cannot directly instantiate a valid, fetchable, decryptable historical GNUnet CHK URI**. This is a protocol-format exclusion of a *standalone GNUnet locator*, not an exclusion of using the digest to match data already collected elsewhere. One might conditionally query an implementation's raw DHT with a known QUERYHASH and obtain an encrypted block, but would still lack the distinct decryption hash and file size; p56 supplies no instruction for that network access, and no original block was obtained.

**Decision:** The already-preserved p56 digest is a useful **exact equality target for recovered 2014 page bytes**, but no standalone Freenet or GNUnet address follows from its 128 hex characters. Future lookup needs an *independently sourced historical URL, filename, file body, other CHK fields or a publisher index*, rather than arbitrary split, size and metadata guesses. This does not establish that GNUnet was used by Cicada or eliminate all 2014 decentralized-network archives.

## Reproduction

The [single runnable CommonJS test](../sims/lp2_p56_freenet_chk_uri_sft.cjs) extracts the original five p56 hex lines, asserts the 128 characters, constructs and reverses the exact two 32-byte fields, verifies base64 and five-byte settings round trips, and prints four complete URI strings. Node.js 22, built-in modules, no network, no file writes.
