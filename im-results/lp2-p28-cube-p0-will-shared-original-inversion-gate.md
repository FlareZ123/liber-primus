# P28 cubic READOUT versus p0 WILL: original full-book shared-law gate

**Agent50, 23 November 2026. Classification: completed finite original-input exclusion for Director #2383. No authenticated unknown-page plaintext or key.** The local labels READOUT and WILL are conditional, originally post-selected English candidates. This test holds their original ciphertext and source-derived operations fixed, and asks whether the most direct single deterministic extension can make them *one* 2014-executable original cipher.

## Independent upstream observations and exact rule

A signed 2016 Cicada message supplies word-number exponent **3**, modulus **29**, and a GP29 cube permutation `Q(x)=x³ mod29`. The locally proposed p28 operation treats a single predecessor rune with exponent3 and the following five-rune printed word with exponent27, since `3³=27 mod28`. Original p28 rune offsets134..139 are `[9,28,24,10,1,20]`; the frozen exponent vector `[3,27,27,27,27,27]` gives `[4,28,23,3,1,16]`, transliterating to **READOUT**.

The strongest straightforward full-page extension is uniquely reversible and uses *only visible printed word lengths*:

1. Give every original GP29 rune exponent27, applying `R(x)=x²⁷ mod29` (including zero).
2. At the rune **immediately before** each printed complete five-rune word, replace its exponent with3. The cube assignment wins if the rune also lies within the previous five-rune word, preventing two operations on one glyph.
3. Carry this deterministic schedule independently on each physical page; do not choose keys, signs, extra rotations, page-dependent exceptions, or English-scored boundaries. Every rune is transformed once, and the inverse at each position is exponent19 for a cube rune and27 for a reciprocal rune, since `3×19≡27×27≡1 (mod28)`.

The p28 six-rune anchor is reproduced **exactly**, and every original page round-trips. This is a plausible first complete decoder for the localized p28 mechanism, explicitly exploratory because a 2014 original does not instruct the solver to apply it to all five-rune words. The post-2014 signed message authenticates the arithmetic in retrospect; it does not establish that a 2014 solver knew the power schedule.

## Direct cross-crib contradiction

The proposed p0 WILL location is its complete four-rune word at offsets141..144:

| Register | GP29 indices | Latin GP |
| --- | --- | --- |
| Original p0 ciphertext | `[19,16,9,18]` | `MTNE` |
| Previously proposed local additive/DH plaintext | `[7,10,20,20]` | `WILL` |
| Frozen shared cube-law result | `[26,20,13,21]` | `YLPNG` |

All four p0 runes take exponent27 under the original printed word boundaries. **The proposed plaintext differs at all four GP positions.** More strongly, the two distinct original source runes at offsets143/144 transform to distinct values 13/21. Thus *even an arbitrarily secret fixed bijective output alphabet* shared across the word cannot map these to the repeated L/L in WILL. This impossibility concerns only fixed word-wide pointwise permutations, including all conjugates of this cube rule; a changing-state or multi-rune mixing cipher is still possible.

A source-coherent inverse would need an independently selected **different per-position state/key law** that permits these equal plaintext symbols to arise from different ciphertext runes, and that law must also preserve the exact p28 singleton/word distinction. Neither the signed source nor the p38 packet provides such an instruction.

## Original contiguous material and independent holdout

No variants are tuned. Under the locked extension:

| Original region | Runes | Original IoC | Transformed IoC | Consequence |
| --- | ---: | ---: | ---: | --- |
| Entire p0 | 262 | 0.034307 | **0.034161** | WILL fails exactly; no continuous readable original words |
| Entire p28 | 269 | 0.033901 | **0.034456** | Only the already-known six-rune READOUT island appears; neighbors fail |
| Disjoint p40–53 (excluding rune-free p50) | 3,008 | 0.034542627 | **0.034543733** | Holdout remains near-uniform GP29, with no sustained source-native prose |

The 100 consecutive original runes from p0 offset141 begin `YLPNGEAHPTCEOIACSMOA...`; the 100 from p28 offset134 begin `READOUTDWHIAXFONGNE...`. The unchanged printed gaps do not yield interpretable prose. The untouched 3,008-rune source-region score is much lower than the independent **genuine solved p57** native-GP IoC **0.062709966**. IoC is a diagnostic of ordinary native English only; this result does not exclude a non-English register or a later transform.

A simulated full-length exact positive uses all 95 genuine solved p57 GP29 plaintext runes: encode them with this fixed page-derived state schedule, decode, recover **95/95**; deliberately swapping the two exponents fails. Original p0, p28, and every holdout page recover **all original ciphertext runes on forward replay**. The original-vs-native distinction is therefore an empirical result, not an implementation omission.

## Decision, remaining causal fork

**This candidate shared law fails decisively.** P28's isolated post-selected READOUT and p0's separately constructed WILL cannot be merged simply by spreading the source-authenticated cube/reciprocal rule over all printed source words, even with an arbitrary global alphabet relabeling. A primitive that emits WILL must mix positions or update state; the source-derived local additive WILL key `[12,6,18,27]` does not specify the missing update and has not been shown to transfer to p28.

For Director #2383, the prerequisite for another dependent search is now explicit: a **first-party, human-visible instruction** that selects one unambiguous reversible shared state, word/page clock and original register **before** both targets are fit. Without one, allowing separate per-island keys or rechoosing cube powers would simply reconstruct the original postselection. Future experiments should use such a frozen source key to predict at least 100 adjacent original runes and a disjoint 200-rune original chapter, with original replay and authentic-native controls.

## Exact reproduction

Windows Node22/CommonJS: `node sims/lp2_p28_predecessor_cube_p0_will_shared_gate_sft.cjs`. The test parses `resources/liber-primus/lp2-corpus.json` and the exact printed separators from `resources/liber-primus/lp2-transcription.txt`, asserts both anchors, original forward replay, noncollapsing WILL values, 3,008-rune untouched holdout and a 95-rune native GP plant. Verified Windows CI: https://github.com/FlareZ123/liber-primus/actions/runs/45165534747.
