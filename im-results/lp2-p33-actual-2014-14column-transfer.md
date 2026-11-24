# Original p33 black196: documented fourteen-column order, alone and coupled with additive F-hold

**Decision (#2153 and #2599; Agents 18 and 8): the fixed historical row permutation alone, and its two compositions with ordinary additive GP29 literal-plaintext-F holds at q8/q13, fail to predict coherent original p33 black text under the calibrated finite key searches below.** The latter recovered all ten calibration-gated planted keys and 560/560 withheld native runes; original continuations are impossible or nonprose. No unknown plaintext or key. These are bounded tests, not general transposition or all-key exclusions.

## A human-visible, historically motivated trial

Original LP2 p33 scan `resources/liber-primus/50.jpg` has 214 runes. The independent physical ink inventory identifies ten initial red runes at offsets `[0,10)` and an eight-rune red subheading at `[91,99)`. Strip those **18 red rune positions** without trimming or selecting text for language, leaving **196 black rune positions, exactly 14×14**. The original complete black words are **21 above / 28 below** the red subheading, with black-run tape lengths **81 and 115**. Their seam is black offset81, i.e. column11 of zero-based 14-wide rows; the original layout therefore does **not** itself print a single uninterrupted 14×14 black matrix. The tempting square size warrants the trial, but is an inferred serialization rather than an author's explicit grid.

The historical operation comes from the documented 2014 Cicada fourteen-column stage, [participant solution and its exact cipher text](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3). Its **fixed zero-based within-row column order** is `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`: within each 14-symbol row, output the input symbols at those columns in that order. The order and original 70-character source cipher are historical, independent of LP2 p33; the 2014 reconstruction itself is not a Cicada-signed instruction to apply it to p33.

Running this row operation on the documented 2014 source five rows recovers the exact 70-character contemporary solution:

```text
GOODWORKULTIMA
TETRUTHISTHEUL
TIMATEILLUSION
JOINUSATFV7LYU
CMEOZZD5J4ONIO
```

This uses the **real historical row-wise permutation**, not a classical arbitrary 14-column rectangular readout, a guessed order from the p33 ciphertext, or a newly derived key.

## Fixed original unknown-cipher receiver

The same operation applied **once** in original p33 black-source order to all 196 untouched ciphertext runes, with no phase or direction search, emits fourteen consecutive 14-rune rows. The printed strings below are conventional GP29 transliterations; `TH`, `EO`, `NG`, `IA`, `AE`, `EA`, and `OE` each designate one rune.

```text
FIASOEEANYEOEATEOEAG
RMYAETRBIAMXOTHWD
HHSJLTHIAOEIAWAEUNGF
WMLIEAWTHOUWTTNS
JDPAJWEGYWAEJMIA
HGJUBYDNGIAEWESL
UMIYRWDNTHEYIAREO
HWNBEOIFJIANCXAM
OPEAOWJBOEJSEOTP
NGTFEADEAJMCTWUOU
XTLOBIAIGDOTHXBEO
FWDEIAWSUESEAAPD
SIANDRAFJLUNGTHGX
FAEAMDBOEHRRTHYAG
```

No coherent original GP29 English plaintext appears, including in the **unoptimized final 49-rune holdout**:

```text
GDOTHXBEOFWDEIAWSUESEAAPDSIANDRAFJLUNGTHGXFAEAMDBOEHRRTHYAG
```

The original black IoC is **0.03354264782836212**; the transformed IoC is **identical**, as necessarily occurs for any pure permutation. This near-uniform monogram distribution contrasts with an authentic solved-LP1 196-rune control IoC of **0.059497645211930926**. The comparison illustrates why a pure transposition by itself cannot restore ordinary prose-like GP29 symbol frequencies from this ciphertext. It cannot prove that every possible non-English textual or intermediate output is absent.

The test provides two exact forward/backward positives: the historical 2014 70-character source returns **70/70** characters, and an independently taken 196-rune authentic solved-LP1 text planted through the inverse row order returns **196/196**, including its final 49 positions. Original p33 black tape also reconstructs **196/196** exactly through inverse replay. The original word parser disregards typographic slash/newline and respects all true punctuation; it confirms **49 complete black words**, no invented line-split words.

## Coupled additive F-hold inverse (#2599)

The earlier pure-permutation IoC argument cannot reject value encryption layered with the permutation. Keep the exact same black196 tape, historical row map and phase-zero start without fitting offsets or changing row geometry. Define (R) as the historical decryption permutation and (S=R^{-1}) as its encryption permutation. Define (A_K) as addition modulo 29 with a literal plaintext GP0/F hold: F outputs 0 and does not consume the cyclic key; a non-F symbol consumes a key digit and may also produce ciphertext 0.

Two encryption compositions were frozen:

- **after**: (C=S(A_K(P))); undo (R), then solve the additive layer in natural rune order.
- **before**: (C=A_K(S(P))); undo additive encryption in the actual permuted intermediate, then restore natural order with (R).

Both use q8 and q13, motivated by the recovered LP1 WELCOME and KOAN keys, not a p33-selected period. Fit the first **140 black runes (10 full virtual rows)**; withhold the last **56 (4 rows)**. This replaces the earlier pure-permutation diagnostic split 147/49 to prevent a single row from straddling fit and holdout. Printed groups are not used as lexical constraints. The key clock does not reset at the red-heading seam offset81. This remains the hypothetical serialization of #2153 rather than an authenticated p33 opcode.

### Calibration and exact scope

Reuse the existing cyclic n-gram MAP library, trained on the first 70% of three frozen GP-transliterated literary donors (33,392 / 152,350 / 215,934 runes). For the before ordering, train the surrogate language model on the same donors rearranged by (S) at every one of the 14 possible donor row offsets, so inference scores the actual intermediate. The base solver evaluates all visible-zero masks by exact bigram optimization; all receive trigram optimization if at most two zeros, otherwise only four highest-ranked masks do. A fitted key is frozen before processing the held-out rows, marginalizing the legal latent F paths. Both native controls must recover the full key and every held-out rune before the original target is scored. The native windows are selected by the predeclared <=2 plaintext-F and <=4 prefix ciphertext-zero eligibility; this conditions the power assessment. The keys are synthetic, independently seeded, not alleged historical keys.

The first three branches (after/q8, after/q13, before/q8) recover 6/6 exact keys and 336/336 withheld native runes, with 840/840 fit runes. The first before/q13 solver recovers only one of two keys exactly: KOAN1 13/13 and 56/56 held, LOSS 11/13 and 48/56 held. **The original before/q13 ciphertext was not scored by this failed calibration.**

A separately frozen improved before/q13 inverse then optimizes the correct natural-order trigram objective over all legal masks. Starts are the exact permuted bigram key, the native unigram key, and (for the four highest surrogate bigram masks) the exact permuted trigram key. For each start, at most 12 alternating coordinate-ascent sweeps over all allowed digits are used. This is a local key optimization, **not an exact global trigram MAP theorem**. Frozen key continuation enumerates and marginalizes every legal F path, scores the restored natural order, and checks exact forward composition replay. Four fresh seeded keys on KOAN1, LOSS, WELCOME and second KOAN (the latter two are newly introduced native source sections) recover 52/52 key digits, 560/560 prefix runes and 224/224 held-out runes. The failed initial calibration is preserved, rather than counted as a negative result on original p33.

### Frozen original p33 predictions

| Encryption order / period | Native key recovery | Native withheld | Original natural prefix log score/rune | Frozen original held-out decision |
|---|---:|---:|---:|---|
| Additive then row, q8 | 2/2 | 112/112 | −4.979727 | No legal path at intermediate zero-based offset145 (sixth withheld rune) |
| Additive then row, q13 | 2/2 | 112/112 | −4.252768 | Legal nonprose, −7.132538 natural score/rune |
| Row then additive, q8 | 2/2 | 112/112 | −5.742997 | Legal nonprose, −7.655620 natural score/rune |
| Row then additive, q13, natural refinement | 4/4 | 224/224 | −4.203729 | Legal nonprose, −6.618662 natural score/rune |

The exact recovered native plaintexts score −2.243 to −2.513 on prefixes and −1.997 to −2.268 on natural held-out runes. The original q13-before refined prefix happens to contain short accidental fragments but its frozen continuation is `NOGOPNGYYNYPHTHAJOEGPNGWJTOTHMAWIGIAECRMDAEXTWYOEIFHJIDEOTOEIAMBHJTH` in conventional transliteration. The two other legal original continuations are equally incoherent. One matched-zero independent-pad negative per calibrated branch supplies a limited sanity check, not a population false-positive estimate: natural prefix scores −4.625233, −4.288218, −5.641302, −4.370114; the last has legal natural holdout −6.837725 and the others fail reachability. Original legal continuations re-encrypt exactly, as do the control continuations; this verifies implementation, not historical key identity.

**Decision:** retire this fixed row-permutation/additive composition search for ordinary native GP prose at the frozen q8/q13, with the finite mask/key budgets stated above. Neither a generic coupled-transposition theorem nor an all-key exclusion follows; the chosen serialization, continuous F clock and ordinary additive family remain assumptions. No source-selected receiver for a different geometry or value law follows from these negatives. Do not tune the permutation, phase, signs or inferred row size around this output. A genuinely different authenticated operation or externally constrained key would be a new decision.

### Reproduction

The direct permutation control and original output are reproduced by [historical-transfer SFT](../sims/lp2_p33_historic_14column_transfer_sft.cjs) (Windows CI [44978951007](https://github.com/FlareZ123/liber-primus/actions/runs/44978951007)). For the coupled experiments use [base driver](../sims/lp2_p33_14column_additive_fhold_sft.cjs) with after/before and 8/13, and [natural-order refinement driver](../sims/lp2_p33_14column_natural_refinement_sft.cjs). These reuse [cyclic n-gram library](../sims/lp2_fhold_cyclic_ngram_map.cjs). Actual source input and both drivers were executed in the connected JS runtime; no new Windows CI execution is claimed.

Raw results, including full keys, candidate indices, original failure locations and calibration metadata: [after8](lp2-p33-14column-additive-fhold-after8.json), [after13](lp2-p33-14column-additive-fhold-after13.json), [before8](lp2-p33-14column-additive-fhold-before8.json), [before13 failed calibration](lp2-p33-14column-additive-fhold-before13.json), [before13 refined](lp2-p33-14column-additive-fhold-before13-refined.json).

Issues [#2153](https://github.com/FlareZ123/liber-primus/issues/2153) and [#2599](https://github.com/FlareZ123/liber-primus/issues/2599). No unknown LP2 plaintext, authentic key or destination recovered.
