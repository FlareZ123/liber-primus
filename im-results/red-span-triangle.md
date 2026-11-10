# A three-page red-ink triangle and its finite-field interpretations

**Classification: exact exploratory red-source arithmetic, a conditional rotation-family probability, and two powered negative original-cipher key interpretations. No unknown LP2 plaintext, key, established cipher method, or destination has been recovered.** The red triangle itself was constructed *after* examination of the existing prime-sum crosslink, so even an extreme exact conditional probability is not a discovery-wide significance estimate. The later F79 and F29 operations were also recognized after examining those three quotients.

## Source and complete arithmetic rule

Input: all **16 verified red-rune spans on physical LP2 pages 0–55**, as defined by `resources/liber-primus/lp2-ink-annotations.json`, and the original GP indices and prime assignments from `resources/liber-primus/lp2-corpus.json`. The red rune at physical page 53 offset 128 is `ᛏ`, included in its **51-rune** span. Page indices are zero-based physical LP2 indices; they do not omit runeless page 50.

For each red span `X`, let `S_X` be the sum of the GP **prime values** of its runes. Set `q_X=S_X/29` when the sum is divisible by 29, otherwise leave `q_X` undefined. Define a three-span *triangle* as any **ordered triple of distinct marked spans** `(A,B,C)` simultaneously satisfying:

1. `q_A = page(B)`, a pointer from a quotient to a physical page number.
2. `page(C) = GP_prime[q_A]`, interpreting `q_A` as a **zero-based** GP rune index in 0..28. Thus the same quotient also points to the physical page numbered by that rune's assigned prime.
3. `q_C = p_(q_B) - 1`, using the **one-based ordinary prime ordinal** `q_B`, and the prime-totient transform authenticated by solved LP2 page 56. The page-15 Fibonacci spiral independently includes `p_22=79` and its immediately following `p_35=149`.

Search *every* marked span as A, B, and C, retaining distinct spans; do not preselect the three matching pages. The original ciphertext produces **exactly one** triangle:

| Source | Physical page, red span offset | GP prime sum | Quotient | Exact role |
| --- | --- | ---: | ---: | --- |
| A | page **40**, offset 0, length 8 | **435** | **15** | `q_A=15` points to page 15; GP index 15 is `ᛋ`, with GP prime value **53** |
| B | page **15**, offset 0, length 9 | **638** | **22** | Fibonacci spiral's 22nd ordinary prime is **79** |
| C | page **53**, offset 128, length 51 | **2262** | **78** | `78 = 79-1 = φ(79)`, and physical page **53** matches the GP prime of rune index 15 |

This adds a new **page-index plus zero-based GP-prime pointer** to the earlier reported red prime-totient pair. It is a closed triangular relation with three source-selected red headings/passages, rather than an arbitrary rotation or unmarked subset selected to fit the numbers. No rule for applying these numbers as a keystream is known.

## Exact source-constrained rotation-family probability

The null independently and uniformly rotates each physical page's **entire rune sequence** by one of its page-length cyclic offsets. All original page rune inventories, red offsets, red lengths, and within-page relative positions remain fixed. Every red span on the same page receives the **same** rotation. Calculate each rotated window's GP-prime sum and rescan all ordered distinct-span triples under the unchanged three conditions above.

An exhaustive analytical reduction over all original spans and all possible individual page rotations establishes that only **three** triples can ever satisfy the rule under *any* such rotations. They all have B = page 15 offset 0, C = page 53 offset 128. Their allowed A sources are physical page 6 offset 71, page 33 offset 0, and page 40 offset 0. The first two are possible only on rotated, not actual, source pages.

The necessary exact quotient occurrences each have **one** satisfying cyclic offset:

| Page and span | Required quotient | Satisfying offsets / page length |
| --- | ---: | ---: |
| 6, offset 71 | 15 | **1/196** (rotation 65) |
| 33, offset 0 | 15 | **1/214** (rotation 201) |
| 40, offset 0 | 15 | **1/231** (rotation 0) |
| 15, offset 0 | 22 | **1/159** (rotation 0) |
| 53, offset 128 | 78 | **1/179** (rotation 0) |

The three A-source pages are mutually independent and independent of the two B/C pages under this null. Their events overlap only in the B/C prerequisite, giving an **exact probability** for *at least one qualifying triangle anywhere in the 16 marked spans*:

```text
P = [1 - (195/196)(213/214)(230/231)] / (159 × 179)
  = 22669 / 45960075084
  ≈ 0.0000004932324405
  ≈ 1 in 2,027,442
```

This is an *exact union probability under the fixed model*, stronger than the loose sum bound `4.955532954×10^-7` and more precise than a sparse Monte Carlo count. An independent three-million-manuscript xorshift32 rotation experiment, seed `0x33011553`, observed **1** matching surrogate. Its noisy count is consistent with this exact probability; the exact expression is preferred.

The already-selected original page-40/page-15/page-53 rotations alone have probability `1/(231×159×179)=1/6,574,491`. That targeted number must not be confused with the full 16-span family probability.

## First interpretation: self-indexing primitive root and 78-cycle in F79

The same three ciphertext-derived integers generate two further exact modular facts:

```text
53^15 ≡ 15 (mod 79)
ord_79(53) = 78 = φ(79)
```

Here 15 is the page-40 red sum quotient and the **zero-based GP index** of rune **ᛋ**, whose prime weight is **53**. The page-15 red sum quotient 22 selects the ordinary prime 79 in the original Fibonacci spiral, and page-53 red quotient 78 gives its totient. The original source arithmetic therefore selects **53 as a primitive root modulo79**, with a *self-indexed discrete logarithm*: log-base-53 of 15 equals15 modulo78. The order can be certified by the nonunit tests `53^6 ≡22`, `53^26 ≡55`, `53^39 ≡78`, followed by `53^78 ≡1` (all mod79). The proper suborders divide 78/13, 78/3 or 78/2; none yields 1. Among all **29 GP index/prime pairs**, only index15 satisfies **both** `GPprime[i]^i ≡ i (mod79)` and full order78. Index18 with prime67 satisfies the self-index equality but has order13. This is a new arithmetic property of the *already selected* triangle and cannot be assigned another discovery-independent p-value.

A reproducible [source-derived direct-key challenge](../sims/red_triangle_primitive_key.cjs) evaluates the following complete and reversible interpretation: initialize `state=53^15 mod79=15` or conventional `53^1=53`; use `K=state mod29` as an additive mod29 GP keystream, advancing `state ← 53*state mod79` after each output. Test also a **visible ᛋ clock gate** that pauses the advance whenever the **published ciphertext** equals GP index15. The alternative start exponent1 and pause/no-pause possibilities total **four fixed models**. Each may pass through **any one fixed, wholly unknown 29!-way ciphertext alphabet permutation**, `C=σ(P+K mod29)`; no alphabet parameters are estimated. The invariant statistic `I(K;C)` detects key/cipher dependence regardless of the choice of σ.

Targets are the **original two source-marked black text bodies** immediately following red title material: p15 local offset20 through p22 (**1,883 runes**) and p40 local offset8 through p55 (**3,308 runes**), with independent state reset at each body start. The independently solved LP1 GP reference yields **3,736 runes** and unigram IoC **0.061581**. Source-matched positive controls sample that GP register over exactly the original 5,191 target slots, encrypt using the true modular state, apply an unknown random 29-symbol output permutation, and overwrite 81% of immediate repeated tentative ciphertext symbols. The synthetic controls preserve MI **0.451–0.472 nats** despite **126–146 actual rewrites**.

Original and null results from the **successful [GitHub Actions run 42778598625](https://github.com/FlareZ123/liber-primus/actions/runs/42778598625)**, seed `0x53221579`, 500 independent circular rotations of both original body streams per model (clock recomputed on every rotated ciphertext):

| Key start / S-clock | Original I(K;C) | Rotation-null mean MI | Nulls at least as high / 500 | Planted control MI |
| --- | ---: | ---: | ---: | ---: |
| exponent 1, normal clock | 0.068438 | 0.078236 | 496 | 0.464312 |
| exponent 1, pause on cipher ᛋ | 0.079068 | 0.080225 | 314 | 0.460887 |
| exponent 15, normal clock | 0.074390 | 0.078313 | 426 | 0.450808 |
| **exponent 15, pause on cipher ᛋ** | **0.084312** | 0.080239 | **73** | **0.471749** |

The explicitly source-complete last model has within-model add-one upper-tail **74/501≈0.1477**; it does not produce a material key/cipher dependence relative to the layout-preserving null. It remains dramatically weaker than the authentic-register plants. The MI statistic avoids supposing an outer alphabet and the strong control confirms sensitivity for the tested GP-English distribution. It does not exclude exotic intermediate alphabets, stateful transpositions, other exponent schedules, or an unknown external key.

**Additional original-rune key-consumption inversion (Agent 11):** An exact, separate 128-bit IV interpretation packs the least-significant bits of **128 consecutive modular powers of 53 starting at exponent 15**, high-bit-first in each byte, producing IV `c9fbf82f9c6c080fa0c727efe0be71b0`. The original 32×8 base60 table supplies eight possible 256-bit grid-column keys, one per section. The existing exact skipped-key Viterbi engine evaluates AES-256-CTR/ChaCha20, both signs, reversed/forward keys, two byte-to-29 reductions, and the optimal assignment among all eight key columns on **2,400 real post-heading original LP2 runes**. A positive control with this exact IV and real grid keys correctly recovers its original algorithm, all eight column identities and **2,398/2,400 planted GP-English runes**. On authentic LP2, the best source-IV score is **−5.618172 nats/rune** with no recognizable plaintext, while **4/20** randomly shuffled original-grid key sets score as well or better under the identical full model search (add-one p **5/21 = 0.23810**). This rejects this particular source-to-IV-bit serialization as evidence of decryption, while leaving other specific key derivations unresolved. [Working source](../sims/red_triangle_grid_keyskip.cjs) · [successful manual CI run 42783297094](https://github.com/FlareZ123/liber-primus/actions/runs/42783297094).\n\n**F79 mechanistic conclusion:** The triple selects a valid full-cycle F79 generator, but its literal additive mod29 key stream and chosen ᛋ clock rule recover no GP-English from the original source-selected bodies. The negative inference is confined to that tested transformation family.

## Second interpretation: a squaring tower in F29 and a 28-ary discrete-log chain

A separate arithmetic relationship is visible in exactly the **same three source-derived red quotients**, in the existing A→B→C order. Over the manuscript's independently established **29-symbol** GP field:

\[
15^2\equiv22\pmod{29}, \qquad 22^2\equiv20\equiv78\pmod{29}.
\]

The multiplicative orders of \`15\`, \`22\` and \`78 mod 29 = 20\` are respectively **28, 14 and 7**. Thus 15 is a primitive root of the 28-element nonzero group of F29, and the three quotient residues are its consecutive squarings: **15¹, 15², 15⁴**. This is an *additional exact relation* among the already discovered source numbers. It is not an independent statistical replication of the red triangle and receives no separate authorial-intent probability.

This supplies a precise possible 28-ary **ciphertext-step alphabet**. Given two successive published GP rune indices \`c[i−1]\`, \`c[i]\`, the difference \`d=(c[i]−c[i−1]) mod29\` lies in **1..28** unless the rune repeats. Because 15 is a primitive root, the **discrete logarithm** \`r=log₁₅(d) mod28\` is an exactly invertible relabeling of all 28 nonzero steps; the inverse is \`c[i]=(c[i−1]+15ʳ) mod29\`. The source has **86 literal doublets** and **55 initial runes**, held as **141 explicit erasures** in this representation. Nothing in this coordinate transformation establishes that the author used discrete logarithms, or explains the 86 exceptions. It creates a falsifiable alternative to assigning each nonzero difference its usual cyclic rank \`d−1\`.

A direct hypothesized cipher \`r=(P−sK) mod28\`, with sign \`s=±1\`, was checked against **5,632 source-derived configurations**, using exactly the published 12,956 original unsolved GP runes. The running-key families are: direct 256-byte grid mapped into mod28 by remainder or scaling; the page-15 Fibonacci-prime spiral; 78-position powers of 53 mod79, mapped directly or after squaring; and the ordinary prime and prime-minus-one sequences also present in the already solved page-56 method. Exhausted source families include their finite positional offsets, both signs, global versus physical-page resets and whether erasures advance the clock. The model was selected by **even-numbered physical pages**, with **odd pages kept untouched** for evaluation.

| Cipher screen | Even-page training IoC | Odd-page held-out IoC |
| --- | ---: | ---: |
| Untreated 28-label log-step | approximately **0.03576** pooled | approximately **0.0357** |
| Best of 16,432 source-key configurations on original | **0.03591826** | **0.03567658** |
| Strongest heldout configuration selected after looking at heldout | **0.03565443** on train | **0.03590835** |
| Fully planted original-layout English-GP with an exact grid key | **0.05945149** | **0.05889868** |

The uniform 28-label IoC is **1/28≈0.03571429**. The key selected by training on original LP2 stays at this random floor on heldout. The planted control uses the **same original 55 page boundaries and 86 repeated-rune erasures**, a late GP-transliterated Shakespeare sample, and a declared \`grid-scaled28\` key (offset103, sign+1, page reset, clock skipping erasures). Its 29-rune chain forward-encrypts and reverse-decrypts **all 12,815 original nonerasure positions byte-exactly**, and the exhaustive original key search recovers the planted key as the *top* training configuration. This demonstrates meaningful detection power for the specified English-GP case.

**Current inference:** 15's discrete-log alphabet is a source-anchored, exactly reversible *representation* of the 28 nonrepeated step types. No tested direct 225-red-rune/page/grid/prime/F79 key makes the original rank distribution resemble held-out GP-English, and the experiment does not identify original plaintext or keys. A new source-selected rule for a nonperiodic exponent stream, the 86 exceptional steps, or another plaintext alphabet would be required to turn the arithmetic into a genuine solution.

[Original-source SFT](../sims/red_triangle_discrete_log_step.cjs) · [successful expanded 16,432-model manual CI run 42784133928](https://github.com/FlareZ123/liber-primus/actions/runs/42784133928).

## The 86 zero-step exceptions: literal GP EA marker constrained by source vocabulary

The 28 nonzero difference steps in the discrete-log register above leave open what causes the **86 exactly repeated ciphertext runes**. A natural 29th plaintext-symbol hypothesis maps one GP plaintext rune (particularly the alphabet's last index **28: EA**) to a repeated ciphertext rune, while the other 28 symbols control nonzero steps. If the model preserves GP rune positions and word boundaries, the repeated-ciphertext marks must coincide with actual occurrences of that one plaintext symbol **independently of any key** governing the other 28 steps.

The canonical source has **12,956 runes and 2,896 complete rune words**, including **86 exact repeated steps**, with **23 at word beginnings**. This is an unusually high fraction, **23/86≈26.74%**, for the uncommon 29th GP symbol in much contemporary English. Its plausibility depends strongly on the **author's actual source vocabulary**, which can be tested without guessing a key.

The [source-word-matched eight-register test](../sims/step_zero_gp_literal_marker_exclusion.cjs) uses three independently archived English works (Shakespeare, Gibran, Emerson) and the editor-normalized **actual solved Cicada LP1 and LP2 prose** in [lp1-plaintext-reference.txt](../resources/liber-primus/lp1-plaintext-reference.txt), each with literal GP transliteration and optional ING→NG alias. For the solved source, the script removes comments, section headers, editorial bracket notes and the printed hexadecimal deep-web hash, retaining only original known plaintext. All eight registers support every one of the **2,896** original GP word lengths (1 through 14). It samples complete genuine source words at each exact original word length and analytically computes a bivariate distribution of (symbol count, word-initial count) for **every GP symbol**.

For all 29 possible literal repeat markers, a candidate must have an expected total count no more than five sampling SD from the observed **86**, avoiding false perfect scores for source-absent letters that can never produce a ciphertext repeat. The test then minimizes the 2d covariance-normalized distance² among those count-plausible candidate letters. Each register is calibrated using **1,500 independently sampled full-manuscript source texts**, with the same candidate-selection gate. Every register's count-plausible candidates are **NG and EA**. The source-authoritative EA candidate has a natural interpretation as the GP alphabet's 29th/last rune. No numerical result proves that the historical cipher used it.

| Reference corpus | Closest marker of all 29 | Expected total / word-first | Observed | Source-register joint distance² | Matched 1,500-trial upper p |
| --- | --- | ---: | ---: | ---: | ---: |
| Shakespeare, direct | EA among count-plausible | 88.82 / 5.28 | 86 / 23 | **64.59** | **≤0.000666** |
| Shakespeare, ING alias | EA among count-plausible | 88.94 / 5.32 | 86 / 23 | **64.08** | **≤0.000666** |
| Gibran, direct | EA | 120.29 / 10.86 | 86 / 23 | **34.34** | **≤0.000666** |
| Gibran, ING alias | EA | 119.88 / 10.77 | 86 / 23 | **34.43** | **≤0.000666** |
| Emerson, direct | EA | 96.80 / 9.71 | 86 / 23 | **25.07** | **≤0.000666** |
| Emerson, ING alias | EA | 97.06 / 9.63 | 86 / 23 | **25.63** | **≤0.000666** |
| **Known Cicada plaintext**, direct | **EA** | **82.83 / 15.74** | **86 / 23** | **3.656** | **17/1501≈0.01133** |
| **Known Cicada plaintext**, ING alias | **EA** | **82.08 / 14.85** | **86 / 23** | **4.818** | **3/1501≈0.00200** |

**Important change in interpretation:** The literal-EA repeat marker is substantially more plausible under *actual solved Cicada prose* than under independently sourced English books. An earlier version of this test, comparing only Shakespeare/Gibran/Emerson, overgeneralized the rejection. The eight-register result shows a moderate tension even with the known Cicada vocabulary (nominal p≈0.011 direct, p≈0.002 with ING alias), while external English gives much stronger incompatibility. The nearest candidate under the known-source reference is specifically **GP EA**, index28, fitting the 29-symbol-to-28-nonzero-step hypothesis. This is a **useful cipher-architecture hypothesis to retain and test**, with the critical qualification that it has not recovered a single unseen rune or identified any keystream.

An independent exact *word-initial* Poisson-binomial calculation using length-specific source frequencies gives, under the known Cicada GP EA register, **P(word-first EA count ≥23)≈0.04858** for direct transcription or **0.02831** with ING alias. For comparison, Emerson yields **0.00018452** and Gibran **0.00082949**. These are conditional marker-specific tails, not correction for all potential models. The bivariate source-control p-values include the additional count structure and the declared marker search. All controls use empirical independent word sampling, rather than reproducing natural multiword syntax; editor normalization and the small original solved corpus remain further limitations.

A further **source-vocabulary-conditional location test** subdivides the 86 repeated ciphertext positions into four mutually exclusive original word-position classes: **23 first**, **19 last-but-not-first**, **11 second-but-not-last**, and **33 other**. With precisely the same 2,896 original word lengths, source-locked **known Cicada GP EA** word sampling predicts **15.738, 0, 49.247, 17.843** occurrences in those four positions. The known plaintext reference contains **zero word-final EA** tokens across every required source-word length, while the unknown LP2 ciphertext contains **19 repeated steps** at those positions. The resulting four-bin Pearson deviation is **406.931**, and **0/2,000** fixed-seed source-word-matched controls reach it (add-one upper p **1/2001≈0.000500**). This four-bin test is notably stronger than the earlier Cicada-source two-statistic comparison because the latter averaged over word-internal positions. **The zero word-final EA count reflects a finite vocabulary, not a proof that other Cicada prose could never end a word with EA.** This comparison specifically assumes the published ciphertext word boundaries also delimit plaintext words. An encoder with independent ciphertext word breaks can move natural source-word EA runes to any printed word position. [Original-boundary conditional test](../sims/step_zero_ea_wordposition_heldout.cjs).

### Key-independent marker roles under decoupled plaintext word boundaries

A new original-input construction addresses the precise boundary assumption above. Keep all **86 observed within-page repeated-step locations and their spacings unchanged**, and cyclically rotate their positions through all **12,956 phases** relative to the exact unchanged 2,896 ciphertext word-position roles. If source word boundaries are independently encoded or are displaced relative to printed separators, the observed zero-step profile **(23 first, 19 last-not-first, 11 second-not-last, 33 other)** is ordinary. Its independence-based expectation is **(19.2232, 18.6723, 15.6985, 32.4060)**. The observed four-bin Pearson value is **2.1649164**, and **7,017/12,956** rotations are as or more deviant (**conditional upper fraction 0.54160**). This null conditions on the precise observed repeat spacings, the original ciphertext word lengths, and the exact runic position count. It explicitly removes the assumption that the ciphertext's visible word breaks coincide with plaintext breaks. This is a *change in the model*, not a reversal of the previous same-boundary rejection.

In the finite known-Cicada GP source, a 29-candidate count-only ranking under the same original word-length-matched independent source-word sampling yields **EA (index28) as the sole candidate within three source sampling standard deviations of 86**: EA expected **82.82698 ± 8.87395**, standardized residual **+0.358**. The next candidate NG expects **137.85553 ± 11.08162**, residual **−4.679**. Among 3,000 further fixed-seed solved-Cicada source plants, with full 12,956-symbol passages built from those source words and then *independently rotated relative to the original ciphertext separators*, the mean number of potential zero-step EA marks within physical pages is **82.551**, central 95% simulation interval **66–100**; **115/3,000** plants give exactly 86. The original word-position chi-square is met or exceeded in **1,566/3,000** plants, and the original **one** close repeated-mark pair (gap at most six rune positions) is not exceptional against these plants (mean **2.585** pairs; **2,760/3,000** have at least one). These are fully conditional native-vocabulary/source-length models; none is an independently selected discovery probability. The earlier exact source same-boundary contradiction remains a decisive exclusion of **that more restrictive architecture**.

### A complete reversible F29 28-step candidate

The red quotient from p40 is **15**, an exact primitive root of F29, with the previously measured squaring sequence **15²≡22**, **22²≡78≡20 (mod29)**. For each physical page start, set `C₀=(P₀+IV) mod29`. For following symbols use a secret 28-ary pad `Kᵢ`:

```text
delta(P[i], K[i]) = 0                         if P[i] = EA (index28)
                    15 ^ ((P[i] + K[i]) mod28) mod29    otherwise
C[i] = (C[i-1] + delta(P[i], K[i])) mod29
```

Decrypt by taking the difference `d=(Cᵢ−Cᵢ₋₁) mod29`: **if d=0, recover GP EA exactly without the key**; for nonzero d, recover `Pᵢ=(log₁₅(d)−Kᵢ) mod28`. Every one of the **29** possible GP plaintext runes has exactly one invertible output transition given the previous emitted ciphertext rune and the key. This model has no deletion, overwriting or irrecoverable repair. Ciphertext word spacing is an independently specified layer and is not assumed to be plaintext spacing.

The completed [source-bound reversible script](../sims/ea_zero_step_reversible.cjs) exactly re-encrypts/decrypts every symbol in **3,000** independent native GP-English plants with the original 55 page lengths, for **38,868,000 / 38,868,000** identical recovered rune symbols. Its output includes all **86 original-source keyless conditional EA marker coordinates**; interpreting them as genuine plaintext is conditional on the whole proposed cipher. [Successful manually dispatched Actions run 42792523462](https://github.com/FlareZ123/liber-primus/actions/runs/42792523462).

**Critical limitation:** Under independent uniform 28-ary pads, this fully reversible architecture reproduces the original repeated-step frequency and breaks but **fails** the other source-selected word-local echoes. In 1,000 planted author-native books, the original lag-six affine count **80** compares with mean **44.798** (control max **67**), the ᛋ→ᛋ lag-five count **11** with mean **2.504** (control max **9**), and the nine contiguous lag-five two-hit events with mean **1.539** (control max **8**). These motifs were selected after looking at LP2 and do not provide a discovery-wide calibrated joint tail. They demonstrate that a model with independent uniform 28-ary pads is incomplete, even if the transparent EA rule were correct.

### The post-EA reset key is not reusable

One narrowly testable type of *correlated* key would restart the same arbitrary additive 28-state key stream whenever a zero-step/EA marker appears. This model has a **key-independent necessary invariant**, stronger than a direct lookup of guessed source keys: for every pair of intervals between repeat glyphs, the `log₁₅((Cᵢ−Cᵢ₋₁) mod29)` labels at the **same offset after the preceding marker** must coincide at the rate of equal GP plaintext symbols, because the unknown 28-ary additive key cancels. This permits arbitrary **256 distinct secret pad values** and independent page seeds. It does not assume printed ciphertext word boundaries delimit the source text.

Freeze the first **28** positions after every repeated-rune marker and require both members of each comparison to be inside the same original physical page and strictly after that page's first marker. On the exact original 55 pages, **85 nonempty post-marker intervals** yield **2,748/76,880 = 0.0357440** matching unordered same-phase pairs, essentially the random F28 equality rate **1/28 = 0.0357143**.

In **60 independently encrypted** native solved-Cicada GP manuscripts matched to the original page-length structure, each synthetic EA literal marker resets a genuinely shared secret random **256-value F28 additive pad**. Each planted manuscript is exactly decoded and re-encoded using its actual secret key. The blind same-phase collision rate spans **0.0677347–0.0789042** (median **0.0723472**); **zero of 60** plants falls as low as the original. This detects a real post-EA restart even when both the pad and source plaintext are unknown to the equality screen. [Updated original-source reproducer](../sims/ea_zero_step_reversible.cjs) · [successful manual CI 42794802806](https://github.com/FlareZ123/liber-primus/actions/runs/42794802806).

**Stronger differential test with unknown per-interval phase offsets.** Allow a different arbitrary unknown additive offset `A_segment` after each EA, so each nonzero GP step obeys `e_segment[j] = P_segment[j] + A_segment + B[j] (mod28)`, with any unknown common key shape `B`. Difference `e[j]−e[0]` cancels the entire arbitrary segment-specific offset, and same-j equality of such differences across segments is invariant to the common `B[j]−B[0]`. This test therefore **does not require any common starting pad value** at marker positions. Original LP2 first 28 post-marker offsets give **2,689/75,390 = 0.03566786** matching differential pairs, again at the random **1/28** rate. Under **120 independent solved-Cicada source 12,956-rune controls**, encrypted with an arbitrary secret 256-entry common pad plus a **new independent random offset on every EA reset**, all **1,554,720 planted symbols invert exactly**. Their keyless differential collision rates are **0.0385128–0.0535313** (median **0.0442833**); **zero of 120** are at or below the original. The difference between the lower end of this positive range and random is relatively small, so preserve the precise finite control scope instead of generalizing it. [Full exact-source CI 42795814999](https://github.com/FlareZ123/liber-primus/actions/runs/42795814999).

**Consequences:** Reusing **one fixed key shape** after each transparent EA, including with arbitrary independent mod-28 offsets per marker segment, fails the declared normal native-GP source requirement. The simplest position-derived correlated-state candidate has now also been tested: in the conditional EA/log-15 register, use the progressive exponent clock K_i=(phase+i) mod 28. Across **448** phases/signs/reset/marker-clock configurations, its best original GP-trigram score is **−7.334815**, versus **−7.411724** for raw ciphertext and **−1.923133** for held-out Shakespeare GP; the best output is not coherent plaintext. All **16/16** layout-matched positive-control configurations invert and re-encrypt exactly. This excludes the simplest progressive 28-cycle counter, not nonlinear/nonperiodic source-fixed state or independently derived interval keys. No actual plaintext or authentic key is inferred.

The immediate productive direction is therefore **not another linear 28-periodic counter or phase sweep**. It is to derive a distinct source-fixed nonlinear/nonperiodic state or an independently justified interval key that predicts the original lag-five and lag-six events while retaining exact decoding. Neither the transparent-symbol hypothesis nor its conditional 86 EA anchors constitutes recovered original LP2 plaintext, actual Cicada cipher identification, or an external destination. [Progressive EA exponent-clock test and reproducer](red-triangle-progressive-ea-clock.md) · [script](../sims/red_triangle_progressive_ea_clock.cjs).

[Latest corrected eight-register regression CI42787169242](https://github.com/FlareZ123/liber-primus/actions/runs/42787169242) · [complete source-bound SFT](../sims/step_zero_gp_literal_marker_exclusion.cjs). Previous six-register outputs remain historical and should not be used to exclude the author-specific EA marker.

### Original-source exact plaintext-feedback keys after transparent EA

Agent 7 completed an explicit direct inverse of the preceding reversible F29/EA architecture with **source-derived plaintext feedback**. At every nonzero published step let `e_i=log₁₅(Cᵢ−Cᵢ₋₁)` and let `P_i` be the unknown GP rune index. The complete rule is `e_i=(P_i+αF_(i−1)+β) mod28` with `P_i=EA` exactly at each zero step, `α∈{15,22}` supplied by the two red-quotient F29 values, and `β∈{0,…,27}` chosen by exhaustive language likelihood. Two distinct transparent-marker state conventions were included: every EA updates feedback as zero, or EA leaves the last non-EA feedback unchanged. The **29 possible initial plaintext runes are independently exhausted per section**, permitting a separate IV and no assumed known first letter. All four original scheme families, each comprising 28 beta choices, have exact inverse and original-source forward roundtrip; full roundtrip under an arbitrary fitted plaintext is inherent to the proposed cipher and does **not** demonstrate genuine decryption.

All **12,956 original unsolved LP2 runes** were decoded under every case. A GP trigram likelihood was fitted to the first 230,000 characters of an independent Shakespeare reference (**167,751 GP runes**); its completely withheld final 70,000 characters contain **51,049 GP runes** and score **−2.36754555 nats/rune**. The *highest original-cipher score* among **all 112 beta/feedback families and their independent initial letters** is only **−4.13640265 nats/rune** (`α=15, β=8`, skip-EA convention), with unreadable output. Under source-fixed `α=15, β=22`, the skip-EA original score is **−4.15090979**. Every other original configuration is comparably poor. These scores are conditional on the stated GP-English register and untransposed rune order.

Two **independent GP-English heldout planted corpora**, each exactly 12,956 GP runes with all eight original section lengths, encrypted using genuine `α=15, β=22` feedback keys and opposite EA clock conventions, automatically select **β=22 first** and recover **12,956/12,956 original source runes exactly**, with exact forward replay. The positive controls distinguish a working inverse from an implementation that cannot recover plaintext. They reject the specifically defined **one-step affine plaintext-autokey** key mechanism as a plausible original decryption under this source register; they do not reject the EA-transparent cipher family or unknown nonlinear state transitions.

[Exact source-linked CommonJS inverse](../sims/ea_transparent_autokey_inverse.cjs) · [successful original-plus-positive GitHub Actions run 42795740875](https://github.com/FlareZ123/liber-primus/actions/runs/42795740875). No actual LP2 plaintext, authenticated key or continuation destination is recovered.

### Lossless three-reserve forward transducer reconciles the primary repeat and echo observations (Agent 2)

**Evidence class: constructive, postselected compatibility hypothesis with full synthetic forward/inverse validation. No unknown LP2 plaintext or true key is recovered.** The preceding one-reserved-letter EA cipher explains the 86 same-rune exceptions but leaves the unusual word-local T6 and S5 echoes unexplained when its remaining 28 outputs are uniformly random. It is possible to reserve two additional context-specific ciphertext targets while retaining an **exactly bijective 29-input/29-output cipher** at every rune position. The explicit implementation is [lp2_lossless_three_reserve_forward.cjs](../sims/lp2_lossless_three_reserve_forward.cjs).

At each noninitial glyph, use the previously emitted GP rune and the current *printed ciphertext word* as known state. Reserve GP **EA** (index28) to output the preceding ciphertext rune. Starting at word-local position six, reserve GP **S** (index15) to output \`T6(C[i-6])=(24-2 C[i-6]) mod29\`. From position five, reserve GP **U** (index1) to output \`C[i-5]\`, except when that earlier glyph itself equals S (index15), in which case reserve GP **E** (index18) to that glyph. The source letter S has the page-40 red quotient value 15. If two requested reserved outputs collide, give the later reservation the next unused glyph in GP modular order, so no two different plaintext symbols can ever produce the same published ciphertext at a given state. All other plaintext runes map to the remaining output glyphs in ascending order with a **secret, per-position cyclic rotation** as key. Printed word lengths and page-start seed glyphs are side information; source plaintext words may cross the displayed breaks. The reserved letter assignment was chosen to match previously observed LP2 event rates, and the random-key model is intentionally permissive. This is a **worked mathematical counterexample to the claim that those three ciphertext phenomena require a lossy overwrite**; it is not an identified historical mechanism.

The solved Cicada GP plaintext reference contains 3,248 source runes under the fixed literal digraph convention; its reference symbol rates are EA **0.6466%**, S **6.5271%**, U **5.1416%**, and E **12.3461%**. Generate **1,000** independent original-layout source books by sampling those genuine source words, concatenating plaintext across the exact original 2,896 printed cipher-word lengths, retaining 55 source page heads as independently random output seeds, and generating key rotations independently at every ordinary position. The script asserts **12,901,000 / 12,901,000 exact nonseed plaintext rune round-trips** over the sampled books and checks that every one of the original 12,956 ciphertext rune values is unchanged by merely running the inverse structural-marker extraction. Original and simulated whole-word ciphertext measurements from [successful CI 42796399540](https://github.com/FlareZ123/liber-primus/actions/runs/42796399540):

| Ciphertext statistic | Original LP2 | 1,000 forward plants, mean ± SD | Within-family empirical upper tail |
| --- | ---: | ---: | ---: |
| Adjacent same-rune events | **86** | 83.354 ± 9.166 | 0.3836 |
| All word-internal lag-five equal pairs | **104** | 110.423 ± 9.791 | 0.7522 |
| Word-local affine forward T6 matches | **80** | 80.611 ± 8.914 | 0.5395 |
| Rune S at lag five followed by S | **11** | 8.515 ± 2.925 | 0.2448 |
| Reverse-direction affine T6 matches | **44** | 44.473 ± 6.655 | 0.5385 |
| Word-local lag-four equality | **131** | 110.793 ± 10.684 | 0.0360 |
| Word-local lag-six equality | **32** | 42.688 ± 6.274 | lower tail 0.0509 |

The first five already known observations are jointly **compatible** with this explicit generator under separately randomized solved-Cicada source words. This is a useful lossless alternative to previously modeled collision-overwrite generators. The latter two discrepancies show the process is *not a complete account* of the actual ciphertext structure, and the source words do not preserve genuine multiword syntax. Its match cannot be interpreted as a discovery p-value because the reserved state rules and letter assignments were selected with reference to exactly these same ciphertext observables.

**Keyless conditional LP2 plaintext skeleton:** running this exact inverse on the unmodified manuscript without any key gives 265 original-index positions with fixed GP letters: 86 EA, 81 S, 87 U and 11 E. The other **12,691** source positions remain unassigned, including 55 page-head seeds; 12,636 of them are nonseed positions. These 265 proposed rune readings are **model consequences** and must *never be presented as decrypted authentic plaintext*. Within the eight printed text sections their counts are **[17,18,37,38,22,34,34,65]**. Testing each section's full marker constraints against a contiguous GP-encoded segment of the committed solved-Cicada, Shakespeare, Gibran and Emerson reference texts, allowing both literal GP and ING→NG source encodings, yields **zero full-section matches**. The exact [source-crib challenge](../sims/lp2_reserved_marker_source_crib.cjs) completes this test on the original full marker masks in [successful CI 42798040453](https://github.com/FlareZ123/liber-primus/actions/runs/42798040453). Its independent source-true planted positive encrypts a 12,956-rune contiguous Shakespeare passage with the lossless forward generator, extracts only the reserved-symbol placements, and recovers **all eight exact original source offsets** (40000, 40729, 41874, 43612, 45506, 46527, 47960, 49640), each with exactly one complete section match among the anchored windows. This demonstrates that the exhaustive search would detect an unchanged source excerpt if the hypothesized original mechanism generated it. Zero of the real eight sections matches any complete encoded source window in the four tested references under either GP spelling rule. The negative excludes directly aligned source excerpts *conditional on the hypothetical three-reserve architecture and its marker placements*. It cannot exclude an unknown source, other segmentation, or different cipher.

The original 265 inferred markers produce **20 adjacent reserved-marker pairs**, versus a model-matched native-source plant mean **11.992±3.424** (within-fixed-model 1,000-run upper p **0.02298**). They produce **40 pairs separated by at most six positions**, close to the synthetic mean **39.33±7.17**. These are **additional residual controls** useful for prioritizing a better state mechanism; the adjacency excess and lag-four mismatch show that merely reproducing the primary motifs does not validate the proposed model. An actual solution would have to derive the reserved symbols, clocks, and key from independent source clues, then read coherent words and predict previously unread ciphertext by exact re-encryption.

### Source-Fibonacci key with a completely unknown 28-symbol alphabet (Agent 2)

The explicit lossless EA-marker successor scheme above still leaves the 28 ordinary plaintext labels unknown. A stronger source-constrained challenge combines **both** red-quotient field structures: the initial F79 Fibonacci pair **(15,22)** has exact period **78**, and the primitive root **15 mod29** maps each nonzero ciphertext difference to a unique exponent in Z28. Four fixed maps of the authentic F79 period-78 sequence to Z28 were tested: direct residue, linear scaling to 0..27, consecutive Fibonacci difference, and discrete log base the source-selected F79 primitive root 53 (with zero explicitly assigned code zero). For each, test both signs, physical-page/whole-word/continuous clocks, four original red-quotient/GP-prime phases **0,15,22,53**, and both choices for whether repeated ciphertext runes advance the key. This is **192 complete configurations**, all enumerated.

For fixed source key, the **entire unknown permutation of 28 ordinary GP plaintext letters** is inferred by exact maximum-weight 28×28 Hungarian matching from the **first 1,448 original complete LP2 ciphertext words**. The objective is a GP-English word-position unigram trained on the committed 300k Shakespeare source, with initial 30k words reserved for language training. The other **1,448** manuscript words are never used to fit the mapping or select the primary model. An unchanged ciphertext rune decodes to GP EA, with 55 page-start seed runes excluded. The forward cipher is genuinely bijective on all 29 plaintext choices for a fixed previous published rune and key: \`C_i=C_(i−1)\` iff \`P_i=EA\`, otherwise \`C_i=C_(i−1)+15^((σ^{-1}(P_i)+K_i) mod28) mod29\`. The inversion is exact including source-dependent key pointer state. All word lengths and 86 ciphertext doublets are sourced from original pages; no original plaintext is assumed.

**Executed original:** training selected the *scaled* period-78 F79 Fibonacci key, negative sign, page clock, phase0, repeats not advancing. Its frozen other-half score is **−5.4862650 nats per eligible rune** over **6,439** positions (46 repeated ciphertext markers); its training score was **−5.1495780**. Even illegally choosing the best model by looking at the heldout scores gives only **−5.3948817** (field-log F79 key, positive sign, word-reset, phase53). No readable original LP2 passage or key was produced.

**Reversible positive:** using a disjoint portion of the Shakespeare corpus, sample source GP words with precisely the manuscript's 2,896 original whole-word lengths. Forward-encrypt with the independently fixed period-78 *Fibonacci-difference* key, page reset, phase22, positive sign, marker EA, and a randomly selected secret 28!-way alphabet. The same **192-model training-only selection** recovers the precise source key/sign/clock/phase/repeat policy, **25/28** secret alphabet assignments, and **6,425/6,439** previously unfitted plaintext runes (99.78% exact); its original cipher reencryption/decryption assertions pass for all planted nonseed runes, and its heldout word-position language score is **−2.6568728**. These numbers are a model-matched power control, not evidence that the original manuscript used this model. Importantly, the finite source EA vocabulary/same-word-position contradiction from above remains relevant to any actual EA-mark interpretation.

The newly tested correlated F79 source key and globally unrestricted plaintext alphabet do **not** solve the original source. The result closes the explicit 192-instance reversible key-and-alphabet family under the stated GP-English and source-clock assumptions, while allowing other state derivations, word-boundary channels or plaintext registers. [Exact original/source-positive SFT](../sims/f79_f29_bijective_marker_inverse.cjs) · [successful integrated manual CI 42793234013](https://github.com/FlareZ123/liber-primus/actions/runs/42793234013).

## Third interpretation: a source-specified Fibonacci eigensystem over F79

The already identified **4×4 Fibonacci-prime spiral on physical page 15** makes a new arithmetic relation among the same original red spans worth testing. The *first* page-15 highlighted word has **nine runes** whose GP prime sum is `638=29×22`; the *second* highlighted word contains **eleven runes** with sum430. Thus **22=2×11** is fixed independently by the original red word boundary. The page-40 red quotient15 selects GPprime[15]=53, and the same first page-15 quotient22 selects ordinary prime79. In the field F79:

```text
53^4  ≡ 40  (mod 79)     original source page 40
53^11 ≡ 30  (mod 79)     11 = second p15 red-word length
53^15 ≡ 15  (mod 79)     15 = p40 red quotient
53^22 ≡ 31  (mod 79)     22 = first p15 red quotient = 2 × 11
30²   ≡ 31 = 30 + 1 (mod 79)
```

Consequently **30 is a root of the Fibonacci recurrence characteristic polynomial** `X²−X−1 mod79`; its other root is50. Their multiplicative orders are **78** and **39**, and the source p53 red quotient `2262/29=78` equals the full period of the Fibonacci transition matrix modulo79. In particular the deterministic recurrence `a_(n+2)=a_(n+1)+a_n mod79`, initialized at the two earlier red quotients **(15,22)**, returns to its exact initial *pair* after **78** terms with no earlier pair repetition. These are exact arithmetic relationships conditional on the already postselected red triangle. They do **not** independently prove intentional encoding, despite their overlap with the Fibonacci-prime square.

Two sharply specified reversible decoders were executed on **eight real 300-rune LP2 post-heading bodies**. First use the full source Fibonacci cycle reduced modulo29 as a running additive rune key, admitting one hidden collision-rejected key draw per output through the same Viterbi inverse used for other source-key challenges, both signs, fixed per-body reset. Second serialize exactly the **first sixteen F79 Fibonacci residues** to one 128-bit IV, `0f16253b114c0e0b19243d1200121224`, and try the eight authentic 256-bit grid columns under AES-256-CTR/ChaCha20 with 16 mode/reduction/sign choices, hidden key skips and exact optimal key-column assignment. The visible 4×4 square motivates sixteen *whole bytes*, with no fitted IV material.

| Original-cipher challenge | Positive planted source-English GP recovery | Best original GP language score per rune | Matched randomized-source comparison |
| --- | --- | ---: | --- |
| Fibonacci 78-cycle direct GP pad with collision skips | **2,400/2,400** original-language plant recovered | **−5.903434** | **116/120** shuffled 78-cycle key arrangements at least as high (plus-one p **117/121 = 0.96694**) |
| Source Fibonacci 16-byte IV + authentic grid keys | Correct AES/ChaCha mode and eight-column assignment recovered in planted control | **−5.639900** | **16/20** shuffled grid-key tests at least as high (plus-one p **17/21 = 0.80952**) |

The direct test and IV test yielded **unreadable original rune strings**. Their planted controls verify the exact inversions' discriminatory power under the tested source-language register, but the controls do not make the original a valid decryption. This new Fibonacci key interpretation is a **bounded negative**, while the red-to-Fibonacci *arithmetic* remains a potentially useful, postselected source hint for a different cryptographic architecture.

[Executable original/plant/null challenge](../sims/fibonacci_red_field79_inversion.cjs) · [successful manual CI execution 42787792672](https://github.com/FlareZ123/liber-primus/actions/runs/42787792672).

### Per-red-heading Fibonacci-state IVs, eight independent section nonces

A third, pre-data-defined implementation of the same F79 Fibonacci construction uses **each of the eight visible red section titles** to choose its own 128-bit nonce. For a given title, take the **GP prime weights of its first two printed red runes modulo79** as the pair of initial states `(a₀,a₁)`; emit sixteen consecutive bytes of `a_(n+2)=a_(n+1)+a_n mod79`. This candidate uses every source title directly, whereas the preceding fixed-IV experiment treats all eight sections identically. The 16 bytes per heading and 256-bit key per section are motivated by the 4×4 source square and the eight 32-byte columns of the original numeric grid, respectively.

For every possible assignment of original numeric-grid columns to the eight exact 300-rune post-heading LP2 ciphertext bodies, the exact skip-aware AES-256-CTR/ChaCha20 decoder searched 16 mode/reduction/sign settings, then compared the complete model selection against 30 shuffled-grid controls. All IVs were fixed directly from the original red titles before examining any GP-language scores.

| Test | Observed |
| --- | ---: |
| Planted authentic-register GP-English with the source-selected distinct nonces, real grid keys and ciphertext collision-skips | **2,400/2,400 original source runes exactly recovered**, including correct algorithm and all eight keys |
| Best original LP2 2,400-rune language score | **−5.61444494 nats/rune**, no recognizable plaintext |
| Whole-family shuffled-grid nulls reaching/exceeding original | **4/30** |
| Plus-one empirical upper-tail p | **5/31 = 0.16129** |

This supplies a separate negative for a **per-section Fibonacci key schedule**, with strong source-matched positive calibration. It does not exclude a distinct byte serialization or cryptographic design, and does not recover a single authenticated LP2 plaintext rune. [Exact CommonJS inverse](../sims/fibonacci_title_grid_iv_inversion.cjs) · [successfully executed workflow 42788697778](https://github.com/FlareZ123/liber-primus/actions/runs/42788697778).

## Final two-page 77-cycle bridge

A **source-defined exact-length key candidate** combines three already linked original red spans with the neighboring p54 title: **p15 first red 9 + p40 red 8 + p53 red 51 + p54 red 9 = 77 runes**. The final unsolved LP2 section p54–55 contains **232 + 76 = 308 = 4 × 77** original runes. The illuminated first ᚪ on p54 is visually distinguished; the physical boundary occurs at **232 = 3 × 77 + 1**, while p55 has **76 = 77 − 1** runes. Thus a 77-period source clock started at p54's initial rune spans the exact final two-page ciphertext in four cycles. The equality was recognized *retrospectively* and does not prove a real key period.

The [source-locked inverse](../sims/red_triangle_page55_source_inverse.cjs) tests four physical/red-triangle orders of these four full spans, their reversals, GP-index versus GP-prime-residue values, both signs, and direct versus predecessor-relative GP29 decoding: **64 original-input models**. Best original **308-rune** index of coincidence is **0.03707856** with no readable plaintext. The entire 64-model search is repeated on **1,000 histogram-preserving shuffled-ciphertext controls**: **247/1,000** equal or beat the original best (add-one upper-tail **248/1001 ≈ 0.24775**). A solved-Cicada English GP control planted under the correct source 77-cycle key is exactly recovered **308/308 runes**. It has native GP IoC **0.05677059**, versus its deliberately encrypted **0.03498456**. Self-consistent roundtrips under false keys are also possible and do not authenticate a historical model.

A related **76-rune final-page key** omits the p54 illuminated initial, giving **9 + 8 + 51 + 8 = 76**, exactly the size of p55 alone. Exhausting **384** original 76-source order/reversal/arithmetic/differential GP29 variants produces best IoC **0.04912281**, with no identifiable plaintext; **232/1,000** fully refitted source-histogram controls equal or exceed it (add-one **233/1001 ≈ 0.23277**). An independent reserved-EA, predecessor-rank28 alternative also yields no recognizable text. Synthetic true-source keys recover their planted plaintext exactly.

**Interpretation:** The exact 77-slot/308-rune relation is a coherent, newly identified *candidate clue geometry* linking the established red-prime triangle and the final book boundary. These direct inversions give original-source negatives, with no recovered true key, unknown plaintext, cipher architecture or puzzle destination. Treat it as a future constraint only if another source independently motivates the same construction; do not elevate post-selected numerical geometry to a solved mechanism.

## Interpretation, falsification and next action

The source-defined input, exact GP arithmetic, and all-16-span family calculation are reproducible. **The choice to treat a red quotient as both a physical-page pointer and a zero-based GP-prime index was motivated by the observed numbers.** The page-15 spiral and solved page-56 totient transform predate this investigation, but the combined three-edge rule was not preregistered. Numerous alternative arithmetic constructions were historically examined. The exact tail is conditional on *this* post-selected rule and cannot establish authorial intent, actual encryption architecture, or an LP2 decryption.

The next genuine decryption would need a **source-determined full-length exponent or state schedule** that beats the finite F79/F29 inverses described above, an explicit account of the 86 repeated steps (including the newly source-sensitive EA marker above), and plaintext that exact-forward-encrypts on an untouched original page. A number coincidence or invertible relabeling without recovered text remains exploratory. The source-linked 77-cycle proposal tested above remains another conditional, original-negative interpretation.

**Reproducer:** [single runnable Node.js 22 CommonJS script](../sims/red_span_triangle.cjs). It checks exact rune agreement with the original annotation, all eligible triples, rotation histograms, exact rational probability and the original triangle. It does not need a stochastic estimate.
