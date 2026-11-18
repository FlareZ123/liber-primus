# p57 reconstructs the p50 nested bracket: EMERGE=83, DIUINITY=105, center `13`

**Agent5, 18 November 2026. Classification: high-priority source-internal solve-path hypothesis. Every numerical and artifact statement below is reproduced from original/curated source inputs. The remaining inference is the instruction that solved p57 words should be summed in canonical GP0 and used as zero-based p50 addresses. No unknown LP2 plaintext or key is recovered.**

## Human-first reconstruction from the solved instruction

Solved p57 says:

`WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIUINITY WITHIN AND EMERGE.`

The original p57 image also visibly prints the red title `PARABLE` followed immediately by a red 13-dot mark; the terminal punctuation is a red 23-dot mark. The curated ink annotations reproduce those two marks at offsets7 and95.

Use the canonical GP0 indices already native to LP arithmetic.

`EMERGE = E M E R G E = 18+19+18+4+6+18 = 83`.

Zero-based p50 **cell83 is `3D`**. The same token occurs at cell127. One cell immediately outside each endpoint gives cells82 and128, and both are **`3L`**. This reconstructs the independently discovered nested pair directly from the instruction:

- outer pair: cells82/128, token `3L`, base60 value201, separation46 = π(201);
- inner pair: cells83/127, token `3D`, base60 value193, separation44 = π(193);
- both pairs have the same linear midpoint **105**;
- shedding both endpoint pairs leaves strict interior cells84..126, exactly43 cells.

Now apply the next named object in the instruction:

`DIUINITY = [23,10,1,10,9,10,16,26]`, whose canonical GP0 sum is **105**.

Thus the word **DIUINITY lands exactly at the common center of both reconstructed circumferences**. Cell105 prints literal token **`13`**, and `13` occurs once in the entire 256-token table.

The core path is therefore:

`EMERGE --GP0--> 83 --duplicate 3D / outer 3L--> nested circumferences --shed endpoints--> 84..126 --center--> 105 <--GP0-- DIUINITY`

This is materially stronger than discovering the bracket first and fitting p57 afterward: a solver starting from the solved instruction can use EMERGE to enter the table at one boundary, recover both nested duplicate pairs by local inspection, verify both prime-count separations, shed the boundaries, then find DIUINITY at their exact shared center.

Across all 20 complete p57 words, the only GP0 sums that hit the five bracket-special addresses `{82,83,105,127,128}` are **EMERGE=83** and **DIUINITY=105**. Other arithmetic conventions can produce isolated special hits, so the evidence is the paired semantic match rather than a claim that GP0 is the only imaginable encoding.

## The same frozen GP0 addressing exposes a word-level instruction chain

Once GP0→p50 address is fixed by EMERGE/DIUINITY, the remaining p57 words provide an independent table prediction.

- `SHED` has GP0 sum64. Cell64 is `22`; under the already documented base59 alphabet, `22` = **120**, exactly the GP0 sum of the title `PARABLE`.
- `CIRCUMFERENCES` has GP0 sum131. Cell131 is `20`; under base60, `20` = **120**, independently converging on `PARABLE`.
- `PARABLE` has GP0 sum120. Cell120 is `0g`; base60 gives **42**, exactly the GP0 sum of `FIND`. No token in the source table decodes to42 under base59.
- `FIND` has GP0 sum42. Cell42 is `0S`; both base59 and base60 decode it as **28**.

So the source-privileged chain is:

`SHED --base59--> PARABLE <--base60-- CIRCUMFERENCES`

`PARABLE --base60--> FIND --> 28`

The radix split is semantically coherent at the first edge: SHED uses the alphabet with one symbol removed. It is also mechanically forced by the actual source tokens if the target is PARABLE=120: `22` reaches120 only in base59, while `20` reaches120 only in base60.

### Conditional matched-token diagnostic

Treat the named GP0 addresses64,131,120 as frozen by the source words and randomly permute the exact 256-token p50 multiset.

For the exact observed radix assignment:

`P = (2/256) × (1/255) × (2/254) = 1/4,145,280`.

If either base59 or base60 is allowed independently at the two inbound PARABLE edges, there are three source token copies capable of yielding120 under at least one radix, while the PARABLE→FIND edge still requires one of the two `0g` copies:

`P = (3/256) × (2/255) × (2/254) = 1/1,381,760`.

These are conditional selectivity diagnostics, not universal familywise p-values over every possible word subset, numerical convention, or semantic interpretation. Their value is that the GP0 addressing convention was identified independently by the EMERGE/DIUINITY bracket reconstruction before this complete p57-word graph was enumerated.

The resulting **28** is now a concrete blind destination candidate. A page-number reading is plausible because another source word, `TUNNELNG` (GP0=94), lands on p50 cell94 `0u`, whose two frozen radix readings are **55 and56**, exactly the final unknown p55 / solved p56 page pair. This secondary alignment should remain conditional until a source-fixed operation on p28 succeeds.

## EMERGE pointer walk is not independent evidence

A tempting continuation is to start at center105 and follow base59 table pointers until “emergence.” The path reaches the unique base59 fixed point189 in28 hops. An all-start census rejects this as validation: **all 256 p50 starting cells eventually reach189**. Six starts, including105, do so in exactly28 hops. The fixed point therefore adds no evidence for the p57 bracket route.

## Printed center `13` and the red-13 punctuation family

The center token is visibly `13`, not merely a radix-decoded number. The original p57 page places a red 13-dot punctuation mark immediately after the red title PARABLE, giving a same-page visual motif a human solver could notice.

The manuscript nevertheless uses 13-dot marks as a recurring punctuation class, and solved-page controls do not establish their dot count as a numeric operand. Therefore this continuation stays conditional.

If the center `13` is taken as a cue to inspect red 13-dot marks, then requiring an immediately preceding red span to possess a one-based 13th rune leaves exactly six original pages:

`p0, p3, p7, p23, p27, p53`.

Their red-span GP-prime sums are `662,742,766,786,1109,2262`; only p27 is prime, **1109 = prime #186**. Its one-based 13th rune is `I` with GP prime31, its residual length after position13 is6, and `31×6=186`. That is the existing p27 red13 object whose DH/table continuation has already survived an independent familywise audit around 1 in130,000.

This gives the red13 route a plausible upstream human clue for the first time, while the exact interpretation of the printed center token remains unresolved.

## Center-out receiver follow-up (Agent6)

The source reconstruction makes one distinct receiver worth testing before any broader cipher search: after `DIUINITY` identifies center cell105, read the 43-cell strict interior **outward from the center**, interpreting p57 `EMERGE` as the serialization cue, and pair that stream with the 43 strict p55 word interiors selected by `SHED OUR OWN CIRCUMFERENCES`.

That finite receiver is now closed for the two center-out tie orders, raw-byte/totient GP29 registers, and every global affine additive pair `a,b mod29` (**3,364 candidates**). The best original candidate scores **-11.92144509** on the calibrated within-word GP29 trigram model, below the worst of **2,000** exact-word-shape native controls (**-8.96495606**). A source-shaped planted receiver recovers **43/43** and scores **-7.65777251**. See [the bounded receiver gate](lp2-p57-divinity-emerge-centerout-p55-gate.md) and [SFT](../sims/lp2_p57_divinity_emerge_centerout_p55_sft.cjs).

This negative leaves the `EMERGE=83 / DIUINITY=105` bracket reconstruction unchanged. It only rejects the simplest center-out stationary affine use of the 43 bracket values as a p55 key stream.

## Decision

Promote the **p57 EMERGE/DIUINITY → p50 nested bracket** route as a leading intended-solve-path hypothesis. It explains how a player could be led to the nested prime-count structure from solved text, rather than merely recognizing the structure statistically.

The strongest next blind prediction is **FIND → 28** under the same frozen GP0/table convention. Work on p28 should remain narrow: use only source-fixed selectors supplied by this route, and require a reversible plaintext or a new original-artifact prediction. Do not broaden into arbitrary p28 key searches.

The printed center `13` → red13 continuation is promising but still one inference short of authentication. The universal base59 attractor189 must not be counted as corroboration.

Reproducer: `sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs`.
Windows Node22 passes: **44412420619** (initial center bridge), **44413029291** (global-attractor correction), and **44414174775** (expanded EMERGE/DIUINITY reconstruction plus the frozen p57 word-chain and FIND→28 prediction).
