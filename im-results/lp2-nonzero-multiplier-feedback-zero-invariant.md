# Multiplicative ciphertext feedback: original zero-step witness and all-secret exclusion

**Agent 32, 15 November 2026. Decision:** One entire, precisely stated class of length-preserving GF(29) predecessor-feedback ciphers, even with a separate fixed zero label for each source-visible visual chapter, is incompatible with the preserved original LP2 ciphertext if its printed words directly encode the repository's source-native English register. This excludes **every** secret nonzero multiplier sequence and **every** globally fixed zero-label rune in that class, with no multiplier search or selected phase. No authentic LP2 plaintext, historically selected key, complete cipher, or destination was recovered.

## Original-only mathematical constraint

The 29-symbol Gematria Primus alphabet is a field modulo 29. A simple reversible generator matching the visibly rare adjacent equal ciphertext runes is

```text
C[i] = C[i-1] + K[i] * (P[i] - s)  (mod 29)
P[i] = s + K[i]^-1 * (C[i] - C[i-1])  (mod 29)
```

where `s` is **one fixed unknown GP29 plaintext symbol** for the whole unsolved release and each `K[i]` is a completely unrestricted nonzero element of GF(29). An ordinary multiplicative chain has `s=F=0`; a shifted plaintext register or fixed global substitution can choose another `s`. This construction admits adversarially chosen, high-entropy, evolving keys rather than a short stationary stream.

As the multipliers are nonzero, the following equivalence holds independently at **every** noninitial step:

```text
C[i] == C[i-1]   if and only if   P[i] == s.
```

The original 55 rune-bearing LP2 p0–55 pages contain **12,956** ciphertext runes and **86** adjacent equal-rune transitions entirely inside their respective original physical pages. Exactly **63** of these transitions are inside printed words and 23 cross printed word boundaries. There is one mathematically unobserved predecessor at each of the 55 page starts. Granting even arbitrary page reset states yields the source-only necessary bound

```text
86 <= count(s in the 12,956 original plaintext runes) <= 86 + 55 = 141.
```

The lower and upper bounds remain necessary whether the true generator runs continuously through pages or resets there, provided `s` is globally fixed and the source pages are preserved. Printed word boundaries may be crossed by the running state; their preservation is needed only for the word witness below.

## Original p27 two-doublet witness

Physical **p27**, after joining the original typographic line wraps, contains this exact twelve-rune printed word:

```text
ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ
     ^^     ^^
```

The original zero-based rune indices of its adjacent equalities are **5** (the second O glyph) and **11** (the second E glyph). In any candidate decoder in the family, the resulting twelve-rune plaintext word must have the **same fixed symbol `s` at both positions 5 and 11**, regardless of every multiplier and the initial cipher state.

The repository's `english_wordfreq_textblob.txt` supplies 29,157 English entries (29,154 encodable entries after the established GP29 substitutions). Under the existing source-native word normalization `QU→CW, V→U, K→C, Z→S, ING→NG, IO→IA`, followed by greedy GP29 tokenization, **only eight possible zero symbols** appear at both positions of any encoded dictionary word of exactly twelve GP runes:

```text
C N S T E L D A
```

This test holds out all other 61 words with internal equal ciphertext transitions. It requires only one printed p27 word to be an unchanged native English word; it does not assume the identity of that word or select a winning cipher key.

## Independent frequency contradiction

The same eight candidate GP29 plaintext symbols are intrinsically common in three independent source-native literary controls. Sliding through **every contiguous 12,956-rune window** of each complete control, with the established GP29 source conversion and without fitting a key, gives the following exact minima:

| Candidate zero symbol | Shakespeare minimum | Gibran minimum | Emerson minimum |
|:--|--:|--:|--:|
| C | 391 | 289 | 408 |
| N | 642 | 767 | 795 |
| S | 730 | 653 | 660 |
| T | 643 | 685 | 794 |
| E | 1,408 | 1,416 | 1,491 |
| L | 473 | 415 | 422 |
| D | 407 | 463 | 416 |
| A | 748 | 789 | 809 |
| **Minimum over all eight** | **391** | **289** | **408** |

The original-cipher upper bound is **141**. Each of the 8 candidate labels violates that bound under **all three** native English control texts. Other GP labels are already incompatible with p27's two forced positions in the 29,154-entry finite dictionary. Thus **no globally fixed zero label and no sequence of invertible multipliers can yield this tested English language register while preserving p27's printed word**.

The single-word dictionary scope is material: missing words, coined language, Old English, text already transformed through another layer, or altered word segmentation can invalidate that assumption. The three window scans are exact facts about specified fixed texts, **not a theorem over every possible English composition**. Allowing per-page or per-word different `s`, a changing additive offset, a zero multiplier, ciphertext skips, an alternative plaintext register, or an independent block-mixing layer changes the mechanism and is outside this exclusion.

## Stronger six-page visual-chapter contradiction

The original p27 word lies in independently marked **visual chapter p27–32**, comprising **1,433 source-original runes** over six physical pages. It contains exactly **13** same-page equal ciphertext transitions, so even granting six arbitrary starting states and a new unknown zero label for this chapter:

```text
13 <= count(s in chapter pp27–32) <= 13 + 6 = 19.
```

The same p27 source-doublet word forces the chapter's symbol `s` to be one of **C/N/S/T/E/L/D/A** under the fixed source-native English lexicon. Sliding through **every contiguous 1,433-rune window** of the three unmodified GP-normalized controls gives these exact lower bounds:

| Candidate zero symbol | Shakespeare minimum | Gibran minimum | Emerson minimum |
|:--|--:|--:|--:|
| C | 28 | 21 | 25 |
| N | 53 | 64 | 64 |
| S | 60 | 41 | 41 |
| T | 50 | 57 | 67 |
| E | 112 | 133 | 131 |
| L | 35 | 28 | 26 |
| D | 24 | 33 | 30 |
| A | 63 | 68 | 71 |
| **Minimum over all eight** | **24** | **21** | **25** |

Even the smallest eligible control count, **21**, exceeds the original upper bound **19**. Therefore a model allowed to change its global zero symbol independently for each of all **nine** marked visual chapters still fails on p27–32 under the exact original-word/native-English assumptions. This chapter-specific test has a smaller numerical margin than the full-book exclusion above. Varying `s` within this chapter, such as separately by physical page or word, remains outside the result, as do transformed boundaries, another plaintext register, and non-English text.

## Decoder positive and relation to earlier work

The [read-only CommonJS SFT](../sims/lp2_nonzero_multiplier_feedback_zero_sft.cjs) checks all original counts, word constraints, source-native dictionary, and all windows from three fixed local control files. It independently **encrypts and recovers all 95 authentic solved-p57 runes**, once with `s=F` and again with `s=E`, using a nonzero changing multiplier on every rune; it verifies `C[i]=C[i-1]` precisely at `P[i]=s` in both implants. These planted positives validate the implemented formula, without authenticating it as Cicada's design.

An earlier [p39 quadratic feedback study](lp2-p39-quadratic-multiplicative-feedback-source-gate.md) tested p39-motivated finite key schedules and a **fixed** zero-label variant on p40–53. The present exclusion does not depend on that guessed polynomial, exponent clock, or finite range; the zero-step plus p27 witness eliminates **all secret schedules** in the stated global-zero family under the independent English register assumptions. It is a genuinely different gate, not a fresh search over previous key candidates.

**Next causal decision:** A multiplicative-feedback theory should specify from original artwork/text **why its zero-label would vary within a visual chapter (for example per physical page or word), or why the plaintext word boundaries change**, then demonstrate an original-input inverse. Fitting another multiplier recurrence cannot resolve the fixed-global-zero contradiction. Seek a source-selected alternative architecture, an authentic independently recovered unknown-page crib, or an original carrier payload instead.
