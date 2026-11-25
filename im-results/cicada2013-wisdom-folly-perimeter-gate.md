# 2013 wisdom/folly circumference and interior-pad gates

**Status: bounded negative for the direct outer-perimeter key, the 3×76 p55 receiver, and the stripped-interior floral pad.** No unknown LP2 plaintext, authentic LP2 key, or final destination recovered.

## Human-visible cue and weakest premise

The 2013 Cicada OS rootfs inventory records a 65-byte `usr/local/bin/message.txt` displaying `@1231507051321`, “The key is all around you.”, “Good luck.”, and `3301`; it also records a 948-byte clearsigned copy, `message.txt.asc`. The same OS contains byte-identical `/tmp/wisdom` and `/tmp/folly` files, each 3,368 bytes. The original-derived bytes are preserved in [the repository's historical source note](../resources/cicada2013-wisdom-folly.md).

A plausible human interpretation is to inspect the 3,368-byte binary as a 58×58 byte matrix plus four framing bytes: the LP2 release has 58 physical pages, and “all around you” naturally suggests the matrix's outside ring. This is a distinct extraction from the already-tested row/column page keys and Hill interpretations.

**Weakest assumption:** the startup script runs `prime_echo`, displays `message.txt`, waits, and reboots; the rootfs inventory found no reference from startup/configuration files to `/tmp/wisdom` or `/tmp/folly`. The message may refer to the Twitter handle/feed or another surrounding source, not this binary. The binary itself survives through a secondary archive and is not independently authenticated against a separately signed original ISO. Therefore the perimeter reading is a motivated but low-confidence hypothesis, not an established instruction.

## Frozen extraction and inverse

The 58×58 payload is taken either after the first four bytes (prefix framing) or before the final four bytes (trailer framing). Its perimeter is read from the top-left corner, clockwise or counterclockwise, with each boundary cell included once:

- top edge: 58 bytes;
- right edge: 57 additional bytes;
- bottom edge: 57 additional bytes;
- left edge: 56 additional bytes;
- total: **228 bytes**.

The 228-byte perimeter equals `3×76`, while physical p55 contains 76 runes. The first test treats the perimeter as one continuous period-228 key over the complete unknown book. A separate bounded receiver test uses the numerical 3×76 alignment as three byte channels feeding p55; it does not infer that this binary is an authored key.

The direct GP29 additive inverse uses the two natural byte mappings already used in the source-key work:

- `byte mod 29`;
- `floor(byte×29/256)`.

For each of two framings, two perimeter directions, two mappings, and both signs, the fixed key is applied continuously from the first unknown rune of p0. No phase fitting, page resets, arbitrary rotations, alternative ciphers, or parameter sweeps were used. Each of the **16** inverses was re-encrypted with the opposite sign and asserted rune-for-rune equal to the original ciphertext.

## Data and reproducibility

- Binary: `resources/historical/cicada-2013-os-wisdom-folly.bin.b64`; decoded length 3,368 bytes; binary Git blob SHA-1 `62b1b949a1e4e4a346e75b1c34101000d3c53220`; SHA-256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`.
- LP2 ciphertext: `resources/liber-primus/lp2-corpus.json`, 12,956 symbols across p0–p55 excluding runeless p50.
- Language control: `resources/control/shakespeare_first300k.txt`; uppercased, nonletters removed, then greedily tokenized by longest GP transliteration. The first 80% trains a 29-symbol trigram model with add-one smoothing; the final 20% is held out.
- Original perimeter reproducer: `node sims/cicada2013_wisdom_folly_perimeter_gate.cjs`.
- Follow-up receiver/interior reproducer: `node sims/cicada2013_wisdom_folly_circumference_receiver_gate.cjs`.

The trigram score is a coarse language discriminator, not a proof against unrelated transformations. Exact re-encryption validates implementation only, not the proposed key.

## Results

The raw LP2 score is **-3.895913** nats/rune (IoC **0.03447840**). The native Shakespeare holdout scores **-2.399903** nats/rune. The best of the 16 perimeter candidates is:

| Framing | Direction | Byte map | Inverse | Trigram score | IoC |
|---|---|---|---|---:|---:|
| First four bytes as prefix | Clockwise from top-left | byte mod 29 | `P=C+K` | **-3.897543** | 0.03449018 |

This is slightly worse than raw ciphertext. All other candidates are also noise-like; none produces coherent text or improves the language score. No plaintext or reusable key is recovered.


## Follow-up bounded structural tests

### The 228 = 3×76 perimeter as a p55 three-channel receiver

The 2013 perimeter was split into three consecutive 76-byte channels. For p55 rune position i, the candidate shift is derived from [ring[i], ring[76+i], ring[152+i]]. The frozen family tests big-/little-endian 24-bit reductions, scaled 24-bit reductions, byte sum, byte XOR, RGB luminance, and each individual channel; both additive signs and both continuous and plaintext-F-transparent clocks are checked with exact re-encryption.

The raw p55 score is **-3.792772** nats/rune (IoC **0.03789474**). The best candidate is the byte-XOR reduction with the positive additive direction and continuous clock: score **-3.717584**, IoC **0.03263158**. Its output remains incoherent (the recorded prefix begins `HNDUCEAFXNGGTHOEUTHFFJOEEOOBAEMOEOESXNINGF...`) and is far below the native Shakespeare holdout (**-2.399903**). The modest score movement is not a decryption.

### Strip both circumferences: 3,136 + 180 = 3,316

The 2013 58×58 matrix interior is 56×56 = **3,136 bytes**. The 2014 p49–51 base60 grid is 32×8; removing its outer row and column leaves 30×6 = **180 values**. Concatenating the 2013 interior followed by the 2014 interior gives **3,316 values**, exactly the length of the floral ciphertext register on p40–55 excluding numeric-only p50. This is a literal optional dual-reading test of p57's “shed our own circumferences” wording. The LP1 p3/p10/p14 controls above mean that wording does not independently select these two matrices or a direct-pad operation.

The bounded inverse tests row-major extraction, clockwise/counterclockwise spiral extraction and their reversals; each key is mapped by `byte mod 29` or `floor(byte×29/256)`, with both additive signs and continuous or plaintext-F-transparent clocks. Every continuous and F-transparent candidate is re-encrypted exactly. The raw floral score is **-3.899445** (IoC **0.03446283**); the best candidate is clockwise spiral + scaled-byte mapping + positive continuous addition, score **-3.879795** (IoC **0.03433656**). It remains random-looking and far below the native Shakespeare holdout. The original-byte XOR diagnostic yields only **393/3,316** valid GP prime values; the 5-bit GP-index XOR leaves **318/3,316** outputs outside the 29-symbol alphabet. Neither gives a valid plaintext stream.

The exact length equality is therefore a numerical alignment that motivated a bounded test—not evidence of authorial intent or a key. No further KDF, phase, segmentation, or stream-cipher search is justified without an independently source-selected transformation.

## Decision

**Reject the 58×58 outer perimeter as a direct continuous additive GP29 key; reject the frozen 3×76 p55 receiver family and the 3,316-value stripped-interior direct-pad family under the tested source-native mappings and clocks.** The p57 circumference wording has now received its direct interior-pad test. This does not establish what the 2013 message meant, nor exclude the binary as a carrier or a source for a different, independently specified operation.

Do not extend these negatives into arbitrary phase, segmentation, KDF, stream-cipher, or page-reset searches without a new independent source instruction. The earlier direct whole-binary pad, row/column, Hill, and coordinate tests remain separately documented in [the consolidated source-key report](cicada2013-wisdom-folly-source-key.md).
