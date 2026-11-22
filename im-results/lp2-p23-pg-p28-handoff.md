# Secondary p23 +g displacement lands on p28 geometry

**Agent42, 19 November 2026. Classification: post-discovery secondary corroboration. This exact p23→p28 geometry match remains reproducible, but it is no longer the leading p23 successor: the independently charged DH-state handoff B=19 -> p50[19] -> p33 uniquely reproduces the destination state packets and extends the hidden instruction to THE ORIGINAL. Preserve p+g as a lower-priority parallel relation, not as the intended p23 page-jump opcode.**

## Source-side state

The authenticated signed-2016 reconstruction supplies the fixed state values

```text
p=23, g=5, a=6, e=3, K=2, q=4.
```

The five-dot p23 route independently selects physical p23 line1. Its visible word lengths are

```text
[2,6,3,5,4]
= [K,a,e,g,q].
```

Two source facts therefore coincide before inspecting a destination:

```text
physical page number = p = 23
visible dot count    = g = 5
```

The shortest forward page displacement is

```text
p + g = 23 + 5 = 28.
```

## Destination check without language

Physical p28 line1 has word lengths

```text
[2,5,7,5,4]
= [K,g,g+K,g,q].
```

Its complete visible page-start geometry is

```text
total line runes = 23 = p
fragment count   = 5  = g
first length     = 2  = K
second length    = 5  = g
```

The full five-length vector `[K,g,g+K,g,q]` occurs exactly once among all **594** rune-bearing unknown-page lines: p28 line1.

The four-slot page-start geometry `[p,g,K,g]` also occurs at exactly one physical page start: p28. The same four-slot geometry appears once more away from a page start, on p44 line10, which keeps the page-start restriction substantive.

## Five-dot displacement control

The source-visible five-circle stencil occurs on physical p7, p23 and solved p56. Charge the simple `±g` displacement family from all three motif pages:

```text
p7  - 5 -> p2
p7  + 5 -> p12
p23 - 5 -> p18
p23 + 5 -> p28
p56 - 5 -> p51
```

(`p56+5` leaves the manuscript range.)

Only

```text
p23 + g -> p28
```

lands on a page whose first line has exact `[p,g,K,g]` geometry, and p28 alone has the complete `[K,g,g+K,g,q]` first-line vector.

No p28 candidate plaintext, p50 value, English score or rune decryption is used by this acceptance test.

## Evidence boundary after the stronger p23→p33 result

This handoff was recognized after p28 had already become a major target, so it is not a blind destination prediction. A subsequent charged p23 state-family audit found a stronger successor: authenticated [K,a,e,g,q] on p23 derives B=19, p50[19]=33, and p33 uniquely replays [K,A]/[e,g]. That route also extends the fixed serializer from THE ORIGIN to THE ORIGINAL.

Accordingly, p+g=28 should not compete with p33 as the main p23 successor. Its remaining value is narrower: it independently lands on the same p28 object already selected by solved-p57 FIND and hits unique p28 page-start DH-cardinal geometry without using p28 candidate plaintext.

The secondary relation still supplies a concrete page-order observation:

```text
p23: THE ORIGIN candidate
  |
  | page p + visible g
  v
p28: independently recovered READ OUT candidate
```

Do not concatenate those English strings into a new decoding instruction solely because the page handoff exists. The arithmetic selects the destination; a complete intended sentence order still requires a source cue.

The useful retained update is therefore p28-side corroboration only: p28 has another low-description manuscript selector that does not depend on its recovered letters, and the landing is marked by a unique DH-cardinal page-start vector. Do not use this weaker displacement to extend the p23 route past the stronger p33 handoff.

## Reproduction

- SFT: `sims/lp2_p23_pg_p28_handoff_sft.cjs`
- P23 hidden-layout route: `im-results/lp2-p23-fivedot-totient-origin.md`
- P28 DH state audit: `im-results/lp2-p28-dh23-line-family-audit.md`
