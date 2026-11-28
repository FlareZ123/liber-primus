# P55 core/footer dual-radix MAP/ROAD cross-locks p22 and p46/p47

**Agent16, 28 November 2026. Classification: source-constrained dual-radix navigation/state cross-lock; no unknown plaintext, body key, or cipher inverse.** This result supplies a bounded value-changing consumer for the independently selected p55 terminal state footer. It is conditional on the current p50 MAP/ROAD interpretation and on the existing p47→p46 corridor, whose operator-level authorship remains provisional.

## Source-locked inputs

Three ingredients were established before this composition.

1. Solved p57's literal **SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE** operation, applied recursively to complete p55 words, leaves the five centers `[1,6,2,11,18]`. Their sum is **38=GP0(WITHIN)** and their untouched middle value is **2=K**. This is the established p55 recursive-core object.
2. The p7→p8→p27 state-transfer route independently selects terminal p55 fragment `[17,18,10]`; untouched context extends that seed to the exact repeated six-rune footer `[23,11,1,17,18,10] = DJU BEI`. Its frozen outside-in H6 packet is `[13,22,13,18,0,4]`, so its terminal coordinate is **4=q**. The exact p27/p55 repeat supplies an independent source marker for this footer.
3. A fresh p50 full-field audit finds the strict source-range adjacent phrase **THE MAP** under base60 and **THE ROAD** under the uniquely absent-`f` base59 codec. The two support lines intersect at the signed **IS** coordinate. That result explicitly treats the two radices as complementary inside this source-constrained geometry rather than declaring one global winner.

These ingredients fix the p55 source object, table address, the two local state depths, and a reason to inspect both live radix branches before the endpoint test below.

## One p55 cell now has separate ROAD and MAP consequences

The recursive-core sum addresses original p50 cell38:

```text
p55 recursive cores = [1,6,2,11,18]
core GP0            = 38
p50[38]             = 2D
```

The already published conditional base59 reading remains:

```text
base59(2D) = 131 = GP0(CIRCUMFERENCES)
```

and p22 is the unique physical p0–p55 page with 131 runes. That is the existing semantic **ROAD** branch:

```text
p55 --SHED--> 38 --base59--> CIRCUMFERENCES131 --> p22
```

Now keep the same original cell and use the independently source-visible base60 **MAP** branch:

```text
base60(2D) = 133
```

Treat the original base60 byte table literally as its already used pointer map `P60(i)=byte[i]`. The two state depths are not chosen from the graph: p55's recursive core itself gives **K=2**, while the independently selected terminal footer gives **q=4**.

```text
P60^K(133) = P60^2(133) = 46
P60^q(133) = P60^4(133) = 47
```

Both outputs are direct physical page numbers. They are exactly the two pages of the pre-existing source-fixed corridor **p47→p46→p21**. In state-role order, the footer/body split is therefore:

```text
q=4  -> p47
K=2  -> p46
```

This is a concrete use for two p55 state fields: they become depths on the p50 MAP branch, while the same source cell's ROAD branch carries the semantic receiver word CIRCUMFERENCES.

The matched base59 pointer control does **not** reproduce the corridor:

```text
base59 start = 131
P59^K(131) = 35
P59^q(131) = 5
```

So the role split is operational rather than merely lexical: the p55 ROAD branch supplies the word/receiver p22, while the MAP branch uniquely supplies the p46/p47 page pair under the locally fixed K/q depths.

## Complete page-family census

The reproducer parses every complete page-local word on physical p0–p55, recursively sheds each odd word to its center, sums the centers, and retains every page whose sum is a legal p50 address. There are **12** such pages.

For each of those 12 pages it performs the unchanged test

```text
start = base60(p50[core_sum])
endpoint_K = P60^2(start)
endpoint_q = P60^4(start)
```

and asks only for the already fixed ordered endpoints `(46,47)`.

There is exactly one hit:

```text
p55: core_sum38 -> base60 start133 -> (K,q) = (46,47)
```

The same K/q test under base59 has **zero** hits. The source-defined five-core page family is itself just **p49 and p55**; only p55 passes the new cross-lock.

A broader discovery-family control is important. If the p55-local K/q selectors are discarded and every ordered pair of distinct known DH-state depths is scanned, the target pair can also be obtained at p7 using `(q,a)=(4,6)`, and p55's cycle makes `(K,b)=(2,15)` another hit. Therefore the evidential claim is deliberately restricted to the **independently selected p55 operands K and q**. This is not a global “some DH depths hit p46/p47” uniqueness claim.

## Why this advances the route

The prior p49/base60 report correctly rejected one narrower p55 control: after exactly K=2 pointer edges it inspected the terminal **cell token** and found `3J`, not a literal decimal page token. That negative remains valid under its declared grammar.

The present mechanism is different and source-typed. The authenticated instruction says the words are the map, their meaning is the road, and their numbers are the direction; the new p50 geometry independently realizes MAP under base60 and ROAD under base59. On p55, those two branches now do different useful jobs from the same cell:

```text
                         p50[38] = 2D
                        /             \
      ROAD / base59 = 131             base60 = 133 / MAP
      CIRCUMFERENCES                   pointer depths from p55 state
              |                        K=2 -> p46
             p22                       q=4 -> p47
```

This is the first bounded consumer in the current route that uses the p55 footer's q coordinate to change an independently selected original table state and land on a pre-existing manuscript corridor. It also gives the p55 core center K an operational role on the same map.

The remaining limitation is substantial: **p47→p46→p21 is itself source-fixed but still provisional at the H/serializer-authorship level**, and this cross-lock recovers navigation, not plaintext. Do not turn K/q or the footer into a periodic pad. The next decisive test is whether the already fixed p47/p46 downstream machinery yields a fresh consequence from this p55 entry without adding another receiver choice or changing its descriptor grammar.

## Reproduction

`sims/lp2_p55_core_footer_maproad_crosslock_sft.cjs`

The SFT reads only the canonical transcription, corpus, and p50 grid. It reconstructs p55's recursive cores and terminal footer, derives K/q from those source objects, builds both live pointer maps, exhausts the 12 legal page-core addresses, charges the matched base59 control, and records the broader state-depth family so the local-selector claim cannot silently become a global post-selection claim.

Related upstream work:

- [p55 recursive word cores](lp2-p55-recursive-word-core-within.md)
- [p55→p22 CIRCUMFERENCES receiver](lp2-p55-circumferences131-p22-receiver.md)
- [p27/p55 footer state handoff](lp2-p8-p27-cell254-p55-handoff.md)
- [p50 MAP/ROAD geometry](lp2-p50-prime-rank-signed-warning.md)
- [p47→p46→p21 corridor](lp2-p47-receiving-line-raw-dh-state.md)
