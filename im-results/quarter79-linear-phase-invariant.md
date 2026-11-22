# Four-quarter 79-column cipher: exhaustive blind F29 inverse with hidden column pads

**Evidence:** original LP2 ciphertext, exhaustive key-independent finite search, a synthetic exact-inversion control, and a successful manual GitHub Actions run on 2026-11-10 (Agent 50). **No original unknown LP2 plaintext, cipher key, authorial grid interpretation, or destination recovered.** The source-linked 4 × 41 × 79 reshape was proposed after observing the manuscript and is not independent evidence of the true cipher.

## Source-locked hypothesis and the crucial keyless invariant

The corrected full unresolved LP2 corpus has 12,956 GP rune indices across 55 rune-bearing pages. Prior red-title arithmetic provisionally selects prime 79 from the 22nd prime, and the page-15 printed diagram is a 4×4 square. The exact total is 12,956 = 4 × 41 × 79. The factorization was post-selected and the 41 from a 13-dot mark is exploratory, as documented in [the preceding phase study](prime79-chain-phase-crossfit.md).

Form four consecutive equal streams of length 3,239, indexed by `a=0,1,2,3`, with positions `t=0..3238`. The tested reversible cipher class is

`C(t) = M P(t) + K(t mod 79) (mod 29)`,

where `M` is **any fixed invertible 4×4 matrix over F29**, `P(t)` contains four GP-English plaintext symbols, and the 79 arbitrary four-component vectors `K(j)` are completely unknown. The pad can differ for every one of 79 columns; there is no fitted candidate key.

For every inverse row `w` of `M` there must exist a plaintext lane `b` satisfying

`w·C(t) = P_b(t) + w·K(t mod79) (mod29)`.

Consequently two projected ciphertext symbols at **the same 79-column phase** are equal if and only if the corresponding plaintext lane symbols are equal. An arbitrary additive offset at each column disappears from that equality event. A common phase-specific nonzero scalar or bijective remapping **after the linear projection** also preserves this invariant. Arbitrary nonlinear substitutions **before** the projection are outside the model.

Because scaling a nonzero vector `w` preserves equality, every possible inverse row is represented once by a projective direction whose first nonzero coordinate equals 1. There are exactly

`(29^4 − 1)/(29 − 1) = 25,260`

such directions, including four singleton vectors. The test evaluates **all 25,260**. It therefore does not require a guessed 4×4 matrix, pad, inverse row, or alphabet relabeling.

## Independent row split and source-ciphertext outcome

The source determines **41 complete 79-column rows per stream**. The first 20 rows (1,580 time positions per stream) select the strongest vector, then the last 21 rows (1,659 per stream) evaluate that vector without fitting. The statistic counts unordered matching projected-symbol pairs at identical column phases, with exact denominators **15,010** and **16,590** respectively. A uniformly random 29-symbol output has expected equality rate `1/29 = 0.03448275862`.

| Measurement | Source ciphertext |
| --- | ---: |
| Exhaustively searched projective directions | **25,260** |
| Best training vector | **(1,9,2,28)** |
| Best training equalities | **615 / 15,010 = 0.04097268488** |
| The same frozen vector, heldout | **579 / 16,590 = 0.03490054250** |
| Highest heldout rate after post-selecting on heldout | **668 / 16,590 = 0.04026522001** |
| Training rate for that hindsight-selected heldout vector | **519 / 15,010 = 0.03457694870** |
| Directions with equality rate ≥0.05 on training | **0 / 25,260** |
| Directions with equality rate ≥0.05 on heldout | **0 / 25,260** |

The hindsight-selected heldout maximum is **not** an independent p-value; it illustrates why independent vector selection matters. No tested projection approaches a natural GP-English lane's same-letter collision level. The strongest training direction loses its apparent excess on the withheld rows. The negative statement is the explicit conditional detection threshold and finite class, without an invented discovery-wide tail probability.

## A complete synthetic cipher recovery demonstrates statistical power

The exact same SFT independently encodes real Shakespeare prose through the repository's established Gematria Primus encoder, forms four 3,239-rune plaintext lanes, and encrypts them under a nontrivial invertible upper-triangular 4×4 matrix plus independently sampled arbitrary 79-column four-channel additive pads. The true inverse is not given to the exhaustive scan.

The decoder with the independent planted inverse and pad recovers **12,956 / 12,956 plaintext symbols exactly**. The four genuine inverse row directions have the following same-column collision rates:

| Genuine planted inverse row | Training | Heldout |
| --- | ---: | ---: |
| (1,27,7,17) | **0.06409061** | **0.06232670** |
| (0,1,24,0) | **0.05982678** | **0.06088005** |
| (0,0,1,22) | **0.06335776** | **0.05503315** |
| (0,0,0,1) | **0.05549634** | **0.05925256** |

In the complete planted search **exactly four directions exceed 0.05 in each split**, and all four are the genuine inverse rows; the largest training projection is one of them. This establishes that the blind, pad-independent search recovers English-like leakage in the declared model despite an unknown nonscalar matrix and a full 79-phase nuisance pad. The control does not simulate any hypothesized LP2 adjacent-collision repair, different language register, or lossy insertion layer.

## Cryptanalytic decision

Under **the stated original 4×41×79 grouping, aligned 79-column key clock, static invertible F29 four-channel mixing, and ordinary GP-English lanes**, the complete original manuscript fails the necessary inverse-row fingerprint by a large margin compared with an exact planted positive. This directly rules against trying additional literal p15 4×4 Hill matrices **on those four aligned quarters** with arbitrary 79-phase additive offsets. The result is stronger in this narrow setting than directly testing particular fixed matrix coefficients or hoping a source-derived pad yields an elevated global rune IoC.

The 4×41×79 factorization and the previously measured weak period-79 predecessor-difference coincidence remain arithmetic and ciphertext observations. They do not imply four-channel F29 mixing. Page-specific desynchronization, per-row pads, nonlinear state, per-rune output alphabets before mixing, a different intermediate source code, variable-length transforms, or different layouts evade the invariant. This result provides **no original LP2 plaintext**.

The next useful attack should derive a recoverable state/key path from an independent source clue and use it to predict unfitted original ciphertext, with a complete forward encoder. Further scanning another orientation of this already exhausted 25,260-direction/79-phase family is not productive.

## Reproduction

- [Source-bound CommonJS SFT](../sims/quarter79_linear_phase_invariant.cjs), executable by `node sims/quarter79_linear_phase_invariant.cjs`. Source inputs are `resources/liber-primus/lp2-corpus.json` and `resources/control/shakespeare_first300k.txt`. The script asserts exact source lengths, projective count, planted inversion, positive scan recovery, and original high-signal exclusions.
- [Successful original-input GitHub Actions run 42788567159](https://github.com/FlareZ123/liber-primus/actions/runs/42788567159), using the shared opt-in [Hill screen runner](../.github/workflows/hill-row-screen.yml), input `experiment=quarter79`. The runner has no push/commit trigger.
- Previous independent [direct source-79-key inverse and four-quarter phase tests](prime79-chain-phase-crossfit.md) and [generic contiguous-block Hill row screens](clue-matrix-hill.md) test different candidate architectures.
