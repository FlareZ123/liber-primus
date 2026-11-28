# Source-selected 32/8 inner/outer register from LP1 behaviors + LP2 PARABLE; p50, p55 and stream-cipher receivers

**Agent23, 27–28 November 2026. Classification: source-motivated cross-book key/nonce construction; bounded negative across direct AES, GP29, Salsa20 and ChaCha20 readers.** No unknown LP2 plaintext, authenticated key, executable operator or continuation recovered.

## A human-visible route, not a key claim

The *already solved first book* names three specific behaviors of the circumference, in this source order: **CONSUMPTION**, **PRESERVATION**, **ADHERENCE**. It explicitly says these cause the **loss of DIVINITY**. The independently solved LP2 p57 PARABLE says to **shed our own circumferences** and find the **divinity within**. Those instructions make a bounded, source-selected *extraction* possible: take only the **strict interior GP29 runes** of the three named behavior words, followed by DIVINITY.

| Source word | Complete GP rune count | Strict interior | Boundary runes |
| --- | ---: | ---: | ---: |
| CONSUMPTION | 11 | 9 | 2 |
| PRESERVATION | 12 | 10 | 2 |
| ADHERENCE | 9 | 7 | 2 |
| DIVINITY (GP U for V) | 8 | 6 | 2 |
| **Total** | **40** | **32** | **8** |

The resulting **32 source GP symbols**, in exact original-source word order, are not guessed to fit a target. The two literal source registers, original 0–28 rune indices and 2013 Gematria Primus primes, each encode naturally as **32 bytes** (every prime fits into one byte). The exact keys are:

```text
GP ordinal bytes
03090f01130d100a0304120f12040118100a03170812041209050a010a090a10
GP prime bytes
071d3503472b3b1f070b4335430b03613b1f075917430b431d0d1f031f1d1f3b
```

The eight boundary runes, retained in source order as first/last pairs `C,N; P,N; A,E; D,Y`, also form two exact 8-byte nonce registers:

```text
GP ordinal nonce: 05090d091812171a
GP prime nonce:   0d1d2b1d61435967
```

This makes a source-shaped 32-byte key + 8-byte nonce pair, without inventing a keyword or offset. The book still does not name a stream cipher.

There are two independent **physical 32-count receivers**, not just the familiar 32-byte AES-256 key width: p49–51's 256-cell printed numeric panel has **32 rows × 8 cells**, and physical p55's **33 runes outside the strict word interiors** consist of **32 exterior runes plus one original first-rune carry from p54**. The source p55 43 strict-interior/33 exterior partition is established independently. The candidate therefore creates a new, concrete 32↔32↔32 alignment across original source passages. This count was noticed in the course of seeking a 32-byte key and is **not a discovery-adjusted significance test**. The book never names AES or directs XORing two 32-rune registers.

## Direct source-fixed reversals

The original p49–51 two-character numeral table can be byte-parsed under the conventional 60-character printable alphabet, giving 256 bytes, or its equally lossless printed-symbol alternative omitting the globally unused f and using radix59. Both 256-byte views preserve every original printed token, but yield substantially different bytes; neither codec is creator-authenticated.

For each source-derived key register, each whole table codec and both native row-major and reverse-byte reading, apply each of **AES-256-ECB**, **AES-256-CBC with an all-zero 16-byte IV**, and **AES-256-CTR with an all-zero 16-byte initial counter**. These are **24 direct frozen decryption cases** (2×2×2×3). They output random-looking binary and **zero** recognizable leading magic among PDF, PNG, ZIP, gzip, bzip2, xz, 7z, armored OpenPGP, SQLite, HTML and UTF8 BOM. The original-base60 12 cases contain between **86 and 106 printable ASCII/control bytes of 256** (the source-native control was calibrated against the independent NIST AES-256-ECB vector). No original case yields readable English, an embedded URL, or native GP byte text.

A second equally source-fixed **GP29 32-rune receiver** is the 32 p55 exteriors at original page offsets:

```text
1,4,5,6,7,8,9,14,15,20,21,22,23,35,36,41,
42,45,46,47,48,54,55,61,62,63,64,69,70,72,73,75
```

The carry rune at offset0 is excluded because it completes a p54 word. Direct original-order source-key arithmetic `(C−key) mod29` yields

```text
OE IA F T A G EA S Y Y E E EA H E C U A N A L Y X Y OE B A P P NG W D
```

and `(C+key) mod29` also yields gibberish. Neither is an uninterrupted source-native message. An additional, historically plausible but **unselected** bridge XORs that same exterior32 with each inner-source32 register (using ordinal with ordinal and prime with prime), and applies AES-256-ECB to the complete original table under both codecs. These four exact XOR+AES cases also contain no recognizable file header or readable body, notwithstanding one 126/256 printable count that does not form word-like text (its longest printable run is eight bytes, punctuation-heavy). No additional phases, secret IVs, fitted KDFs, or cipher-text-selected key variants were attempted to rescue failures.

## Source-sized stream-cipher receiver gate (28 November)

The 32-symbol interior and eight boundary runes have a second, technically plausible interpretation: a 256-bit key plus a 64-bit nonce, the exact parameter sizes of **Salsa20/20** and original 64-bit-nonce **ChaCha20/20**. This is a narrow source-driven test, not evidence that either primitive is named by the manuscript.

Freeze the **12,956 original GP29 indices on physical p0–55** as one continuous stream, including page seams. For each matched ordinal or prime key/nonce register above, generate Salsa20/20 or original ChaCha20/20 from block counter zero and test only the two natural GP29 stream inverses:

\[
P_i=(C_i-(S_i\bmod29))\bmod29,\qquad
P_i=(C_i+(S_i\bmod29))\bmod29.
\]

No page reset, phase, nonce mutation, KDF, output-selected shift, or extra layer is introduced.

| Primitive | Register | Inverse | IoC | Adjacent equal pairs / 12,955 |
| --- | --- | --- | ---: | ---: |
| Salsa20/20 | GP ordinal | subtract | 0.034519328490 | 423 |
| Salsa20/20 | GP ordinal | add | 0.034464146619 | 454 |
| Salsa20/20 | GP prime | subtract | 0.034466553602 | 469 |
| Salsa20/20 | GP prime | add | 0.034474334591 | 485 |
| ChaCha20/20 (64-bit nonce) | GP ordinal | subtract | 0.034463824894 | 425 |
| ChaCha20/20 (64-bit nonce) | GP ordinal | add | 0.034491195388 | 466 |
| ChaCha20/20 (64-bit nonce) | GP prime | subtract | 0.034487823228 | 456 |
| ChaCha20/20 (64-bit nonce) | GP prime | add | 0.034469806603 | 454 |

All eight outputs remain at the random-like GP29 unigram IoC of approximately **1/29 = 0.03448276**, not the **0.06270997** clear-p57 reference. Adjacent equal-pair rates rise to 3.27–3.74%, but that isolated feature does not overcome the flat unigram distribution; the initial transliterations are nonsensical. This rejects the fixed global additive-GP29 Salsa20/ChaCha20 receivers for these exact key/nonce registers. It does not exclude a different, independently selected primitive or an authored encoding rule.

The Salsa20 implementation is checked against the published eSTREAM 256-bit Set1vector0 block. The original ChaCha20 keystream prefix is cross-checked against an independent Python `cryptography` implementation using the same 64-bit counter/nonce layout. The source-exact Node22 SFT also checks the full corpus length and reversible planted controls.

## Discriminator and next research decision

**Source registration is positive:** the actual solved LP1 text names the three behaviors and divinity, the actual solved LP2 p57 delivers a clear outer/interior instruction, and their GP-native strict interiors make exactly32 symbols. These are meaningful clues to test, and unlike arbitrary key searches require no dictionary scoring, secret offset or fitted word choice.

**Cryptographic decision is negative and bounded:** the 32-rune source token is **not an authenticated key**, and neither the two direct 32-byte key formats, 24 fixed AES direct readings, four direct XOR-with-shell ECB readings, two literal GP29 p55-shell inverses nor the eight fixed full-book Salsa20/ChaCha20 GP29 stream candidates yield plaintext. This does not exclude a creator-selected KDF, nonce, nonlinear cipher, different output coding or another receiver, but it supplies **no warrant** to multiply arbitrary transformations without a new original instruction. This belongs in intermediate research, not authoritative decrypted results. The general unsolved state remains unchanged.

**Reproduction:** [original-input AES/GP29 SFT](../sims/lp2_lp1_threebehaviors_divinity_inner32_p50_aes256_sft.cjs) reads the solved LP1 text, original LP2 p57, GP29 chart, p55 runes, and exact numeric panel tokens; it asserts the 32-register keys and passes the published AES-256-ECB NIST vector plus **24 source-native plants**. [Windows Node22 PASS, run 46084518226](https://github.com/FlareZ123/liber-primus/actions/runs/46084518226). The new [full-book Salsa20/ChaCha20 SFT](../sims/lp2_divinity_inner32_salsa_chacha_global_sft.cjs) derives both key/nonce registers from the same four source words, checks the eSTREAM Salsa20 vector and independent ChaCha20 stream prefix, then tests all eight full-book candidates with reversible controls. [Windows Node22 PASS, run 46115685311](https://github.com/FlareZ123/liber-primus/actions/runs/46115685311); the exact p0–55 index stream SHA-256 is `73473a68c3fc4296f16009716d7fee18c9c102173e6e70d090c9494cc5bd9252`. All inputs are original/repository-fixed; no language-model-generated plaintext is used.
