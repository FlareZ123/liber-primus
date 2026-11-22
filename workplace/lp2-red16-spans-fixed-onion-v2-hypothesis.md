# Sixteen original unsolved red-ink spans: one fixed candidate old-onion reading

**Agent 17, 13 November 2026. Classification: speculative archival target with an original-source numeric feature; no authenticated destination or unknown LP2 plaintext.** The decoder produces the fixed string **`wgjv666osv3hntwv.onion`**. Its validity as an old Tor address is automatic from the chosen format. This report records an inexpensive, source-selected historical test and a finite conditional null; do not treat the address as a Cicada service without independent archival evidence.

## A human-visible route to a 16-character output

The complete original Liber Primus second release has **18** red-highlighted rune spans in its ink atlas. Exactly **16** are printed in the still-unknown physical pages p0–55; two further red headings belong to the solved closing pages p56 (AN END) and p57 (PARABLE). Unlike an arbitrary collection of sixteen unmarked words, these sixteen source marks are physically singled out by the puzzle's red ink. The entire original sequence comprises **213** red ciphertext runes on the unknown pages. The two solved closing headings add 5 and 7 red runes.

Cicada's earlier puzzles explicitly give GP runes prime weights and document a BASE29 operation, and the 2014 sequence used 16-character Tor-v2 onion names, including the signed `ky2khlqdf7qdznac.onion` continuation. The 2016 signed message describes the book's words and their numbers as directional. These facts motivate asking whether one **number per source-red span** makes a later onion pointer.

The simplest single-number reader is the sum of the 29 original GP prime weights in each marked span, reduced modulo32 for Tor-v2's RFC4648 alphabet `abcdefghijklmnopqrstuvwxyz234567`. Include every unknown red span once, in printed order, and no solved closing-page span. This operation is human-computable and requires no guessed key, unknown plaintext or optimized alignment. **The missing premise is crucial:** no signed source tells a solver to use modulo32, to discard the solved red headings, or to interpret these sums as an onion hostname. A page digest in solved p56 is not satisfied by a hostname string.

## Exact frozen original reading

| LP2 physical page and start rune | Red length | GP-prime sum | Mod32 | Base32 |
| --- | ---: | ---: | ---: | :---: |
| p0:0 | 13 | 662 | 22 | w |
| p3:0 | 16 | 742 | 6 | g |
| p3:119 | 3 | 137 | 9 | j |
| p6:71 | 11 | 661 | 21 | v |
| p7:194 | 14 | 766 | 30 | 6 |
| p8:0 | 12 | 446 | 30 | 6 |
| p15:0 | 9 | 638 | 30 | 6 |
| p15:9 | 11 | 430 | 14 | o |
| p23:0 | 16 | 786 | 18 | s |
| p27:0 | 19 | 1109 | 21 | v |
| p33:0 | 10 | 379 | 27 | 3 |
| p33:91 | 8 | 295 | 7 | h |
| p39:119 | 3 | 173 | 13 | n |
| p40:0 | 8 | 435 | 19 | t |
| p53:128 | 51 | 2262 | 22 | w |
| p54:0 | 9 | 597 | 21 | v |

**One fixed result:** `wgjv666osv3hntwv.onion`. An exact-name public web search on 13 November 2026 returned no reference to this hostname. This is a *search non-hit*, not archival proof of nonexistence; the old Tor-v2 service system has been retired, and the original host's HTTP response has not been found.

The three source-consecutive spans p7/p8/p15 happen to produce identical residue **30**, the base32 digit `6`. Their source prime sums are 766, 446, 638; all are additionally congruent to **62 modulo64**. The `666` substring is striking, yet the method and the particular substring were inspected on the same source and are not an independent preregistered prediction. Interpret this as exploratory.

## Exact matched controls and limitation

The [single-file CommonJS reproducer](../sims/lp2_red16_spans_prime32_onion_sft.cjs) reads the preserved [original numeric corpus](../resources/liber-primus/lp2-corpus.json) and [red ink atlas](../resources/liber-primus/lp2-ink-annotations.json), asserting all sixteen original locations, rune lengths, sums, outputs and a 16-character label. It runs **100,000** independent reproducible shuffles under xorshift32 seed `0x9e3779b9`:

- **Digit-order conditional:** shuffle the *sixteen observed modulo32 residues* while preserving their exact multiplicities, then ask whether **any three consecutive** values are equal. Exactly **4,888/100,000 (4.888%)** produce a run of length at least three.
- **Red-rune inventory conditional:** shuffle all **213 original unknown red runes** among the same sixteen fixed lengths, recompute each GP-prime sum modulo32, then ask the same question. Exactly **1,044/100,000 (1.044%)** show any triple-equal run.

These are *exploratory conditional diagnostics*, not calibrated probabilities that Cicada intentionally selected this address. The tests do not account for all alternative numerical conversions, moduli, span subsets and striking substrings a researcher might notice after seeing the data. Conditional order and source-rune shuffles address different null questions; their percentages must not be multiplied as independent evidence. Both models deliberately preserve only selected aspects of the printed source; neither is a complete generative model of Liber Primus encryption.

The reproducer also confirms that the sum of **two** GP rune primes can realize **every** residue modulo32. Thus the mapping can manufacture a valid v2-shaped label with arbitrary source strings; its syntactic success has no evidential weight. The source-red selection of exactly 16 spans is the meaningful clue candidate, while the conversion and external ownership remain unresolved.

## Discriminating next decision

The only worthwhile successor under this frozen interpretation is a contemporary **independent 2014–2017 source artifact** naming exactly `wgjv666osv3hntwv.onion`: an authenticated signed message, browser/IRC capture, HSDir descriptor with the associated onion service public key, or an archived HTTP body. If original page bytes can be recovered, compare their historical digest with the 128-hex p56 SHA-512 target and inspect for an LP2 decryption operation or key. Merely finding a modern search result repeating this report would not be independent.

Without such an artifact this candidate remains unverified, and testing rotations, reversed order, multiple prime-sum moduli or new fitted substrings would be unconstrained address hunting. The separate [p55 sixteen-word old-onion proposal](../workplace/p55-prime32-v2-onion-hypothesis.md) and [two source-red sixteen-rune whole-integer proposals](../im-results/lp2-red16-base29-onion-v2-source-gate.md) use different, already preserved selectors; no repeated exhaustive scan is called for.
