# Fixed-zero-anchor differential cipher on original LP2: exact word-pattern and conditional English gates

**Agent8, 18 November 2026. Status: bounded original-cipher negative; no authentic plaintext or key.** This is a constructive attack on a distinct, invertible nonperiodic alphabet mechanism motivated by the striking lack of adjacent identical ciphertext runes. It closes the *one global, secret zero-input symbol* version for ordinary GP29-native English with unchanged printed word slots, even if all other 28 outputs use unrelated, independently secret bijections at every position. It does not exclude position-dependent zero symbols, insertion/escape channels, word division changes, non-English plaintext, or a symbol with a deliberately unnatural English register.

## Exact attack contract

Let $C_{w,j}$ be original GP29 ciphertext within printed word $w$ at zero-based symbol position $j$. Consider this family, for any secret $q\in\mathrm{GP29}$:

\[
C_{w,j}=C_{w,j-1}+\pi_{w,j}(P_{w,j})\pmod{29},\qquad j\geq1,
\]

where each secret $\pi_{w,j}$ is a **full 29-symbol bijection**, may differ at every step, and must satisfy $\pi_{w,j}(q)=0$. Every other 28 mapping is completely unconstrained and may change nonperiodically. The first cipher rune in each printed word can be arbitrary and is not used in this necessary-condition test.

This is invertible with the key and the previous ciphertext symbol. It maps one potentially rare plaintext symbol $q$ to the zero ciphertext step, while moving all other plaintext symbols to nonzero ciphertext steps. Crucially, **regardless of the unknown keys,**

\[
C_{w,j}=C_{w,j-1}\quad\Longleftrightarrow\quad P_{w,j}=q\quad (j\geq1).
\]

The entire negative is driven by this equality, so there are no parameter searches over the other 28! alphabet mappings.

## Original-input observations and exact lexicon gate

The repository's original-source GP29 transcription gives **12,956 ciphertext runes in 2,896 printed words** over physical p0–p55. There are **63 within-word zero steps in 62 marked words** (the remaining one word has two within-word repeats). Printed word boundaries remain as in the original image transcription. The reference-normalization convention is the repository's GP29 orthography, including ING→NG, IO→IA, V→U, K/Q→C, and Z→S.

For each $q$ among all 29 GP runes, construct a Boolean mask of its required positions in *every* word containing an original zero step. Check whether the TextBlob spelling lexicon contains **any** GP29-normalized native-English word of the *same printed length* with exactly that mask. This grants each source word an entirely independent dictionary choice, making it a very permissive language test.

- **21 of 29 possible zero-input symbols are impossible** already in at least one original marked word under that lexicon.
- Only **C, N, S, T, E, L, D, A** survive *all* 62 marked-word masks.
- The double-zero original 12-rune word at word index1476, with required positions 5 and11, is particularly constraining. This remains a lexical, model-conditional exclusion: TextBlob omits many legitimate archaic and proper words.

For the eight survivors, there is a different obstruction: each is common in ordinary English. If the fixed-anchor model generated source-native GP plaintext with these original printed word lengths, the count of within-word occurrences of that symbol would equal exactly the observed **63**, with all other occurrences prohibited.

## Reference-conditioned bound, with its exact scope

For each reference book independently, sample each of the original 2,896 printed slots from its GP29-normalized English words **of the matching GP rune length**. The three references cover **2,813 original length slots**; the 83 unsupported slots are omitted, and 63 is used as a conservative upper bound on the possible count in the supported slots. Word draws are independent with replacement *for this particular null model*. Frequencies are empirical within the original slot lengths.

For a candidate fixed symbol $q$, let $X$ be the total number of postinitial $q$ runes under this source-native null. The test computes an optimized **Chernoff upper bound** on $\Pr(X\le63)$ using exact per-length empirical probability-generating functions:

\[
\Pr(X\le63)\le\inf_{t<0}e^{-63t}\prod_{\ell}\bigg(
E[e^{tX_\ell}]\bigg)^{N_\ell}.
\]

| Independent native-GP English reference | Minimum mean among 8 surviving symbols | Weakest upper-tail-exclusion bound, any survivor |
|---|---:|---:|
| Gibran, *The Prophet* | 331.96 (C) | $\Pr(X\le63)<10^{-75.44}$ |
| Shakespeare, first 300k characters | 348.44 (C) | $<10^{-83.93}$ |
| Emerson, essays | 365.01 (C) | $<10^{-90.43}$ |

For the candidate E, the expected source count is about **1,480–1,491** and its corresponding lower-tail bound is far smaller. All eight survivors are dramatically incompatible with these three *conditional source-native English sampling models*, even though their required word-mask shapes are lexicon-feasible. These conditional numerical bounds are **not** global probability estimates for all possible English texts, cipher families, alphabet normalizers, or the author's intentions.

## Constructive positive and reproduction

The [single-file CommonJS test](../sims/lp2_fixed_zero_anchor_original_sft.cjs) implements 29 exact 10-symbol lossless plants, one for each anchor $q$, using an **independently changing secret nonzero rotor permutation at every position**. It decodes each from its known test key and checks the zero-step equivalence. Original source masks and all three empirical bounds are then tested with assertions.

Windows Node22: **PASS**, [manual SFT run 44330228021](https://github.com/FlareZ123/liber-primus/actions/runs/44330228021) (commit [1c8e64e](https://github.com/FlareZ123/liber-primus/commit/1c8e64ee8bb614379934fa5e84bafa14b7c18fb6)). There are no generated workflows, no new long-running CI shards and no original plaintext candidates.

## Research decision

The architecture **"every plaintext noninitial rune is mapped bijectively to a changing ciphertext step, but one unknown and globally constant GP29 plaintext rune always maps to step zero"** is a poor explanation for the intact original word-slot register. It fails 21 q values on generous exact lexical constraints and the other 8 under strong independent GP29-native English word-length-conditional distributional tests. A stronger source-driven candidate must name how the zero-input symbol **changes**, how the printed word divisions **do not describe plaintext**, or which source-selected language/register makes a rare fixed $q$ compatible with the observed word masks. It must then recover genuine contiguous original plaintext and reproduce the ciphertext, not merely fit the 63 repeat sites.

No creator-selected key, new deciphered page or intended Cicada continuation follows from this study. It is an original-cipher obstruction to a compact invertible feedback family, not a claim of solved LP2.
