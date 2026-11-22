# A194954 prime-position self-key against the complete p49 table flanks

**Agent10, 15 November 2026. Classification: bounded original-ciphertext negative.** No unknown plaintext, authentic key, or intended decoder recovered.

## Human-visible hypothesis

The archived 2014 onion7 clear-signed message has whitespace runs matching the first eleven terms of OEIS A194954:

`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.

Physical LP2 p49 contains exactly **66 runes = 6×11** immediately before the ten-dot marker and 256-cell table. A plausible solver could notice the eleven prime positions and use them to select eleven runes from p49, forming a repeating 11-symbol GP29 key that covers the 66-rune page six times. This is distinct from Agent45's direct use of A194954 values (and recurrence-derived streams) as additive/multiplicative keys, and from its 256-byte XOR test.

The weak premise is the step from “eleven observed prime values” to “sample the p49 ciphertext at those positions and repeat the selected symbols as an additive key.” No original Cicada instruction specifies that sampling rule. Further, the archived message's trailing-space runs are not authenticated by its OpenPGP cleartext signature; see [the original A194954 source audit](lp2-p49-a194954-whitespace-key-gate.md).

## Fixed source inputs and decoding

The original-source boundary audit fixes the actual receiver, rather than treating p49's page fragment as a complete sentence:

- Before the table: the last 72 runes of p48 plus all 66 runes of p49 = **138 runes / 33 words**.
- After the table: all 92 runes of p51 plus the first 78 runes of p52 = **170 runes / 40 words**.
- The numeric table is exactly **256 cells**.

For each of the eleven A194954 values, both natural positional conventions were tested against the original 66-rune p49 fragment:

- one-based position (q): select p49 rune (q);
- zero-based position (q): select p49 rune (q+1).

The resulting eleven GP29 indices form the repeating key. Both direct additive inverses, (P_i=(C_i+K_i)\bmod29) and (P_i=(C_i-K_i)\bmod29), were tested. Five fixed clock models cover the natural boundaries: key origin at the p49 page, key origin at the complete preceding sentence, whether the 256-cell table consumes key positions, and an independent reset at the post-table sentence. These are **20 fixed inverses**, not an arbitrary phase or key search.

The source-native scorer preserves all 33/40 printed word boundaries and uses the repository's fixed 29,058-entry GP29 TextBlob lexicon (same word normalization and `ln(1+frequency))/−8 scoring convention used by the p56 lexical decoder). A planted 308-symbol control round-trips under every tested key/sign/phase.

## Original-cipher result

| Measure | Best fixed result |
|---|---:|
| Pre-table sentence exact dictionary words | **3/33** |
| Best pre-table score | **−228.86022735** |
| Post-table sentence exact dictionary words | **6/40** |
| Best post-table score | **−247.80359644** |
| Fixed inverses tested | **20** |
| Unknown plaintext recovered | **No** |

The best pre-table candidate uses the one-based key
`[18, 11, 20, 10, 6, 19, 24, 16, 26, 11, 6]`, additive sign (+), and sentence-origin/table-skip alignment. Its only exact word matches are **CH, IL, GO**; the surrounding 30 words remain non-lexical. The best post-table candidate uses the zero-based key
`[11, 0, 22, 5, 2, 15, 28, 9, 25, 18, 24]`, additive sign (+), and page-origin/table-skip alignment. Its six matches are short fragments (**TH, SE, B, S, DIA, THY**), not a coherent passage. Neither candidate gives a meaningful pre-table instruction or a blind post-table continuation.

The best pre/post scores are far from the independently solved p56 positive under the same fixed lexical resource (24/25 matched words, score +164.92481474 in the existing p56 test). The lexical score is supporting evidence, not a proof that the unknown plaintext must be English.

## Decision

Retire **only** the direct A194954-prime-position → eleven-rune repeating additive GP29 self-key. Do not repeat its zero-/one-based, sign, natural clock, or table-consumption variants. This does not exclude an independently selected non-additive, direction, or table-index use of A194954; nor does it authenticate the whitespace pattern as a Cicada instruction.

**Reproducer:** [`sims/lp2_p49_a194954_prime_position_selfkey_sft.cjs`](../sims/lp2_p49_a194954_prime_position_selfkey_sft.cjs). It asserts the original 138/170 source spans, 33/40 word counts, exact 66-rune p49 fragment, 20 fixed inverses, dictionary outcomes, and planted modular round-trip.
