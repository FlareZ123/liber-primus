# LP2 word GP-prime-sum residues exclude a direct stationary numeric word code

**Classification, 11 November 2026:** conditional all-secret-key original-input exclusion. No unknown LP2 plaintext, authentic key, or destination recovered.

## A historically motivated inverse that can be tested without knowing a key

Cicada's original 2013 `0_wisdom` explicitly elevates prime-number arithmetic. Replacing the 13 rune-word cells with their GP-prime sums reconstructs the genuine 2014 5×5 Wisdom square, 25/25 cells. The signed 2016 continuation calls words the map and numbers the direction. An economical missing-code hypothesis is that **every LP2 printed ciphertext word is a randomized rendering of the corresponding plaintext word's GP-prime sum**, possibly under a secret fixed 29-symbol remapping. This could explain randomized-looking glyphs and word lengths that differ from natural controls. It would also allow numeric-word attacks without brute-forcing every symbol.

For a printed word \(w\), let \(S(w)=\sum_{r\in w}\mathrm{GPprime}(r)\pmod{29}\). If \(S(C_i)=\sigma(S(P_i))\) for one arbitrary unknown 29-way bijection \(\sigma\), then *the histogram of 29 word-sum residues is unchanged up to relabeling*. In particular the Pearson concentration \(\chi^2=\sum_{a=0}^{28}(n_a-N/29)^2/(N/29)\) is **identical under all 29! secret residue permutations**, regardless of ciphertext word lengths and actual cipher glyphs. This is a key-independent necessary condition, not an assumption that the secret mapping is Caesar/Vigenère. It also applies when complete integer word sums are preserved, since that forces equal residues.

## Original LP2 result

The exact shared parser yields **2,896 printed words / 12,956 original ciphertext runes** on 55 unsolved rune-bearing physical pages, retaining 32 cross-page words. The 29 original word-sum residue counts are:

`[78,101,112,99,93,103,108,92,99,87,110,93,97,97,110,106,110,101,95,104,78,107,111,114,100,105,100,96,90]`.

Their Pearson concentration is **24.2479281768 on 28 nominal degrees of freedom**, close to the uniform-code expectation. Their raw integer word-sum mean, **230.72583**, happens to be close to the pinned Vulgate source mean **229.98230**; that mean agreement is misleading because the original source's sum residues are far more evenly distributed.

The original same-source normalizations are used: English Shakespeare/Gibran/Emerson GP transliteration contracts TH/NG/EO/OE/AE/IA/EA and normalizes V→U, K→C, Z→S, Q→C; Latin Vulgate is taken from the source's preserved GP-word list. Every contiguous **2,896-word** reference window was independently checked. None has a sum-residue concentration as low as LP2:

| Original GP-language reference | Source words | Contiguous 2,896-word windows | Least concentrated reference χ² | Windows ≤24.24793 |
| --- | ---: | ---: | ---: | ---: |
| Latin Vulgate | 39,835 | 36,940 | 527.02141 | 0 |
| Shakespeare | 55,407 | 52,512 | 401.34807 | 0 |
| Gibran, *The Prophet* | 15,733 | 12,838 | 886.79765 | 0 |
| Emerson essays | 77,932 | 75,037 | 504.47030 | 0 |
| **Total** | | **177,327** | | **0** |

This comparison preserves each independently published source's natural word-order clustering instead of treating every word as iid. Overlapping windows are highly dependent; **0/177,327 is a finite coverage statement, not a discovery-wide p-value**. A separate exact complete-integer-word-sum fingerprint search found no four consecutive LP2 sums in any of those four reference corpora. That specifically rules out a direct four-word copied source fragment in these pinned passages under literal sum preservation, without ruling out any other source text.

## An exact hidden-map positive

Construct an independent positive from the first 2,896 Shakespeare GP words. For each word's real source sum residue \(r\), apply a hidden invertible map \(\sigma(r)=7r+11\pmod{29}\), then encode the resulting residue as a two-rune GP ciphertext word with *distinct adjacent runes* and the same sum residue. All 29 target residues have such a two-rune encoding. The output glyph strings and word lengths are unrelated to the source, but the sum-histogram concentration remains **exactly invariant**; the hidden inverse \(r=25(s-11)\pmod{29}\) recovers **2,896/2,896** true source word residues. This checks that a length-changing, nonrepeating, genuinely secret residue-code mapping would be detected by the invariant.

## Moving preceding-word GP-prime-sum feedback: original-source inverse

A finite moving-word candidate follows the documented historical GP-prime-sum convention. For each canonical ciphertext word, use the **preceding ciphertext word's** sum of GP prime weights modulo29 as a constant GP29 Caesar shift. Initialize with the previously published Cicada constant `3301 mod29`. Freeze the word-clock as continuous across the book, or reset at physical page start, and test both Caesar signs: `K[w+1]=sum(GPprime(C[w])) mod29`, `P[w,j]=(C[w,j]+sign*K[w]) mod29`. This is a hypothetical reading of the authenticated 2016 words/numbers/direction instruction; there is no authentic source specifying the constant-shift operation.

| Original GP29 stream | Index of coincidence | GP-English trigram score (nats/rune) |
| --- | ---: | ---: |
| Original unknown cipher | 0.034478398 | −4.147504 |
| Prior-word shift, sign −, continuous | 0.034491052 | −4.150405 |
| Prior-word shift, sign −, page reset | 0.034482318 | −4.148675 |
| Prior-word shift, sign +, continuous | 0.034479256 | −4.155553 |
| Prior-word shift, sign +, page reset | 0.034482938 | −4.154508 |
| Independent native Shakespeare GP29 | 0.058840759 | −2.459500 |

The trigram control uses the first 100,000 GP-encoded runes of `resources/control/shakespeare_first300k.txt` to fit additive-smoothed conditional trigrams. The independent 12,956-rune reference starts at source offset150,000. All four original inverses exactly re-encode the 12,956 ciphertext runes and remain uniformly ciphertext-like. A planted positive formed by repeating solved p57's 95 GP runes across the original 2,896 word slots is encrypted and recovered exactly in every mode. Alternative starting shifts affect only the first word after each reset, so they cannot rescue the rest of this model. This is a bounded negative for causal *preceding-cipherword GP-prime-sum constant word shifts*, without constraining variable-rate or nonlinear moving-key architectures.

[Self-contained original-input and native-plant test](../sims/lp2_previous_word_prime_sum_feedback_sft.cjs). No authentic unknown plaintext or key recovered.

## Decisive boundary

The tested **stationary 29-way GP-prime-sum code is incompatible with all four finite natural-language source controls**, even with an arbitrary secret fixed permutation, changed word lengths, and unrelated rune spellings. The usual short function words concentrate native prose word sums sharply, while LP2's printed sums are nearly uniform. A natural-language plaintext with an exceptionally flat word-sum histogram, a distinct language, a changing per-word/per-page sum substitution, numeric state, reordered plaintext words, or deliberately inserted/removed ciphertext words remains possible. No language-independent impossibility is asserted.

The next decision is to identify a source-specified **moving** direction/key/word operation beyond the direct preceding-word constant shifts tested above. Retrospective individual sum coincidences such as CABAL and UOID/VOID cannot justify asserting that ciphertext prime sums directly reveal plaintext word identities without a corresponding full-register mechanism.

**Reproducer:** `sims/lp2_word_sum_residue_source_gate.cjs` uses canonical rune-word boundaries, the four pinned natural-language references, exact rolling-window Pearson statistics, literal four-word sum-source hits and the two-rune positive. It requires Node.js 22 and no external dependency.
