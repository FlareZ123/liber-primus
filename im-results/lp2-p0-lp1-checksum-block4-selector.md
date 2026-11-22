# P0 block 4: locked LP1 checksum uniquely selects COLD

**Agent7, 18 November 2026. Classification:** strong intermediate selector result. The first three source-bounded 27×27 blocks are upstream premises. This test removes the remaining language-score dependence from block 4 by applying a numerical target that was publicly documented before the repository's source-bounded bootstrap existed.

## Current source-internal stop reconciliation

This report preserves the historical role of the solved-LP1 checksum: it was the first non-language selector that fixed the four-rune COLD stop. A later source-only convergence now reaches the same stop independently.

The authenticated 2016 `LIES / EMPTY / EPIPHANY` GP0 sequence `63 / 92 / 121` defines a `(+4,-3)` ray on the original 32×8 p50 table; the p50 tree reflection changes only the horizontal sign, leaving vertical magnitude4. Agent30's separate shared2 circumference fixes the post-TURNS read direction as UP. Projecting the signed ray onto that already selected vertical read axis therefore fixes **four runes**, after which the same frozen key/start/read branch gives COLD. The checksum's exact `4 / 51 / 182` residual becomes an independent numerical holdout for that source-internal construction.

Because this cross-object consumer was recognized after COLD was known, it remains retrospective and does not supersede the original prospective chronology or authenticate the plaintext by itself. See [the convergence report](lp2-2016-plus29-p0p1-stop-convergence.md).


## Locked cross-text target

The external 27×27 project had already recorded, by 22 October 2026, a correspondence between its proposed first seven-word LP2 passage and solved LP1. The repository now reproduces the source side directly instead of trusting that report.

The solved LP1 warning contains the seven-word window:

```text
YOU KNOW TO BE TRUE TEST THE
```

Under the standard native GP encoding it has:

```text
words       7
runes       21
index sum   232
GP sum      825
```

A census of all **621** encodable seven-word windows in `resources/liber-primus/lp1-plaintext-reference.txt` finds exactly **one** window with 21 runes and GP sum 825: this warning window. Its index sum is 232.

The two solved LP1 number squares independently reproduce the neighboring target index. `FORM` at the center of the first square has GP sum 91; the 91st prime is 467; twice 467 is **934**, the value printed immediately above and below the center of the second square. Then:

```text
phi(934) / 2 = 233
phi(233)     = 232
```

The chain is historically pre-existing relative to the new bootstrap, so for this experiment the first-passage targets are frozen as:

```text
7 words, 21 runes, index sum 233, GP sum 825
```

This does not prove that Cicada intended the chain. Its value here is that the numerical target was locked before the repository's independent source-bounded route reached block 4.

## Upstream prefix

The existing source-bounded bootstrap selects these first three blocks from the original p0-p2 729-rune square:

```text
AS I GO THE / WEATHER / TURNS
```

Their combined metrics are:

```text
words       6
runes       17
index sum   182
GP sum      643
```

The locked seven-word target therefore requires one final block contributing exactly:

```text
words       1
runes       4
index sum   51
GP sum      182
```

No candidate word is supplied to the selector.

## Exhaustive block-4 selection

Reuse the already frozen TURNS state and its finite family from `lp2-27square-source-bounded-first3-bootstrap.md`:

```text
anchor                   A = (14,19)
previous key center       NG = 21
movement distance         phi(21) = 12
candidate key centers     every in-bounds cardinal +/-12 displacement
key operation             center totient, then mu(phi(k)) rotation
candidate starts           every in-bounds cardinal +/-12 displacement
read directions            all four cardinals
complete family            36 candidates
```

For every candidate, enumerate every positive prefix length available on its ray. Score nothing linguistically. Retain only prefixes whose index and GP sums equal the required residual.

Exactly **two** prefixes satisfy both numerical sums:

| Rune length | Decrypted runes | Index sum | GP sum |
| ---: | --- | ---: | ---: |
| 5 | `R F C L OE` | 51 | 182 |
| 4 | `C O L D` | 51 | 182 |

The locked total of 21 runes requires a four-rune completion. Therefore only one candidate survives all three precommitted invariants:

```text
center direction  DOWN
raw node          H - TH - H
center totient    H - U - H
rotation          1
key               U - H - H
start direction   LEFT
start             (14,7)
read direction    UP
plaintext         C - O - L - D
```

This is **COLD**. The selector never queries a dictionary, word frequency, longest English prefix, or expected plaintext string.

## Why this changes the p0 evidence

The prior block-4 result was prospective but still selected the winning branch by a native-English prefix maximum. The locked LP1 checksum now chooses the same path and exact four-rune stop from the original 36-branch family without that language score. The first seven-word candidate is therefore reconstructed as:

```text
AS I GO THE WEATHER TURNS COLD
```

with exact totals:

```text
7 words, 21 runes, index sum 233, GP sum 825
```

Those values hit the pre-existing solved-LP1 warning/matrix correspondence exactly.

This remains intermediate evidence because the checksum itself was first noticed on the external proposed route, and several geometric operations still descend from that route rather than an explicit original instruction. The stronger conclusion is narrower: **given the source-bounded first-three-block bootstrap and the frozen LP1 target, COLD is no longer an English-selected branch.**

## Conservative control

As a discovery-aware calibration, apply the same cross-text relation to every encodable seven-word window in two pre-existing literary controls. A control window counts as a hit if any LP1 seven-word window has the same rune count and GP sum while the LP1 index sum equals `phi(control index sum)`.

```text
Shakespeare: 35 / 55,401 = 0.0006318
Gibran:       9 / 15,727 = 0.0005723
```

These overlapping windows are not independent probability trials, so the rates are descriptive rather than p-values. They show that the exact cross-text metric relation is uncommon under the same encoder.

## Next executable prediction

The pre-existing route also locks a second seven-word passage target of **17 runes, index sum 232, GP sum 854**. The independent continuation bootstrap has now reached `THE IDEA` without using that downstream checksum. `THE IDEA` itself contributes 5 runes, index sum 81, GP sum 301, leaving a frozen residual for the next five words of:

```text
12 runes, index sum 151, GP sum 553
```

The next useful attack is to derive a source-only post-IDEA transition family and test that residual before inspecting candidate English. This directly targets the current ambiguity after IDEA and avoids another frequency-selected `OF` branch.

## Reproduction

Run:

```text
node sims/lp2_p0_lp1_checksum_block4_selector_sft.cjs
```

The SFT reads the canonical p0-p2 corpus, solved LP1 reference, and two fixed literary controls. It reproduces the LP1 census, the FORM/934 arithmetic, the 36-candidate block-4 family, the two dual-sum prefixes, the unique four-rune selector, and the control counts.
