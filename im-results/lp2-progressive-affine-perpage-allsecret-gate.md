# LP2 progressive affine cipher: exact all-secret page-local original-input exclusion

**Agent 23, 13 November 2026.** The complete 12,956-rune original ciphertext cannot be the direct output of a pagewise affine progressive Caesar/Trithemius operation applied to the tested source-native GP-English text register. The result holds with **every page independently choosing three entirely unknown parameters**. A native-English planted control is detected without knowing any of its 55 independently selected keys. No new plaintext, authentic source key, decoding instruction or continuation has been recovered.

## Human-visible premise and frozen cipher family

The authentic manuscript uses the 29-symbol Gematria Primus alphabet and shows a striking shortage of repeated adjacent ciphertext runes (86 among 12,901 same-page adjacencies). A historically simple alternative to a complicated changing permutation is a *progressive alphabet shift*: add a running position counter to each plaintext rune. An ordinary GP alphabet can make particular transitions much rarer under such a counter. The source-visible page divisions motivate considering new affine parameters on each original physical page; no historical instruction, however, actually prescribes this operation.

Test the full family

`C[p,i] = a[p] * P[p,i] + b[p] * i + c[p] (mod 29)`

where `i` is the rune-local zero-based index, `a[p]` is any nonzero residue modulo29, and `b[p]` and `c[p]` are arbitrary. There are **28 × 29 × 29 = 23,548 possible keys per page**, independently over 55 rune-bearing pages. Original physical page p50 remains runeless and consumes no key. All original runes and page boundaries are preserved; this is a **single-layer direct-GP29 English cipher** with no inserted escape register.

**Exact all-key reduction.** Given any candidate page slope `b`, subtract `b*i`. Subsequent multiplication by the inverse of `a` and subtraction of `c` are bijections of the 29 rune symbols. They **cannot alter the number of equal-symbol pairs** inside that page. Thus the largest possible per-page index of coincidence is exactly

`max_b [ sum_x n[p,b,x]*(n[p,b,x]-1) / (L[p]*(L[p]-1)) ]`,

with `n[p,b,x]` counting rune `x` in the original page after subtracting `b*i`. Summing the 55 exact pair-count maxima before division gives an upper bound on **every possible combination of all 55 secret page keys**. Only **55 × 29 = 1,595** candidate page/slope measurements are needed, with no plaintext-optimized key search.

## Original result and matched native-language test

The self-contained test reads `resources/liber-primus/lp2-corpus.json` and independently checks every symbol against the printed-word transcription parsed by `sims/lp2_word_pages.cjs`. It uses all 55 rune-bearing unknown physical pages, **2,896 complete words**, and **12,956 original GP rune positions**.

| Exact test | Page-stratified GP29 IoC |
| --- | ---: |
| Original unchanged ciphertext | **0.034039152717** |
| **Best possible original under all independent pagewise secret affine slopes** | **0.037049264792** |
| Lowest of 1,000 length-matched Gibran-native plaintext controls | **0.057895572747** |
| Median of 1,000 native controls | 0.059338100490 |
| Highest of 1,000 native controls | 0.060836903699 |
| Positive source-English affine plant, correctly solved slope among all 29/page | **0.058937919409** |

Controls originate from the repository's fixed `gibran_prophet_58585.txt` corpus, GP-normalized with the same K/Q→C, V→U, Z→S and multigraph conventions used in other project native-register controls. Each control is constructed by selecting **one authentic source word with exactly the length of each original LP2 printed word**, preserving the entire original 2,896-word length sequence and all cross-page rune offsets. The 1,000 independently sampled 12,956-rune sources use deterministic xorshift32 seed `0x15e2026`. Even the lowest complete native control exceeds the **mathematically maximal** original-cipher result by more than 0.0208 absolute IoC.

The planted positive uses one source-native control and encrypts each page independently with a randomized nonzero multiplier, an independent progressive slope, and an independent additive constant, unknown to the inference. Its encrypted page-stratified IoC is **0.035013968821**, close to the original noise-like value. The same exhaustive per-page maximization attains the exact unencrypted control IoC **0.058937919409**, as it must. The source plant thus demonstrates that the numerical bound has power against a *genuine instance of the tested full secret-key family*, even with changed keys on all pages.

## What this rules out, and what survives

In this finite, source-native GP-English setting, the literal GP29 progressive Caesar/Trithemius family and every page-specific affine-key variant are excluded as direct one-layer decryptors. Its very large all-key space **cannot** rescue the original, because the pair-count invariant is exact. An arbitrary encrypted text could still be engineered to have a flatter original letter inventory; our natural-language inference is limited to the tested Gibran GP register and the assumption of a direct GP29 plaintext mapping. Other languages, non-GP intermediate registers, multi-step encryption, transposition mixed with substitution, changing slopes inside pages, feedback, or independently encoded word boundaries are not covered.

**Research consequence:** do not tune a progressive per-page affine key, a page-specific Caesar offset or an alphabet multiplier against the original until an independent clue justifies a different output register or added layer. This direct-classical explanation has an exact negative gate. The scarce unsolved input remains an original-source key, state update or reversible operation that predicts genuinely unknown text.

**Reproduce:** [single-file CommonJS original-cipher SFT](../sims/lp2_progressive_affine_perpage_allsecret_sft.cjs). It asserts exact input rune identity, both original numerical bounds, all native-control summaries, and a source-native full-length positive cipher plant before emitting one JSON verdict. It is read-only and uses existing repository sources; no key tuning, artificial page deletion or new training corpus is required.
