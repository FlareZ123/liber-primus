# Cuneiform prime ranks select the p32 Möbius map and a p3 -> p39 red-triad state bridge

**Classification:** exact cross-artifact structural result with a standalone original-source reproducer. The p32 projective map and 210-state recurrence are source-derived. However, its 8×210 output matches the full pp33–39 page span (1,680 runes), not the source-bracketed cuneiform body (1,468 runes, p33 local91→p39 local119); the page span also includes a 91-rune p33 prelude and a 121-rune p39 tail. No plaintext readout, authentic LP2 key, or complete cipher has been recovered.

## Source-boundary correction (Director Issue #329)

Original-image review resolves the p32→p33 ambiguity. The p33 red heading at local offset 0 is a 10-rune title followed by the same 13-dot punctuation motif as solved p57's PARABLE title; it begins a standalone **91-rune / 23-word** unit. The later p33 red heading at local offset 91 begins the repeated 1033/3301 cuneiform passage. A second three-black-dot bracket ends at the p39 red heading at local offset 119. The source-bracketed cuneiform body is therefore **1,468 runes**, from p33 local91 through p39 local119. The full pp33–39 page span decomposes as **91 + 1,468 + 121 = 1,680**.

Consequently, 1,680 is a **page-span** count, not the length of one cuneiform section. The 210-state recurrence remains established as a source-derived cycle; the 8×210 equality does not independently prove a single-section target or a cryptographic reset. Existing full-span readout tests below must be read as tests of the aggregate page span. The original-JPEG boundary evidence and red-13-dot pixel SFT are consolidated in [the section-clock synthesis](../workplace/lp2-section-clock-ambiguity.md) and [the boundary reproducer](../sims/p32_p33_red13dot_boundary_sft.py).


## Source chain

The repeated cuneiform header on physical pp33-39 gives sexagesimal **1033** and **3301**. Both are prime. The pair has a substantially older operator history. In the early-2013 boot image, `prime_echo` emits the primes in increasing order through 3301 and deliberately pauses four times longer on **1033** and **3301**. The subsequent first-onion `NUMBER` service explicitly tests decimal reversal of primes and shows `3301 -> +`, meaning its reversal 1033 is also prime. Later March 2013 server-test records show Cicada issuing `BASE29 1033` and `DH 3301`; a full participant transcript records `BASE29 1033` → `16I` before a completed `DH 3301` exchange. In 2014 the ordered concatenation `33011033` is the documented OpenPuff password that extracts `magicsquares.txt`. The pinned [historical operator manifest](../resources/external/1033-3301-historical-operator-chain.json) and [TCP transcript manifest](../resources/external/2013-tcp-live-test-vectors.json) preserve the chain. These sources make decimal reversal and an ordered-prime interpretation part of the historical solve vocabulary. Counting the highlighted primes' positions remains a solver inference, though it now follows directly from a source-visible ordered prime stream.

Their one-based prime ranks are **174** and **464**, hence:

```text
174 = 6 x 29 = 3 x 58
464 = 16 x 29 = 8 x 58
```

The quotients 6/16 and 3/8 were previously noted against p32 ring/clause geometry. The new result is that the same source numbers resolve the p32 central-ring Möbius ambiguity and connect the two three-rune red inscriptions.

Physical p32's central 5x5 perimeter has 16 runes and GP-prime sum 1,136. Assign each of its four corners to exactly one adjacent side. There are exactly 16 legal corner-ownership conventions. Each convention gives a 2x2 side-sum matrix over F29.

Two cuneiform-derived conditions select exactly one convention. The p32 source-visible 13-dot mark and `3301 mod 29 = 24` require **13 -> 24**. The first cuneiform prime rank 174 requires one projective cycle's finite GP-prime weights to sum **174**. Exactly one of all 16 assignments passes both, the horizontal-corner single-count convention:

```text
M7 = [[14,25],
      [25,28]]  mod 29
```

It has projective order 7. Its infinity-containing cycle has finite states `{2,7,8,10,11,16}`, whose GP-prime weights sum exactly 174. This supplies a source-selected reason to prefer that p32 map over the other corner allocations.

## Exact red-triad transition

The original red triads at local rune offset 119 are:

```text
p3  = [13,23,2]
p39 = [27,5,15]
```

Applying the selected p32 map componentwise gives `M7(p3) = [24,5,7]`. The exact componentwise correction is:

```text
p39 - M7(p3) = [3,0,8] mod 29
```

The two nonzero corrections are exactly `174/58 = 3` and `464/58 = 8`. Among all 16 legal p32 corner assignments, this exact correction occurs for one assignment only, the same selected M7.

The cuneiform-derived value **16** independently appears in the existing source relation:

```text
M7 ~ Q16 A^16 Q16^-1
Q16 = [[16,9],[0,1]]
A   = [[11,6],[6,11]]
```

where A is the LP1 p05 `MOBIUS` corner matrix. The later cuneiform header therefore supplies parameters that meet the earlier LP1/p32 projective chain and the p3/p39 red inscriptions in one finite construction.

## A source-fixed 210-state recurrence

Interpret the three corrections as projective translations after M7:

```text
F0 = (x -> x+3) o M7
F1 = M7
F2 = (x -> x+8) o M7
```

Starting from the original p3 coordinates `[13,23,2]`, one step under `[F0,F1,F2]` gives the original p39 triad `[27,5,15]` exactly. The three source-started coordinate orbit lengths are **14, 7, and 15**, so the joint state returns for the first time after **210** states.

The seven-page pp33–39 span contains exactly **1,680 runes**, but the source-bracketed cuneiform body is only **1,468** (p33 local91→p39 local119); the page-span total also includes the 91-rune p33 prelude and 121-rune p39 tail:

```text
1680 = 8 x 210
```

and **8** is exactly `464/58`. Among every contiguous seven-page window in physical pp0-55, pp33-39 is the only window whose **page-span** rune count is divisible by 210. This gives a source-fixed state period and unique page-span count, not a source-fixed single-section length.

## Direct projective readout gates

The first three natural symbol-readout families are now closed on the full 1,680-rune pp33–39 page span (including the p33 prelude and p39 tail), not on the 1,468-rune bracketed cuneiform body. The three evolving projective coordinates collide with each other at **15 of the 210 states**, so a single projectivity carrying the distinct initial triad to every later triad does not exist. That rules out the most direct moving three-point frame before language scoring.

A homogeneous 2×2×2 tensor readout remains defined through infinity and gives exactly eight field coordinates per state, matching 210×8 = 1,680. Using the canonical binary coordinate order and the pre-existing PATIENCE column order, with direct add/subtract/Beaufort-style GP29 combination, gives six original-cipher candidates with IoC only **0.034270683–0.034759919**. No candidate approaches native-GP prose.

**Scale-invariant Segre normalization is also closed.** Treating each 8-coordinate tensor row as its actual projective point in \(P^7(F_{29})\), divide the whole row by its first nonzero coordinate before any cipher action. This removes homogeneous scale ambiguity and remains defined when any of the three source coordinates is projective infinity. The canonical binary order, canonical normalization followed by the existing PATIENCE order, and PATIENCE-before-normalization give nine direct C−K/C+K/K−C candidates. Every output remains ciphertext-like: IoC **0.034407–0.034632** and held-out Latin-GP trigram score **−10.6894 to −10.6520**, versus native-control IoC **0.07203** and trigram **−7.2895**. Reproducer: [scale-invariant Segre SFT](../sims/p32_cuneiform_segre_normalization_sft.cjs). This closes the canonical projective normalization route without choosing an arbitrary infinity symbol or fitted scale.

A second lossless construction composes the actual coordinate-map powers into one PGL2 keystream, using the two natural component orders F0^n F1^n F2^n and F2^n F1^n F0^n and testing forward/inverse action. The four candidates produce **48, 59, 51 and 48 projective-infinity outputs**; their remaining finite symbols have IoC **0.034086811–0.034513827**. Treating infinity as a possible source-visible delimiter does not rescue the model: the strongest of the four has **17/51** poles exactly at the 378 canonical word ends, versus **11.475** expected; the one-sided hypergeometric tail is **0.0477966 before accounting for the four tested variants**. This is not a discriminating boundary selector.

A third readout now closes the most direct use of the cuneiform-derived 3/8 pair itself. The value **3 = 174/58** is absent from every coordinate in all 210 source states, so the projective chart `h(x)=1/(x-3)` is finite on the entire recurrence, with projective infinity mapping naturally to zero and no patched pole. The three chart coordinates give exactly **2^3=8** binary subset-sum vertices per state, matching **8 = 464/58** and the required 1,680 = 210×8 rune count. Canonical binary order and the pre-existing PATIENCE order, under C−K, C+K and K−C, give six exactly reversible original-cipher candidates with IoC only **0.034377038–0.034651437**. The cube key itself has IoC **0.051007544**, so the negative is not caused by a uniform key stream. This finite projective-safe construction does not recover native-GP prose.

These results reject only these direct readouts, including the source-selected affine-chart cube. They do not refute the 210-state source relation itself, and they do not authorize an arbitrary infinity-to-rune patch, phase search, or fitted nonlinear map. A successor needs an independently source-specified symbol action. Reproducer: [projective-readout SFT](../sims/p32_cuneiform_projective_readout_gate.cjs).

## Projective cross-ratio readout gate

The canonical cross-ratio is the natural projective invariant to try after the direct coordinate, tensor, Segre and affine-chart readouts: it is defined on \(P^1(F_{29})\) without selecting an affine chart. I tested a bounded, source-tied family against the full **1,680-rune pp33–39 page span**; this is not the **1,468-rune** source-bracketed cuneiform body.

The 30 nonempty thirteen-dot fragments are ranked by the p50 table's all-distinct second column, giving the existing bijection between ranks 0–29 and fragments. The M7 fixed rank **25** selects fragment 22, the **eight-rune p33 second heading**; its p50 row is row 22. For each of the 210 states and each of eight columns, I tested three readouts:

1. \(CR(x_n,y_n;z_n,d_j)\), where \(d_j\) is one of the eight row-22 table bytes reduced modulo 29.
2. The same state triple with \(d_j\) taken from the eight p33 heading runes.
3. \(CR(B_{x_n,j},B_{y_n,j};B_{z_n,j},h_j)\), where each \(B\) is the p50 byte in the row selected by that state's projective rank and \(h_j\) is the corresponding p33 heading rune.

The convention is
\[
CR(a,b;c,d)=\frac{\det(a,c)\det(b,d)}{\det(a,d)\det(b,c)},
\]
with finite points represented by \([x:1]\) and infinity by \([1:0]\). Each result in \(P^1(F_{29})\) is mapped through the 30-fragment rank order to the first rune of that fragment; infinity therefore maps to rank 29 without an affine patch. The first-rune representative is an explicit candidate readout, not a source-established rule. A 0/0 degeneracy is retained as an erasure, never silently replaced.

The three readout families, two source-anchored orientations (p3-forward / p39-backward), and both additive signs give **12** predeclared inverses. They produce **1–17 erasures** and **90–163 infinity outputs** per 1,680-symbol key. Across the 12 outputs, IoC is **0.03427–0.03478** (raw target **0.03436**); held-out Gibran trigram score is **−12.3237 to −12.1753**, against raw **−12.2651** and a matched 1,680-rune native Gibran control **−7.69065** (control IoC **0.06188**). Some candidates move the raw score slightly, but none approaches native prose. A modulo-29 synthetic encrypt/decrypt positive control recovers every non-erased position exactly.

**Conclusion:** the natural cross-ratio/table/heading readouts do not decrypt the full pp33–39 page span. This rejects only these specified readouts and the explicit first-rune codebook choice; it does not refute the source-derived 210-state recurrence or justify inventing a different projective patch. Any successor needs an independently motivated readout and a locked, source-supported symbol action. Reproducer: sims/p32_m7_projective_crossratio_readout_sft.cjs.

## Direct 30-state PGL2 alphabet substitution gate

The simplest direct symbol action of the source-derived M7 is its permutation of \(P^1(F_{29})\): finite states 0–28 are the GP runes and \(\infty\) is assigned to the word boundary. This is a natural 30-state embedding, but the `infinity = space` assignment is an added hypothesis, not an explicit instruction in the manuscript. The fixed matrix is \(M_7=[[14,25],[25,28]]\), determinant **28 mod29**, with inverse \([[1,25],[25,15]]\); both act as bijections on all 30 states.

I applied only M7 and M7⁻¹ to two source-fixed targets, preserving word boundaries as the 30th input state and ignoring line wraps/page breaks: (1) full physical pp33–39, **1,680 runes + 378 word boundaries**; and (2) the exact matching three-dot bracket p33 local91 through p39 local119, **1,468 runes + 326 word boundaries**. On the full pages, M7/M7⁻¹ produce only **64/55 spaces** (65/55 words, mean lengths **30.677/36.418**) instead of 378 source boundaries; on the bracketed body they produce **47/46 spaces** (48/46 words, mean lengths **36.396/38.000**) instead of 326. Duko Round27 quadgram means are **−18.50766046/−17.69639681** versus raw **−17.25835981** on full pages, and **−18.52003128/−17.71087293** versus raw **−17.31601836** on the bracketed body. The solved p56+p57 and native Shakespeare controls score **−14.07409897** and **−10.00056948**. Both maps are exact inverses and recover a planted 30-state stream; that validates implementation, not the cipher hypothesis. The output samples are nonlinguistic. **Retire only this direct P¹(F29) substitution with infinity-as-space**; do not search arbitrary alternative infinity assignments. Reproducer: [`p32_m7_30state_alphabet_substitution_sft.cjs`](../sims/p32_m7_30state_alphabet_substitution_sft.cjs).

## Cross-round Liber AL geometry (source evidence; not a solved readout)

The 2013 Cicada source bundle includes transcriptions of *Liber AL* I/II/III in [Book I](../resources/external/2013-book-of-law-I.txt), [Book II](../resources/external/2013-book-of-law-II.txt), and [Book III](../resources/external/2013-book-of-law-III.txt). They contain a tightly connected geometric vocabulary:

- I:6 identifies Hadit as the speaker's "secret centre".
- I:60 gives the number 11 and describes a five-pointed star with a red circle in its middle.
- II:3 says: "In the sphere I am everywhere the centre, as she, the circumference, is nowhere found."
- II:55 directs the reader to obtain the order and value of the English alphabet and assign new symbols.
- III:47 describes a drawn line and a squared circle as keys.

This is a notable cross-round match to the solved LP2 tail: p56's koan says "the I is the voice of the circumference"; p57 says to "shed our own circumferences" and "find the divinity within". Keep the page features distinct: the Möbius/infinity motif occurs elsewhere in LP2 (notably pp0–2 and p15); the 4×4 numerical table is on p15; physical p32 is the 121-rune six-line block with its red 13-dot mark and tree illustration. These separate visual cues can be considered together as a manuscript-wide family, but they are not all printed on p32. The 2013 `0_wisdom` MOBIUS marker and the already-derived p32 projective/Möbius map remain relevant cross-round context. The source cluster strengthens a Thelemic centre/circumference/line/circle interpretation as a plausible human solve-path hypothesis.

**Limits.** The 121 p32 runes are printed in six lines, not as an 11×11 square; 11×11 is a derived reflow. I:60 therefore motivates, but does not prove, that reflow or a pentagram overlay. The source texts do not specify a rasterization, orientation, symbol readout, or mapping from the 29 GP symbols to the English Qabalah/ALW alphabet. Do not assume that later ALW interpretations are Cicada's intended cipher.

**Bounded negative checks.** Literal GP29 Vigenère keys `HADIT` and `NUIT` on p55, a simple per-word centre-as-key operation, and the 11-rune p32 main-diagonal key on pp33–39 did not yield readable plaintext. A standard top-point pentagram rasterization of an 11×11 reflow produced a 45-rune candidate key; its forward/reverse and centre-inserted variants did not decrypt pp33–39 under the p56 additive convention. These results reject only those exact readings; they do not disprove every geometrically motivated route. Do not continue unconstrained Thelemic word-key sweeps.

**Primary-source comparison completed (11 November 2026).** The O.T.O. USA library's [holograph manuscript landing page](https://lib.oto-usa.org/libri/liber0031.html) identifies [page 60, verse III:47](https://lib.oto-usa.org/libri/images/liber0031/60.jpg). The scan visibly has eight labelled columns (a–h), ten numbered rows (1–10), a diagonal line, and a circled-cross mark. The scan establishes that these features are present in the holograph witness; it does not date the grid/line annotations relative to the 1904 dictation. Comparing the original LP2 physical p32 scan (`resources/liber-primus/49.jpg`), its 121 runes are printed in six text lines above a tree illustration, with a red 13-dot mark; it has no corresponding 8×10 grid, diagonal line, or circled-cross. The 11×11 p32 arrangement is a derived reflow, not its printed layout.

A plausible cross-artifact factorization is **21 complete p32 word starts × 80 cells (8×10) = 1,680 runes** across the pp33–39 page span; equivalently, the 210-state recurrence is 21×10 and each state has eight tensor coordinates. The 1,680 span includes the 91-rune p33 prelude and 121-rune p39 tail, so this is not a section-length alignment or executable rule. In the canonical transcription, the twenty internal 80-rune cuts coincide with only **8/20 word boundaries** (12 cut words) and **0/20 clause boundaries**; the target contains 22 clause spans, none of length 80. Thus the 21×10×8 layout is not a natural word- or clause-segmentation. The grid's eight columns provide a possible reason to group eight coordinates, but the left-to-right a–h to canonical binary 000–111 order is only the obvious candidate, and that tensor readout has already failed on the original target. The visible line runs approximately b1→e7 (rise/run 6/3 = 2); the circled-cross is centred at d7. Taking that mark as the phase anchor (zero-based row 6, column 3) gives the candidate affine shear r'=(r−2c) mod 10. Applied to the 21×10×8 tensor layout, this is a bijection of each 80-cell block.

The source-shear key was tested under the three direct GP29 actions. The source-selected slope-2/phase-0 results are: C+K IoC **0.0343876741**, trigram **−10.64337748**; C−K IoC **0.0341359653**, trigram **−10.65157497**; K−C IoC **0.0341359653**, trigram **−10.66426178**. Raw full pp33–39 page span is IoC **0.0343600216**, trigram **−10.66203386**; the held-out Latin-GP control is IoC **0.0720286230**, trigram **−7.28950741**. The best source-shear action (C+K) ranks **33/300** across the compact 10-slope × 10-phase × 3-action affine-shear control; 32 candidates score higher. The best overall control (slope 8, phase 0, C−K) scores only **−10.61679046**, remains ciphertext-like, and is the inverse orientation rather than the source-read line. A planted 1,680-rune Latin-GP stream encrypted with this exact key round-trips **1,680/1,680**, validating the implementation. This is a bounded negative, not a p-value or a plaintext candidate. Reproducer: `sims/liber_al_iii47_10x8_shear_sft.cjs`.

**Decision:** retain the III:47 page as historical geometric context and the 21×10×8 factorization as an unverified structural observation; retire the direct additive tensor readout under the source-motivated slope-2/phase-0 shear. The source-selected result is not exceptional among the small affine-shear controls and is far below native prose. Do not launch arbitrary grid permutations, line extensions, or alternate infinity patches. Reopen only if an independent original source fixes a different, unique symbol action.


## Prime-weighted M7 chain-cipher readout gate

The external chain-cipher hypothesis is indexed at [Leo-Y-Zhang/LiberPrimusAnalysis](../resources/external/leo-y-zhang-liberprimusanalysis.md). A bounded synthesis test used the source-derived 210-state M7 recurrence, its eight Segre-normalized coordinates per state, and the GP prime table as a readout: each coordinate v becomes either p_v mod 28 or φ(p_v) mod 28. The p3 seed's middle coordinate **23** is the candidate initial state; it matches the first rune D/23 of the full p33–39 page span. The chain inverse maps a zero step to EA and otherwise uses the external report's 28-step equation. Symbol order is identity or one of the two natural DH-shared-key-2 orders; both key signs were tested.

- **Full page span:** 12 fixed models (two key maps × three symbol orders × two signs). Best GP-Latin trigram score **−10.62111755**, versus the weakest of 721 native 1,680-rune Latin-Vulgate windows **−7.30049590**; **0/12** enter the native range.
- **Source-bracketed cuneiform body:** p33 local91→p39 local119, **1,468 runes**. Tested 48 fixed models: two key maps × three symbol orders × four source-bounded alignments (reset/carry IV × key offset 0/91) × two signs. The carry IV is the preceding p33 interlude's final rune L/20; the reset IV is p3's middle coordinate D/23. Best score **−10.61218791**, versus the weakest of 933 native 1,468-rune Latin-Vulgate windows **−7.32535910**; **0/48** enter the native range.

Every model exactly re-encrypts the original target and recovers a native-GP positive plant. The raw bracketed body scores **−10.66230334**; the full page span scores **−10.66203386**. These are bounded negatives for the frozen prime/totient M7 key readout and chain-cipher family, not evidence against every possible projective readout. Reproducer: [p32_m7_prime_chain_readout_sft.cjs](../sims/p32_m7_prime_chain_readout_sft.cjs).


## Seven projective degrees of freedom / exact 1,468-rune bracket gate

A normalized Segre point in P⁷ has **seven free coordinates**: one of its eight homogeneous coordinates is the pivot fixed to 1. In this M7 orbit the canonical binary-order pivot is coordinate 0 for all 210 states. Removing that pivot from each state gives **7×210 = 1,470** free coordinates. Removing the first and last boundary coordinates gives **1,468**, exactly the source-bracketed cuneiform body p33 local91→p39 local119. The two outside units total **91+121 = 212 = 210+2**, matching the 210 fixed pivots plus the two endpoint coordinates. This is a structurally motivated readout, not proof that the endpoints should be discarded.

The free-coordinate stream begins 15 and ends 20; the latter matches the preceding p33 interlude rune L/20. The 1,468 middle values were tested as a key stream:
- **Chain family:** raw-field, prime-weight, and totient-prime mappings into Z28; identity and both DH-shared-key-2 symbol orders; reset IV D/23 or carried IV L/20; both key signs. **36 models**, best trigram **−10.61977864** (raw field/DH2-power) versus weakest of 933 native 1,468-rune Latin-Vulgate windows **−7.32535910**; **0/36** enter the native range.
- **Direct additive family:** raw-field, prime, or totient-prime mapping into Z29; both signs. **6 models**, best trigram **−10.64706167** (raw field); **0/6** enter the native range.

All models re-encrypt the original bracketed body exactly and recover a native-GP positive plant. The raw body score is **−10.66230334**. The exact 7×210−2 length fit is worth preserving, but these fixed raw/prime/totient readouts do not recover plaintext. Do not expand this family with arbitrary coordinate permutations, dropped positions, or phases. Reproducer: [p32_m7_segre_free7_readout_sft.cjs](../sims/p32_m7_segre_free7_readout_sft.cjs).


## Outer-frame projective-chart selector gate

The two units outside the source-bracketed body total **91+121=212** runes. Removing their first and last boundary runes leaves **210** selectors, one per M7 state. Interpret each selector's GP index modulo 8 as the preferred homogeneous coordinate chart in the eight-coordinate Segre point; if that coordinate is zero, advance cyclically to the next nonzero coordinate. This is a standard deterministic chart fallback, and it gives seven free coordinates per state. The 210 selected pivots span all eight coordinates; 8/210 initial chart choices are zero, and all eight require exactly one forward step. Their state indices are **18, 33, 48, 78, 93, 123, 138, 153** (all congruent to 3 modulo 15). Removing the first and last free values gives **1,468** key values, exactly the cuneiform bracket length.

This is a source-motivated but unproven use of the outer frame as chart selectors. On the 1,468-rune body:
- **Chain family:** raw/prime/totient-prime key maps × identity/DH2 symbol orders × reset/carry IV × both signs = **36 models**; best trigram **−10.61473398**.
- **Direct additive:** raw/prime/totient-prime maps into Z29 × both signs = **6 models**; best **−10.60547266**.
- **Direct readout:** raw/prime/totient-prime maps × identity/DH2-power/DH2-log (EA fixed) = **9 models**; best **−10.51652735**.

All 51 candidates remain below the weakest of 933 native 1,468-rune Latin-Vulgate windows (**−7.32535910**); **0/51** enter the native range. Chain and additive models re-encrypt the original bracket exactly and recover native-GP plants. The raw body is **−10.66230334**. Retire this exact outer-frame chart-selector readout; do not tune selector modulus, fallback direction, or endpoints without a new source instruction. Reproducer: [p32_m7_outer_chart_selector_readout_sft.cjs](../sims/p32_m7_outer_chart_selector_readout_sft.cjs).

## What this changes

The p32 row-major projective map can now be selected from the complete 16-member physical corner family using the adjacent cuneiform numbers. Those same values select its infinity cycle, prescribe the p3-to-p39 triad correction, and produce an 8×210 geometry across the full pp33–39 page span, not the 1,468-rune bracketed cuneiform body.

The direct P¹(F29) alphabet action with infinity-as-space and the source-motivated III:47 10×8 slope-2 shear are now tested and negative. The missing component is still a **distinct, source-specified projective-safe readout** from the 210-state cycle to a source-selected target (the 1,680-rune page span or the 1,468-rune bracketed body) and reversible symbol action. The canonical cross-ratio constructions and the direct 30-state substitution do not authorize a fitted nonlinear map, arbitrary infinity patch, or further phase search. A successor must supply a different readout and symbol action from independent source evidence before applying it to the frozen pp33–39 interval.

**Reproducer:** [`sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs`](../sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs). It reads the unchanged canonical corpus and ink annotations, enumerates all 16 corner assignments, asserts both unique selectors, reconstructs the red triads, verifies the projective relations, proves the 210 source-started period, and checks every contiguous seven-page LP2 window.
