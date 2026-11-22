# P50's 76-cell circumference as a rank-transposition key for p55

**Agent 4, 17 November 2026. Classification:** source-motivated, finite original-cipher test; no recovered plaintext, key or author-selected transposition.

## Human-visible route

The archived original 2013 CicadaOS terminal message says **“The key is all around you.”** The 2014 LP2 numerical table is a printed 32×8 rectangle. Its one-cell outer circumference has exactly

\[
2(32)+2(8)-4=76
\]

cells. The unresolved original p55 has exactly **76 GP29 runes**. The later signed 2016 message says that words are the map and numbers are direction, while solved p57 says to “shed our own circumferences.” These independent statements make the table perimeter a reasonable candidate key source, and the exact 76-to-76 size match selects p55 without scanning page offsets.

The direct perimeter-to-p55 additive/Beaufort pad has already been tested and rejected. A different ordinary human operation is a **numeric columnar/rank transposition**: read the 76 perimeter values in order, sort their positions by numeric value, and use that permutation to reorder the 76 p55 runes. The source does not state clockwise versus counterclockwise, ascending versus descending, or whether the printed sequence is the readout or the inverse, so the test freezes exactly these eight standard conventions:

- clockwise or counterclockwise perimeter traversal;
- stable ascending or descending numeric sort (ties retain traversal order);
- direct or inverse application of the resulting permutation.

No phase, offset, fitted key, word edits, rune substitutions or language-optimized choices are allowed.

## Radix and input controls

The original two-character table tokens admit the existing provisional base60 reading and the documented base59 rival. No original token contains lowercase f; therefore the two alphabets preserve the same digit order for every token. **The stable numeric rank permutation is identical under base59 and base60**, so this transposition test does not depend on choosing between those two radices. The 76-cell perimeter has 68 distinct values; repeated values are resolved only by stable printed traversal order.

The unchanged inputs are resources/liber-primus/base60-grid.json, resources/liber-primus/lp2-corpus.json (p55 indices), and resources/liber-primus/lp1-plaintext-reference.txt. The SFT checks that the 76 perimeter cells are unique positions, that the table byte transcription matches the source-derived byte rows, that base59/base60 rank orders agree, and that all eight permutation conventions invert a planted 76-symbol block exactly.

## Original p55 result

The best of the eight original-key candidates is **counterclockwise / ascending / direct**, with average character-trigram log score **−9.5774747147**. Its transliteration begins:

    BCIAEHCEOEOAEEOSFTHITHOEWSTHEOTHBINGJMEMEACIEAEXDAXREASXUFGPMBXHIAPLCSUMIDGFISEOMGNGBECWDUEAESB

The remaining seven conventions score between **−9.5836461 and −9.7729606**. None yields a coherent plaintext, instruction, address or recognizable final directive. The isolated English-looking trigrams are not sufficient evidence.

## Familywise key-order null

To test whether the actual perimeter ordering carries information, the SFT preserves the exact multiset of 76 original perimeter values, uniformly shuffles their positions, and for each shuffled key takes the **best** score across the same eight conventions. It uses xorshift32 seed 0x330176 and **20,000** shuffled keys. The model is a character-trigram model trained on the existing solved LP1/p56/p57 Latin reference, with add-0.5 smoothing over 26³ trigrams.

| Statistic | Result |
|---|---:|
| Observed best score | −9.5774747147 |
| Null mean of best-of-eight scores | −9.5772133892 |
| Null 95th percentile | −9.4699058736 |
| Null range | [−9.7713212174, −9.2518682766] |
| Null maxima at least as good as observed | 9,435 / 20,000 |
| Plus-one familywise empirical p | **0.4717764** |

The observed best candidate is essentially at the null mean. The familywise test accounts for the eight fixed conventions and retains the duplicate-value/tie structure of the perimeter key. It does not model every possible natural-language or cipher output, but it shows that the actual perimeter ordering is not unusually plaintext-like under this frozen test.

## Decision

**Reject this specific stable-rank columnar transposition of the p50 76-cell perimeter into p55.** The exact perimeter/page length match remains a source-motivated clue, but it does not select this operator. This result does not reject the already separate 76-cell additive/Beaufort pad alone, other perimeter consumers, other source-selected operations, or a nonlinguistic p55 payload. Do not expand this branch into arbitrary row/column permutations or fitted transpositions without a new first-party instruction.

Reproduce from the repository root with an ordinary Node invocation:

    node sims/lp2_p50_76rim_rank_transposition_p55_sft.cjs

The SFT is read-only and preserves all original source files.
