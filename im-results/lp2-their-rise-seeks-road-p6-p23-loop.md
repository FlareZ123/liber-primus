# Unique THEIR RISE source cycle: SEEKS ↔ ROAD links p6, p23 and p33

**Agent14, 19 November 2026. Classification: intended-route synthesis. No additional unknown plaintext is promoted.**

Director #1802 established the fixed source navigation opcode:

```text
THEIR positions19,25 -> rise6=a
p50 width8=A
RISE(GP0) = GP0 - 6*8 = GP0 - 48
```

under the printed 32×8 p50 geometry. The full compass-direction charge selects north; source and solved controls include:

```text
SEEKS  71 -> 23 -> ROAD
BEWARE 88 -> 40 -> PATHS
EMERGE 83 -> 35 -> FOUND.
```

The displacement is itself DH state:

```text
48=A*a
48 mod29 = B=19
48 mod p = K=2
48=29+B=2p+K.
```

## The authenticated north graph has one reciprocal pair

Among the 20 source words whose six-row north destination is another authenticated signed-word index, charge every edge for reciprocity. Exactly one unordered pair is mutual:

```text
6  SEEKS -> 23 ROAD
23 ROAD  -> 6  SEEKS.
```

Numerically:

```text
GP0(SEEKS)=71 -> 71-48=23
GP0(ROAD)=54  -> 54-48=6.
```

The other source-index edges do not form a reciprocal two-cycle.

## Physical p6 independently selects SEEKS

The existing p6 result predates this cycle synthesis:

```text
signed word6 = SEEKS
GP0(SEEKS)=71
p6's only red title begins at rune offset71
p6 has one complete len5/GP0=71 receiver at offsets128..132.
```

Its charged local-layout family reconstructs that receiver as SEEKS with one hit in the tested family. The exact local serialization was recognized after target selection, so SEEKS remains a strong plaintext candidate.

The rise graph now gives a separate navigation relation:

```text
p6 / SEEKS --RISE--> 23 / ROAD.
```

## Physical p23 independently says THE ONE RISE

P23's red heading, through the independently solved p56 cardinal mechanism and charged H pairing, decodes:

```text
THE ONE RISE.
```

P23 and solved p56 also share the original five-dot stencil under a half-turn. Their page-number rise is:

```text
56 - 23 = 33.
```

Physical p33 independently decodes:

```text
THEIR RISE.
```

This supplies a closed human-readable route:

```text
p33 THEIR RISE
 -> fixes rise6 on p50
 -> SEEKS GP0 71 rises to 23 / ROAD
 -> physical p23 says THE ONE RISE
 -> p23/p56 half-turn rises by33
 -> p33 THEIR RISE.
```

The reverse authenticated edge `ROAD -> SEEKS` closes the p6 endpoint as well.

## Cycle-specific p23 ROAD-state consumer: FAIL

After the reciprocal cycle was identified, a stronger p23-specific state consequence was sealed before opening the p23 state census:

`workplace/agent14-seeks-road-cycle-p23-road-precommit.md`

commit `b98152d118f372ebc3905d51218976dc301daf9f`.

Because the unique source cycle is `SEEKS6 ↔ ROAD23` and p23 independently says `THE ONE RISE`, the frozen prediction required exactly one complete p23 word with the canonical ROAD state:

```text
ROAD
length4
GP0=54.
```

Canonical p23 complete-word parsing yields nine four-rune words with GP0 values:

```text
72, 28, 64, 64, 86, 64, 81, 52, 62.
```

There are zero length4 / GP0=54 receivers. The p23 ROAD-state consumer is therefore rejected. No fragment or alternate state is admitted.

This strengthens the evidence boundary: the SEEKS↔ROAD relation is navigation, while ROAD is not licensed as a p23 body plaintext label by the simplest cycle-specific state rule.

## Evidence boundary

This strengthens the interpretation of the 2016 signed text as a navigation layer because its only reciprocal six-row source pair lands on two physically distinctive manuscript pages, one with a strong SEEKS candidate and one with an independently decoded RISE instruction.

It does **not** make ROAD an unknown p23 plaintext claim. #1802's first prospectively sealed rule that a rise destination should select same-state plaintext on the corresponding physical page failed at p29 DIRECTION. Preserve ROAD as the authenticated source label of node23 until a p23 artifact clue specifies a payload consumer.

The next productive test should therefore consume a visible p6 or p23 feature selected by this cycle, rather than generalizing destination numbers into plaintext.

## Reproduction

The exact reciprocal-cycle assertion is in:

`sims/lp2_their_rise_sixrow_p50_geometry_gate_sft.cjs`

Upstream:
- `im-results/lp2-their-rise-sixrow-p50-geometry-gate.md`
- `im-results/lp2-p6-seeks-sameindex-layout-shell.md`
- `im-results/lp2-p23-p56-p33-their-rise-loop.md`
