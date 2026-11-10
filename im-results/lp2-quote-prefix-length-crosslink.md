# An original LP2 five-word quotation-prefix crosslink

**Classification, 10 November 2026:** new exact source-structural correspondence and a narrowly specified, exact conditional null. It is **not** a recovered plaintext, identified repeated phrase, key or cipher mechanism. This result offers a frozen *candidate crib equivalence* for future independent inverses.

## Source-observed relationship

Two separately annotated quote openings in the 12,956-rune unsolved LP2 corpus have precisely the same first five **canonical word lengths**:

| Quote opening, zero-based global rune offset | Physical LP2 page | Quote length | Canonical words in entire quotation | First five word lengths |
| --- | ---: | ---: | ---: | --- |
| **9,811** | **40** | 58 runes | 14 | **5, 7, 2, 3, 4** |
| **12,522** | **53** | 70 runes | 14 | **5, 7, 2, 3, 4** |

These are the **only two starts** of this length-five word-length pattern anywhere in all **2,896 original unsolved canonical words**. In each case the five-word prefix begins *exactly* with a quotation mark, independently recorded in `resources/liber-primus/lp2-quote-punctuation-spans.json` from the richer relikd/scream314 transcription. The canonical rune-bearing pages omit the printed numeric-only page 50, so the physical page 53 is **rune-bearing page ordinal 52**. Both quote starts and word boundaries are resolved by the existing canonical transcription, joining printed-line and page wraps.

For a frozen comparison, the actual **21 original GP rune indices** at each five-word quote opening are:

```text
Physical p40, offsets [9811,9832):
[0,23,4,28,6,13,3,12,3,19,28,17,11,27,15,19,0,16,0,25,3]
Physical p53, offsets [12522,12543):
[28,14,26,12,4,3,13,15,5,25,19,12,9,11,18,0,15,18,0,24,21]
Difference p40 - p53 (mod 29):
[1,9,7,16,2,10,19,26,27,23,9,5,2,16,26,19,14,27,0,1,11]
```

The **numerical red-ink triangle** had separately selected physical pages **40, 15 and 53** through three prime-sum/page-pointer relations; see `im-results/red-span-triangle.md`. That earlier selection makes the two relevant pages particularly interesting to investigate. It does **not** give an independent decryption or prove these two quotes share words.

## Exact quote-opening null

Predeclare the event as **any pair** of the **five** original quotations containing at least five complete words sharing all five lengths at their quote beginnings. The other two independently annotated quotes contain only four and two words and cannot enter this event. There are `choose(5,2)=10` eligible pairs.

Conditional null: for every source rune-bearing page containing an eligible quote opening, circularly rotate its *whole canonical word-length sequence* by an independently chosen uniformly random number of whole words. Preserve the page's original word-length order, its word inventory, and each quote's **page-local word ordinal**. Both quotations on rune-bearing page 42 share the same rotation. This is a conditional word-phase model, not a claim that rotating words produces an authentic manuscript.

Enumerate each pair over *all* page rotations; share the shift for same-page quote starts. Results:

- **9 of 10** quote pairs have **zero** attainable matching five-word prefixes under *any* of their valid original-page rotations.
- The physical **p40/p53** pair has precisely **two** allowed rotation combinations out of `55×39=2,145`: shifts `(0,0)` with observed pattern `(5,7,2,3,4)`, and `(40,14)` with a different pattern `(2,3,5,4,4)`.
- Consequently the event *any* eligible quote-prefix match has the **exact family-wise conditional probability `2/2145 = 0.0009324009`**. A separate 1,000,000-draw fixed-seed xorshift32 check found 974 such matches, consistent with the exact rate; use the exact enumeration for evidence.

This accounts for pair selection *within these seven annotated quotes* under this specific five-word criterion. The criterion and the interest in p40/p53 were noticed in an exploratory search, and the test does **not** adjust for arbitrary prefix lengths, alternative phrase boundaries, other discovered page links, or the larger research program. It is a meaningful conditional coincidence, not proof of a deliberate creator mechanism.

## Consequences for a same-plaintext hypothesis

An actionable **hypothesis** is that the 21 GP-rune positions at these openings may encode the same five plaintext words under different cipher state, key or transformation. Freeze this interval equality as a possible side constraint and demand meaningful held-out predictions elsewhere before endorsing it.

There is already a key-independent obstruction for an overly simple reading: if both openings represented the same 21 plaintext rune sequence through **one arbitrary bijective rune substitution per quotation**, equal-symbol relations would be preserved. At positions 0 and 16 of the proposed common prefix, the p40 ciphertext has `0=0`, whereas p53 has `28≠15`. Thus no pair of *fixed* monoalphabetic bijections can map an identical 21-rune plaintext to these two original strings. Context-dependent cipher state, shifting segmentation, a non-bijective intermediate, or coincidental equal word lengths remain possible.

This is specifically a **word-length** crosslink, not an identical plaintext quote. Avoid postselecting a putative English phrase to fit the observed runes.

## Reproduce

Run `node sims/lp2_quote_length_crosslink.cjs` from the repo root. Inputs are the frozen original-word transcription `resources/liber-primus/lp2-transcription.txt` and independently sourced quotation annotations `resources/liber-primus/lp2-quote-punctuation-spans.json`. The script verifies all source counts and offsets, prints the seven quotation length lists, and exhaustively enumerates ten pairwise rotational supports. No random sample, external text or guessed key is needed for the primary statistic.

The likely useful continuation is to ask whether any independently specified historical LP2 reversible decoder maps these two **preselected** 21-symbol intervals to identical five plaintext words *without fitting the key to this equality*, while also explaining the remaining original text. Without such a decoder this crosslink stays in intermediate results.
