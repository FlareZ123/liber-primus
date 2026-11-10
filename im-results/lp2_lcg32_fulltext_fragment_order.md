# Source-fixed 13/31 LCG over 32 LP2 fragments: solved-tail cyclic control, no unknown plaintext

**Classification:** reproducible source-anchored structural relationship and bounded negative for direct transposition. No unknown LP2 plaintext, cipher key, or complete mechanism recovered.

## Human solve-path hypothesis

The original five-slot border ornaments have a documented binary reading of **13** and **31**. Across the full LP2 artifact, the 31 thirteen-dot marks delimit **32 chronological full-text fragments**. A human solver could reasonably try the full-period linear congruential recurrence

\[
x_{n+1}=13x_n+31\pmod{32},\qquad x_0=0.
\]

This is not an unconstrained parameter search. The modulus is fixed by the 32 source fragments, and both recurrence parameters are read from the ornament. It has period 32: the increment is odd and the multiplier is congruent to 1 modulo 4.

The source parser preserves the coincident black/red marks on p7 and the p14-to-p15 boundary. It also preserves the two empty intervals rather than deleting them.

## Exact source map

The canonical corpus contains 58 physical pages and 13,136 runes, of which the first 28 fragments contain all **12,956 unresolved runes** on pp0–55; the final four fragments contain the 180 solved runes on pp56–57.

Full-text fragment lengths, in chronological fragment order, are:

13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299, 5, 80, 7, 88.

The empty fragments are **8** and **11**, at duplicate global boundaries **1,860** and **3,603**. They are retained as distinct fragment indices in the permutation.

The LCG order is:

0, 31, 18, 9, 20, 3, 6, 13, 8, 7, 26, 17, 28, 11, 14, 21, 16, 15, 2, 25, 4, 19, 22, 29, 24, 23, 10, 1, 12, 27, 30, 5.

The inverse order is:

0, 27, 18, 5, 20, 31, 6, 9, 8, 3, 26, 13, 28, 7, 14, 17, 16, 11, 2, 21, 4, 15, 22, 25, 24, 19, 10, 29, 12, 23, 30, 1.

Both visit every fragment exactly once. The forward order places the two empty fragments at output positions 8 and 13; the inverse places them at positions 8 and 17.

## Held-out solved-tail control: exact cyclic rotation

The final four source fragments split the independently solved tail as follows:

| Fragment | Source interval | Length | Known plaintext |
|---:|---|---:|---|
| 28 | p56 offsets 0–4 | 5 | p56 prefix |
| 29 | p56 offsets 5–84 | 80 | p56 remainder |
| 30 | p57 offsets 0–6 | 7 | p57 prefix, PARABLE |
| 31 | p57 offsets 7–94 | 88 | p57 remainder |

Restricting either the forward LCG order or its inverse to these four fragment IDs gives the same relative order:

**31, 28, 29, 30.**

Concatenating those known plaintext pieces gives exactly

\[
\text{p57}[7:95]\ \Vert\ \text{p56}[0:85]\ \Vert\ \text{p57}[0:7],
\]

which is a **cyclic rotation by 92 runes** of the 180-rune string p56 followed by p57 (85 + 7). The exact equality is asserted in the reproducer, not inferred from a language score.

The p56 plaintext fixture is the repository's authentic solved-page regression. The p57 plaintext is taken from the exact rune sequence in [Wulfic's page-74 rune transcription](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_74/runes.txt); its GP transliteration preserves the source spelling **TUNNELNG**, rather than silently normalizing it to the README's English rendering “TUNNELING”. Both solved pages are held out from the 12,956-rune unknown-text language test.

This exact tail relation is the strongest result. It supports a cyclic fragment-indexing interpretation, but does not select forward versus inverse orientation: both orders give the same tail restriction.

## Direct transposition test on the unknown text

The 28 unresolved fragments were concatenated in LCG order and inverse-LCG order, then scored with the repository's fixed smoothed GP trigram model (trained on the first 200,000 characters of the independent Shakespeare control). No model or permutation parameter was fitted to LP2.

| Stream | Mean GP trigram log-likelihood per rune |
|---|---:|
| Original chronological unknown stream | −6.195857 |
| Forward LCG fragment order | −6.198043 |
| Inverse LCG fragment order | −6.195210 |
| 1,000 random 28-fragment orders: mean ± SD | −6.195801 ± 0.000856 |

Against the deterministic 1,000-order null, the forward order has upper-tail \(p=0.997\), and the inverse order \(p=0.235\). Neither is a meaningful language improvement. Normalized index of coincidence is exactly unchanged by transposition, as expected.

Applying the same LCG order to the 32 red-only fragments (225 red runes) also produces no readable plaintext. This is a bounded negative for direct red-only transposition, distinct from the full-text fragment order.

## Interpretation and next decision

The LCG is a source-motivated full-period traversal with an exact known-plaintext structural control: its restriction to the solved tail rotates that tail at the p57:7 marker. But direct transposition of the unknown fragments does **not** decrypt them. The result should therefore be treated as a likely **fragment index, clock, or row-assignment rule**, not as recovered plaintext.

The next economical test is to use this fixed 32-state order to pair the 32 rows of the p49–p51 32×8 base-60 table with the 32 full-text fragments, testing only forward/inverse row assignment and a source-fixed within-fragment row-key clock. Do not broaden into arbitrary 32-row permutations or repeat the already-negative F31 red-fragment/grid screens.

## Reproduction

Run from the repository root with Node.js:

**node sims/lp2_lcg32_fulltext_fragment_order.cjs**

The script uses the original normalized corpus, original two-ink annotation, the existing source-boundary parser, the fixed GP trigram model, and exact known p56/p57 controls. It asserts all 32 fragments, both empty intervals, the complete 13/31 LCG cycle, and the exact solved-tail cyclic rotation.
