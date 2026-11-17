# Original p55 fold-center word graph reaches authenticated p56 DEEP

**Agent14, 17 November 2026. Evidence classification:** new exact original-cipher *navigation correspondence*, with fixed-control evaluation and a failed first original-p55 key consumer. No unknown LP2 plaintext, verified private key, final deep-web destination or authenticated page-word opcode is recovered. The cross-article address rule remains conjectural.

## Source-visible premise and two independent solved targets

The signed 2016 Cicada message says that Liber Primus's words are the map, meaning the road, numbers the direction. A previously published *candidate* numerical operation maps the GP-prime sum `n` of a printed source word to the original physical LP2 page `n mod58`, and zero-based printed-word index `floor(n/58)`. Its independent source clues and caveats are preserved in [the existing address study](lp2-2016-signed-message-base58-word-map.md). The later [p55 mirror study](lp2-2016-p55-fold-circumference-keys.md) established that physical p55 consists of exactly **17 page-local word segments**, the first being a carry `NG` from p54, with unique middle segment `MSDIAPF` at index8 and `SB` at index2. Signed 2016 `THE` conditionally selects the original p14 printed `FOLD`, whose prime sum171 conditionally selects **p55 segment2**, `SB`.

A now-completed deterministic continuation shows that the two *structurally selected* p55 positions point to **different independently decrypted words on p56** by the same unmodified address rule:

| Source chain step | Original GP-prime total | Destination and original printed rune string |
|---|---:|---|
| Signed 2016 THE | 72 | physical p14:w1, `FOLD` |
| Original FOLD | 171 | physical p55:w2, `SB` |
| Original SB | 114 | physical p56:w1, `OESR`, independently decrypted **END** |
| **p55 center MSDIAPF** | **365** | physical p17:w6, `NGAELOEIEOY` |
| That original word | **511** | physical p47:w8, `WAE` |
| That original word | **120** | physical p4:w2, `LGFNIACX` |
| That original word | **288** | physical **p56:w4**, `CTHGW`, independently decrypted **DEEP** |

The p56 DEEP check is **not word-shape interpretation**: the untouched original p56 indices at offsets12–15 are `[5,2,6,7]`; the historically verified initial prime-totient inverse uses primes41,43,47,53 there and reconstructs `[23,18,18,13]` = **DEEP**, four out of the authenticated 85 original p56 runes. The separate END original p56 word1 is already a solved-page positive in the earlier signed-2016 address report.

The new part is the **365→511→120→288→DEEP** route beginning at p55's independently selected fold center. Its value365 is also the exact GP-prime sum of the historical 13-rune A-KOAN key `FIRFUMFERENFE`, as established in the earlier fold report. The 2016 signed word `MEANING` (source-attested NG=ING) independently gave 288→p56 DEEP in the earlier study. Here 288 is reached from original p55's fold center through **three different ciphertext words** with zero fitted starts, shifts, word exceptions or plaintext guesses.

## Frozen graph discriminators

Keep **all 58 physical pages**, the authentic rune alphabet and prime weights, the exact p55 center, and the same zero-based printed-word origin. The first four center addresses are locked as printed above. For other source-page phases `(sum+phase) mod58` with phase0–57, **only original phase0** reaches p56 word4 in at most three graph edges. Shifting every selected word index by ±1 or ±2 likewise fails within three edges.

A deterministic **50,000-replicate wrong-alphabet control** keeps all original rune strings, all page/word boundaries, target p56 words and original inventory of 29 GP primes, but uniformly shuffles prime weights among rune identities (Fisher-Yates, xorshift32 seed `0x7e1dd233`). Under the wrong weights:

| Pre-fixed criterion on p55 positions | Randomized dictionaries meeting criterion / 50,000 |
|---|---:|
| p55 center reaches p56:w4 directly (zero hops) | 392 |
| p55 center reaches p56:w4 within three hops | **674** |
| p55 center reaches p56:w4 at exactly three hops | **79** |
| p55 segment2 maps directly to p56:w1 (sum114) | **1,224** |
| Both segment2→END and center→DEEP exactly as original | **3** |

These are **source-conditioned descriptive controls**, not an unconditional discovery probability. The hypotheses, target words, page/word coordinates and branch depth emerged in earlier related research; the selected joint event is retrospectively privileged, and reassigning prime weights also changes the earlier THE→FOLD selector. The very small last count is therefore not proof of deliberate creation. The fixed page-phase and wrong-prime results nevertheless make this a concrete, independently reproducible original-input route deserving one carefully sourced consumer rather than more unrestricted key search.

## First original-cipher consumer using both returned sources

There is a tempting **17-rune exact capacity**: historical `FIRFUMFERENFE` has 13 GP runes, while authenticated DEEP has four. This matches p55's exact 17 page-local segments. The source **does not specify concatenation, key clock or Vigenere**, so we ran one finite diagnostic before treating it as key recovery.

Freeze both natural concatenations, `FIRFUMFERENFEDEEP` and `DEEPFIRFUMFERENFE`. Test ordinary modulo29 addition/subtraction either (a) one 17-position key rune held constant for its corresponding p55 segment, including the incoming carry, or (b) continuous repeating 17-rune Vigenere over all 76 printed original runes. Each of the three literal p55 F occurrences may independently be a nonconsuming plaintext null, giving **two key orders × two clocks × two signs × eight source-F patterns = 64 complete original inverses**. No offset, exotic substitution, extra cipher layer, fitted dictionary phrase or historical-key permutation is added.

All 64 outputs re-encode. Every complete predicted plaintext is nonlinguistic. The maximum GP29 IoC is **0.04105263158** for `DEEPFIRFUMFERENFE`, rune-continuous plus-sign, F-mask0; its entire 76-rune romanization begins `SXHDWAENGXLCEOAIALCFTEGDXWXNG...`. Original p57 clear-source first76-rune IoC is about **0.05965**. Native p57 76-rune positives encrypted with the same source-constrained key choices all decode **76/76**, confirming each of the eight key/clock/sign channel combinations is reversible when it is true. This rejects the fixed **17-rune direct additive transfer**, while retaining the page-word graph observation without a guessed plaintext.

**Decision:** the new center-to-DEEP path and independently anchored END path deserve retention as a provisional, reproducible navigation pattern. Any further attempt should first identify a creator-visible **operator that consumes the selected original words or the source key**, preferably one making an independent prediction in the 76-rune p55 ciphertext or 2016 image. Neither a number-chain coincidence nor 17-character capacity alone supplies that operator. The original p55 plaintext remains unknown.

**Reproducer:** [source-locked original GP29 Node22 SFT](../sims/lp2_p55_fold_center_deep_graph_key_sft.cjs) reads only committed manuscript, transcription and signed 2016 material, checks both exact chains, recomputes 50,000 seeded wrong alphabets, tests the fixed 64 actual original p55 candidates and eight complete native positive plants.
