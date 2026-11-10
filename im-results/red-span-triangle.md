# A three-page red-ink triangle and its two multiplicative-field interpretations

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

**F79 mechanistic conclusion:** The triple selects a valid full-cycle F79 generator, but its literal additive mod29 key stream and chosen ᛋ clock rule recover no GP-English from the original source-selected bodies. The negative inference is confined to that tested transformation family.

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
| Best of 5,632 source-key configurations on original | **0.03591273** | **0.03567551** |
| Strongest heldout configuration selected after looking at heldout | **0.03563119** on train | **0.03589940** |
| Fully planted original-layout English-GP with an exact grid key | **0.05945149** | **0.05889868** |

The uniform 28-label IoC is **1/28≈0.03571429**. The key selected by training on original LP2 stays at this random floor on heldout. The planted control uses the **same original 55 page boundaries and 86 repeated-rune erasures**, a late GP-transliterated Shakespeare sample, and a declared \`grid-scaled28\` key (offset103, sign+1, page reset, clock skipping erasures). Its 29-rune chain forward-encrypts and reverse-decrypts **all 12,815 original nonerasure positions byte-exactly**, and the exhaustive original key search recovers the planted key as the *top* training configuration. This demonstrates meaningful detection power for the specified English-GP case.

**Current inference:** 15's discrete-log alphabet is a source-anchored, exactly reversible *representation* of the 28 nonrepeated step types. No tested direct page/grid/prime/F79 key makes the original rank distribution resemble held-out GP-English, and the experiment does not identify original plaintext or keys. A new source-selected rule for a nonperiodic exponent stream, the 86 exceptional steps, or another plaintext alphabet would be required to turn the arithmetic into a genuine solution.

[Original-source SFT](../sims/red_triangle_discrete_log_step.cjs) · [successful manually dispatched CI run 42783355623](https://github.com/FlareZ123/liber-primus/actions/runs/42783355623).

## Interpretation, falsification and next action

The source-defined input, exact GP arithmetic, and all-16-span family calculation are reproducible. **The choice to treat a red quotient as both a physical-page pointer and a zero-based GP-prime index was motivated by the observed numbers.** The page-15 spiral and solved page-56 totient transform predate this investigation, but the combined three-edge rule was not preregistered. Numerous alternative arithmetic constructions were historically examined. The exact tail is conditional on *this* post-selected rule and cannot establish authorial intent, actual encryption architecture, or an LP2 decryption.

The next genuine decryption would need a **source-determined full-length exponent or state schedule** that beats the finite F79/F29 inverses described above, an explicit account of the 86 repeated steps, and plaintext that exact-forward-encrypts on an untouched original page. A number coincidence or invertible relabeling without recovered text remains exploratory.

**Reproducer:** [single runnable Node.js 22 CommonJS script](../sims/red_span_triangle.cjs). It checks exact rune agreement with the original annotation, all eligible triples, rotation histograms, exact rational probability and the original triangle. It does not need a stochastic estimate.
