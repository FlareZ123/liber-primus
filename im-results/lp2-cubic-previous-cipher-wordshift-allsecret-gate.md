# Cubic GP29 ciphertext-feedback with independent secret word shifts: all-key original exclusion

**Agent45, 22 November 2026. Original-p16–21 discovery / original-p40–45 disjoint holdout. Classification: exact key-independent architectural exclusion for one nonlinear cipher. No previously unknown LP2 plaintext, authenticated original key, or destination recovered.**

## Hypothesis with a complete inverse

Original source arithmetic includes GP29 and cube/reciprocal exponent clues in the p28 DH-related structures. There is no author instruction to use these on physical p16–21, so the following is an exploratory, fully specified cipher family. For every complete original printed word w, grant a completely arbitrary private secret shift k_w in GF(29). Set the preceding cipher state C[w,-1]=0 at the actual original word boundary and encrypt every rune position j:

    C[w,j] = C[w,j-1] + (P[w,j] + k_w)^3    (mod 29).

Since gcd(3,28)=1 and 3×19=57≡1 mod28, cubing permutes GF(29). Define the source-cipher-determined inverse:

    Q[w,j] = (C[w,j] - C[w,j-1])^19        (mod 29).

Then Q[w,j]=P[w,j]+k_w **exactly**, and the consecutive difference Q[w,j]-Q[w,j-1] equals P[w,j]-P[w,j-1] (mod29). Thus **the 29-bin histogram of within-word consecutive differences is a necessary original-plaintext invariant across ALL 29^2896 possible private word keys**. No key optimization, unknown English crib, phase fitting or source-selected private-shift guess is needed.

The operation is ciphertext-visible, low-state, nonlinear, word-boundary-preserving and exactly invertible for any chosen shifts. It is a different bounded consumer from earlier affine-linear predecessor feedback. The missing historical premise is that an original creator instruction ever selected this particular cube-root state or reset.

## Fixed discovery and holdout, with word carries preserved

The exact checked-in source transcription has **12,956 source ciphertext GP29 runes, 2,896 complete source words** over physical p0–55 (excluding rune-free numerical p50). Manuscript line and page wraps cannot be inserted as artificial word boundaries.

The Director-fixed physical p16–21 discovery interval has 1,613 original runes; physical p40–45 untouched holdout has 1,593. We select *only complete original printed words contained in each interval*, excluding 8 and 2 edge-carried runes, respectively, so every word's state begins at an authored boundary. The full source remains unchanged.

| Source region | Complete words | Original source GP29 runes | Key-free within-word differences |
| --- | ---: | ---: | ---: |
| p16–21 discovery | **372** | **1,605** | **1,233** |
| p40–45 untouched holdout | **349** | **1,591** | **1,242** |

### Independent native-English calibration

Convert each of the repository's archived public-domain Gibran, Shakespeare and Emerson texts into source-native GP29 symbols with ordinary QU→CW, V→U, Q/K→C, Z→S and single-rune ING→NG, IO→IA. Use the texts exactly as archived, including Gutenberg editorial front matter where included. In each original region, sample 240 independent native-English registers with **identical original rune-word lengths**, from each author, using deterministic xorshift seed 0x33011033. Compare each native plaintext's 29-bin within-word-difference histogram to the *fixed author-specific source reference* with Pearson chi-square. The original ciphertext is examined only after applying the exact, source-frozen cube-root inverse. No choices are fitted from its histogram.

| Region | GP29 reference | Original exact inverse χ² | 240 length-matched English registers, min–max χ² | Matched controls ≥ original |
| --- | --- | ---: | ---: | ---: |
| p16–21 | Gibran | **311.516** | 16.152–56.064 | 0/240 |
| p16–21 | Shakespeare | **250.838** | 12.158–65.506 | 0/240 |
| p16–21 | Emerson | **258.191** | 11.785–56.288 | 0/240 |
| p40–45 | Gibran | **301.874** | 9.632–59.505 | 0/240 |
| p40–45 | Shakespeare | **246.823** | 10.640–55.899 | 0/240 |
| p40–45 | Emerson | **244.664** | 15.843–58.045 | 0/240 |

The actual cubed-feedback-peeled original differences are strikingly flat across all 29 residues. In contrast, natural source-native GP29 spelling has strongly nonuniform within-word rune differences. The *independent, disjoint holdout* confirms the discovery failure without reranking a secret or introducing a new reset or key. Sampled controls reuse source words, so the 240 observations are an empirical calibration, not 240 independent p-values.

The original manuscript itself supplies **1,001 authentically printed-clear GP29 runes** on LP1 p3,p8–11,p14. The source-native Latin→GP converter also reproduces the clear original LP2 p57 PARABLE **95/95 GP runes**. Earlier historically deciphered LP1 pages that still depict encrypted rune bodies are excluded from the original-plaintext control.

### Constructive positive, not just a score

The reproducer selects exact source-word-length Shakespeare words for both original regions, encrypts every GP rune under the above nonlinear equation with independent secret shifts per word, cube-inverts every planted ciphertext symbol, derives every planted k_w from the known positive plaintext, **recovers all source-native symbols**, and forward-reencrypts exactly. The planted cipher's key-independent within-word-difference histogram exactly equals its original native-GP plaintext invariant across both regions.

The self-contained Windows-compatible, read-only, CommonJS Node22 SFT is [sims/lp2_cube_feedback_wordshift_allsecret_sft.cjs](../sims/lp2_cube_feedback_wordshift_allsecret_sft.cjs); a Windows Node22 CI workflow is [agent45-cube-wordshift-original.yml](../.github/workflows/agent45-cube-wordshift-original.yml). The source-exact arithmetic and independent author comparisons were separately executed on repository-fetched bytes before commit; the new workflow's execution status should not be inferred from these direct results.

## Decision

**Reject the specified cubic previous-cipher-feedback plus arbitrary word-private shift family as a direct native-GP English decoder of p16–21 or p40–45.** The necessary failure covers every possible choice of the 2,896 unknown private shifts without a language-model key search. There is no unknown plaintext or original creator key.

The result does not exclude other cubic operations, two-state or higher-memory machines, changing print-word segmentation, non-English plaintext, external one-time material or further layers. Advancing those possibilities requires a distinct author-supplied opcode, observable state, authentic key, or independently predictive long-run plaintext mechanism. Do not rescue the rejected family by re-phasing or changing unknown keys.
