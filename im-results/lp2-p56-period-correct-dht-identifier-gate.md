# LP2 p56: 2014-era DHT content-identifier source gate

**Status (23 November 2026):** bounded negative for a complete, retrievable GNUnet/Freenet address as *printed*. The 128 hexadecimal digits on solved p56 provide precisely 512 bits, consistent with a **single** 2014 GNUnet hash-code field. They do not supply a complete period-correct GNUnet CHK (two 512-bit hashes and a size), a 2014 Freenet CHK (two 256-bit keys and five mandatory extra bytes), or an authenticated retrieval. No unknown LP2 plaintext or final destination is recovered. This tests the typed identifier hypothesis of [Director #2433](https://github.com/FlareZ123/liber-primus/issues/2433); it is neither a SHA-512 preimage search nor a claim that a network object never existed.

## Source input and exact byte-level transformations

The original source is LP2 solved physical p56, corresponding to archive image 73 (not unknown physical p55). The literal 128 lowercase hex characters, preserving their order across printed lines, are:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

There are 64 decoded bytes. **This 64-byte value is neither a retrieved DHT object nor a complete type-tagged identifier**. The only authorized change considered here is a deterministic byte-to-text encoding; splitting, inventing other fields and choosing a network by output fit would require separate first-party evidence.

### GNUnet 2014: field width matches, complete CHK fails

Historical 2014 source is GNUnet **0.10.1**, Git commit [4a5c2f93 (8 April 2014)](https://github.com/GNUnet-Mirror/GNUnet/commit/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2), contemporaneous with LP2. The earlier [0.10.0 release of 24 December 2013](https://github.com/GNUnet-Mirror/GNUnet/commit/c0e3537bc400698137b43a78fc63ca96ae6315a9) confirms the same field grammar and encoding.

- [`src/include/gnunet_crypto_lib.h`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/include/gnunet_crypto_lib.h): `GNUNET_CRYPTO_HashAsciiEncoded` has 104 bytes, including a NUL, i.e. **103 encoded Base32 characters per 64-byte hash**. [`src/include/gnunet_common.h`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/include/gnunet_common.h) uses a 512-bit hash code.
- [`src/util/strings.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/util/strings.c) explicitly defines **`0123456789ABCDEFGHIJKLMNOPQRSTUV`** as the encoding alphabet. Later GNUnet uses Crockford `0123456789ABCDEFGHJKMNPQRSTVWXYZ`; applying the modern format to a 2014 clue would alter the identifier.
- [`src/fs/fs_uri.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/fs/fs_uri.c) `uri_chk_parse` parses `gnunet://fs/chk/HASH1.HASH2.SIZE`. It reads each hash separately and parses the unsigned decimal `file_length`. `uri_chk_to_string` emits all three fields. A lone 103-character encoding of p56 is rejected as a complete CHK; two distinct hash fields plus size must be supplied by independent source material. Copying p56 twice and choosing size 42 can yield *syntactically* valid input but invents 576+ bits of structure and cannot establish content availability.

A canonical **2014 Base32hex** representation of p56's bytes (103 chars, final three zero pad bits) is:

```text
6OR7EOTBEDS3OUNIGH26OMA6DD6DCKP3J8OHPDOHDL31HNN0JA22B29TOT80MHIFRBOMEBBRTTF8I73E49Q5D296KIFR9T2H6B1AHD0
```

This exact value may occupy *one* of the two CHK hash fields. It is **not itself** `gnunet://fs/chk/` content. Parsing the genuinely period-correct original [`test_fs_uri.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/fs/test_fs_uri.c) CHK example succeeds in the reproduction harness; one-field p56 forms fail.

The historical [`uri_sks_parse`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/fs/fs_uri.c) requires `gnunet://fs/sks/NAMESPACE/IDENTIFIER`. **In 0.10.1 the namespace is an ECDSA public key of 32 bytes**, `GNUNET_CRYPTO_EcdsaPublicKey.q_y[32]`, not p56's bare 64-byte value; an external identifier string is also mandatory. Earlier 0.9.x source used a hash namespace, still followed by `/IDENTIFIER`. KSK is keyword-search grammar (`gnunet://fs/ksk/KEYWORD[+KEYWORD]*`), so reinterpreting the hex as an English keyword is no authenticated content-hash lookup.

### Freenet 2014: two keys fit only after an arbitrary split; mandatory extra field absent

Period-correct Freenet source is `hyphanet/fred` at [commit e9deac55, 23 December 2014](https://github.com/hyphanet/fred/commit/e9deac5502dc447f4ac00e6c5cd0d4474622feaf):

- [`src/freenet/keys/FreenetURI.java`](https://github.com/hyphanet/fred/blob/e9deac5502dc447f4ac00e6c5cd0d4474622feaf/src/freenet/keys/FreenetURI.java) gives `CHK@RoutingKey,CryptoKey,Extra`.
- [`src/freenet/keys/ClientCHK.java`](https://github.com/hyphanet/fred/blob/e9deac5502dc447f4ac00e6c5cd0d4474622feaf/src/freenet/keys/ClientCHK.java) fixes the encryption key at **32 bytes**, routing key at **32 bytes**, and demands **at least 5 extra bytes**. It explicitly throws when the extra field is missing; the extra encodes an accepted cipher algorithm, metadata flag and compression algorithm. Five bytes cannot be obtained from the printed 64 while keeping both 32-byte keys intact.
- [`src/freenet/support/Base64.java`](https://github.com/hyphanet/fred/blob/e9deac5502dc447f4ac00e6c5cd0d4474622feaf/src/freenet/support/Base64.java) uses the Freenet-specific Base64 alphabet ending `~- ` (without the space), rather than ordinary URL Base64.

An *illustrative, unauthorized* first32+last32 split would yield:

```text
CHK@NjZ3Y6tzeDx68oREbFlGa0zWUyOaMRy3EW1GGN7gmoQ,JYk9x1ALRk-a8Wcte~9eiRxuInRWiSakn7T0UTLCqLQ,<MISSING_EXTRA_5_BYTES>
```

This display is a demonstration of the field-size ambiguity, not a valid Freenet URI. The original p56 image gives no endorsed 32/32 split or values for the extra bytes. Its printed five-point ornament is insufficient to encode five typed bytes.

### Other 2014-era identifiers and archive visibility

The relevant I2P `.b32.i2p` address uses a 256-bit destination hash (52 base32 characters); a Tor-v2 onion host uses a much shorter 16-character base32 host encoding. Neither consumes the single printed 512-bit string as a canonical hostname without a separate operation selecting/reducing it.

A bounded public-web-index search of the **2014 GNUnet Base32hex encoding**, the Freenet split's first 43-character key, and the later GNUnet Crockford encoding returned no publicly indexed records of this supposed object. This is **not** a network DHT query, an archive-wide WARC exclusion, or evidence that every peer record has disappeared. No full historical CHK/SSK/SKS URI was obtained, so a real retrievable-object test cannot be specified without inventing crucial fields. Prior repository p56 archival work already excludes the unauthenticated pnotisdev mirror as a first-party continuation and finds no supported algorithm/preimage selector; it must not be reopened on a 512-bit width coincidence.

## Executed reproduction and decision

Read-only source-native Windows Node22 test: [`sims/lp2_p56_2014_dht_uri_gate_sft.cjs`](../sims/lp2_p56_2014_dht_uri_gate_sft.cjs). It checks the original 128-character hex/64-byte input, the exact 2014 Base32hex and Freenet conversions, strict binary roundtrip and nonzero pad rejection, the historical 2014 GNUnet CHK test fixture, and the absent-field rejection. **Windows Node22 PASS:** [GitHub Actions run 45287077002](https://github.com/FlareZ123/liber-primus/actions/runs/45287077002).

**Decision:** retire the strong interpretation “p56 as printed is a *complete* 2014 GNUnet/Freenet retrievable URI.” A weaker interpretation (“p56 is one 512-bit GNUnet hash operand whose second hash, size and file type are elsewhere”) remains *possible but nonoperative*: it needs an independent period-authentic clue selecting the protocol, the correct field, missing typed operands and accessible surviving data. A 64-byte width match alone neither selects GNUnet nor decrypts any unknown original rune. If new original evidence supplies the remaining fields, form the full 2014 URI and retrieve bytes, then compare the returned typed object with its field hashes and any proposed decryption receiver. Do not spend compute on a generic preimage or invented-field search.

## Independent source entry points

- GNUnet [0.10.1 `src/fs/fs_uri.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/fs/fs_uri.c), [`src/util/strings.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/util/strings.c), [`src/fs/test_fs_uri.c`](https://github.com/GNUnet-Mirror/GNUnet/blob/4a5c2f93a3c89526ca24f4711ba3f7b63c360ae2/src/fs/test_fs_uri.c).
- Freenet 2014 [`ClientCHK.java`](https://github.com/hyphanet/fred/blob/e9deac5502dc447f4ac00e6c5cd0d4474622feaf/src/freenet/keys/ClientCHK.java), [`FreenetURI.java`](https://github.com/hyphanet/fred/blob/e9deac5502dc447f4ac00e6c5cd0d4474622feaf/src/freenet/keys/FreenetURI.java).
- Original p56 archive JPEG 73 and canonical LP2 corpus under [`resources/liber-primus/`](../resources/liber-primus/). GitHub [Director issue #2433](https://github.com/FlareZ123/liber-primus/issues/2433).
