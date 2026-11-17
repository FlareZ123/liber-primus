# Nine-chapter nonzero-step GP28 unrestricted-pad reuse, all relative offsets

**Agent 3, 17 November 2026. Decision: no evidence of a reused nonperiodic GP28 step pad; no unknown Liber Primus plaintext, original key or destination recovered.** Complete [Windows/Node22 original-source test](../sims/lp2_nonzero_step_allshift_sharedpad_sft.cjs), passing [run 44002765736](https://github.com/FlareZ123/liber-primus/actions/runs/44002765736).

## A possible original-cipher decipherment mechanism

The unsolved manuscript has 12,956 GP29 runes in nine visually marked chapter bodies of lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. Their predecessor steps yield only **86 zero differences**, suggesting a possible reversible 28-valued alphabet for all nonzero differences. The two source-motivated, explicitly testable encodings of a nonzero field difference d are **d−1** (cyclic sorted rank) and **log base 15 of d**, the latter motivated by the primitive order-28 root 15 appearing in the p39 red field polynomial. No original instruction authenticates either representation.

If chapter j emits rank R[j,t] = P[j,t] + K[t+s_j] + a_j modulo 28, where K is an unrestricted-length nonperiodic reusable secret pad, s_j is any chapter-specific pointer displacement and a_j is a constant, then for the correct chapter-pair offset the pad **cancels** in R[a,t]−R[b,t+delta]. The clock advances only when the observed ciphertext predecessor step is nonzero. All secret key symbols may remain unknown. This tests a genuine potentially exploitable cipher family, distinct from existing original-rune GP29 all-shift and repeating-28-tap tests. Its weakest premise is **reuse of the same key across original visual chapters** despite no first-party command to do so.

## Complete original data and calibrated maxima

The nine original nonzero-step tape lengths are **[724, 1138, 1719, 1892, 1009, 1419, 1667, 2989, 304]**. The source-exact reproducer scans every pair and integer pointer offset preserving at least 256 overlapping nonzero steps: **84,492** alignments for each of the two fixed rank encodings. At each alignment it optimizes the 28-way relative Caesar residue and reports the maximum normalized selected-bin excess z. This postselected maximum is **not** a single-trial p-value.

| Step rank | Original max z | Chapters (0 based) | Offset | Overlap | Largest bin |
|---|---:|---|---:|---:|---:|
| Cyclic sorted | **5.916245** | 2, 8 | +488 | 304 | 30 at residue 18 |
| Primitive-log base 15 | **5.649967** | 2, 4 | −463 | 546 | 44 at residue 19 |

Eight independently seeded null manuscripts per rank transform relabel each complete chapter's **28 nonzero-step rank symbols bijectively**. This preserves chapter lengths, observed rank repetitions, all 86 original repeated-rune events, and local rank-equality structures while disrupting shared modular key relations. Each null repeats the **entire 84,492-alignment optimization**.

- Cyclic sorted control maxima: **5.44984, 6.13923, 5.86837, 5.35522, 6.53436, 5.60719, 5.81850, 6.27917**. **3/8** exceed the original maximum, empirical add-one tail **4/9**.
- Log-base-15 control maxima: **5.57788, 5.64785, 5.91624, 5.91624, 5.60719, 5.84032, 6.55406, 6.90483**. **5/8** exceed the original, empirical add-one tail **6/9**.

Both original maxima are routine for their fully optimized randomized comparisons. Eight controls are diagnostic rather than a precise significance estimate. There is no candidate unknown plaintext or authentic key from either winner.

## Source-native reversible positive

The same script enciphers independent, genuinely GP-transliterated Gibran text under a **genuinely shared arbitrary 4,000-symbol GP28 pad**, with nine different secret chapter pointer offsets and constants. The complete forward encoder accumulates valid nonzero GF29 ciphertext predecessor steps and preserves **exactly the original 86 zero-step locations** as reserved rune events. Both corresponding inverse decoders recover every planted source symbol, and both all-offset scans find the planted true key alignment.

The positive maximum is **z=9.630266** for both rank constructions: chapters 2 and 5, relative offset +24, relative constant residue 14, **118/1419** matching difference residues. The program explicitly asserts the recovered offset and residue equal the independently planted secret values. This is a meaningful sensitivity positive because the source has chapter-specific key shifts, exact original 86 repeated sites and a real English GP28 register.

## Key-independent extension: arbitrary nonperiodic secret alphabets

The additive-pad model is stronger than the bare **reuse of a key-position-specific alphabet permutation**. Suppose each key position has its own entirely arbitrary, unknown bijection \(f_t\) over the 28 observed nonzero-step ranks, and the same set of \(f_t\) tables is reused between original chapters with independent hidden pointer offsets. The source cipher would be \(R_{j,t}=f_{t+s_j}(P_{j,t})\). At the correctly aligned cross-chapter positions, **ciphertext-rank equality is equivalent to plaintext-rank equality**, independently of any of the secret \(28!\) alphabet choices per key position. This is an exact keyless necessary-condition signal for two independently written, ordinary-English GP28 passages; unlike additive differences, it survives arbitrary nonlinear symbol relabelings.

A new [standalone full-source CJS test](../sims/lp2_nonzero_step_allshift_allsecret_sft.cjs) performs **all 84,492 chapter-pair and relative key-pointer offsets** with at least 256 compared ranks. Every original zero-step position is skipped exactly once and neither the original symbol values nor punctuation are edited. Compare the fully optimized source maximum with **twelve complete independently relabeled original-chapter controls**, not an unoptimized null. The controls keep all original per-chapter nonzero-step equality events, counts, word runs, and **86 literal repeated-cipher-rune sites**, but each chapter's 28 symbols are independently permuted.

| Complete full-shift test | Highest rank-equality z | Chapter pair | Relative offset | Equality observations |
|---|---:|---|---:|---:|
| Original LP2 p0–55 | **4.6235493704** | 5 versus 7 | −429 | **83/1419** |
| Twelve chapter-wise label-permutation nulls | **4.528–5.636** | Each optimized independently | Each optimized independently | **11/12** maxima exceed original |

The add-one descriptive upper-tail is \((11+1)/(12+1)=12/13\); the original maximum is lower than 11 of the 12 true matched-search control maxima. This original-vs-null comparison **does not** select an independently recoverable shared nonlinear key offset.

An independent full-length genuine-GP-language positive uses real Gibran text, an independently sampled **arbitrary permutation of all 28 output ranks for every one of 4000 secret keystream positions**, and nine different hidden chapter pointers. The forward encoder reconstructs all 12,956 source-length GP29 ciphertext runes through their cyclic nonzero differences, preserving **exactly the 86 original repeated-position sites**. The inverse, knowing the independently planted bijections, recovers **all 12,870** GP28 source runes and every zero event. With all secret permutations hidden during scanning, the equality test identifies the correct true relative pointer **+25**, chapters **2 and 3**, at z **7.7899812435**, with **120/1694** equality hits. This is an authentic shared-state nonlinear-alphabet sensitivity test, not a synthetic score generated by an additive-only model. Full [Windows/Node22 CI run 44004297714 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44004297714) on the exact committed code.

**Stronger decision:** there is no detectable cross-chapter reuse of a shared completely arbitrary, position-specific GP28 alphabet stream on this **nonzero-ciphertext-step/event-clock** under any relative chapter offset, judged against independently written native-GP controls. This keyless test subsumes additive-pad *equality* correlations without assuming an additive output law. It **does not** exclude independently keyed chapters, a transcript encoded in a different linguistic register, non-bijective output, independently changing page salt, key-pointer advancements at zero-step events, or plaintext-dependent state. The source itself has not selected this alphabet architecture, so no significance claim can authorize extrapolating another hidden transform.

## Research decision

**Retire this GP28 nonzero-event-clock reused-key family at arbitrary relative chapter offsets: the originally tested additive pads and the more general key-position-specific 28-way secret permutations.** The negative pertains to the two fixed rank maps under independent source-language controls and is a practical prioritization bound, not an information-theoretic exclusion of every cipher. Independent keys or changing alphabet schedules per chapter, plaintext feedback, altered word registers and independently selected transformations remain possible. The original winners do not justify adding arbitrary adjustment layers to force a high score.

This directly complements the [GP29 all-relative-shift full-rune pad experiment](lp2-allshift-ninebody-additivepad-gate.md) and [fixed 28-tap GP28 quotient experiment](lp2-q252-ninechapter-gp28-step-gate.md), without repeating their clocks. The authentic unsolved text remains cryptographically unrecovered.
