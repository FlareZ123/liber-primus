# P50 256-phase mask with arbitrary secret cycle and printed-word shifts: keyless original-cipher obstruction

**Agent46, 21 November 2026. Classification: bounded original-cipher negative, including a stronger printed-word extension.** The 256-cell table might be a repeating source key whose phase values are combined with secret, changing additive offsets. Two independent key-free original-input invariants now exclude both a 307-value epoch model and a stronger **3,203-value epoch-plus-word model** for unchanged-source-word GP29 English. Neither operation is a Cicada-authored key schedule. No recovered unknown-page plaintext, key or destination follows.

## Why this exact family

Physical LP2 pp49–51 print **32 rows × 8 cells = 256 two-character numeral tokens**. The source-visible global rune clock has 50 complete 256-rune cycles and one final partial cycle across the 12,956 original unknown GP29 runes. A basic repeating 256-phase additive mask was already contradicted. A plausible escape is to combine an unknown phase pad with an **independent unknown shift** each time the 256-cell table resets, and optionally a further unknown shift each time a printed original word begins.

The two nested models are:

```text
A: C[i] = (P[i] + K[i mod 256] + L[floor(i/256)]) mod 29
B: C[i] = (P[i] + K[i mod 256] + L[floor(i/256)] + U[word(i)]) mod 29
```

**All** 256 values of `K`, **all** 51 values of `L`, and in B **all** 2,896 values of `U` are secret and unconstrained. The models retain the printed rune order and word boundaries. Neither p50 radix59/base60 uncertainty nor any cipher-key search can affect the necessary condition below. Models A and B encompass every possible selection of secret additive values with these public clocks; they do not encompass stateful nonlinear encryption or a distinct additive key per rune.

The weakest premise is still a hypothesis: the 2016 signed source says the book's numbers are the direction but does **not** prescribe summing GP29 offsets at table phases, cycle ends, or printed-word boundaries.

## Exact cancellation of the unknown keys

Consider a same-page source rune pair `i,i+1` wholly inside one 256-position cycle. With `j=i mod 256<255`, its difference is

```text
D[i] = (C[i+1] - C[i]) mod 29
     = (P[i+1] - P[i] + K[j+1] - K[j]) mod 29
```

under model A. Its `L` offset cancels for *every* choice of all secret epoch values. The unobserved phase difference `K[j+1]-K[j]` is identical for every repetition of phase j, so whether two observed `D` values at the same j are equal is invariant under all key assignments.

For model **B**, use only pairs inside the **same complete original printed word**. Then each word's independent unknown `U` also cancels, leaving the exact same invariant for every choice of all **3,203** secret values. Both tests omit the 255→0 cycle transitions, which can cross an `L` change; both omit physical-page crossing pairs, which the manuscript may treat separately. Model B additionally omits printed word-separator transitions. The original 32 cross-page word carries are joined correctly before word grouping, without creating false word boundaries.

The reported statistic counts unordered equal-difference pairs within **each** of the 255 phase classes, sums the matches and divides by all unordered same-phase comparisons. Multiply the collision fraction by 29 for an interpretable normalized equality score. **It is an algebraic invariant of these model families, regardless of secret key entropy.**

## Original-cipher results and source-word-matched controls

Immutable input: [physical LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), [original word separators](../resources/liber-primus/lp2-transcription.txt), 55 rune-bearing physical pages of p0–55, **12,956 GP29 runes**, exactly **2,896 complete original printed words**.

| Key-independent invariant | Eligible source transitions | Same-phase unordered comparisons | Equal-difference pairs | Normalized score |
| --- | ---: | ---: | ---: | ---: |
| A: 256 phase + 51 secret cycle offsets | **12,851** | **317,458** | **11,301** | **1.032353886** |
| B: same, plus 2,896 secret word offsets | **9,990** | **191,774** | **6,870** | **1.038879097** |

The controls preserve the entire exact original **2,896-word GP rune-length vector**. For each source slot, one independently chosen word of that exact length is sampled from the checked-in Gibran, Shakespeare or Emerson prose. Source normalization uppercases, maps K→C/V→U/Q→C/Z→S, and greedily recognizes GP digraphs TH/EO/NG/OE/AE/IA/EA. Every control book contains exactly 12,956 GP29 runes in the same printed word lengths. Samples are independent draws from fixed word pools; they are not reconstructed target plaintext.

| Source-native GP English control, 250 draws each | A: mean | A: minimum | B: mean | B: minimum |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 1.118054697 | 1.076202206 | **1.169075599** | **1.114488930** |
| Shakespeare, first 300k | 1.104487296 | 1.064874723 | **1.151900675** | **1.108893802** |
| Emerson, *Essays* | 1.100206238 | 1.056013708 | **1.139851492** | **1.085303534** |

For **each model**, all **750/750** length-matched English draws score **above** the corresponding original ciphertext statistic. The closest B control is 1.08530, compared with 1.03888 original. These are conditional reference-register comparisons; the finite empirical tail alone is not proof against *every possible English plaintext*, adversarially chosen language, or altered word boundaries. We did not optimize sampled keys or fit plaintext.

### Reversible positives under nontrivial secret components

The reproducer constructs a complete independent 12,956-rune source-native English text with the authentic word lengths and encrypts it using these fully specified, nonconstant components:

```text
K[j] = (37*j + 3) mod29
L[r] = (17*r + 2) mod29
U[w] = (11*w + 5) mod29
```

With K+L, the complete planted output has exactly the same A invariant as its plaintext. With K+L+U, it has exactly the same B invariant as its plaintext. Both hold bit-for-bit on the same source positions, including every original page boundary exclusion. The positive plants show that **no secret value assignment in the specified family can reduce B's fixed coincidence count**. Every choice preserves the collision pattern under this model.

## Decision and surviving routes

**Exclude both p50 stationary-phase additive families, including the stronger variant with an arbitrary independent shift at every printed word, as direct intact-word native-English LP2 decoders.** The exact 256-phase key and epoch, page-level or word-level additive corrections cannot rescue the observed near-uniform within-phase difference pattern. Model B rules out a class with more than three thousand unrestricted key values, and is therefore a sharper answer than testing a few candidate keys.

This does **not** exclude a source-authored nonlinear changing alphabet, a per-rune cryptographic keystream, a different plaintext language, an intervening byte compression code, a key clock whose phase skips symbols, or a transformation changing the original printed word contract. Any positive candidate requires its own authentic clue-selected operation and an original-cipher holdout.

**Single-file read-only reproducer:** [`sims/lp2_p50_256phase_epochoffset_allsecret_sft.cjs`](../sims/lp2_p50_256phase_epochoffset_allsecret_sft.cjs). Executed on the exact committed repository sources with a CommonJS-compatible runner, with both positive plants and **750/750 controls passing for each invariant**. Windows Node.js 22 is the intended native runtime. No CI or arbitrary key search was used.
