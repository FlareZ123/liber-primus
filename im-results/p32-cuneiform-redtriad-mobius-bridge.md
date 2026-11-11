# Cuneiform prime ranks select the p32 Möbius map and a p3 -> p39 red-triad state bridge

**Classification:** new exact cross-artifact structural result, with a standalone original-source reproducer. It fixes a previously ambiguous p32 projective map and produces a finite 210-state recurrence aligned exactly to the pp33-39 cuneiform-headed section. It does not yet provide a plaintext readout, authentic LP2 key, or complete cipher.

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

The seven physical pages carrying the cuneiform header, pp33-39, contain exactly **1,680 runes**:

```text
1680 = 8 x 210
```

and **8** is exactly `464/58`. Among every contiguous seven-page window in physical pp0-55, pp33-39 is the only window whose rune count is divisible by 210. This gives a source-fixed state period and target interval without fitting a language score.

## Direct projective readout gates

The first three natural symbol-readout families are now closed on the unchanged pp33–39 ciphertext. The three evolving projective coordinates collide with each other at **15 of the 210 states**, so a single projectivity carrying the distinct initial triad to every later triad does not exist. That rules out the most direct moving three-point frame before language scoring.

A homogeneous 2×2×2 tensor readout remains defined through infinity and gives exactly eight field coordinates per state, matching 210×8 = 1,680. Using the canonical binary coordinate order and the pre-existing PATIENCE column order, with direct add/subtract/Beaufort-style GP29 combination, gives six original-cipher candidates with IoC only **0.034270683–0.034759919**. No candidate approaches native-GP prose.

**Scale-invariant Segre normalization is also closed.** Treating each 8-coordinate tensor row as its actual projective point in \(P^7(F_{29})\), divide the whole row by its first nonzero coordinate before any cipher action. This removes homogeneous scale ambiguity and remains defined when any of the three source coordinates is projective infinity. The canonical binary order, canonical normalization followed by the existing PATIENCE order, and PATIENCE-before-normalization give nine direct C−K/C+K/K−C candidates. Every output remains ciphertext-like: IoC **0.034407–0.034632** and held-out Latin-GP trigram score **−10.6894 to −10.6520**, versus native-control IoC **0.07203** and trigram **−7.2895**. Reproducer: [scale-invariant Segre SFT](../sims/p32_cuneiform_segre_normalization_sft.cjs). This closes the canonical projective normalization route without choosing an arbitrary infinity symbol or fitted scale.

A second lossless construction composes the actual coordinate-map powers into one PGL2 keystream, using the two natural component orders F0^n F1^n F2^n and F2^n F1^n F0^n and testing forward/inverse action. The four candidates produce **48, 59, 51 and 48 projective-infinity outputs**; their remaining finite symbols have IoC **0.034086811–0.034513827**. Treating infinity as a possible source-visible delimiter does not rescue the model: the strongest of the four has **17/51** poles exactly at the 378 canonical word ends, versus **11.475** expected; the one-sided hypergeometric tail is **0.0477966 before accounting for the four tested variants**. This is not a discriminating boundary selector.

A third readout now closes the most direct use of the cuneiform-derived 3/8 pair itself. The value **3 = 174/58** is absent from every coordinate in all 210 source states, so the projective chart `h(x)=1/(x-3)` is finite on the entire recurrence, with projective infinity mapping naturally to zero and no patched pole. The three chart coordinates give exactly **2^3=8** binary subset-sum vertices per state, matching **8 = 464/58** and the required 1,680 = 210×8 rune count. Canonical binary order and the pre-existing PATIENCE order, under C−K, C+K and K−C, give six exactly reversible original-cipher candidates with IoC only **0.034377038–0.034651437**. The cube key itself has IoC **0.051007544**, so the negative is not caused by a uniform key stream. This finite projective-safe construction does not recover native-GP prose.

These results reject only these direct readouts, including the source-selected affine-chart cube. They do not refute the 210-state source relation itself, and they do not authorize an arbitrary infinity-to-rune patch, phase search, or fitted nonlinear map. A successor needs an independently source-specified symbol action. Reproducer: [projective-readout SFT](../sims/p32_cuneiform_projective_readout_gate.cjs).

## Projective cross-ratio readout gate

The canonical cross-ratio is the natural projective invariant to try after the direct coordinate, tensor, Segre and affine-chart readouts: it is defined on \(P^1(F_{29})\) without selecting an affine chart. I tested a bounded, source-tied family against the unchanged **1,680-rune pp33–39** target.

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

**Conclusion:** the natural cross-ratio/table/heading readouts do not decrypt pp33–39. This rejects only these specified readouts and the explicit first-rune codebook choice; it does not refute the source-derived 210-state recurrence or justify inventing a different projective patch. Any successor needs an independently motivated readout and a locked, source-supported symbol action. Reproducer: sims/p32_m7_projective_crossratio_readout_sft.cjs.

## Direct 30-state PGL2 alphabet substitution gate

The simplest direct symbol action of the source-derived M7 is its permutation of \(P^1(F_{29})\): finite states 0–28 are the GP runes and \(\infty\) is assigned to the word boundary. This is a natural 30-state embedding, but the `infinity = space` assignment is an added hypothesis, not an explicit instruction in the manuscript. The fixed matrix is \(M_7=[[14,25],[25,28]]\), determinant **28 mod29**, with inverse \([[1,25],[25,15]]\); both act as bijections on all 30 states.

I applied only M7 and M7⁻¹ to two source-fixed targets, preserving word boundaries as the 30th input state and ignoring line wraps/page breaks: (1) full physical pp33–39, **1,680 runes + 378 word boundaries**; and (2) the exact matching three-dot bracket p33 local91 through p39 local119, **1,468 runes + 326 word boundaries**. On the full pages, M7/M7⁻¹ produce only **64/55 spaces** (65/55 words, mean lengths **30.677/36.418**) instead of 378 source boundaries; on the bracketed body they produce **47/46 spaces** (48/46 words, mean lengths **36.396/38.000**) instead of 326. Duko Round27 quadgram means are **−18.50766046/−17.69639681** versus raw **−17.25835981** on full pages, and **−18.52003128/−17.71087293** versus raw **−17.31601836** on the bracketed body. The solved p56+p57 and native Shakespeare controls score **−14.07409897** and **−10.00056948**. Both maps are exact inverses and recover a planted 30-state stream; that validates implementation, not the cipher hypothesis. The output samples are nonlinguistic. **Retire only this direct P¹(F29) substitution with infinity-as-space**; do not search arbitrary alternative infinity assignments. Reproducer: [`p32_m7_30state_alphabet_substitution_sft.cjs`](../sims/p32_m7_30state_alphabet_substitution_sft.cjs).

## What this changes

The p32 row-major projective map can now be selected from the complete 16-member physical corner family using the adjacent cuneiform numbers. Those same values select its infinity cycle, prescribe the p3-to-p39 triad correction, and produce a whole-section 8 x 210 geometry.

The direct P¹(F29) alphabet action with infinity-as-space is now also tested and negative. The missing component is still a **distinct, source-specified projective-safe readout** from the 210 state cycle to the 1,680 ciphertext runes. The canonical cross-ratio constructions and the direct 30-state substitution do not authorize a fitted nonlinear map, arbitrary infinity patch, or further phase search. A successor must supply a different readout and symbol action from independent source evidence before applying it to the frozen pp33–39 interval.

**Reproducer:** [`sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs`](../sims/p32_cuneiform_redtriad_mobius_bridge_sft.cjs). It reads the unchanged canonical corpus and ink annotations, enumerates all 16 corner assignments, asserts both unique selectors, reconstructs the red triads, verifies the projective relations, proves the 210 source-started period, and checks every contiguous seven-page LP2 window.
