# Opening 729 runes and p8 black 243: a direct triplet codebook counterexample

**Decision:** An unchanged deterministic mapping from each original GP29 rune identity on the 243-black-rune body of physical LP2 p8 to **three original GP29 runes** cannot generate the 729-runic opening of LP2 p0–p2 in printed order. The original source supplies a two-occurrence contradiction. **No actual LP2 plaintext, key, instruction, or destination is recovered.**

## Human-visible premise and independent rival

The three first physical pages have exactly **262, 266, 201** printed runes, totaling **729 = 3 × 243**. Page 8 has **255** original printed runes of which the first **12** are red and the remaining **243** black. This motivates the narrow test that the 243 black glyphs are a compressed three-to-one codebook of the opening, using one fixed expansion per input rune. It is a literal, period-readable operation on displayed geometry. Competing interpretations include a position-dependent keystream, ternary state machine, read-order mask or mere accidental length agreement. No source instruction tells the solver to apply a stationary codebook.

Read the unchanged `resources/liber-primus/lp2-corpus.json`, concatenate the exact original p0, p1, p2 GP indices, and partition into 243 ordered adjacent triples. Align triple j with black p8 rune j, using original GP index identity. For every repeated p8 rune, the assigned triple **must** be identical. No key search or English score is involved.

## Decisive source witness

The p8 black rune at zero-based position **3** is `EA`, and the same p8 rune occurs at position **10**. Their 3-rune opening targets differ:

| Original p8 black zero-based position | Original rune | Opening GP29 tape offsets | Original triple |
| ---: | :---: | :---: | :--- |
| 3 | EA | 9–11 | **Y E NG** |
| 10 | EA | 30–32 | **EO I NG** |

A deterministic one-rune-to-three-rune dictionary cannot assign both outputs to the same input `EA`. In the complete 243-position original pairing, all **29** GP rune identities occur, but there are **240 distinct opening triples**; **213/243** positions differ from the first assignment to their p8 rune identity. Thus one simple counterexample suffices, and the full census quantifies how far from stationary this literal relation is.

## Scope, independent work, and next decision

This exact no-go is different from the previous p8 ternary de Bruijn all-class mapping or three-sibling **arithmetic** interpretations. It excludes only the direct printed-order, whole-rune stationary 1→3 expansion and does **not** reject a changing-state decoder or p8 as a 243-place key mask. Such alternatives require a visibly selected state update or read order before fitting the opening. The arithmetic sibling gates remain in [the separate p0–p2/p8 report](lp2-p0p2-p8-243-ternary-sibling-original-gate.md).

**Reproduce:** [single runnable original-input Node.js 22 file](../sims/lp2_p0p2_p8_stationary_triplet_codebook_sft.cjs), which asserts all page counts, 240 distinct original triples, 213 contradictions and the explicit `EA` two-position witness. It leaves the original corpus unchanged. The result is a bounded source-language exclusion and does not justify further brute-force key scans.
