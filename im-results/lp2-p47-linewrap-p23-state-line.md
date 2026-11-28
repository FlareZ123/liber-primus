# P47 line-wrap DH state prospectively selects p23's exact state line

**Agent7, 28 November 2026. Classification: source-selected cross-route state/navigation closure. No unknown plaintext is promoted.**

## Decision

The p47 local-group47 route now makes a held-out prediction on a different page.

Cell115's literal `47` selects p47 page-local group47 before reading its runes. Its original printed line wrap is

```
[19] | [1,10,27,11,3]
  1  |       5 runes
```

and directly supplies

```
a = total length = 6
g = right length = 5
B = left singleton = 19
p = GP0(right) mod29 = 23.
```

Ordinary DH closure then uniquely reconstructs

```
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4).
```

The derived modulus **p=23** selects physical p23 without using p23 ciphertext. The pre-existing p23 source object is its first printed five-word line. Its word-length packet is exactly

```
[2,6,3,5,4]
= [K,a,e,g,q].
```

This is a prospective cross-route consequence: the p47 source object fixes both the destination page and all five numeric values before the p23 line is inspected.

## Full printed-line charge

Use the same printed-line parser already used by the p23 reconciliation. Across unknown p0-p55 there are **186** printed lines containing exactly five rune groups. Across the full p0-p57 manuscript there are **188**.

Charge the ordered vector

```
[K,a,e,g,q] = [2,6,3,5,4]
```

without permuting roles or values.

There is exactly **one** matching five-word line in both censuses:

```
physical p23, first printed line.
```

Thus the p47-derived modulus does not merely land on a page that happens to contain familiar state numbers; it lands on the unique printed five-word line that replays the state in the already established p23 order.

The established p23 positive-cardinal serializer maps this same line prefix to `THEORIG`, and its independent five-dot/terminal extension yields `THE ORIGIN`. Those semantic readings predate this p47 route. The new result is the source-only causal bridge:

```
cell115 literal47
 -> p47 local group47
 -> visible line-wrap DH reconstruction
 -> p=23
 -> physical p23
 -> unique printed [K,a,e,g,q] line
 -> existing p23 instruction family.
```

## H-free next-receiver gate: THE ORIGIN coordinate read fails (#3463)

A subsequent Director task asked whether the p47 state can select a **page-local p23 receiver without H**. The source-local motivation was frozen before the readout in Issue #3463:

- the already-established positive-cardinal packet on p23 reads `THE ORIGIN`;
- the original p23 image visibly marks the text origin with its enlarged first red rune;
- p47 reconstructs exactly nine ordered DH fields `(p,g,a,b,A,B,K,e,q) = [23,5,6,15,8,19,2,3,4]`;
- the authenticated signed-source word `DIRECTION` has nine letters and is independently motivated by “their numbers are the direction.”

The frozen operation therefore treated the enlarged first p23 rune as coordinate 0 and read the nine raw p23 runes at zero-based offsets

```
[23,5,6,15,8,19,2,3,4].
```

No H transform, shift, sign, reversal, permutation, page reset, word reset, or alternate index origin was allowed after reveal. Exact acceptance required the canonical GP transliteration to be `DIRECTION`.

The original p23 readout is

```
GP0 = [28,14,23,26,10,25,7,21,6]
GP  = EAXDYIAEWNGG
```

so the locked prediction fails. Applying the identical nine offsets from the origin of every physical LP2 page with enough runes produces **zero** `DIRECTION` hits and zero hits on any nine-letter word in the authenticated 2016 cleartext (whose only nine-letter word is `DIRECTION`). The upstream five-word-line charge is unchanged: `[K,a,e,g,q]=[2,6,3,5,4]` still occurs on exactly one printed five-word line, p23 line1.

This rejects the most direct `THE ORIGIN` → state-coordinate → `DIRECTION` consumer. One-based indexing and alternate state orders are deliberately not searched after the miss. P47→p23 remains a source-selected navigation/state closure into the pre-existing p23 instruction family, not a recovered H-free ciphertext receiver, key, or plaintext.

## Authentic p56-style consumer of the p23 state line fails immediately

The same p47→p23 bridge now permits a stronger body-cipher gate than arbitrary state shifts. The first p23 line is independently predicted as the ordered positive-cardinal state packet `[K,a,e,g,q]=[2,6,3,5,4]`. P23's already-established solved-p56 serializer is the genuine prime-minus-one map `T(n)=(prime(n)-1) mod29`, so this line fixes the five GP29 shifts `[2,12,4,10,6]`.

Freeze the receiver at the first rune after the complete selected five-word line (20 runes), repeat those five shifts from phase0, and use the authentic solved-p56 direction `C=P+k mod29`: inverse `P=C-k`, with plaintext Fehu/F=0 transparent and not consuming the key. No reversed key, phase search, sign change, H transform or language score participates.

The inverse has exactly one legal state through the first six following runes, producing GP0 `[11,24,15,18,6,9]`. At body offset6 / physical p23 rune offset26 the ciphertext value is `12` while the current key lane is also `12`. Consuming would force plaintext F=0, which is illegal under the authentic p56 F-hold semantics; the ciphertext rune is not F, so a transparent hold is also impossible. The legal-path set therefore collapses to **zero at the seventh rune**.

A generated native p57 control encrypted under the exact same five-shift/F-hold rule remains legally invertible for all95 runes and contains the original plaintext path, so the collapse is an original-cipher contradiction rather than a decoder implementation failure.

This rejects the most literal transfer of the authentic p56 cipher semantics to the newly authenticated p47→p23 state-line receiver. It is stronger than the older four-red-word raw-cardinal test: the key here uses the complete independently predicted five-word line and the genuine prime-minus-one serializer. It does not exclude a different clock, nonrepeating use, word-level operation, or another cipher family.

### THE ORIGIN -> p0 and the phase0 survivor census

A separately committed preregistration froze `THE ORIGIN` as physical p0/rune0 under the identical five shifts and solved-p56 F-hold semantics. P0 collapses after four legal symbols: at offset4 `C=6` equals the current key lane6, forcing an illegal consuming plaintext F; a hold is impossible because ciphertext is not F.

A post-failure diagnostic applies the exact phase0 decoder to every rune-bearing page. Only p24 and p43 traverse legally, with **14** and **27** exact plaintext histories once F-branch histories are counted rather than merged by key index. Their best source-native LP1 trigram scores are **-3.3946140** and **-3.4083711**. Those are worse than every matched Gibran control: among all 62,223 length270 windows the floor is **-3.1693961**, and among all 62,219 length274 windows the floor is **-3.1690795**. Thus the legal survivors are nonlinguistic coincidences, not plaintext.

The census is exploratory and does not source-select p24/p43. It establishes that mere F-hold legality is insufficient evidence and closes the direct `THE ORIGIN -> p0` transfer without phase/sign rescue.

## Evidence boundary

This does not decrypt new p23 rune text. It strengthens the intended-route case because a source-selected object on p47 predicts an independently documented source object on p23 with exact ordered values and a unique manuscript-wide printed-line hit. The direct H-free origin-coordinate continuation is now prospectively rejected, so the supported claim stops at navigation/state closure unless a different page-local operation is independently selected.

The page-local ordinal convention remains part of the upstream p47 route: cell115 literally prints `47`, and the chosen interpretation is physical page47 plus local group47. Once that selector is granted, the p47 line-wrap arithmetic and the p23 line holdout are deterministic.

## Reproduction

Primary cross-route SFT:

`sims/lp2_p47_group47_linewrap_dh_state_sft.cjs`

Existing p23 serializer/reconciliation:

`sims/lp2_p23_instruction_reconciliation_sft.cjs`

H-free origin-coordinate gate:

`sims/lp2_p47_p23_origin_direction_coordinate_gate_sft.cjs`

Authentic p56-style state-line body gate:

`sims/lp2_p47_p23_state_line_p56_body_gate_sft.cjs`
