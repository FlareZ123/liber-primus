# Frozen zero-F + two-regime first-order affine-feedback gate

**18 November 2026, Agent8, Director issue #1520. Classification: complete negative for the exact 29^4 phase-zero p50-class family.**

## Frozen family

This test starts from the reversible #1422 zero-F surface-normalized stream `M`. The p50 table supplies one source-fixed binary state:

```text
z_i = 1 iff raw p50 byte at global phase i mod 256 is < 60
```

The only tested value layer is

```text
M_i = P_i + a[z_i] * P_(i-1) + b[z_i] mod 29
P_-1 = 0
a0,a1,b0,b1 in Z29
```

The global clock is phase zero and never resets. The search exhausts all **29^4 = 707,281** tuples. No alternate predecessor register, phase, reset, higher lag, polynomial degree, byte-valued term, or second layer is admitted.

## Frozen scoring and holdout

The ranking score is one source-native GP within-word trigram log likelihood built from the repository's Shakespeare, Gibran and Emerson controls with fixed 0.5 smoothing. The training slice is the first three physical LP2 pages p0-p2, **729 runes**. The top 64 tuples are frozen before blind evaluation on p40-p53 and p54-p55.

For a positive, Director #1520 requires at least 150 contiguous coherent blind plaintext runes, exact reencryption, and a stable winning tuple under independent training subsets.

## Source-shaped positive controls

A deterministic xorshift generator seeded by `0x33011033` selected three family members. Each was applied to the same 12,956-rune native-GP source-shaped plant preserving every original printed word length, then wrapped in the exact #1422 zero-F outer layer.

| planted tuple (a0,a1,b0,b1) | exhaustive p0-p2 rank | exact layered roundtrip |
| --- | ---: | --- |
| (26,5,3,7) | **1** | yes |
| (26,22,28,16) | **1** | yes |
| (23,1,5,23) | **1** | yes |

Thus the exhaustive implementation and frozen ranker recover source-shaped members of the exact family cleanly.

## Original exhaustive result

The untouched original's p0-p2 winner is:

```text
(a0,a1,b0,b1) = (12,21,14,18)
training score = -1647.9870455431494
```

Its blind outputs are nonlinguistic. On p40-p53 it has 40 exact native-dictionary hits among 669 complete words, **zero** hits of GP length >=5, and only a 4-rune longest consecutive dictionary span. On p54-p55 it has 3 hits among 66 complete words, **zero** length>=5 hits, and only a 2-rune longest span. Representative blind prefixes are:

```text
p40: UEOGIATLUIACYWSBXLIFTHMEUPLEACOOPOEGGBEADEAWXNYCULNDOEEBFAEEDGTJGEOHOIAJJOEOUXTHIOEHIYWUTHJOTHDLBEAYXAENONGPJYTHTHWS
p54: AEANGEHHTHUOEICYHWTNGARLEIGEACEAGJRNGHMAEJEEOSIAIAYFETHBSAETEANOETHOBUHCTHALHLUYULEAMXEOIAJTHNNGDITHYACXOOEHJMBRBSGASFEAIX
```

The negative is not specific to rank 1. Across **all 64 frozen top candidates**, the maximum p40-p53 count of length>=5 dictionary words is **1**, the maximum p54-p55 count is **0**, and the longest consecutive exact-dictionary spans are only **7 runes** and **5 runes**, respectively. This is two orders of magnitude below the 150-rune success gate.

## Independent training-subset stability

The same frozen scoring rule was independently applied to p0, p1 and p2. Their winners disagree completely:

| training page | rune interval | winning tuple (a0,a1,b0,b1) |
| --- | --- | --- |
| p0 | 0..261 | (14,21,0,15) |
| p1 | 262..527 | (28,20,5,24) |
| p2 | 528..728 | (5,2,4,19) |

The full p0-p2 winner `(12,21,14,18)` therefore has no independent-page stability. This independently fails the positive criterion.

## Decision

The exact two-regime first-order affine-feedback family under the frozen #1422 intermediate is **closed negative**. The p50 low-cell class remains a reproducible source feature, while this particular four-parameter use of that class does not recover language.

Do not rescue #1520 by adding states, phases, resets, higher lags, byte-valued coefficients, alternate predecessor registers, or another layer. Any such mechanism is a different hypothesis and needs its own source motivation and discriminating test.

Reproducer: [`sims/lp2_p50_zeroF_tworegime_affine_feedback_sft.cjs`](../sims/lp2_p50_zeroF_tworegime_affine_feedback_sft.cjs)

Windows Node22 CI: [run 44391353361](https://github.com/FlareZ123/liber-primus/actions/runs/44391353361)
