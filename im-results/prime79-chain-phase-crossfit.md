# LP2's source-selected 4×41×79 lattice and weak 79-phase difference-rank recurrence

**Status (2026-11-10, Agent 50): reproducible source arithmetic and provisional ciphertext-only correlation. No unknown plaintext, cipher key, validated 79-stage generator, or destination recovered.** The candidate numbers and models were chosen during analysis; the statistical probabilities are conditional on declared comparisons.

## Why 4×41×79 is an explicit candidate rather than a fitted free-key search

The corrected **nine-rune red title on physical LP2 page 15**, immediately above the already identified 4×4 Fibonacci-prime spiral, has GP prime sum **638 = 29×22**. The **22nd prime is 79**. The independently red-marked **51-rune stanza on page 53** has GP sum **2262 = 29×78**, with **78 = φ(79)**. Source annotation fixes all rune offsets. This red-to-red arithmetic was discovered by Agent 30 and was **postselected**, with no key-use rule; see [the exact source test](red-prime-totient-crosslink.md).

The **13-dot large punctuation stencil** (31 physical LP2 marks including one black exception) provides a possible, independently visible ordinal **13**, whose ordinary prime is **41**. The page-15 number square is visibly **4×4**. The 55 unresolved rune-bearing LP2 pages contain **exactly**

\[
12,956 = 4\times41\times79 = 4\times3,239.
\]

Consequently there is a source-motivated but unproven **four-plane, 41-row, 79-column** reshape of the *complete canonical unsolved ciphertext*. The three ingredient choices and the desire to factor the ciphertext length were made after knowing the manuscript; no authorial design probability or plaintext follows from the equality. Alternative interpretations of 13, 4 and the red sums remain possible.

## A reversible 28-label field on the original rune sequence

Represent each rune by its GP alphabet index \(c_i\in\{0,\dots,28\}\). Within each original physical page, convert every **unequal** predecessor step to

\[
r_i=((c_i-c_{i-1})\bmod29)-1 \in\{0,\dots,27\}.
\]

The first rune of each of 55 physical rune-bearing pages and the 86 immediate repetitions yield **141 erasures**. The absolute original-rune phase advances through them, without resynchronization. This rank map has an exact inverse given an initial rune and the 28-ary step, and can represent a stateful no-repeat ciphertext. It does **not** invert the unknown LP2 cipher.

Compare rank-symbol equality at matching global positions modulo **79** across the four exactly equal 3,239-rune ciphertext quarters. Each quarter contains precisely **41 complete 79-rune rows**. For context, compare the original four consecutive physical-page groups (14/14/14/13 pages), period **78** (the separately sourced prime totient), and sorted predecessor exclusion \(r_i=c_i-\mathbf 1[c_i>c_{i-1}]\). All tests require the original physical-page starts and erasures. Raw ciphertext periodicity provides a negative check.

### Exact source-ciphertext scores

| Equal-quarter pair | Matching rank pairs | Eligible pairs | Match rate |
| --- | ---: | ---: | ---: |
| 0–1 | 4,711 | 130,070 | 0.03621896 |
| 0–2 | 4,723 | 129,870 | 0.03636714 |
| 0–3 | 4,698 | 130,026 | 0.03613124 |
| 1–2 | 4,749 | 129,823 | 0.03658058 |
| 1–3 | 4,804 | 129,982 | 0.03695896 |
| 2–3 | 4,671 | 129,777 | 0.03599251 |

Mean of the six rates: **0.036374896592**; pooled rate **0.036374924957**; minimum **0.035992510229**. Uniform 28-ary coincidence is **1/28=0.035714285714**. Every pair exceeds that baseline, with the overall mean only **0.000660611** higher. The corresponding 14/14/14/13 physical-page partition mean is **0.036319292754**.

The direct **29-rune** modulo-79 phase collision is **0.034530274246**, close to the uniform **1/29** expectation. The direct **one-lag** cyclic-rank identity at 79 is **442/12,598 = 0.035084934117**, below the 28-ary uniform expectation. A straightforward 164×79 transposition therefore has no supporting direct-rune period signal, and a 79-position cipher key remains unrecovered.

## Correcting for the eight candidate interpretations

The source-conditional null independently rotates each *entire observed 28-ary difference sequence within each physical page*, retaining its exact symbols, interior order, length, and original erasure count. The same random page rotations feed all **eight** combinations of two periods (78,79), two excluded-predecessor conventions (cyclic,sorted), and two groupings (four original page groups vs four equal 3,239-rune quarters). For each model the statistic is the unweighted mean of six cross-group equality rates.

In **3,000** fixed-seed controls \`0x7941e170\`:

| Convention and period | Page-group mean (upper p) | Equal-quarter mean (upper p) |
| --- | ---: | ---: |
| Cyclic 78 | 0.03586607 (0.28224) | 0.03570428 (0.56681) |
| **Cyclic 79** | **0.03631929 (0.00367)** | **0.03637490 (0.00167)** |
| Sorted 78 | 0.03545677 (0.90403) | 0.03554991 (0.79207) |
| Sorted 79 | 0.03553935 (0.81939) | 0.03554750 (0.78141) |

The equal-quarter cyclic-79 score is **3.029** simulated standard deviations above its rotation-null mean **0.035741715337**. Calibrating the **largest standardized score across all eight interpretations** against each complete surrogate family yields **22/3,000** null maxima as large as observed: add-one familywise **p=23/3,001=0.00766411**. This finite-model family correction accounts for the two groupings; it does not correct the extensive exploratory history, the discovered factorization, the choice of 13-dot stencils, or the broader space of possible numbers.

An independently calculated **5,000-trial** control retains the first-rune erasure fixed at each original physical page start and cyclically rotates only the remaining difference ranks. The *page-group* 79-phase mean and minimum each have **30** null exceedances (add-one upper p **0.0061988**; seed \`0x79ff1102\`). A separate **2,200-trial** null rotates original complete ciphertext pages before recomputing their ranks and tests the page-group 79-phase signal, producing p **0.00227** (mean) and **0.00318** (minimum). Both test a slightly different source-preservation contract; neither generates plaintext.

## Real-data inverse failure and calibrated positive

The accompanying standalone code encrypts independently sampled GP-encoded English control text with a fully specified **79-position, 28-label additive step key**, then inverts it. Its per-rune 28-symbol plaintext is GP indexed modulo28, its ciphertext step is \((1+p_t+k_{t\bmod79})\bmod29\) from the previous ciphertext rune, and its page-start initial states are source-independent. All **12,901** eligible synthetic positions are recovered **exactly** using the true 79-symbol key. The planted cross-group coincidence exceeds **0.05**, far greater than original LP2's ~0.03637.

A separately computed original-source heldout test learned the phase-rank histogram on the first 41 physical rune-bearing pages and tested the last 14 with independently chosen smoothing parameters. Its best tested smoothing, α=800, produced a **negative heldout log-likelihood improvement of −0.000389 per rune** against the source-specific baseline, with page-rotation upper p≈0.0846 among 1,300 trials. More aggressive smoothing yielded upper p from 0.106 to 0.291. This source/test split failed to recover any text or fixed phase-key profile.

## Next mechanism gate

Any true cipher interpretation of the 4×41×79 reshape must specify **a source-determined traversal, 79-stage state/key and exact forward/inverse rune transformation**, reconstruct *unfitted* original LP2 ciphertext, and yield independently defensible plaintext. The present 0.00066 excess could arise from dependence not reproduced by the null, broad exploratory selection, a weak latent state, or chance. Its small magnitude and negative original inversion strongly caution against promoting it to a decryption mechanism.

**Reproduction:** [\`sims/prime79_chain_phase_crossfit.cjs\`](../sims/prime79_chain_phase_crossfit.cjs), self-contained Node.js 22/CommonJS program on repository-pinned LP2 corpus, original image-ink annotations and existing Shakespeare/GP encoder. It asserts the original source numbers, all 141 erasures and the exact inverse control; it prints eight original models, the paired 3,000-surrogate family maximum, and a separate original-cipher rotation check. Manual-only [GitHub workflow](../.github/workflows/prime79-chain-phase.yml); previously successful baseline [CI 42779258288](https://github.com/FlareZ123/liber-primus/actions/runs/42779258288). A model-specific statistical p-value is a conditional test result, not proof of Cicada's intended mechanism.
