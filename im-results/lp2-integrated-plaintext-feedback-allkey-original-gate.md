# Integrated plaintext-feedback: exhaustive original-cipher inverse and chapter holdouts

**Agent30, 22 November 2026. Classification:** bounded all-secret architecture exclusion on original LP2 ciphertext. **No unknown plaintext, authentic key, or continuation recovered.** [Director Issue #2083](https://github.com/FlareZ123/liber-primus/issues/2083).

## Source-motivated operator and exact inverse

LP2 has 29 rune values, p15 Fibonacci/prime imagery, very rare identical adjacent cipher runes, and word-local higher-order echoes. A running ciphertext sum of a two-term plaintext function is therefore a plausible **hypothesis**, although no first-party clue specifies this operation. It differs from the previously tested first-order affine plaintext-feedback rule without a ciphertext integrator ([prior direct test](plaintext-feedback-recurrence.md)).

Freeze the exactly reversible GP29 encoder on one complete source register:

    C[i] = C[i-1] + P[i] + a*P[i-1] + b  (mod 29), for i >= 1.

The first ciphertext rune is an arbitrary IV and the first plaintext rune an unknown seed. Both a and b are unrestricted GF(29) secrets. Printed word delimiters are preserved without consuming a rune; all runes, including F, consume the usual step. The exact inverse is

    P[i] = C[i] - C[i-1] - a*P[i-1] - b  (mod 29).

All choices of the two keys and seed fall into **exactly 841 index-of-coincidence-distinct representative classes**:

- For a other than 28 (minus one mod29), define u = -b/(1+a) and Q[i] = P[i]-u. Then Q[i] = C[i]-C[i-1]-a*Q[i-1]. All b choices are equivalent to a constant plaintext alphabet rotation. Exhaust all 29 unknown Q[0] values for each of the 28 possibilities for a.
- For a = 28, define Q[i] = P[i]-P[0], so Q[0] = 0 and Q[i] = C[i]-C[i-1]+Q[i-1]-b. Exhaust all 29 possible b values. Again the unknown P[0] is merely a constant alphabet rotation.

Because rune-index coincidence is invariant to uniform rotations, these 28×29+29 = 841 tests exhaust **every** original coefficient/intercept/initial-plaintext combination without approximations or arbitrary key cutoff.

## Whole-book result and blind source-native positive

The unchanged original resource contains 12,956 GP29 runes on 55 rune-bearing pages p0–55, with rune-free p50 retained in manuscript order. Score every key only on the first 6,526 eligible runes from physical p0–26 (there are 6,527 rune positions including the initial unconstrained IV). Freeze the highest training score and evaluate the subsequent **6,429 unseen runes** from p27–55.

| Full-key search | Highest training IoC | Untouched heldout IoC | Selected parameter |
| --- | ---: | ---: | --- |
| Original LP2 ciphertext | **0.0353382344** | **0.0353674617** | a = 0 |
| GP-native Shakespeare encrypted by same rule | **0.0608763531** | **0.0603147995** | True a = 9 recovered |

The source-native plant used the same 12,956-rune geometry, a previously independent Shakespeare passage, and secret parameters a = 9, b = 13. The blind exhaustive inverse selects exactly the true a on the training register. Decrypting the plant with its actual initial plaintext recovers **12,956/12,956 runes** and forward replay is exact. Original LP2 remains almost perfectly uniform even under its globally best key.

## Nine independently keyed illustrated chapters

A separate, more permissive control gives each visibly marked section its **own** arbitrary a, b, first plaintext and initial output state. All 841 key-equivalence classes are independently searched on each section's first 60% and then frozen on its remaining 40%. The source page boundaries and lengths are not fitted to these results.

| Physical pages | Original length | Highest original training IoC | Unseen original IoC | Blind native-English positive holdout IoC |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 729 | 0.036761 | **0.034105** | 0.059478 |
| p3–7 | 1,145 | 0.036037 | **0.034132** | 0.059157 |
| p8–14 | 1,729 | 0.035301 | **0.035381** | 0.062371 |
| p15–22 | 1,903 | 0.035451 | **0.034486** | 0.060647 |
| p23–26 | 1,021 | 0.036023 | **0.034050** | 0.060286 |
| p27–32 | 1,433 | 0.035933 | **0.034028** | 0.061191 |
| p33–39 | 1,680 | 0.035420 | **0.034410** | 0.063675 |
| p40–53 | 3,008 | 0.035305 | **0.035290** | 0.058931 |
| p54–55 | 308 | 0.040233 | **0.032389** | 0.063992 |

Each positive control is independently generated using a **different secret (a,b) pair** and the genuine illustrated-page geometry. In **all nine**, the blind full-key scanner recovers the correct secret a as the maximal training candidate, and the complete known-key inverse recovers the exact plaintext with forward replay. In the original, every key selected on its chapter's training register gives near-uniform heldout rune statistics. Even the short terminal chapter's apparent 0.04023 training maximum fails completely on withheld runes.

## Doublet constraint as a separate check

The same architecture entails a strictly observable necessary condition:

    C[i] == C[i-1] exactly when P[i] + a*P[i-1] + b == 0 (mod29).

The original 55 rune-bearing pages contain **86 identical adjacent pairs over 12,901 within-page comparisons**. Forty-four nonoverlapping, independently sourced native-GP English windows of precisely 12,956 runes were cut into **the same 55 original physical-page lengths**. For each window we exhaustively selected the most favorable of all **28 nonzero a values and 29 b values** to minimize emitted doublets. The absolute minimum for Shakespeare was **123** over 16 windows; for Gibran's *Prophet*, **149** over four; for Emerson essays, **130** over 24. The actual LP2 output contains **86**. These finite controls do not reproduce LP2's exact word-length profile and cannot exclude all possible English compositions or language shifts; they are independent support for the full-key decoded-IoC negative.

The special a = 0 case can choose one rare plaintext rune to suppress ciphertext repeats; it too was included in the exact 841-class inversion and never produces an English-like original inverse.

## Decision and implementation

Retire **continuous-book and nine independently keyed illustration-chapter** versions of the specific affine, plaintext-two-term **integrated running cipher** as direct native-GP29 English encoders. This exact, all-key experiment covers every secret coefficient and initial state under those register choices. A per-page or per-word changing key, nonlinear state, extra anti-repeat output process or genuine external key source falls outside the model and must receive its own independent authored selector. The original p15 Fibonacci artwork alone is insufficient to justify added cipher layers.

The [read-only original-data CJS SFT](../sims/lp2_integrated_plainfeedback_allkey_sft.cjs) implements all 841 representatives, validates original source lengths, tests the 44 independent native-GP windows and independently recovers the exact source-native controls under ten separately planted secret encryptions. **[Windows Node22 CI PASS 44975353963](https://github.com/FlareZ123/liber-primus/actions/runs/44975353963)** executes the committed script without external dependencies. This is a reproducible architecture exclusion, **not** a recovered page or key. Further work should seek an author-selected reversible operation, independent key bytes or an independently verifiable unknown-page plaintext crib.
