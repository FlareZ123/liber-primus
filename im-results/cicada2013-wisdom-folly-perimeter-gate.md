# 2013 wisdom/folly 58×58 outer-perimeter key gate

**Status: bounded negative for the literal direct-pad reading.** No unknown LP2 plaintext, authentic LP2 key, or final destination recovered.

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

The 228-byte perimeter happens to equal `3×76`, while physical p55 contains 76 runes. This test does **not** use that equality to split the perimeter into three blocks or select p55; it treats the whole perimeter as one continuous period-228 key over the complete unknown book.

The direct GP29 additive inverse uses the two natural byte mappings already used in the source-key work:

- `byte mod 29`;
- `floor(byte×29/256)`.

For each of two framings, two perimeter directions, two mappings, and both signs, the fixed key is applied continuously from the first unknown rune of p0. No phase fitting, page resets, arbitrary rotations, alternative ciphers, or parameter sweeps were used. Each of the **16** inverses was re-encrypted with the opposite sign and asserted rune-for-rune equal to the original ciphertext.

## Data and reproducibility

- Binary: `resources/historical/cicada-2013-os-wisdom-folly.bin.b64`; decoded length 3,368 bytes; binary Git blob SHA-1 `62b1b949a1e4e4a346e75b1c34101000d3c53220`; SHA-256 `7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a`.
- LP2 ciphertext: `resources/liber-primus/lp2-corpus.json`, 12,956 symbols across p0–p55 excluding runeless p50.
- Language control: `resources/control/shakespeare_first300k.txt`; uppercased, nonletters removed, then greedily tokenized by longest GP transliteration. The first 80% trains a 29-symbol trigram model with add-one smoothing; the final 20% is held out.
- Reproducer: `node sims/cicada2013_wisdom_folly_perimeter_gate.cjs`.

The trigram score is a coarse language discriminator, not a proof against unrelated transformations. Exact re-encryption validates implementation only, not the proposed key.

## Results

The raw LP2 score is **-3.895913** nats/rune (IoC **0.03447840**). The native Shakespeare holdout scores **-2.399903** nats/rune. The best of the 16 perimeter candidates is:

| Framing | Direction | Byte map | Inverse | Trigram score | IoC |
|---|---|---|---|---:|---:|
| First four bytes as prefix | Clockwise from top-left | byte mod 29 | `P=C+K` | **-3.897543** | 0.03449018 |

This is slightly worse than raw ciphertext. All other candidates are also noise-like; none produces coherent text or improves the language score. No plaintext or reusable key is recovered.

## Decision

**Reject the 58×58 outer perimeter as a direct continuous additive GP29 key.** This closes only the explicit “all around you” → 58×58 `wisdom/folly` border → period-228 additive-pad interpretation. It does not establish what the original message meant, nor exclude the binary as a carrier or a source for a different, independently specified operation.

Do not extend this negative result into arbitrary phase, segmentation, KDF, stream-cipher, or page-reset searches without a new source instruction. The earlier direct whole-binary pad, row/column, Hill, and coordinate tests remain separately documented in [the consolidated source-key report](cicada2013-wisdom-folly-source-key.md).
