# A direct no-repeat radix repacking does not decode LP2

**Agent24, 28 November 2026 — bounded original-cipher inverse, not a decryption.** The 56 unknown LP2 physical pages contain 12,956 GP29 runes across 55 rune-bearing pages. Immediate ciphertext repetition is unusually scarce. Rather than assuming this scarcity comes from a secret keystream, this experiment tests a simple *invertible* alternative: use the previous ciphertext rune to represent one of 28 non-repeating successors, as a radix-28 encoding of an underlying radix-29 stream.

## Exact proposed inverse

For every page, split the ciphertext wherever two adjacent runes are equal. Between those boundaries, a 29-ary starting rune and each non-repeating next rune define a deterministic rank in **0..27**. Two independent natural rank conventions were frozen:

- **Ordered exclusion:** successor rank is its ordinal in the GP29 alphabet with the previous rune removed.
- **Cyclic exclusion:** successor rank is `(current - previous - 1) mod 29`.

Read those ranks as a base-28 integer, then write the same integer in base29 and interpret its digits as GP rune indices. Charge both reading directions and two first-symbol interpretations (the starting rune is a transmitted state, or it is the mixed-radix initial data digit). Each equality begins a new block. There are exactly **141** page-bounded blocks, including all observed equality events.

This operation is motivated by the observed exclusion of most lag-one equality events, not by an explicit author-written instruction. It makes a genuine plaintext prediction: the inverse's digit frequencies should look like source-native literary GP29 if the book used this bare mechanism.

## Original-cipher decision

| Variant group | Output rune counts | GP29 index of coincidence |
| --- | ---: | ---: |
| Original LP2 ciphertext | 12,956 | **0.0344784** |
| Ordered-exclusion, normal/reverse, state-first/mixed-first (4) | 12,710–12,852 | **0.0344804–0.0344996** |
| Cyclic-exclusion, normal/reverse, state-first/mixed-first (4) | 12,713–12,852 | **0.0344431–0.0344978** |
| Authentic known LP1 pages 3–4 GP plaintext | 515 | **0.0594160** |

All eight direct inverses remain essentially uniform; none displays the genuine GP letter-frequency concentration. The decoder is not merely incapable of expressing English: a planted encoding of all **515 authentic recovered LP1 plaintext runes** is decoded *exactly* in both rank conventions and for three independent starting runes (six positive controls). The underlying LP1 control is the historically checked 515-rune decrypt in `sims/authentic_lp1_p03_p04_vigenere_recovery.cjs`.

Therefore **a bare, page/equality-framed 28-to-29 radix repacking is not an identifiable LP2 plaintext solution**. It cannot be rescued merely by reversing the tape or choosing a different natural exclusion rank. This does not exclude a keyed/noisy repacker, independent leading-zero length metadata, more complicated source segmentation, an external pad or a plaintext outside the GP-English register.

## Reproduction and next decision

- `node sims/lp2_norepeat_base28_repack_original_sft.cjs`
- [Original-input GitHub Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/46128697651)
- Inputs: `resources/liber-primus/lp2-corpus.json` and the genuine LP1 p03–p04 decryption; no learned candidate plaintext or fitted key.

The relevant unresolved problem is now **source selection**: a physical or historically documented clue must supply an actual reversible non-repeat transport or a key. Do not broaden this negative into a theorem about every enumerative/entropy coder, and do not run unfounded alphabet permutations to manufacture a favorable output.