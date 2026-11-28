# Fresh p7 THE transfer rejects generalizing the THEIR RISE +6 H-shell rule unchanged

**Agent 9, 28 November 2026. Classification: genuinely prospective plaintext-rule transfer negative for Director #3423. The exact p7 prediction was committed before p7 two-rune ciphertext receivers were inspected.**

## Fresh target-blind page/word selection

A fresh physical page is supplied independently by the p15 full-integer-H / BASE29 page-count map:

```text
p6 ↔ p8
p7 → p7
```

P7 is its unique fixed point. That selection uses original page counts and the already authenticated BASE29 route; it does not inspect p7 two-rune ciphertext.

Use the existing authenticated zero-based source/page register at this independently selected page:

```text
source index7 = THE
GP(THE) = [2,18]
```

THE is one of the already frozen authenticated two-rune +6-family words.

## Pretarget +6/H-shell prediction

The unchanged authored rise is +6:

```text
index7  THE
index13 WAY

GP0(THE) = 20
GP0(WAY) = 28
r = 28 - 20 = 8 mod29.
```

Freeze the same shell as the p28/p34 calibration:

```text
H(key) = [r,0] = [8,0]
H(x,y) = (x-y,x+y) mod29
H^-1([8,0]) = [4,25].
```

Therefore the exact predicted ciphertext is:

```text
THE [2,18]
key [4,25]
-----------
C   [6,14] mod29.
```

This full prediction was posted in issue #3423 and committed before target inspection:

`im-results/lp2-their-rise-p7-the-fresh-pretarget.json`

commit `508578c777e595f981df175ae5d3fff40adb4caf`.

## Target reveal

Only after that commit, enumerate complete two-rune words on physical p7. There are eight, at offsets:

```text
0, 49, 115, 134, 136, 177, 194, 203.
```

Their exact ciphertext vectors are:

```text
[8,21]
[28,22]
[11,19]
[23,21]
[23,21]
[22,14]
[23,3]
[14,28]
```

Exact predicted `[6,14]` occurrences: **0/8**.

No sign reversal, phase change, alternate H orientation, receiver shift or language grading is permitted after reveal.

## Decision

The p28 THE and p34 BE local candidates remain as previously documented, but the unchanged general rule

`authenticated source word i -> +6 partner -> GP0 rise r -> H(key)=[r,0] -> same-page two-rune ciphertext`

**fails on a genuinely fresh, independently page-selected target**.

This is stronger evidence than the earlier retrospective two-hit calibration. Do not promote the +6/H-shell relation to a reusable plaintext mechanism without a new source feature that explains why p28/p34 are special and excludes p7 before ciphertext.

Reproducer: `sims/lp2_their_rise_p7_fresh_transfer_sft.cjs`.
