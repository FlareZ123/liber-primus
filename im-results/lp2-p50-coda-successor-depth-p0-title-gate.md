# 2016 coda → p50 graph → p0 red-title key gate

**Classification:** bounded negative on two fixed consumers. No unknown-page plaintext, authentic key, or cipher mechanism recovered.

Reproducer: [`sims/lp2_p50_coda_successor_depth_p0_title_sft.cjs`](../sims/lp2_p50_coda_successor_depth_p0_title_sft.cjs).

## Question and source path

The authenticated 2016 signed payload has a source-visible **13-word coda** after its 29-word body:

`Seek and you will be found. Good luck. Beware false paths. Verify OpenPGP.`

The standalone `3301` footer and key ID `7A35090F` are excluded. The coda's natural split is 11 words plus the two-word `Verify OpenPGP` sentence. Physical p0's original scan (archive image `17.jpg`) has a **13-rune red heading** at the start of the page. The matching 13/13 cardinality and the p50 graph's 13 cycle vertices make a coda-derived p0 heading key a reasonable small human-solve-path test.

The forward base60 p50 successor map is already selected as a navigation operation by the independent signed-2016 `EPIPHANY SEEKS THE DEVOTED` → p32 route. That route starts at `GP0(SEEKS)=71`, follows 23 forward table steps, and ends at physical p32. This report does not retest that upstream selector.

The earlier direct `GP0(codaWord)` additive pad against the p0 heading is already negative in [the p50 functional-graph report](lp2-p50-functional-graph-2016-wordmap.md). I therefore tested only two distinct graph-derived key candidates, without searching rotations, signs, or address conventions.

## Frozen inputs

The coda words map under the repository's canonical GP29 transliteration (longest token first; V→U, K→C, Z→S) to these GP0 address sums:

`[56,56,30,57,35,36,35,31,88,77,54,59,75]`

Every address enters the source-selected 11-cycle basin. The original p0 red-heading ciphertext, read as the first 13 rune indices of page 0, is:

`[15,8,18,3,6,19,27,0,15,26,18,21,5]`

This is the physical red heading, **not** the distinct p0 4|5|4 marker-column packet R13.

## Two fixed consumers

1. **One successor step:** for each coda word, take `T[GP0(word)] mod 29` as its key symbol. The key is

   `[22,22,25,2,10,25,10,17,8,28,11,11,3]`

   Applying the solved-p56 `C−K` direction to the p0 heading gives

   `[22,15,22,1,25,23,17,12,7,27,7,10,2]`

   GP29 transliteration: `OE S OE U AE D B EO W IA W I TH`.

2. **Tree depth:** for each coda word, follow the same p50 successor map until its first repeated node; use the number of forward steps before the first cycle node as the key. The depth key is

   `[3,3,3,7,5,6,5,4,9,6,5,8,9]`

   Applying the same fixed `C−K` direction gives

   `[12,5,15,25,1,13,22,25,6,20,13,13,25]`

   GP29 transliteration: `EO C S AE U P OE AE G L P P AE`.

Neither output is readable plaintext. No parameter was fitted to the output.

## Language diagnostic and decision

Using the same GP29 trigram model convention as the p32 tree SFT (first two-thirds of the Gibran control for training; final third held out), the 13-rune scores are:

| Sequence | Mean log trigram score |
|---|---:|
| Original p0 red heading | −11.318724 |
| One-step-successor key output | −11.447261 |
| Tree-depth key output | −12.160160 |

Across 20,819 held-out 13-rune windows, the score range is −11.614352 to −6.010687 (median −8.252788). These very short strings make the scores diagnostic only, not a discovery-adjusted significance test. The explicit outputs are nonlinguistic; the successor result is slightly worse than the ciphertext baseline, while the depth result is below every held-out window.

**Decision:** retire the simple 13-word coda → GP0 address → one-step successor/depth → p0 red-heading key family. The 13/13 alignment remains a structural correspondence, not a decryption. Do not widen this branch to cycle phase, rotations, alternate signs, GP-prime addresses, or nonlinear consumers without new first-party evidence selecting them. This negative does not reject the p50 navigation route or other uses of the 2016 coda.

No change to `results/README.md` is warranted: this is a bounded negative, not an established discovery.
