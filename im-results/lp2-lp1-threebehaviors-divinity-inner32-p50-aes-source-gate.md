# Source-selected 32-rune interior key from LP1 behaviors + LP2 PARABLE; p50 and p55 original receivers

**Agent23, 27 November 2026. Classification: new, *conditional* cross-book exact key-material construction, negative for the fixed direct readers below.** No unknown LP2 plaintext, authenticated key, executable operator or continuation recovered.

## A human-visible route, not a key claim

The *already solved first book* names three specific behaviors of the circumference, in this source order: **CONSUMPTION**, **PRESERVATION**, **ADHERENCE**. It explicitly says these cause the **loss of DIVINITY**. The independently solved LP2 p57 PARABLE says to **shed our own circumferences** and find the **divinity within**. Those instructions make a bounded, source-selected *extraction* possible: take only the **strict interior GP29 runes** of the three named behavior words, followed by DIVINITY.

| Source word | Complete GP rune count | Interior count |
| --- | ---: | ---: |
| CONSUMPTION | 11 | 9 |
| PRESERVATION | 12 | 10 |
| ADHERENCE | 9 | 7 |
| DIVINITY (GP U for V) | 8 | 6 |
| **Total** | **40** | **32** |

The resulting **32 source GP symbols**, in exact original-source word order, are not guessed to fit a target. The two literal source registers, original 0–28 rune indices and 2013 Gematria Primus primes, each encode naturally as **32 bytes** (every prime fits into one byte). The exact keys are:

```text
GP ordinal bytes
03090f01130d100a0304120f12040118100a03170812041209050a010a090a10
GP prime bytes
071d3503472b3b1f070b4335430b03613b1f075917430b431d0d1f031f1d1f3b
```

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

## Discriminator and next research decision

**Source registration is positive:** the actual solved LP1 text names the three behaviors and divinity, the actual solved LP2 p57 delivers a clear outer/interior instruction, and their GP-native strict interiors make exactly32 symbols. These are meaningful clues to test, and unlike arbitrary key searches require no dictionary scoring, secret offset or fitted word choice.

**Cryptographic decision is negative and bounded:** the 32-rune source token is **not an authenticated key**, and neither the two direct 32-byte key formats, 24 fixed AES direct readings, four direct XOR-with-shell ECB readings nor two literal GP29 p55-shell inverses yield plaintext. This does not exclude a creator-selected KDF, nonce, nonlinear cipher, different output coding or another receiver, but it supplies **no warrant** to multiply arbitrary transformations without a new original instruction. This belongs in intermediate research, not authoritative decrypted results. The general unsolved state remains unchanged.

**Reproduction:** [original-input CommonJS SFT](../sims/lp2_lp1_threebehaviors_divinity_inner32_p50_aes256_sft.cjs) reads the solved LP1 text, original LP2 p57, GP29 chart, p55 runes, and exact numeric panel tokens. It asserts all word lengths, 32-register key bytes, canonical base60 numeric bytes SHA-256 `3b9b07d9...`, alternate base59 table SHA-256 `511d4fdb...`, original p55 outside offsets and two arithmetic readouts. It also passes the published AES-256-ECB NIST known-answer vector and **24 exact independent 256-byte source-native encrypt/decrypt plants**. [Windows Node22 PASS, run 46084518226](https://github.com/FlareZ123/liber-primus/actions/runs/46084518226). All inputs are original/repository-fixed; neither an external language-model suggestion nor an invented ciphertext is treated as evidence.
