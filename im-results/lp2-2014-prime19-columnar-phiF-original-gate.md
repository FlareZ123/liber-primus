# The omitted 2014 prime 19 as a columnar width: original LP2 p56-family inverse

**Agent33, 18 November 2026. Evidence class: source-motivated, bounded negative.** No previously unknown Liber Primus plaintext, genuine LP2 key, or final destination was recovered. This test combines a visually proposed width, an historically demonstrated operation and the exact published p56 cipher. It closes only the specified 19-column model.

## Why a player might try this

The preserved 2014 Stage11 signed handoff has whitespace run lengths **[2,3,5,7,11,13,17,23,29,31,37]**, conspicuously skipping prime **19**. The source preserves these bytes, but OpenPGP canonical-text signing strips trailing spaces, so their intended status is uncertain; see the earlier [original whitespace audit](lp2-stage11-signed-whitespace-primes-p56-inverse-gate.md). Cicada's actual 2014 Stage05 puzzle used a columnar transposition. The original LP2 terminal p55 contains **76=4×19 GP29 runes**, and clear p57 has **95=5×19 runes**; p57 also has 19 body words. Taken together these suggest trying width 19, without proving that the creator selected it. Earlier [p27-title-keyed 19-column direct rearrangements](p27-title-19column-p55-transposition-gate.md) were nonlinguistic. The present test asks a mathematically different question: can that fixed transposition be followed by the authentic p56 prime-totient/F-transparent inverse on original unknown pages?

A width alone does not select a 19-column ordering. This experiment grants only natural left-to-right column order in each of two standard transposition directions. It does not infer or tune column permutations, filler characters, starting primes, random keys, clocks or plaintext cribs.

## Complete specified decoder

1. Read the original 29-rune GP index arrays verbatim from [the canonical LP2 source](../resources/liber-primus/lp2-corpus.json), preserving rune-free p50. Use four separately reset windows: **p0–2, p3–7, p40–53, p55**, of lengths **729, 1145, 3008, 76**, respectively.
2. Treat each window as an irregular **19-column** rectangle. Compare (A) undoing natural row-write/column-read transposition by filling columns and reading rows, and (B) the reverse direction. For incomplete final rows, leftmost columns contain the extra source runes; there is no added or deleted symbol.
3. After the permutation, invert the **actual p56 algorithm**: successive Euler totients of primes starting at 2, modulo29 addition (plus opposite-sign control), and **transparent plaintext F=0**. Literal F emits ciphertext F without consuming a prime. Every occurrence of ciphertext F is branched into literal/encrypted interpretations wherever legal. An encrypted transition yielding plaintext F is forbidden. Preserve every possible key cursor; the first position with an empty cursor set is an exact impossibility, independent of any English scorer.
4. Calibrate with unmodified **85-rune p56** plaintext/ciphertext, an exact 85/85 original encryption equality, and **16** full-length p57-native GP planted encryptions in precisely the original four window lengths, signs and transposition directions. Every planted inverse reaches its terminal state.

## Original ciphertext outcomes

Entries are first impossible **zero-based position in the permuted ciphertext**; “survives” means at least one mathematically legal full inverse, not readable plaintext.

| Original window | Undo column-fill, + / − | Row-to-column read, + / − |
| --- | --- | --- |
| p0–2 (729) | **6 / 126** | **19 / 22** |
| p3–7 (1145) | **18 / 17** | **26 / 18** |
| p40–53 (3008) | **177 / 71** | **295 / 27** |
| p55 (76) | **survives / 3** | **survives / survives** |

All **12** long-window inverses are algebraically impossible under these fixed operations and all latent plaintext-F histories. The remaining p55 configurations have respectively **2, 2 and 2 terminal key-clock values**; exhaustive tracing finds **4, 2 and 2 legal plaintext paths** (eight total). Their observed GP29 coincidence indices lie between **0.03018 and 0.03684**. For example, one p55 column-unfill, plus-sign legal trace begins **L C S B B E EO U S L EO C B U IA A C O OE P U A W D IA**, and another begins **L O M G S E J P Y H EO A EA L F U P B S W O X B W T**. Neither yields coherent original unknown text. These are deterministic reconstructions, not asserted decipherments.

The source-derived skip width 19 is insufficient to make the historically real p56 cipher a complete LP2 decoder, even when preceded by a natural 19-column transposition. The three short p55 survivors emphasize that algebraic feasibility by itself is not language or authenticity evidence.

## Reproduction and future decision

The [complete read-only Windows Node22 CJS SFT](../sims/lp2_stage11_prime19_columnar_phi_f_sft.cjs) asserts original inputs, all fixed failure offsets, exact historical p56 recovery, and 16 planted controls. [Windows Actions execution 44350816268](https://github.com/FlareZ123/liber-primus/actions/runs/44350816268) passed. No original manuscript sources or authoritative synthesis were altered.

**Decision:** retire this exact omitted-19/natural-column/p56-F cipher composition. The construction rests on a weak unprinted correspondence between a missing prime, a transposition width, and a later solved-page cipher. Without a new creator-selected column ordering, key schedule, or authentic unknown plaintext, extending it into a key search would be postselection. Distinct clue-to-plaintext routes remain open.
