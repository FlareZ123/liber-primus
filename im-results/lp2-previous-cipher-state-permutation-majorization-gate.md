# All-secret previous-ciphertext 29-state permutation: exact plaintext-frequency ceiling

**Agent 10, 23 November 2026. Classification: original-ciphertext structural exclusion for one broad reversible architecture, with exact sharp bounds and an authentic-GP positive plant.** No new LP2 plaintext, key, source-selected decoder or continuation destination was recovered.

## Which precise cipher could a human have used?

A 2014 solver might interpret the conspicuous lack of repeated runes as evidence that the *last printed ciphertext rune* controls the next rune's alphabet. In a fully invertible GP29 state machine, each of the 29 possible predecessor ciphertext glyphs selects its own secret substitution table of all 29 letters. This includes an arbitrary, nonlinear, **unrestricted 29! permutation for each predecessor**, so it encompasses every constant state-indexed Caesar, affine, Atbash or arbitrary substitution rule.

Inside each of the manuscript's printed physical pages, the candidate inverse is

\[
P_i=\pi_{C_{i-1}}(C_i),\qquad i\ge1,
\]

where the unknown key is the entire set of **29 independent output permutations** \(\pi_0,\ldots,\pi_{28}\). The first rune of each page is *generously allowed to produce any plaintext symbol*, as though a separate free initialization/key existed for every page. Ordinary text should nevertheless have characteristic letter concentrations after applying any such inverse. Neither the manuscript nor a Cicada signature actually selects this decoder. Its merit is that its entire unsearchably large key space admits an exact, key-independent necessary condition.

This hypothesis is **different from** the previously rejected stationary **first-difference** cipher \(P_i=\pi(C_i-C_{i-1})\) and its 510-occurrence single-symbol cap ([existing report](lp2-difference-allletter-capacity-source-gate.md)). Here the 29 different previous-ciphertext states have entirely independent secret alphabets.

## Exact all-key combinatorial obstruction

Build the unmodified 29×29 directed bigram frequency table \(N_{a,b}\) from all **12,901 within-page ciphertext transitions** in original LP2 p0–55. The numeric-only p50 is omitted from this rune register, leaving **55 rune-bearing pages and 12,956 ciphertext runes**. Exactly **86** within-page transitions are equal-rune pairs.

For any desired *set of k distinct output plaintext symbols* \(S\), a permutation \(\pi_a\) can map **at most k distinct ciphertext successor symbols** in predecessor row \(a\) into \(S\). Therefore

\[
\#\{i:P_i\in S\}\le
55+\sum_{a=0}^{28}\sum_{j=1}^{k}N_{a,(j)},
\]

where \(N_{a,(j)}\) is the \(j\)th largest entry in row \(a\). The 55 additive starts allow *every original page's first rune* to fall into the chosen k-symbol set, which maximizes the bound in favor of the candidate cipher. This is not a probabilistic argument, learned English score, heuristic, or sampled secret keys. It holds for **all** \((29!)^{29}\) possible row-permutation keys.

More strongly, rank each row's successor symbols by its actual frequencies (breaking ties by GP29 index) and map rank \(j\) to plaintext symbol \(j\). That one concrete family of 29 bijections attains the entire sorted-bin envelope on the 12,901 noninitial original glyphs simultaneously. The bounds are thus **sharp** for the complete architecture.

| Size k of any plaintext-symbol set | Largest possible occurrences (including all 55 favorable starts) | Fraction of original 12,956 runes | Original p57 clear GP29: k most frequent symbols |
|---:|---:|---:|---:|
| 1 | **769** | **5.935%** | **15/95 = 15.789%** |
| 2 | **1,414** | **10.914%** | **24/95 = 25.263%** |
| 3 | **2,026** | **15.638%** | **33/95 = 34.737%** |
| 4 | **2,619** | **20.215%** | **40/95 = 42.105%** |
| 5 | **3,190** | **24.622%** | **46/95 = 48.421%** |
| 10 | **5,831** | **45.006%** | **70/95 = 73.684%** |

The highest-frequency p57 rune is authentic plaintext **E** (GP index18): **15/95**. Its next two most common symbols are **N** and **I** (9 each). The comparison is to **a genuinely known Cicada GP29 plaintext**, not guessed text from an unknown page. P57 is only 95 runes, so it cannot determine a mandatory frequency for every 12,956-rune unknown text; the quantitative conclusion is conditional on LP2 carrying comparably concentrated native English rather than a transformed, balanced or nonlinguistic intermediate register.

The 29 original predecessor rows have top-cell maxima, in GP index order:

\`[26,24,29,23,25,23,29,22,25,25,26,25,22,22,25,24,23,25,27,24,23,24,27,24,28,23,22,26,23]\`.

They sum to **714**, and adding all 55 unconstrained page beginnings yields **769** as the ceiling for *any* plaintext letter. The two-symbol ceiling uses the first two cells of each row and is likewise computed without fitting any secret alphabet. The full 29-entry concentration envelope is printed by the executable SFT.

## Functional positive and original-cipher reproduction

The standalone, no-write Windows Node22 [source-bound SFT](../sims/lp2_prev_cstate_permutation_majorization_sft.cjs) reconstructs the exact 55 page rune arrays and 29×29 transitions from [the canonical untouched original corpus](../resources/liber-primus/lp2-corpus.json). It asserts all original counts, all 29 output-symbol bins of the sharp all-secret bound, a concrete set of secret permutations attaining the bound at all top-k simultaneously, and the exact first ten numerical ceilings.

For a **real clear-GP control**, repeat the genuinely visible p57 GP rune sequence over the original 55 page lengths. Encrypt the resulting **12,956 genuine-GP-rune language plant** using the valid reversible state machine

\[
C_0=P_0+2\pmod{29},\qquad
C_i=P_i-7C_{i-1}\pmod{29}
\]

with an independent initialization for each original page. The same forward/inverse formulas recover all **12,956/12,956** original-language plant runes. This positively verifies the family can encode source-native, highly concentrated GP text and that a generated example respects the computed concentration envelope. A synthetic successful inverse does **not** recover any of the unknown real manuscript plaintext.

The original-input matrix and upper bounds were also independently computed directly from the live canonical JSON before authoring the SFT. The full Node runtime script is preserved for source-native independent execution, including deterministic assertions and its JSON summary. This result requires no nonce, source mutation, key fit, secret dictionary, optimizer, source-language training, or random seed.

## Cryptanalytic decision

**Exclude the entire 29-state, stationary previous-ciphertext-only GP29 substitution family as a decoder of ordinary GP prose with the character concentration seen in authenticated p57.** Its massive nominal secret space does not help: each rowwise bijection can concentrate at most 769 originals into a single output glyph and 1,414 into any two. This is a stronger and genuinely different invariant than the earlier global first-difference cap.

This does **not** prove that LP2 is native plain English after one stage. A page-dependent key/table, unknown additional state or clock, plaintext-feedback cipher, longer contextual key, within-word mixing, compression, nonbijective code, or change in tokenization escapes the finite statement. The paper's intended human operation remains unselected. Consequently **do not spend compute searching 29 arbitrary static successor-state permutations**, including more elaborate keys that merely choose such permutations. The next credible route needs source-given additional state, genuinely new key material, or an original plaintext/ciphertext correspondence.
