# LP2 p56 source-defined hash semantics gate

**Agent15, 18 November 2026. Director Issue #1664.**

## Decision

The p56 destination value is fixed exactly, but the surviving first-party corpus does **not** fix the hash algorithm, page serialization, canonicalization, HTTP byte boundary, or URL/body choice. Twenty-two exact source-byte candidates in the older tracked 2012–2016 set, including the 2012 onion registration screenshot, five 2014 Onion6 container/component objects and three representations of the newly recovered 2014 cu343 761 HTML carrier, have no SHA-512 or Whirlpool match (0/44 checks). Separately, #2987 tested nine exact representations of three 2012 participant-specific RSA message copies under SHA-512, with zero matches; see [the full byte-boundary table and reproducer](2012-rsa-participant-page-recovery.md#exact-p56-digest-decision-for-three-participant-specific-page-copies-director-2987). A further source-derived test of 38 sq6 host/URL/path and base32-decoded v2 service-ID representations, email, valid-participant RSA-modulus and PGP-signature representations, three decrypted response numbers/URLs, and the screenshot's explicitly illustrative number gives **0/76** SHA-512/Whirlpool matches; its Whirlpool known-answer control passes. These are exact candidate strings and archived objects, not successful HTTP response bodies. An additional period Onion3 preserved-response cohort now adds nine distinct exact byte objects, none matching under SHA-512 or Whirlpool (0/18); see the dedicated archive cohort below. No source-stated digest rule has been found. The separate local p49–p51 candidate set also gives 0/21 SHA-512/Whirlpool/BLAKE2b-512 matches; see the dedicated source-object preimage gate below. The p56 imperative selects an external-page search, not an established prerequisite to p0–55 decipherment; see the dependency graphs below.

A 2012 hidden-service lane is source-located, with two distinct book-code outputs: the Agrippa poem yields `sq6wmgv2zcsrix6t.onion` (preserved), while the Britannica 11th Edition `Cicada` entry yields `eq6emgv2ehsrix6t.onion` (reported lost; content and whether it was accessed are unknown). The latter is a plausible historical candidate, not a demonstrated p56 dependency. The repository preserves the signed /NUM instructions, three participant RSA challenge copies, the signed second-chance/MIDI message, and a source-pinned screenshot of the `sq6` enrollment form. The reproducible RSA response numbers are 33521494043430258676, 29201928111913239376, and 25121996842107342310; see [the consolidated participant-page recovery](2012-rsa-participant-page-recovery.md). The screenshot confirms the email/number workflow but does not contain the actual per-recipient /NUM token or the later response. The `eq6` page, `sq6` participant-specific `/NUMBER` response, and `cginiziglyaobyph.onion` second-chance page remain unavailable. No source-selected hash rule, LP2 key, or p56 preimage follows.

## Exact target from the original page

LP2 internal p56 is the solved “AN END” page; in the repository's 75-image full-book sequence it is original scan `resources/liber-primus/73.jpg` (the Onion7 release named the same page `56.jpg`). The printed hexadecimal lines are lowercase and have lengths 26, 25, 25, 27, 25:

```text
36367763ab73783c7af284446c
59466b4cd653239a311cb7116
d4618dee09a8425893dc7500b
464fdaf1672d7bef5e891c6e227
4568926a49fb4f45132c2a8b4
```

Concatenated target, exactly 128 hex characters / 64 bytes:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The solved instruction says that within the deep web there exists a page that “HASHES TO” this value. It does not print an algorithm name, media type, URL, request method, response/body distinction, text normalization rule, or canonicalization.

This exact transcription agrees with the previously frozen image-level audit in [p56-exact-digest-public-occurrences.md](p56-exact-digest-public-occurrences.md).


## New period Onion3 raw-response preservation cohort (Agent15, 28 November 2026, Director #3340)

A materially different archival input class is preserved in the [participant repository's 2014 Onion3 directory](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion): **actual captured raw response files**, not reconstructed URLs, quoted plaintext, screenshots, or the 22-object cohort already covered here. The [period technical account](https://github.com/micheloosterhof/cicada-2014/blob/d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa/stage04/README.md) explicitly records a first 512-hex response, a later 4 MB Onion3 response, and the leaked Apache `server-status` capture. The archived exact byte files and immediate byte-reversal / hex-to-binary products provide an independent raw-object test. A repository snapshot is an archive witness, not a proof of the live HTTP date or of Cicada's authorship of every byte.

Frozen digest gate: SHA-512 and Whirlpool (empty-message Whirlpool KAT checked), no guessed filenames, URL normalization, string repair or transformations beyond the archived raw objects and the two already-preserved binary extracts. Pin the actual Git source commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`; stream and hash the following files in `2014/005-third-onion/`:

| Preserved exact file | Bytes | SHA-256 integrity identifier | p56 SHA-512 / Whirlpool |
| --- | ---: | --- | --- |
| `onion3.raw` | 4,302,741 | `092f94edc1bf6fb3af01a53267de4f1905c790208337b02144008f187019cd48` | both miss |
| `onion3.bin` | 2,116,096 | `dc4f35f31d397549bab6f0aafdf77f7c8a848c5cb1b5c60920ada54bd88ab285` | both miss |
| `onion3-reversed.bin` | 2,116,096 | `2210bd417985343e06314313c2bd5fd97fa00195abc305f59e09cee4ff2a9bf6` | both miss |
| `server-status.raw` | 1,368,580 | `7e4e29ab17bf1b71e20b9f15f00780e8a345750cf47c550d22e131b1530e5d96` | both miss |
| `server-status.bin` | 673,066 | `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7` | both miss |
| `li676-224_server-status_new.html` | 1,370,851 | `52c1f32d7af62512a1c771cfc0f92beb6673841ed15639cc7198723a27c9f20d` | both miss |
| `infotomb-server-status.hex` | 4,373,266 | `2edf4e382d283fff8277f1aef491a879f9f6aac3a79e285f6af2e5217373795e` | both miss |
| `infotomb-server-status.bin` | 2,116,096 | *duplicate of* `onion3.bin` | both miss |
| `512.raw` | 524 | `471bad0e65ae01f6c0f69d65636f125a4eb47554291780ca1d880e9d44c7e508` | both miss |
| `512.hex` | 520 | `a70ebed61e1937e95b7cb30ec59a92b85d7ce0762c333bcd43f17f7d80cb8078` | both miss |

**Result:** ten preserved files, **nine distinct SHA-256 content hashes**, zero SHA-512 matches and zero Whirlpool matches to the exact p56 value (**0/18 unique byte-object/digest checks**). The two purported independent long Onion3 extraction artifacts `onion3.bin` and `infotomb-server-status.bin` are byte-identical, which prevents treating them as independent discoveries. The historical hex bodies, the second server-status snapshot and the shorter first response are independent files, but not evidence that the unknown p56 object belongs to any of them.

Evidence: [reproducible read-only pinned-object checker](../sims/lp2_period_onion3_raw_body_digest_sft.cjs) and [successful GitHub Actions execution, with every full 128-hex output](https://github.com/FlareZ123/liber-primus/actions/runs/46119217505). These checks expand an **actual body-preservation cohort** and narrow p56 candidates; they do **not** recover a preimage, establish which 512-bit hash is intended, or establish that 2014 Onion3 is downstream of LP2. A new continuation search should require a further genuinely new raw body or explicit target routing evidence rather than new encodings of these same bytes.

## LP2 p49–p51 local preimage candidates (Agent3, 26 November 2026)

The 256-cell p49–p51 panel is a natural adjacent local candidate for the printed p56 digest, but it is not part of the earlier 22-object external/archive set. Seven exact representations were checked under both SHA-512 and Whirlpool: original p49, p50 and p51 JPEGs; their release-order bytewise concatenation; the 256-cell table as base60 bytes and base59 bytes; and the literal 512-character token stream. Result: **0/21 matches**. The exact digest pairs and source-checking reproducer are consolidated in the [p49–p51 radix/preimage report](lp2-p50-radix-codebook-overlap-source-gate.md#p56-digest-preimage-gate-for-p49p51-source-material). This bounded negative does not choose the p56 hash algorithm or identify its external page.

## Does the p56 destination supply a prior decryption operand? (Director #3026, Agent8)

**Decision:** the source requires the pilgrim to *find* the matching page. It does not establish an edge from that page to the key for p0–55, nor require all earlier text to be deciphered before the page search. Treat the destination as a parallel continuation/validation objective and the external-key theory as conditional, not as a blocker on original-cipher research. The endpoint role is the more economical reading of the explicit instruction, but an authentic page carrying an earlier-page key remains possible.

### Independent source contrasts

The [original p56 and p57 scans](../resources/liber-primus/) and [known decoded reference](../resources/liber-primus/lp1-plaintext-reference.txt#56) place AN END before the final clear PARABLE. The p56 imperative is “IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE”; it contains no instruction to take a value from that page and apply it to a preceding page. AN END is a title, not a formal execution-order directive. P57's parable has no explicit destination or operand. The [complete p56 prime-totient control](lp2-p55-p56-p57-public-reset-backward-state-gate.md) independently recovers all 85 runes with a public prime sequence beginning at 2 and the one literal F hold; p57 is already clear. Neither known decoder consumes an external secret, prior page plaintext, or inherited p55 state.

The [original static Stage11 index](../resources/historical/cicada2014-onion7-original-index.html) exposes all 58 page links in one archived object. This removes a *delivery* dependency between pages, not a cryptographic dependency. The [2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc) explicitly names the book itself as the way, its words as map, meaning as road and numbers as direction. The exact wording supports deriving a route from the manuscript; it gives no digest family, URL or backwards key-extraction rule. “Seek and you will be found” is compatible with a recruitment/continuation endpoint. The [antecedent audit](lp2-2016-signed-path-antecedent-gate.md) does not establish a unique external text.

Compare these actual historical contracts (no new source acquisition or cryptographic replay required; reuse the [verified operation profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md)):

| Original witness | Typed inputs and outputs | Dependency selected by source |
|---|---|---|
| [2012 RSA-stage signed message](../resources/historical/cicada2012-message-only-displayed.asc) | Identifies encrypted number, named RSA implementation, supplied public key, and instructs entering decrypted number at same URL | Explicit ciphertext/key → decrypted number → next-step access; recipient-specific, not an LP2 operand |
| [2013 BASE29 signed command](../resources/external/2013-tcp-server-signed-source.md) | Decimal integer → specified base29 representation, with worked example | Explicit input type and conversion; not a later GP29 key |
| [2012 countdown signed message](../resources/historical/cicada2012-countdown-message.asc) | Check back at a named date/time | Checkpoint/continuation instruction; no statement that returned page supplies a prior cipher operand |
| [2014 Stage10 signed form](../resources/historical/cicada2014-sixth-onion-v2-form.html.asc) and [Stage11 redirect](../resources/historical/cicada2014-stage11-message.asc) | Previously obtained three squares and participant-operated contact channel → subsequent signed address → static LP2 delivery | Typed qualification inputs, then location output. The [callback audit](cicada2014-stage10-to-stage11-original-operator-gate.md) verifies the preserved generic redirect, not an individualized encrypted key |
| LP2 p56 | Page whose digest equals the printed 64-byte value → seek that page | Equality criterion and required search; no declared digest algorithm, byte representation, page content, output key, consumer or reverse dependency |

Historical typed input delivery is a useful design contrast, not a universal rule. The 2013 whitespace and 2014 OpenPuff examples show that operations may be inferred rather than spelled out. An implicit external LP2 key therefore cannot be excluded by imperative wording alone.

### Two fully specified dependency hypotheses

Use C = original p0–55 ciphertext and layout, L = solved p56/p57 plus already available LP1/earlier artifacts, D = p56 digest, X = authentic unknown page object, H = intended hash algorithm and serialization, N = independently available route to candidate objects, K = required decryption material, M = authentic p0–55 plaintext. These are variable types, not invented values.

**External-operand graph (E):**

```text
Static release -> C, L
Public local p56 decoder -> D
(N, D, H) -> identify and validate X
(X, independently selected extraction/interpretation) -> K
(C, K, independently selected inverse/clock) -> M
```

Only the local decode and instruction to identify a page satisfying the digest are established. N and H are unresolved; the two final arrows are the *hypothesis*. A full solution M cannot be the sole prerequisite for discovering X in this strict graph, because that creates the cycle M -> X -> K -> M with no initial operand. If earlier plaintext supplies N, this graph requires a independently decipherable prefix/section or an externally supplied route. This exposes an actionable bootstrap requirement: an E advocate needs a source-visible route to X independent of the still-key-dependent ciphertext, plus evidence that its content is typed as K.

**Continuation/validation graph (T):**

```text
Static release -> C, L
Public local p56 decoder -> D
(C, L, independently selected internal or other key source) -> K -> M
(N independent of M OR N derived from an independently solved part of M,
 D, H) -> identify and validate X
X -> continuation / final validation
```

The exact internal key/receiver is also unknown; T does not establish self-containment. It permits LP2 to be deciphered without X and permits a separate other historical key source. The instruction to seek the page can be pursued in parallel; it does not state that an authentic solution must precede searching. A hybrid is possible: independently decoded sections yield a route to X, and X then supplies operands for a remaining section. Such a graph must state the bootstrap section and the downstream consumer rather than treating all 56 pages as blocked by one object.

### Discriminating observations and allocation

1. **Supports E:** acquire an exact authentic X (with source-selected digest and byte boundary or a first-party locator), whose content independently specifies an earlier-page receiver/key. Freeze that binding, including scope, clock and operands, then demonstrate coherent previously unknown plaintext on held-out original ciphertext with exact forward encryption. A digest match alone only identifies the sought object, not its role. A hash miss is not a dependency observation.
2. **Discriminates against strict E:** independently recover authentic p0–55 plaintext with an explicitly reproducible original-source inverse that uses no X-derived data. A partial independently solved chapter falsifies only an E claim covering that chapter, not necessity for the remainder. Alternatively a complete authenticated X with an explicit post-solution-only action and no further key handoff would favor T; incomplete page captures cannot establish absence of an operand.
3. **Direct next acquisition:** the missing object is an authenticated *operand-to-consumer binding*, e.g. original X plus an instruction applying a defined value to an identified LP2 ciphertext interval, or a source-fixed inverse independent of X. A newly captured exact page body remains useful for the continuation objective and could provide the binding, but historical bodies without such a connection are lower-value for plaintext. Keep the separate archival acquisition lane open only for concrete new authentic objects; prioritize original-cipher/source-selector work in parallel. The Stage10 participant callback can be useful only if its additional authenticated content independently defines a key or route; the existing redirect does not.

No direct original receiver was executed: none of these known source imperatives independently selects an unknown-page operand or clock. No new hash guesses, live-service queries, numerical bridges or new plaintext claims. This is a source-dependency decision, not an exclusion of possible implicit keys, a proof of T, or a recovered destination.

## Adjacent final page p57: exact source-object SHA-512 gate

Because p57 is the final physical page immediately following the p56 hash page, test the narrow possibility that the target refers to the final book page itself or to its text. This does not assume p57 is the requested deep-web page; it is the most local adjacent-page candidate a solver could check before searching for an external page.

The reproducer hashes only source-grounded representations under SHA-512: original scan resources/liber-primus/74.jpg, original rune glyphs, canonical GP transliteration, one-byte GP29 indices, the exact p57 reference text, normalized words, and letters-only text. None matches the 128-hex target.

| p57 representation | Bytes | SHA-512 |
|---|---:|---|
| Original scan 74.jpg | 318,076 | 8efd1a0b4a52204387c1c61008c3df56405efbb5d39a6cfd3b6aec874ed7e91e33abcb55ba05dc921ba672f113332d18cbaea6f0b794b25c5193e250f9dc36c4 |
| Original rune glyph sequence, UTF-8 | 285 | 6263b30a8e3edd6c57a3a23224a3c6e1b5b2ad721b482ce0a2c149cb45a2b4ab5c590bd999a05648af361d48f7fdb438a910351227235b1fb23240041d9c221e |
| Canonical GP transliteration, no separators | 100 | 5648420362ad2344e5f10ffbcbbd73d307615426433c14f5566dce019b8eebdf588a80fc2cf8888b06709b4d75bd1b1f9e7a6bf390d10485a7d87d4b738cb42c |
| GP29 rune indices, one byte per rune | 95 | 9887ee7773ec7e2f800327cb457d00be80fbfdc7735ebac0c44999a8892dbceefef4213f5dfbcbd7747dac5c33dc2d703d43681eddde170305469e616d9706e5 |
| Exact p57 reference text, UTF-8 | 122 | e236a34de5a9ace3b55a3ccc2223c88d3a2ed23f3829f342d54a1bc718070c4a3e8452c36fa9d6b78e99594807182fa10ea3f315ad9dabd3a160a10bfa170d26 |
| Normalized uppercase words, single spaces | 120 | f1dd3fc790d6d88cbf3ef20289183babe236302c0e469076d16d5779a21cbf2fde38107b96050a38f45269ebb78a424672381a2e28138ee0c346f71fc1dc6d6a |
| Uppercase letters only | 101 | 552a9e34e276f5434228afab25e665e22d5026d581039db923f88cf01fb42a9c4c23ffc7bfd77f116b98e1da7a71ad797f906f3b3e74b8ed40b4e855e4d29973 |

The script asserts that none equals the p56 target and records the exact byte lengths: [sims/lp2_p56_adjacent_p57_sha512_sft.cjs](../sims/lp2_p56_adjacent_p57_sha512_sft.cjs). Its read-only Node 22 SFT passed in [workflow run 45433601598](https://github.com/FlareZ123/liber-primus/actions/runs/45433601598). This closes only the adjacent-p57 SHA-512 candidates above; it does not identify the deep-web page, select SHA-512 as the intended algorithm, or rule out another external page serialization.

## Authenticated-message semantic census

The new deterministic source gate [`sims/lp2_p56_firstparty_hash_semantics_sft.cjs`](../sims/lp2_p56_firstparty_hash_semantics_sft.cjs) originally scanned 16 pinned Cicada clear-signed messages dated 2012–2016 (historical snapshot; expanded to 21 in #3016 below) in `resources/historical/`.

It deliberately separates the OpenPGP armor header from the signed authored body. Results:

- 16/16 have clear-signature header `Hash: SHA1`.
- 0/16 authored bodies contain the bounded semantic terms `hash`, `hashes`, `hashed`, `hashing`, `digest`, `checksum`, named SHA families, Whirlpool, BLAKE, Skein, or Streebog.
- 0/16 authored bodies contain the p56 target or its first printed line.

Therefore the visible `Hash: SHA1` text is evidence about the digest used by the OpenPGP clear-signature packet. It is not an authored instruction selecting SHA-1, or any other function, for the p56 webpage.


## Period toolchain discriminator: GnuPG 1.4.11 defaults, not a p56 hash selector (#3016, Agent7, 26 November 2026)

**Decision:** SHA-512 is a defensible first candidate conditional on the documented GnuPG toolchain; no first-party source ties that toolchain's standalone digest command to p56. The 2012 public-key preferences are ordinary GnuPG defaults, and cannot select SHA-512 or rule out another external hash implementation. Do not launch an algorithm sweep; seek the missing source or an exact page object.

### Original key and period software

The exact `resources/historical/cicada-3301-2012-public-key.asc` (Git blob `d44aec389e2f346c6b9d149d4c61e890f62979c9`) has verified self-signature and subkey-binding signatures under fingerprint `6D854CD7933322A601C3286D181F01E57A35090F` (local GnuPG `--check-sigs`, both `sig:!`). The 2012-01-05 self-certification uses SHA-1 (packet digest ID 2). Its **hashed** preference subpacket 21 is exactly `08 02 09 0a 0b`: SHA-256, SHA-1, SHA-384, SHA-512, SHA-224. Symmetric subpacket 11 is `09 08 07 03 02`, compression subpacket 22 is `02 03 01`.

The original 2014 Stage10 and Stage11 messages carry the period GnuPG 1.4.11 armor version and actual signature packet digest ID 2. Inspecting the upstream **tag gnupg-1.4.11** establishes:

- [g10/keygen.c, keygen_set_std_prefs](https://github.com/gpg/gnupg/blob/gnupg-1.4.11/g10/keygen.c), blob `760e63a08bdc2316b4f435f94fa67626a0e4a422`: default hash list is exactly H8 H2 H9 H10 H11, symmetric S9 S8 S7 S3 S2 (optionally S1 if available), compression Z2 Z3 Z1 (Z3 if available). The three lists in the original key match the corresponding standard defaults. This is compatibility with default key generation, not proof of the creator's configuration or a custom riddle in the preference order.
- [cipher/md.c, load_digest_module](https://github.com/gpg/gnupg/blob/gnupg-1.4.11/cipher/md.c), blob `9ee0fa7e54faeb200a5874e49d4f28a886312ee5`: registers MD5, SHA-1, RIPEMD-160, and the build-conditional SHA-224/256/384/512 algorithms; only SHA-512 has 64-byte digest output. There is no Whirlpool entry.
- [g10/gpg.c, aPrintMD/print_mds/print_hex](https://github.com/gpg/gnupg/blob/gnupg-1.4.11/g10/gpg.c), blob `0142168e0417b8da6c94c4ab1056afe13805dd80`: standalone digest operation takes an explicitly named algorithm and reads binary file/stdin bytes, with no webpage canonicalization. Its ordinary 64-byte display uses uppercase hex and groups of four bytes; colon mode has a numeric algorithm field and a contiguous uppercase digest. Neither is the literal p56 lowercase, 26/25/25/27/25-character print layout. Reformatting is possible, but no source selects it or the command.

The later `resources/historical/cicada2017-yEiTHhvF.asc` (blob `f455e72159fc9fea9e3d89df835468ea67fe3cf4`) has a real SHA-512 RSA signature (packet digest ID 10, independently verified locally, `VALIDSIG` full fingerprint above, 2017-04-04). This is actual signed-message use, not merely the clear-sign header. It postdates LP2 by almost three years and its signed message is about signature verification. It does not establish the p56 algorithm.

### Bounded additional source scope

The prior signed-body census has now expanded to **21** local 2012–2016 clear-signed copies, all SHA1 armor headers; all 21 authored bodies had zero bounded hash-family terms and zero p56 digest-prefix matches. The five additional copies since the historical 16-copy census do not select an algorithm. The old SFT's hardcoded 16-file cardinality is removed in favor of the actual source count; the semantic assertions remain. This is an authored-body census, not a new signature authentication of every copy.

A distinct supplemental archive scan at [cicada-solvers/neuroretransmit-cicada commit b13600373d3400d75ec4208198019f3d92a304dd](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd) covered these 18 clear-signed objects (copies may overlap local originals), with zero authored hash/digest/checksum/family terms: 2012 `003-subreddit/posts/{8D7hN,KXLOP,vjuNp}.jpg.asc`, `005-845145127.com/img/{162667212858,everywhere}.jpg.asc`, `005-845145127.com/locations/cicada.asc`, `005-845145127.com/whitespace/whitespace.asc`, `008-second-chance/NHYLD.jpg.asc`, `012-necrome/necrome.asc`; 2013 `001-232.jpg/232.jpg.asc`, `002-3301/rootfs-contents/usr/local/bin/message.txt.asc`, `006-third-onion/{annapolis-md,okinawa-japan,standby}.txt.asc`, `007-fourth-onion/no-email.txt.asc`, `008-invitation/invitation.asc`; 2014 `001-twitter/zN4h51m.jpg.asc`, `002-first-onion/1033.jpg.asc`. The last specifies Crypt::RSA::ES::OAEP for a separate ciphertext, not a p56 page hash. No supplemental individual signature-verification claim is made.

Ten further archived HTML objects (2012 countdown/location/whitespace, sq6 enrollment and second-chance root; 2013 first-onion, second-onion everything-you-need/patience and third-onion Annapolis/Okinawa) contained only four embedded `Hash: SHA1` armor headers, no authored algorithm selector. The source-pinned original Cicada OS custom `cicada` and `prime_echo` scripts and message likewise give no standalone digest command. The apparent phrase “break this hash” in modern TryHackMe recreations substitutes for the original 2013 signed instruction to solve a riddle; it is not a Cicada source. The 2014 community hash discussions are leads, not first-party declarations.

**Fork:** the exact conditional toolchain restriction is useful for ordering a later exact-object check, but the antecedent (p56 uses GnuPG standalone hashing) is missing. This investigation produces zero preimage guesses and no new plaintext. Wait for an authentic algorithm/byte-boundary instruction or recover a specifically period-linked page body, rather than using the preference list to justify more algorithm searches.

## Preserved 2014 HTML semantic census

The same gate scans ten repository copies representing six unique Git blobs of preserved 2014 stage/onion HTML:

- Stage03 index
- Stage04 index
- Stage10 post-square response
- the 170-byte and 201-byte Onion2 variants
- the Stage11/Onion7 index, represented by five identical repository copies

Across those six unique byte objects there are zero occurrences of the bounded hash/digest/checksum/family terms and zero p56-target-prefix occurrences. These files therefore provide no surviving first-party webpage-hash serialization rule.

The copies are not independent witnesses and are not claimed to exhaust lost historical HTTP responses.

### Exact 2014 Stage03/Stage04 page candidates (Agent24, 23 November 2026)

The preserved Stage03 and Stage04 index objects are natural earlier-chain candidates for the p56 “deep web page” target. I tested the exact repository blobs and the two unambiguous payload boundaries (ASCII hex and decoded 256-byte payload) under the two 512-bit functions already motivated by the historical discussion: SHA-512 and Whirlpool. None equals the target.

| Candidate bytes | Length | SHA-512 | Whirlpool |
|---|---:|---|---|
| Stage03 exact page blob (resources/external/2014-stage03-index.html; Git blob c979fa7e23de1b04b502467da75ff5b506b97ff8) | 541 | be9ee498562df5a81c7a0db7dba23bb20a3e230dba1ab51ec5882275c3559352eaf37330437a260dc2d0f2139027f596e0872238d1d57b56b7c1eff699a7373e | 160ea5bc1dbb02376667f4e5b873c44660abe666cb33405d2a73b7147047f96e2fbe1b8754af9481ab3a1124f2ac601392b4aa05d60cdff70828d7e008e117a3 |
| Stage03 ASCII hex body | 512 | cc30bb42838d78c7be803673de8af61b537191dcc2d31bcc37b10f0d023c5771b383458e41d9db510ba201d86e05175551249cd838ca7cebc640c7d38a3ed211 | 8c154fc0637644b59c0a0241079a4e70d6206e52157512deee12897965ad1c228243f224813b47df73f4cd0c4c1e3701acb49c058f5e3243a47cdf330ec34fce |
| Stage03 decoded payload | 256 | 881fc9e850842a8765c86e020e854b5c49680e5027625ca45a7a2fca6b2093d57b35aecf1b3b40b0604e26f2421fd6b0884203cc68e9674fa4abfad4f904f5a2 | 97d39186b7c5e45f6915e3907dd8049d04f39f386375551f53b1e861f0c8b6f1452fe61e7976cbc2abdeaffde8e6067daf3c4597b2d16c5a5b68e282e146cdac |
| Stage04 exact page blob (resources/external/2014-stage04-index.html; Git blob 81837b8d5e89f6a31731b84a217a6fdeaa62aff8) | 524 | 8b88426ab9884bf7c23e07fa5f5e2c0a2092f79c0496fbf4dd3e1d149e8c4a91f312127f945846be071d5f6bc84e4853d7a426f8de00b6b464fedfc0af59ecfe | fe81c7ea2846612812042ce6522569f0fd9304a1002b35b2ffcfae038153ae6ebb2925bb5bd87dd82dbcea26ff534785226e0370280b1f1663f450b796929538 |
| Stage04 ASCII hex body | 512 | 524ef99542ccf8ee7232e37082e0232699ffe306438e8b223afbdd4fad906754fb52eb1c2a38635d860f0504636c68c5b3c86c6f3bb9e23d50a8da4b3c1cd681 | b33edcb42ca46d9c2a9c1c377155947721c25bfb87d9ede787e22a042413daf1a5b50f4a563f6074f837b4273c3e53b25c5156543109e47bbfb15516fc9356e6 |
| Stage04 decoded payload | 256 | 678fe2ae157719f5cc2b02d01c6646b92288e37f1e8e5a156db44282c660d25aefe9d17d365d2fb2a3ca796e2c0f3e192739d06638b86be9deaf3d8541e17dac | c4193d23c63d160596420536e4fd124c83c39eed2d25da1b7ca575a8e918e380e74a51f0f7f520a19fa7b73f5f5259499eafe0409c3ce37c5383716f6d5d4678 |

The Stage03 512-character hex body is byte-for-byte identical to the 512-character value in resources/2014-onion2-final-256byte-hex.txt (the authentic January 2014 Onion2 stream; the two repository blob IDs are c979fa7e23de1b04b502467da75ff5b506b97ff8 and cc631b0836032827021d20f3d2c805401c9ee439). Therefore the decoded Stage03 payload row also tests the Onion2 256-byte stream itself; it is not a separate untested candidate.\n\n
### Third 2014 onion and participant XOR output (Agent24, 23 November 2026)

The remaining original 3301-labelled preliminary 256-byte page is also a natural earlier-chain candidate. Its exact 512-character hex object is preserved at the external archive path neuroretransmit/cicada/2014/006-fourth-onion/avowyfg151kzfj3n_256.hex (Git blob 5fd99c0f6c0fe9f86c013f19880ba8179ccf9f0c). I tested both its ASCII-hex bytes and decoded 256-byte payload, plus the 256-byte result of the contemporary participant-authored three-way XOR (1033 ⊕ 761 ⊕ 3301). None matches the p56 target under SHA-512 or Whirlpool.

| Candidate bytes | Length | SHA-512 | Whirlpool |
|---|---:|---|---|
| 3301 ASCII hex | 512 | f9ade05de913286358bc4bcbeb600413c4a10afdc24f088f2d113f9bcf6f411f73b1fd453487b9111e49fcea90b3b988801151b1fe206a5cb251335cef7466b3 | e3c81918dbf7c9e4bd05dd8f048a42a27e80dded6dbdb351c82996466b38473101db45a74ce80359357b7dcc7c4e96d7f100a2eab027af416f256a938fb39f88 |
| 3301 decoded payload | 256 | ba7474bde659c5fa6008eae27f8ac9b0d5537eac6237771e3f5c9b6e2a1555f51ada4985ee6e1d15266be58e9e536f6d2b7b47732a4492c863f0ee21eba5b4b8 | 847aba84f8b9410d42d56a95b76362180842e317bf68921dff10e51a6cb0dfe9da7e364954ec0646deac8f5078fead5719e2f9e699c3257f5c9e9e1d66f59343 |
| Participant three-way XOR output (1033 ⊕ 761 ⊕ 3301) | 256 | 0949487eb2bac6110964abdcfd2283369ea832e829decad577cd17d936e07629508163c76139f1eb96596c12e104cca8441cc26c29204d19029b35c802a3c84e | c2335b424f90881e8dc45d2ceb78bb24dc6db8967e3384ac6a0a8abdfac469dc351b98af776eebdff9b6dce8e5151546fb034070eccffe3995c163e53210dfcd |

The XOR output is not an author-authenticated page or a Cicada-specified p56 preimage; it is included as a plausible derived-file candidate because the operation exists in the contemporary participant script. The 3301 candidate is an archived preliminary page, not the later gzip carrier. These tests reject only the stated exact byte objects and boundaries, not lost HTTP wrappers or other historical page versions.

Reproduction: run sha512sum FILE and openssl dgst -provider legacy -whirlpool FILE. For each page, the ASCII-hex body is the 512-character line after its HTML comment; the decoded payload is bytes.fromhex(body). This rejects only these preserved page/payload byte boundaries. It does not establish that lost original HTTP response bytes or other historical pages are absent.

### Authenticated 2014 Stage07 signed page: bounded original preimage exclusion (Agent29, 23 November 2026)

The earlier native Stage07 p56 workflow failed *before hashing* because its preliminary OpenPuff output check used ordinary CRC32 instead of the separately documented OpenPuff-native MSB-first CRC. Its retained source-specific hash script has since been reduced to the actual three exact byte candidates, and a fresh full Linux run **PASSED**: [GitHub Actions 45241551120](https://github.com/FlareZ123/liber-primus/actions/runs/45241551120), using [the frozen script](../sims/lp2_p56_stage07_page_hash_gate.py) and [manual workflow](../.github/workflows/agent9-p56-stage07-page-hash-manual.yml).

The run retrieved *both* pinned archives of original `q4utgdi2n4m4uim5.onion/index.html`, verified their byte equality and Git blob SHA-1 **afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9**, and verified the Cicada PGP `VALIDSIG` fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**. Independently recovered signed-body hex decodes exactly to both pinned **6,651,873-byte** Interconnectedness MP3 copies, Git blob SHA-1 **09fe068192b76a3697c47ec1d604b527703db798**.

| Source-fixed byte object | Exact length | SHA-512 begins | Whirlpool begins | Match to p56 under either? |
|---|---:|---|---|---|
| Original PGP clear-signed page as archived | 13,526,359 | `8350c7cb68e2477b` | `7ec36e9ef3780ff8` | no |
| GPG-recovered signed ASCII-hex body, with actual line breaks | 13,525,476 | `2b01950c64afa63c` | `47ae7d137d4bd6c2` | no |
| Original signed-hex-decoded MP3 bytes | 6,651,873 | `4b5c9e89b76f1cdf` | `4c15ec2e6db02a8b` | no |

For **each** of these three byte objects the completed run also tested **SHA3-512, BLAKE2b-512, Skein-512-512, and Streebog-512**, for **18/18 exact comparisons, zero p56 matches**. Known-answer vectors and original input identity checks passed; the complete 128-hex-character digests are printed in the CI log and retained in [the archived report artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45241551120/artifacts/14851078255). This is a negative for these precisely framed authentic source objects, **not** for any lost original HTTP wrapper, undiscovered deep-web page, alternate canonicalization, or unspecified digest algorithm. No unknown LP2 plaintext or key is supplied by the test.

## The misleading “liber-primus-hash-block” archive label

The archived signed object named `2014-01-liber-primus-hash-block.asc` does not supply a webpage-hash positive control. Direct inspection of the signed cleartext at krisyotam/cicada3301 commit `76d3ee8c762f60025822c8c05edbf31351636469` gives:

- OpenPGP header: `Hash: SHA1`
- authored cleartext: 34 lines of hexadecimal, 33×60 characters plus a final 2 characters
- total cleartext payload: 1,982 hex characters = 991 bytes when decoded
- p56 target occurrence: zero
- source-authored algorithm or webpage-byte instruction: zero

The independent signature timeline identifies the same signature as carried by the archived LP1 `liber_primus/00.jpg.asc` payload. The phrase “hash block” is an archive filename, not an instruction present in the signed body. It cannot be used as a positive control for p56 canonicalization.

## Positive-control decision

No authenticated page/hash positive control is present in the retained source set inspected here. A valid positive control for #1664 would need all three components together:

1. a first-party page or exact captured byte object;
2. a first-party stated digest algorithm;
3. a first-party statement fixing the bytes or serialization that the digest covers.

The preserved materials have authentic page artifacts and authentic signed messages, but no retained example satisfying all three components.

## Terminal-page visual handoff audit (Agent47, 20 November 2026)

Original LP2 scans were inspected in physical order, with p52 and p54 first and p53/p55 only for additional independent art/layout:

- **p52 / original scan 69.jpg:** grayscale JPEG (mode `L`), with a light ground, dark runes, bilateral vine/root border, and three-dot clusters on both margins. The apparent yellow/purple palette in the earlier display was a false-color rendering of grayscale values, not source color. No separate caption, key legend, or localized mark points from this page to a later page or selects a cipher operation.
- **p54 / original scan 71.jpg:** RGB JPEG, with the same bilateral border and three-dot margin clusters. Its large red initial and small red separator are genuine visible color features; the derived `lp2-ink-annotations.json` likewise labels the nine-rune span and punctuation at offset9 as red. The separator's positional role is already established as an ordinary word boundary, not a state opcode ([p54 separator audit](lp2-p54-tiny-red-point-original-separator-gate.md)).
- **p53 / original scan 70.jpg:** RGB scan with the same border motif and cicada engraving at the foot; its red text/arrow and 179-rune/51-rune annotated span are visible and already-known, and were not treated as new selectors.
- **p55 / original scan 72.jpg:** RGB scan with the same border and cicada motif, a central tree illustration, and the already-known terminal red marker. The tree/branch hypotheses have been tested separately: the p32/p55 silhouette correspondence is not a stable topology-preserving copy, the 29-tip count is threshold-unstable, and no branch traversal or rune order is selected ([p55 tree source-panel gate](lp2-p55-ghosttree-balanced-v2-source-panel-gate.md)).
- **p56 / original scan 73.jpg:** RGB scan with the exact 128-hex target and five black dots below the text. **p57 / original scan 74.jpg:** RGB scan with the clear PARABLE text and a point-cloud tree. These provide a repeated tree motif across p55/p57, but no leaf/node labels, traversal, or link to a specific target URL.

The repeated vine border and three-dot clusters, p53/p55 cicada engravings, p55 tree, and p57 point-cloud tree are real visible features. The p52 JPEG does not preserve color, so its palette cannot be inferred; p54 is RGB and its red initial/separator are visible. Taken together the imagery may indicate a terminal botanical/cicada motif, but it does not define a Merkle tree or any other exact handoff: there is no source-selected leaf set, node order, hash function, canonical byte representation, page URL, or rule connecting the illustrations to the p56 digest. “Tree + 128 hex digits” is an association, not a reproducible hash instruction. No new p55/p56 cipher or hash family was tested.

**Decision:** the p52/p54-first visual inventory adds no source-selected handoff to p56. The exact p56 digest remains a target whose algorithm, byte boundary, and URL are unspecified; the terminal art does not fill those missing inputs.

## Reproduction

Manual Windows Node 22 workflow run:

- [PASS 44420377403](https://github.com/FlareZ123/liber-primus/actions/runs/44420377403)
- head commit `8a8c86a5435cd8aace777ed8ddd674a3332c75bd`
- script: `sims/lp2_p56_firstparty_hash_semantics_sft.cjs`
- adjacent final-page candidate: `sims/lp2_p56_adjacent_p57_sha512_sft.cjs` — [PASS 45433601598](https://github.com/FlareZ123/liber-primus/actions/runs/45433601598)

## 2012 hidden-service page lane

Two independent archives preserve the original `sq6wmgv2zcsrix6t.onion` enrollment page:

- `neuroretransmit/cicada`, commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, path `2012/007-onions/sq6wmgv2zcsrix6t.onion/site/index.html`. The exact 1,788-byte file is mirrored at [`resources/external/2012-sq6wmgv2zcsrix6t-onion-index.html`](../resources/external/2012-sq6wmgv2zcsrix6t-onion-index.html), Git blob SHA-1 `03a7bd9e98578fd51ae3f798375cbbe8bc41dd96`.
- `iBotPeaches/cicada_3301`, commit `08a386a02570359c30eab8e5029d0b334178cdb1`, path `onions/sq6wmgv2zcsrix6t.onion/post/index.html`. The exact 1,740-byte file is mirrored at [`resources/external/2012-sq6wmgv2zcsrix6t-post-index.html`](../resources/external/2012-sq6wmgv2zcsrix6t-post-index.html), Git blob SHA-1 `adc9279bb7894612d1bf584f8f150ace23d27d66`.

Both pages contain the Cicada-signed enrollment message and the original email/number workflow. The embedded message verifies with the Cicada 2012 key ID `181F01E57A35090F`. The exact signed enrollment text is also preserved as [`2012-sq6wmgv2zcsrix6t-congratulations.asc`](../resources/external/2012-sq6wmgv2zcsrix6t-congratulations.asc). The page HTML is an archive copy, not an original server-side WARC/HTTP capture.

The pinned [`2012 two-book-code README`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/006-two-book-codes/README.md) distinguishes the Agrippa-derived `sq6wmgv2zcsrix6t.onion` from the Britannica/Cicada-derived `eq6emgv2ehsrix6t.onion`. The [`007-onions` README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/007-onions/README.md) preserves the former and records the latter as missing. The community [2012 history](https://uncovering-cicada.fandom.com/wiki/What_Happened_%282012%29) says `eq6` is long gone and whether anyone accessed it is unclear; the [missing-information list](https://uncovering-cicada.fandom.com/wiki/List_of_missing_information) still asks what it hosted. These are archive/community status records, not first-party proof of its content. The [`008-second-chance` README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/008-second-chance/README.md) names `cginiziglyaobyph.onion` as the second-chance hidden service. A [2014 participant archive](https://gist.github.com/tekknolagi/8526671) and a [2019 reconstruction](https://connortumbleson.com/2021/04/12/the-cicada-3301-mystery-puzzle-1-extra/) describe the `sq6wmgv2zcsrix6t.onion/NUM` flow and a one-time page response. These are retrospective/participant records, not the original server response; the specific path token in a 2021 account is not treated as first-party evidence.

The [2012 exact-object SHA-512 gate](../sims/lp2_p56_2012_second_chance_page_sha512_gate.cjs) now tests ten source-pinned byte objects plus two verbatim response quotes. The workflow verifies the PGP signatures where the archive supports verification. The `quaetrix0@gmail.com.asc` participant-specific RSA message is the only valid signed participant version identified by the [2012 RSA-email archive README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/008-rsa-emails/README.md); the other two participant mirrors are explicitly unverified because their signatures do not verify, as documented in [2012 RSA participant-page recovery](2012-rsa-participant-page-recovery.md).

| Exact object | Bytes | SHA-512 | Authentication |
|---|---:|---|---|
| Independent archive `post/index.html` page | 1,740 | `3d30dfbf6e20e2cb39c7c998c09f5f5af33260432de48c10ec0fe995da5d879d2633f0b8bd38d67ffbd016b60d051e4b5d8a91f44d465d1c1d928813906f8647` | Embedded Cicada-signed enrollment text |
| Cicada-signed congratulations/enrollment message | 1,433 | `867ee784d2dc4005d61f79d64f347ea57baa0971646675e42c0101e55538a257a021a05ae60bd8631d3dc429092a2c8a20eb6e2a5c72f7502249484083a7e5af` | Cicada PGP signature verifies |
| `sq6wmgv2zcsrix6t.onion` root HTML | 1,788 | `71ae971c27c3852bb4648b7b3bd973568fe25ee8dfc930eb35010f40c0056d8fc9040069cfd0c17a194dbfb99b2c95e61a0dd0967bb2405833421712719e9fbb` | Embedded Cicada PGP message verifies |
| Participant-mirrored one-time RSA page message | 2,537 | `d2f227ba5f26703362a23b1fb4c4840d46725040a1a231c9ad0b8b2a010b4951afcb209f0a68fe8a46a38080ac1266d480d74fd5593ea4221c9302428f037e98` | Provenance-qualified mirror; signature does not verify |
| Participant-mirrored second-chance RSA page message | 2,476 | `c48d28701e8bef1ee797a868d6d5e7f68be6f863ea86192bccbab602d3c94fcdd4b49040b90aca222ac87aaa696e74a5a9b64655cd2f665d74e1145be3e491d7` | Provenance-qualified mirror; signature does not verify |
| Valid participant-specific RSA message (`quaetrix0`) | 2,500 | `636d263618569bb1e34b0c27a7e5c230aa2639e5aa890479a89d2331b01bbf5ad745dd9c9312ba03ea7911acb5bf7b9c8b82528d3e18e607f6234739d9fd67b5` | Cicada PGP signature verifies |
| 2012 countdown clear-signed message | 1,001 | `a8e36a66c6536bee3d42a92664c05183b3e755084363f1e75f9c150dfb33e0d924524485f67fac0342a0f1f3241566f05968ddbd0b72b90ffd2818d8740bf6c5` | Cicada PGP signature verifies |
| 2012 one-time RSA page clear-signed message | 2,494 | `ea3eabb162d45dc3dbc7ac1ef5dd2b5236e7e7232645cb1e9a6c71565122098a0e109c2489342273b7cedd98fb68608cf56279da9f3992ba8a55f6fa304d6225` | Cicada PGP signature verifies |
| 2012 second-chance MIDI follow-up email | 4,322 | `9e1eb8c3871c68da5487eaf96989a149b7690d5bf2d38d25aa8013b68e3f554ec40b21fbd4416d5812c6f72c24837750e6333fd04fa862fa04eea60d461ea189` | Cicada PGP signature verifies |
| Signed literal `Cicada.mid` attachment | 10,889 | `64b8c44bab17868fc9ef72bd7621426ecef3f41f93d5d3d3eb283bf4c1c602f5b9add0fd235443e7069ad9664e2c3333dcde1a29564d9fd8c00aaa4fae013f0d` | Embedded Cicada PGP signature verifies |

The two source-reported one-time response strings were also tested as literal UTF-8 bodies, not as reconstructed HTML: ASCII `Correct. We'll email you.` (25 bytes, SHA-512 `dd75b989c2a5fbaeab40e3a3d9380fcf45b7a006a45be5813718555ec4e4fd14eb6b2df6dbd550b17cb38588864ab6f28e031903e088a6c1cedfa19662b9a703`) and the archive's typographic `Correct. We’ll email you.` (27 bytes, SHA-512 `5049d92559766603a2be7bda3752a83a75fcfc60aece9826771ccb218d8dc4d80e5bec6cfe42a6eb8c082083925fe5d78e85bf27e1c0b137ec938f0a6e1225d4`). Neither matches. These are retrospective verbatim quotes, not original response bytes.

None of the ten exact objects or two quoted response strings matches the p56 target under SHA-512. This is a candidate-specific negative, not proof that SHA-512 is the intended digest family or that no page on these services matched.

**Precisely missing:** any page/HTTP entity from `eq6emgv2ehsrix6t.onion` (if it was ever accessed); the original per-recipient email or equivalent server log containing the `sq6` `/NUMBER` token; the original HTTP entity for the `sq6` `/NUMBER` response; and the original `cginiziglyaobyph.onion` second-chance page. The new screenshot is only the `/cgi-bin/get_email` enrollment form, not the dynamic response. Do not infer `eq6` content from `sq6`, or treat the screenshot's example number as an actual token.

The `Dukotah/cicada3301` CDX log (commit `4aba42eeafc7434cec49041d5095bc843e23e964`) covers the `sq6` and `cginizi` hosts. Separately, the broader [Phase 52 archive audit](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase52_an_end_archives.md) explicitly includes `eq6`: it harvested 528 URL strings from 1,333 text files, enumerated 34 v2 onion hosts, and queried 14 gateway forms per host (`.onion`, `.onion.to`, `.tor2web.org`, `.tor2web.io`, `.tor2web.fi`, `.onion.city`, `.onion.cab`, `.onion.link`, `.onion.ws`, `.onion.sh`, `.onion.nu`, `.onion.lt`, `.onion.direct`, and `.d2web.org`). The `eq6` row is **none**: no Wayback CDX captures. Its [query script](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/phase52/cdx_query.py) confirms the generated host/gateway queries. The same audit reports 124,017 digests over 3,739 candidate files and zero full-512 matches. It queried Wayback only; archive.today, Common Crawl and tor2web-era mirrors outside Wayback were not. This closes the bounded Wayback path for `eq6`; it does not recover the page or prove it was never accessed. A separate [R12.5 archive record](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/corpus/records/R12.5/README.md) and [R12.6 record](https://github.com/jaxonkuipers/cicada3301/blob/47f32a9e94061953ab25fdd5052996c27a86c002/corpus/records/R12.6/README.md) likewise mark the participant page/recipient material as unavailable. These are independent archive-status observations, not proof that private participant copies or every non-Wayback archive are exhausted.

### eq6 non-Wayback acquisition attempt (Agent50, 26 November 2026; #2955)

A separate indexed GitHub exact-hostname search returned the previously known neuroretransmit and Phase52 records, wiki mirrors, and two additional source leads:

- [Liberpedia's pinned Britannica replay](https://github.com/jelliottdev/jelliottdev.github.io/blob/a6771afd146c736fc0a58d67cfd8af7089e39515/reference/articles/britannica-book-code.txt) reproduces the mixed-case address from the historical clue, but explicitly does not establish historical service operation or provide any response. The associated exported coordinate trace is a book-code reconstruction, not a new page object.
- [Optimisticninja archive](https://github.com/cicada-solvers/optimisticninja_cicada3301/blob/c895e6b3b43d06dd2071fdab12694f73c2805c12/2012/03.subreddit/05.two_book_codes/README.md) reproduces the address and labels it never used without presenting a dated access record. This does not prove it was never accessed.

Public exact-hostname searches, including pre-2015, Reddit and Pastebin restrictions, produced no contemporaneous response body or access record in returned results. The [Dukotah community archive gap inventory](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/GAPS-C.md) identifies missing 2012-era predecessor-channel logs, so absence from indexed search cannot exclude those logs.

The bounded non-Wayback acquisition attempt has now tested several distinct archive channels. A challenge or rate-limit response is an access failure, not an empty search result:

| Channel | Exact query | Outcome |
|---|---|---|
| Common Crawl | `https://index.commoncrawl.org/CC-MAIN-2012-index?url=eq6emgv2ehsrix6t.onion&output=json&matchType=domain` | Web retrieval inaccessible; direct container DNS also failed |
| Common Crawl | `https://index.commoncrawl.org/CC-MAIN-2014-52-index?url=eq6emgv2ehsrix6t.onion%2F%2A&output=json` | Web retrieval inaccessible |
| Arquivo.pt | `https://arquivo.pt/textsearch?versionHistory=eq6emgv2ehsrix6t.onion` and `https://arquivo.pt/textsearch?q=eq6emgv2ehsrix6t&maxItems=10` | Web retrieval inaccessible; direct container DNS also failed |
| Archive.today | `https://archive.ph/eq6emgv2ehsrix6t.onion`, `https://archive.today/http://eq6emgv2ehsrix6t.onion/`, `https://archive.is/http://eq6emgv2ehsrix6t.onion/`, and `https://archive.ph/http://eq6emgv2ehsrix6t.onion.to/` | Web retrieval inaccessible; homepage accessible; indexed exact-host searches restricted to archive.ph/is/today/li returned no results; separate browser navigation failed before delivery |
| Archive-It | Quoted exact hostname and unique hostname token through OpenSearch; 2012–2014 domain-matched root through CDX/C | All three HTTP 200 responses were the same 470-byte rate-limit HTML page, SHA-256 `40a0457e763902ed12097cffc3536f1e9a2306a95a701ab2df18f7d47e2b9c39`; one quoted-host retry after cooldown returned the identical body |
| 4plebs | Exact token `eq6emgv2ehsrix6t` on /x/ and /pol/, 2012-01-01 through 2013-12-31 | HTTP 403 for both; 415,581-byte Cloudflare challenge HTML; its published board list excludes /b/ |
| TheBArchive /b/ | `https://thebarchive.com/_/api/chan/search/?board=b&text=eq6emgv2ehsrix6t.onion&date_start=2012-01-01&date_end=2013-12-31` | HTTP 403 Cloudflare challenge, 5,913-byte HTML, SHA-256 `4a76f63145d288fdd2fc19668b20d41619f0841f07af29567d59e11d13c627b6`; no JSON or result set |
| Oldfriend Archive | `https://old.sage.moe/_/search/text/eq6emgv2ehsrix6t.onion/order/asc/` | HTTP 503 JavaScript challenge titled “Wasting CPU...”, 9,553-byte HTML, SHA-256 `d599ce86ce1ebf7b59114a1d69d51afd844eb0ff46cf61a5ef1ce3a2631a71e4`; no exact-host occurrence or result set |

The [Common Crawl collection manifest](https://index.commoncrawl.org/collinfo.json) itself was retrievable. Its 2012 collection begins 27 January 2012, so it has no coverage of the earlier part of January, independently of any query result. The Archive.today homepage documents host/exact-URL snapshot searches, but the inaccessible requests above are not completed index queries. Archive-It is the partner archive corpus, not the general Internet Archive Wayback index; its CDX documentation separately notes that its global /all endpoint is temporarily blocked because of DDoS activity.

**Board and corpus coverage matters.** Desuarchive began archiving in 2015 and does not include /b/; Warosu's published board list also excludes /b/, so neither is a useful 2012 /b/ source for this target. TheBArchive's archived FAQ describes it as a full /b/-only archive with search, making it the relevant board-specific candidate, but the documented FoolFuuka API request was blocked before search. Oldfriend is text-only and mostly contains 2006–2008 posts; its source inventory includes Wayback crawls of 4chanarchive.org/chanarchive.org from 2006–2013 and the 2011 k47 archive, so it is a plausible but partial historical corpus. Its documented global-search route was blocked by a JavaScript challenge. These coverage descriptions justify the tests; they do not prove that either corpus contains the specific 2012 thread.

**TheBArchive exact-host reproducer:** [SFT](../sims/lp2_eq6_thebarchive_exact_host_search_sft.cjs), [preserved response metadata](lp2-eq6-thebarchive-exact-host-output.json), [workflow run 45881674370](https://github.com/FlareZ123/liber-primus/actions/runs/45881674370). The request used the FoolFuuka `/_/api/chan/search/` endpoint with the exact hostname, board `b`, and 2012–2013 date bounds. It returned Cloudflare's “Just a moment...” page, not JSON. This is an access failure, not a no-capture result.

**Oldfriend exact-host reproducer:** [SFT](../sims/lp2_eq6_oldfriend_exact_host_search_sft.cjs), [preserved response metadata](lp2-eq6-oldfriend-exact-host-output.json), [workflow run 45882374050](https://github.com/FlareZ123/liber-primus/actions/runs/45882374050). The exact-host global-search route returned the “Wasting CPU! Enable JS to continue” challenge, not search results. This is an access failure, not a no-capture result.

**Decision:** No newly tested source returned a valid searchable result set or a byte-preserved page/access record. The exact historical input still missing is either (a) the response body and headers served by `eq6emgv2ehsrix6t.onion`, (b) an independently dated participant record binding that exact host to the returned page, or (c) a queryable archive index containing the relevant /b/ thread or imported text. No page-body p56 digest comparison is possible; the separate bounded eq6 identifier-as-preimage check is recorded below. This bounded source-channel/access conclusion meets #2955's completion criterion; it does **not** prove the host was never accessed or that no archive copy exists. Do not repeat these exact queries or start another generic archive hunt. Reopen only if a JavaScript-capable access route, a genuinely new archive corpus, or an independently dated participant-held object becomes available.

### SHA-512 and Whirlpool follow-up on preserved 2012 page objects and the enrollment screenshot (Agent1, 26 November 2026)

The three preserved page/source objects (the `sq6` root HTML, independent post-page HTML, and signed enrollment message) were rehashed under SHA-512 and Whirlpool. A fourth object is now source-pinned: the archived screenshot of `sq6wmgv2zcsrix6t.onion/cgi-bin/get_email` from `cicada-solvers/neuroretransmit-cicada`, commit `b13600373d3400d75ec4208198019f3d92a304dd`, path `2012/007-onions/sq6wmgv2zcsrix6t.onion/screenshots/6mBiv.jpg`. It is 123,011 bytes, Git blob SHA-1 `908ec5b74fd99ff9bf5a440e1685ca317dc88c26`, SHA-256 `07d3c4539437192017f5dd9f8faa31097b7b92beac0a91617f2cb49c40d8db3f`.

The screenshot shows the enrollment form at `/cgi-bin/get_email`: create a new public email address, wait for the emailed number, then append that number to the onion host root. The displayed number `3894894230934209` is explicitly an example, **not** a recovered participant token. The screenshot is not the dynamic `/NUMBER` response or an original HTTP entity.

The same source archive records the separate Britannica-derived `eq6emgv2ehsrix6t.onion` host as missing. The community history says it is long gone and whether anyone accessed it is unclear. It is a plausible historical candidate for the p56 handoff, but there is no surviving page object to hash and no evidence tying it to p56. The Phase 52 audit cited above includes `eq6` in its 14-gateway Wayback CDX sweep and found no captures; the subsequent Common Crawl, Arquivo.pt and Archive.today attempts documented above could not retrieve query results; other non-Wayback tor2web mirrors remain untested.

The reproducible script is [`sims/lp2_p56_whirlpool_2012_onion_pages_sft.py`](../sims/lp2_p56_whirlpool_2012_onion_pages_sft.py); [workflow run 45800628837](https://github.com/FlareZ123/liber-primus/actions/runs/45800628837) completed successfully with OpenSSL 3.5.5 and a passing Whirlpool `abc` known-answer control. Raw results are preserved in [`lp2-p56-whirlpool-2012-onion-pages.json`](lp2-p56-whirlpool-2012-onion-pages.json).

| Exact source object | Bytes | SHA-512 | Whirlpool | p56 match |
|---|---:|---|---|---|
| 2012 enrollment root HTML archive copy | 1,788 | `71ae971c27c3852bb4648b7b3bd973568fe25ee8dfc930eb35010f40c0056d8fc9040069cfd0c17a194dbfb99b2c95e61a0dd0967bb2405833421712719e9fbb` | `faf07bed5678a8f7941f897d3a23e6604fb57d1146a01fc5d24041d7b6e23702801a5f5248054b0afebb7d3cb80d7215d57340f8a0b079b1f6c7858f49d6c052` | No |
| 2012 post-page HTML archive copy | 1,740 | `3d30dfbf6e20e2cb39c7c998c09f5f5af33260432de48c10ec0fe995da5d879d2633f0b8bd38d67ffbd016b60d051e4b5d8a91f44d465d1c1d928813906f8647` | `5c58d78fd0e98cb28515e99b48b16dd41efb609d8a0b692a8231fbcafe018941ad498f93cc420df3a3fe204d1f2a4a409732617c3c2bdcfea2dc4edee0fba62b` | No |
| Cicada-signed enrollment/congratulations message | 1,433 | `867ee784d2dc4005d61f79d64f347ea57baa0971646675e42c0101e55538a257a021a05ae60bd8631d3dc429092a2c8a20eb6e2a5c72f7502249484083a7e5af` | `744abf2090a3af8bf3c09c3f8b5438421ffe3a962fdff284919640b4ed39c229395070a9ef5a171a343c280b7c203288aec5e0b044c53ca286a51720cd3957be` | No |
| Source-pinned `/cgi-bin/get_email` screenshot | 123,011 | `69a0c8a8c79e671f025788a061f83cc33d44b4d58c45b391c3a9aae2f0268d76c996ea4ce098f6f25a9d83323a7e09c1be8cf33713a0ea32ad31ea066ac928fa` | `f8d047c8d39f081b596214164f8259feb79b614bb0087899b2983671d4089bf0ac9a0c40ffd46873f5ead8bf82d5ee08d1d315c3afc354834bf3cdd7c7c85966` | No |

**Result: 0/4 exact objects match under either algorithm.** The three page/source objects were already among the prior 13 frozen 2012/2016 source byte strings; the screenshot adds one, bringing that subset to **14**. The separate [2014 Onion6 component gate](lp2-p56-2014-onion-directory-and-stage11-index-hash-gate.md) tests five further exact objects (the complete container plus four JPEG streams), with **0/10** SHA-512/Whirlpool matches. Including the separately recovered [cu343 761 HTML/hex/packed-body test](lp2-p56-2014-onion-directory-and-stage11-index-hash-gate.md#5-newly-recovered-2014-cu343-761-html-and-payload), **22 tracked exact source-byte objects** have no match under either algorithm (0/44). This excludes only the preserved objects; it does not recover the missing `eq6` page, the `sq6` recipient response, or the p56 target page itself.


### Source-derived sq6 identifiers and RSA path values (Agent3, 26 November 2026)

A bounded test hashes **38 exact source-derived byte strings** under SHA-512 and Whirlpool: the sq6 onion host, bare host label, HTTP/HTTPS root forms, root slash, enrollment URL and path; the participant email address; the valid-participant RSA modulus as decimal text, both `e:n` / `n:e` text orders, minimal big-endian bytes, canonical `RSAPublicKey` DER and `SubjectPublicKeyInfo` DER; all three reproducibly decrypted participant response numbers and their HTTP/HTTPS URL paths; the enrollment screenshot's explicitly labelled example number and its HTTP/HTTPS URL paths; and eight components of the PGP signature on the valid-participant message (exact armor, armor without the version line, base64 text, decoded binary packet, issuer key ID in both cases, version string, and CRC24). The 16-character v2 onion label was also base32-decoded to its 10-byte service ID and tested as raw bytes, lowercase hex, and base64. Result: **0/76** target matches. OpenSSL 3.5.5 Whirlpool was checked against the `abc` known-answer digest and passed.

The exact candidate bytes, lengths, DER construction, target, algorithms, and positive control are reproducible in [`sims/lp2_p56_sq6_identifier_hash_gate.py`](../sims/lp2_p56_sq6_identifier_hash_gate.py). This is a deliberately finite test of source-located identifiers and key/path representations, not a search over arbitrary strings. It does not test the missing initial `/NUM` token, a successful response body, unarchived page content, other participant-specific RSA moduli, or every possible serialization/algorithm. Therefore it excludes only these exact candidates; it does **not** disprove a relationship between p56 and the 2012 sq6 route.


### 2012 onion identifier-as-preimage gate (Agent50, 26 November 2026)

Two source-derived 2012 v2 onion candidates are now tested against the p56 target:

- `eq6emgv2ehsrix6t.onion`, from the 29-volume Britannica book-code route.
- `cginiziglyaobyph.onion`, from the second-chance route: the PGP-signed `NHYLD.jpg.asc` message gives 22 coordinates into William Blake's *The Marriage of Heaven and Hell*, and the pinned community reconstruction's book-code script yields this onion. Its README reports that users then received the same message as at `sq6wmgv2zcsrix6t.onion`; this is secondary reconstruction, not an archived byte-identical page response.

For each host, ten source-located forms were tested: full host, bare label, host with trailing slash, HTTP/HTTPS root URL with and without slash, and the v2 service ID as raw 10 bytes, lowercase hex, and base64. Four common 512-bit digests were applied: SHA-512, Whirlpool, BLAKE2b-512, and SHA3-512.

**Result: 0/80 matches** (0/40 for each host). The Whirlpool implementation passed the standard `abc` known-answer control. Exact candidates, input lengths, all digest outputs, the target and scope are reproducible in [`sims/lp2_p56_2012_onion_identifier_hash_gate.py`](../sims/lp2_p56_2012_onion_identifier_hash_gate.py); the compact result is preserved in [`lp2-p56-2012-onion-identifier-hash-gate.json`](lp2-p56-2012-onion-identifier-hash-gate.json).

The second-chance page's own bytes remain unavailable. A third-party archive corpus contains empty CDX results for the cginiziglyaobyph host across its tracked archive variants; this is not proof that no capture exists. The test rejects only the **identifier-as-preimage** interpretation for these exact forms. It does not hash either page body, unknown paths, headers, or alternate page serializations, and it does not establish either host as the p56 destination. Do not expand this into guessed paths or an unconstrained hash-family sweep.

## 2013 xsxnaks second-onion HTML pages (source-selected candidates; bounded negatives)

The first-onion route reaches the 2013 xsxnaks second-onion service. Two page bodies are preserved in the pinned community archive, distinct from the 14 raw 2013 source files already tested by the original-onion-copies gate:

1. **“Patience is a virtue” v1** — exact 129-byte body, Git blob SHA-1 `7f591aaf6754b6b0a4acf27f912241a40a5c47b5`, stored at `resources/external/cicada2013-xsxnaks-patience-community-copy.html`. SHA-512 `624844a3916421808a4c7f20a1482d2255976cc50712106d4c3cea04c13effaddd856a575b3f95ae6788778e25d7b311d6b00b393ffb69f52c81ccda1e11cc49`; SHA3-512 `4a67bc37f556238c7d75cb76d1bd9ec5674e295e22d107c7eca01636d245d08980b8044bfbe3940594ef87a318b191451c9bbf63c56608b085c9cf0bf23c5d9b`; BLAKE2b-512 `e0ab66075243343043f3a5cf02867ca3a14568e4abdf50875fbae305e78b06f522b0d9f1164308061171d4f105e6c0ac2dac7b17f1d76d05b7497c52c25f61dd`; Whirlpool `4a9f6f09df30458692096161f7e506ba7609bea7650b7aac4da5d621156ef2bfadcf0843246376af5569a269968033e318572611ebc3727da6c686d3e6ce007a`.
2. **“Everything You Need” signed page** — exact 1,089-byte body, Git blob SHA-1 `a156f08ce4291d09e4d3420af1d77c74e190695c`, stored at `resources/external/cicada2013-xsxnaks-everything-you-need-community-copy.html`. Its embedded `<pre>` block is byte-equivalent after line-ending normalization to the separately preserved clear-signed `.asc` message. SHA-512 `04b1f88ef220b7bd5381cba46d0361fda7c570d6c7d547a3c43ad64beb3cb516aba99a53c7279dc709254ae3d0e0204aebb3ae2e289e1d0e771ace1c871c980f`; SHA3-512 `8e81e5b1e7c5784a349998019c4d5a7d92ea5aa4a0980d0cb834df49ea2050f6c9f677d482fa19e202c15a0c500d21936229d896449461bd60ce2ca64d3676f2`; BLAKE2b-512 `d72b4e1e6c65192c972da0378070b96368255b0b4455b9e9cd5aeaa82a3ea69a9508a1f0c5f8bc979de7e303c1dad0bce0c7be77ceb7c2ee236b78d76f1ee914`; Whirlpool `f1945b4f8ffffe3b8fb81c421f699db7cb094ce822518f5450149a5b7b25a8dd6a82b29d29fc7f744bbff405ebea3c9255fd7ffd2055cbbd144c4b889a2e1750`.

All eight comparisons miss the p56 target. The second page's SHA-512/SHA3/BLAKE2b results are reproduced by Windows Node 22 [SFT run 45500035222](https://github.com/FlareZ123/liber-primus/actions/runs/45500035222); its Whirlpool result was computed with OpenSSL's legacy provider. The first page's three Node hashes are reproduced by [SFT run 45499202553](https://github.com/FlareZ123/liber-primus/actions/runs/45499202553), with Whirlpool independently computed by OpenSSL. Reproducers: [v1 SFT](../sims/lp2_p56_xsxnaks_patience_html_hash_sft.cjs) and [signed-page SFT](../sims/lp2_p56_xsxnaks_everything_html_hash_sft.cjs).

Both files are community archive copies pinned to `neuroretransmit/cicada@6c6d3318414775f7febce3c982607039e70f176d`, not original 2013 HTTP entities, WARCs, or signed HTML objects. The embedded PGP message is signed; the surrounding HTML is not. These tests do not exclude a lost original server serialization or headers, other unpreserved page objects, or an unspecified digest algorithm.

## Expanded 2014 archived byte and MPEG frame gate (Agent14, 26 November 2026)

Retrieved the actual machine-readable [artifact from run 45729721208](https://github.com/FlareZ123/liber-primus/actions/runs/45729721208), artifact 15075842672, ZIP SHA-256 `5a1f89699e3354c4f6864005043fc1b4986466cfa8342cf041ef1568639beee8`. Archive: `krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469` (community copy). Results:

- 49 relevant HTML paths, 17 unique 2014 page blobs: 34 exact raw-byte SHA-512/BLAKE2b-512 comparisons, zero matches. Some overlap earlier archive gates.
- Four preserved third-onion status snapshots: eight comparisons, zero matches.
- Stage07 archived MP3 (Git blob `09fe068192b76a3697c47ec1d604b527703db798`, 6,651,873 bytes): ID3 ends at byte 54; 10,610 valid MPEG frames, no Info/Xing frames, no resynchronization, no trailing bytes. The 9,133rd one-indexed frame starts at byte 5,725,258 and is 626 bytes. The raw file, frame stream (with or without Info removal, identical), and frame 9133 are negative under both digest algorithms. The proposed total frame count of 9133 is specifically false; the independent filler interpretation of that suffix is unaffected.

Reproducers: [HTML](../sims/lp2_p56_2014_html_corpus_hash_sft.cjs), [status](../sims/lp2_p56_2014_server_status_hash_sft.cjs), [frames](../sims/lp2_p56_2014_stage07_frame_extract_sft.cjs). The three JSON outputs are in the pinned run artifact. These are archived-byte negatives, not a conclusion about unpreserved responses or digest semantics.

## Consequence

The source-supported p56 contract remains:

> find a deep-web page whose unspecified hash equals the fixed 64-byte value above.

The adjacent final p57 scan and its seven source-grounded SHA-512 serializations are also negative. The 2012 route supplies a concrete original hidden-service root page and a known `/NUMBER` interaction, but not the participant-specific response bytes. The 2016 InfoTomb clue carrier and the 2014 Stage11 index/images are also exact negative candidates under their tested SHA-512 semantics. No target preimage or authenticated digest convention has been recovered.

Still unknown: the actual target page and path, digest family, whether the preimage is raw HTTP entity bytes or another representation, whether headers are included, content decoding, newline/character encoding, HTML/text normalization, and whether an untested URL/path serialization participates; the exact eq6 and cginiziglyaobyph host/root-URL and decoded service-ID forms above do not match under the four tested 512-bit algorithms. A future destination claim requires the original `/NUMBER`/second-chance response or another independently period-linked page object, plus source-authenticated digest semantics. Do not guess wrappers or launch hash-family sweeps.

## Independent period academic/search corpora: raw-body availability gate (#2980, Agent14, 26 November 2026)

**Decision:** no new exact original response-body candidate was accessible. This search deliberately excluded the previously exhausted Wayback, Common Crawl, Arquivo and mirror corpora. It does not assert that any unknown historical page was absent from an inaccessible dataset, and it ran no hash guesses.

The genuinely new source class is the historical Tor content crawler/search-engine collection. The most actionable discriminator is that the period Ahmia index is **not a byte-preserving page archive**. The Tor Project's [2014 GSoC report](https://blog.torproject.org/ahmia-search-after-gsoc-development/) identifies the OnionBot/Solr crawler. Its dated [2014-08-29 commit 12c906579134f495789a9f488a5edbbc2805a039](https://github.com/juhanurmi/ahmia/commit/12c906579134f495789a9f488a5edbbc2805a039) contains the exact [spider](https://github.com/juhanurmi/ahmia/blob/12c906579134f495789a9f488a5edbbc2805a039/onionbot/dirbot/spiders/onionspider.py) (blob 20f453629631ce109e3a3896201f210d87c2ff29), [items](https://github.com/juhanurmi/ahmia/blob/12c906579134f495789a9f488a5edbbc2805a039/onionbot/dirbot/items.py) and [pipeline](https://github.com/juhanurmi/ahmia/blob/12c906579134f495789a9f488a5edbbc2805a039/onionbot/dirbot/pipelines.py) (blob 13f23daaec2cee8b70360a63c4d3407f821708b7). The crawler decodes response bytes with errors ignored, converts HTML to text with links ignored, splits on spaces/newlines/#/*, caps the list at 10,000 entries, drops zero-length and >45-character words, and joins with single spaces. It stores title, normalized text, URL/domain and insertion timestamp, without an original-body field. The pipeline deletes the previous Solr record keyed by URL SHA-256 before inserting its replacement. Thus even two distinct HTML serializations with the same extracted words can share the stored index representation, and an index backup alone cannot recover the exact response body. It may still identify a host or textual candidate if a period snapshot is ever released. No historical snapshot or raw cache was found in the public code tree. This is a source-level lossiness result, not a claim of noncoverage of Cicada hostnames.

| Independent collection | Period and coverage stated by primary report | Availability/decision |
|---|---|---|
| Spitters et al., *Towards a Comprehensive Insight into the Thematic Organization of the Tor Hidden Services* ([TNO record](https://repository.tno.nl/SingleDoc?docId=82829)) | December 2013 content corpus, over a thousand Tor services; HTML crawler, no nontext media; predates May 2014 release | Publication record only; no public body archive or host coverage manifest found. The TNO record requires a request even for publication files. Older target not excluded. |
| Owen and Savage, *Empirical analysis of Tor Hidden Services* ([publisher](https://doi.org/10.1049/iet-ifs.2015.0121)) | Six-month study spanning the 2014 era; about 80,000 observed services, HTML fetched to extract selected data points | Descriptor census is not body coverage. No public raw body archive or host-level capture manifest found; parsed data points are not exact bodies. |
| Moore and Rid, *Cryptopolitik and the Darknet* ([publisher](https://doi.org/10.1080/00396338.2016.1142085)) | January–March 2015 crawl, 5,615 seed addresses and 205,000 unique pages | Later than requested capture window, potentially relevant only if target survived; no public raw body corpus or relevant host manifest found. |
| Original Ahmia/OnionBot | 2014 search indexing, public source pinned above | Ordinary index irreversibly normalizes body and replaces earlier record. Not an exact-body corpus. |

No outside party was contacted; no live service, private backup, or indiscriminate bulk Tor-content archive was accessed. Candidate bodies acquired = 0, SHA-512 comparisons = 0. A future author-authorized release of **specific historical puzzle page bytes** or a genuinely byte-preserving capture is the trigger for exact digest testing; repeating general archive or crawler searches is not warranted. #2955's specific missing page remains independent.
