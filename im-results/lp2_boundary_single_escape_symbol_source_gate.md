# Word-boundary single-escape GP29→28: source-exact all-secret obstruction

**Agent37, 12 November 2026. Status: source-frozen negative for one complete, invertible, low-state boundary codec; no unknown plaintext/key. Director #603.**

## Why this is the shortest credible word-boundary operation

The original signed 2016 instruction says that *words are a map*, and the solved final Parable calls for shedding circumferences. For a suspected no-doublet cipher, a literal pre-2014 paper-and-pencil mechanism is to let the printed boundary **before the current rune** signal whether a special plaintext symbol was encountered. This exploits a source-visible, already-printed side channel. Do not assume the unknown writer actually intended it.

Freeze the original runes and delimiters from `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`. Of the **12,901** within-page predecessor transitions of the 55 rune-bearing unknown LP2 pages, **2,873** have actual printed `-`, `.`, `&`, `$`, or `§` punctuation between the two glyphs. A slash/newline is a line wrap; do not assign an artificial word break. Each page begins a separate previous-output clock; the 32 real words crossing physical pages are preserved in the transcription and their page-turn transitions are intentionally excluded from this within-page experiment. The full original corpus still contributes **12,956/12,956** rune symbols.

## An exactly reversible, all-secret, 29-symbol local code

Given the immediately preceding ciphertext rune `q` in GP29 and one current plaintext rune `p`, reserve an unknown single plaintext symbol `e(q)`. A fixed but otherwise arbitrary secret bijection `φq` maps the other **28** source symbols to the **28 ciphertext symbols other than q**:

- If `p ≠ e(q)`: emit the single ciphertext rune `c=φq(p)≠q` and print **no new word boundary** before c.
- If `p=e(q)`: print a word boundary and emit the single, fixed ciphertext rune `c=h(q)` (any choice of `h(q)`, including q). Decode by the visible separator bit: for no boundary use `φq⁻¹(c)`; for boundary recover `e(q)`. Update previous ciphertext to c.

This is a lossless complete encoder for all 29 plaintext values with no secret extra escape positions. Its 29 different secret per-q codebooks need **no supplied plaintext** to state the following exact necessary tests. Any arbitrary *static* secret codebooks are permitted.

1. **No-boundary output must differ from q.** A printed transition with no word break but repeated ciphertext is impossible.
2. **For a fixed q, every boundary-marked next ciphertext rune must be identical.** The reserved plaintext symbol has just one output c. A single q with two distinct boundary-following outputs falsifies every secret key of this type.

An explicit positive plant selects `e(q)=q`, `φq(p)=p` for `p≠q`, and `h(q)=q+1 mod29`. When p=q the encoder prints a boundary and writes q+1; otherwise it prints no boundary and writes p. The decoder uses exactly the boundary and previous emitted rune. The standalone test derives **12,956 GP29 plaintext runes from the independent pinned Shakespeare source**, emits every rune and flag, checks every emitted next rune excludes its predecessor and recovers the entire original plaintext **12,956/12,956** with actual per-page clock resets. This demonstrates that the proposed two-output-register code is truly invertible and not an intrinsically impossible specification.

## Decisive original-source failure, with heldout

| Frozen criterion | pp0–39 initial test | pp40–55 untouched holdout | All 55 rune-bearing unknown pages |
| --- | ---: | ---: | ---: |
| Original transitions | 9,600 | 3,301 | 12,901 |
| Printed punctuation boundaries | 2,141 | 732 | 2,873 |
| Observed repeated ciphertext transitions | 65 | 21 | 86 |
| Repeated output **without a word boundary**: impossible in this codec | **48** | **15** | **63** |
| Repeated output **with** word boundary | 17 | 6 | 23 |
| Previous-q states with **more than one** next output at boundary: impossible | **29/29** | **29/29** | **29/29** |
| Maximum distinct outputs after one q at a boundary; must equal 1 | **29** | **20** | **29** |

The two independent necessary constraints both fail massively on the original. The most compact one-special-symbol boundary-escape architecture cannot fit the original on either split, **even with 29 arbitrarily secret per-q bijections and arbitrary reserved plaintext symbols**. This is a mathematical impossibility for this narrow but complete code, not a language-likelihood objection.

## Research decision

Word-boundary positions still have sufficient *information-theoretic capacity* to carry the 325–649 lost bits documented in [the upstream source-capacity audit](lp2-no-repeat-source-visible-channel-capacity.md). The present result eliminates the most literal **one-special-input / one-extra-boundary-bit per step** implementation. An escape system using a different subset of original punctuation locations, multirune variable-length coding, a changing secret h(q,i), a second previous rune, ciphertext doublet exception channel, or external state may escape this result. Each requires a separate selector not supplied by the 2016 phrase or p57 Parable.

In particular, treating the original 2,873 printed word breaks as a freely tunable bitstring would make an arbitrary fitted codec possible; that says nothing about plaintext. A candidate successor must identify an independently original-visible distinction between **real syntactic word ends and special escape-bearing ends**, supply the missing 86-doublet exception rule, and map source-visible punctuation to actual extra bits. Without such a rule there is no complete source-selected no-repeat decoder for #41.

**Reproducer:** [single-file original/heldout SFT](../sims/lp2_boundary_single_escape_symbol_source_gate_sft.cjs). The result is an exact class exclusion with a native Shakespeare GP29 plant, rather than a proposed manuscript decryption.