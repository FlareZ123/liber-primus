# Moving escape rune with discrete-log rank: exact lexical inverse and all-secret envelope

**Agent4, 24 November 2026.** No unknown LP2 plaintext or authentic key. The new lossless changing-sentinel family has a measurable blind key-recovery mechanism on native GP solved-source controls, but all 559 original seven-or-more-rune words fail the frozen lexical constraints, even allowing arbitrary secret predecessor-conditioned escape tables. A still more permissive envelope grants private affine rank keys and a completely independent escape at each position; all 187 original words of length 9–14 still fail.

## Source-led candidate and rival

The source's 86 equal adjacent GP29 runes suggest a predecessor-excluding encoding, and the original red number triangle's 15 is a primitive root in GF(29). Earlier [fixed escape](lp2-fixed-escape-repeat-site-native-language-gate.md) and [word-private fixed escape affine](lp2-wordprivate-rank28-affine-nativelex-gate.md) tests do not cover a moving plaintext escape. The strongest unsupported premise is that the printed word boundaries are meaningful plaintext boundaries and a discrete logarithm rank is the intended operation.

For each plaintext rune P and previous plaintext Q, let E=f(Q) where f is a completely unknown 29-entry table. Given previous ciphertext Cprev, emit C=Cprev+D mod29, with:

    D=0                                if P=E
    D=15^((rank_E(P)+k) mod28) mod29     otherwise
    rank_E(P)=P-[P>E], k=0..27.

Inverse: if D=0 recover E; otherwise r=(log_15(D)-k) mod28 and P=r+[r>=E]. Both states advance continuously, including across page and word boundaries. Initial P and C are 0 in the full control implementation; first plaintext rune of every original word is granted arbitrary for the more permissive lexical gate. No hidden escape bits or rejected ciphertext rerolls. The state law permits different plaintext symbols at different repeat sites.

## Exact all-secret original constraint

For each dictionary candidate word P matching original C in length and each k, every internal nonzero D fixes r. A valid next plaintext rune must be either r (then f(Q)>P) or r+1 (then f(Q)<P). For D=0 require f(Q)=P. Intersect these exact bitmask domains for each preceding plaintext rune. This covers every one of 29^29 tables without enumerating them, and all 28 shifts. The original test even grants independently different tables and shifts per word, so no shared key choice can rescue a word with no candidate.

A stronger envelope dispenses with table consistency entirely: grant arbitrary E independently at every occurrence and an independently secret invertible affine log-rank decoder r=a*log_15(D)+b mod28 per word. All 336 affine choices are covered via at most two intercepts for each of 12 units a, using the first nonzero transition. A repeat gives unrestricted P, while any nonrepeat still requires P in {r,r+1}. This is a necessary condition even if the escape is selected by an arbitrary hidden state. The first rune remains unconstrained.

## Original results

The canonical parser checks all 2,896 original printed words and 12,956 rune indices, with page and line wrapping transparent. Independent TextBlob GP lexicon: 29,060 distinct forms.

| GP length | Original words | Moving f, all shifts: any candidate | Arbitrary per-position E and per-word affine rank: any candidate |
|---|---:|---:|---:|
| 7 | 216 | 0 | 36 |
| 8 | 156 | 0 | 5 |
| 9 | 78 | 0 | 0 |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| Total | 559 | 0 | 41 |

Even the stronger envelope has no candidate for any of the 187 words length 9–14. This is exact over the specified finite lexicon and word parse, not a proof about every possible natural-language word. A fully arbitrary rank permutation or a changing affine key inside a word, rather than just changing the escape, is outside the envelope.

## Actual blind recovery with held-out continuation

Use three disjoint 60-word blocks from the published 740-word solved-Cicada GP corpus, restricted to words of length >=5 present in the independent lexicon (205 eligible words). This is a lexical positive, not a coherent prose sample. Encrypt with three distinct hidden affine escape tables f(q)=m*q+b mod29, each with independent k. On first 40 ciphertext words only, propagate all-secret table domain constraints across lexicon candidates, then enumerate the affine subclass and test exact full-word lexical compatibility including cross-word edges. Freeze the unique recovered key and decode 20 held-out words continuously. No plaintext is given to the inference algorithm.

| Plant | Recovered unique (m,b,k) | Runes recovered in full | Held-out words exact |
|---|---|---:|---:|
| 1 | (1,7,7) | 413/413 | 20/20 |
| 2 | (3,13,19) | 404/404 | 20/20 |
| 3 | (5,21,3) | 397/397 | 20/20 |

All 1,214 planted runes recover and replay exactly. All three original rotation keys are uniquely retained even before restricting to affine f; the unrestricted table itself is not uniquely identified by these plants. True dictionary word remains in every training domain. This distinguishes actual key recovery in the compact subclass from broad necessary-condition rejection.

## Decision

Retire this dynamic escape/rank receiver, including any extra hidden state used solely to choose the escape if the remaining rank decoder is fixed affine within each word. This addresses the strongest obvious fixed-sentinel loophole without assuming a rare rune or prescribing repeat-position frequencies. A genuinely evolving non-escape alphabet, changed segmentation, or independent source-selected nonlinear mapping remains possible. No need to scan alternative primitive roots: any primitive root changes the discrete log by a unit multiplier modulo28, already within the private affine envelope.

[Read-only CommonJS SFT](../sims/lp2_contextual_escape_rank28_lexical_sft.cjs). Executed against checked-in repository sources in connected V8; no Windows CI run claimed. Run `node sims/lp2_contextual_escape_rank28_lexical_sft.cjs`. Outputs all per-length counts, all shared rotation survivors, domain sizes, recovered affine key and held-out exact replay.
