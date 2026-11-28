# p50 source reflection closes the pre-existing base59 sink into authenticated DH state

**Agent13, 28 November 2026. Classification: new source-reflection/DH closure over prior p50 pointer work. No unknown LP2 plaintext, payload cipher, or final continuation is recovered.**

## Correction and prior art

The **base59 all-to-cell189 sink is not new in this run**. `sims/lp2_p50_dh23_base59_pointer_sft.cjs` already established that the drop-`f` base59 map `next_address = decoded_cell_value` sends all 256 addresses to the fixed point cell189=`3C`, while base60 does not. It also noticed that cell189 has zero-based coordinates `(23,5)`, matching the authenticated 2013 worked-DH `(p,g)`, that the table width8 matches public `A=8`, and that cell186=`0J=19` can be written as row23/column `K=2` and equals peer public `B=19`.

The material addition here is narrower: the **independently source-selected p50 horizontal reflection itself maps the already-known sink column `g=5` to the DH shared-key column `K=2`**, so cell186 is selected without importing `K` as its address. The source artwork therefore closes the pointer sink into the existing DH packet:

`base59 sink (p,g) -> source mirror -> (p,K) containing B`.

This replaces the first checkpoint's overly broad wording that treated the sink construction itself as new, and it corrects the first shuffle control, which locked cell189 but did not also require the mirrored cell to contain 19.

## Exact source/DH closure

The scan-verified panel is 32×8. The authenticated 2013 worked exchange establishes

`p=23, g=5, A=8, B=19, K=2`, with private exponents `a=6`, `b=15` in the teaching example.

Prior p50 pointer work gives the unique base59 recurrent endpoint:

- fixed sink address **189**;
- `189 = 23×8 + 5`, so the sink coordinates are **row p=23, column g=5**;
- the physical table width is **8 = A**.

The original p50 mirror-tree artwork independently selects horizontal column reflection

`R(c) = 7-c`.

Therefore

`R(g) = 7-5 = 2 = K`,

and the reflected sink is

`R(189) = 23×8 + 2 = 186`.

Original cell186 is `0J`, value **19 under both surviving radices**, hence **B=19**. No DH state value is used to choose that mirror destination; `K=2` is recovered as the reflected column.

The historical DH operation then closes the same packet:

- `log_5(8) mod23 = 6 = a`;
- `log_5(19) mod23 = 15 = b`;
- `19^6 mod23 = 2 = K`, the same column selected by the mirror.

Thus the source-visible/pointer geometry now packs five authenticated public/state values before private discrete logs are taken:

`row = p=23, width = A=8, sink column = g=5, mirror column = K=2, mirror-cell value = B=19`.

This is a substantially cleaner human-solve-path closure than the older `p×A+K` lookup because the artwork supplies the `g -> K` column move.


## Independent eight-step pointer-return cross-check (Agent10, 28 November 2026)

**New exact original-source observation; provisional intended-route evidence, not an authenticated decoder.** The already-selected reflected sink **186** is not a terminal. Continue following the *same* source-anchored base59 successor law without a new key, address choice or transformation. Its **first value** is independent DH public **B=19**, and the walk returns to original sink189 after **eight** pointer edges, equal to independently authenticated public **A=8** (and the panel's eight columns). The pair A/B is thus encoded by the length and first value of a source-selected return trajectory, not merely the table width/one mirrored cell:

```text
189 --original horizontal reflection--> 186
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
       B=19                                unique sink
       ^----------- 8 pointer edges --------------^
```

This is a second *readout* of A=8 in the same geometric structure; the historical source did not explicitly instruct taking the return depth as a DH value. The equality was noticed **after** the sink, mirror and DH values were known, and is not an independently preregistered prediction. It suggests one coherent human-executable circuit (`mirror once, follow eight pointers, close at sink`) but establishes neither a GP29 key serializer nor unknown plaintext.

A standalone original-input Node22 control (`sims/lp2_p50_sink_mirror_dh_dualstate_sft.cjs`) rechecks all 256 printed tokens and both radices, the complete path, original DH modular exponentiation, and two 400,000-draw token-permutation nulls. Controls are deterministic with xorshift32 seed **20261128**, first 400,000 whole-table Fisher–Yates permutations followed by 400,000 permutations preserving each printed eight-token row. The predicates accumulate from exact self-point at189, to all 256 nodes flowing to189, to additional return depth8 and B=19 at cell186:

| Null, 400,000 trials each | Radix | 189 self-point | All-to-189 sink | Sink + depth8 | Sink + B19 | Sink + both |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Whole-table token shuffle | 59 | 6365 | 65 | 1 | 0 | **0** |
| Whole-table token shuffle | 60 | 3137 | 10 | 1 | 0 | **0** |
| Within-row shuffle | 59 | 50090 | 683 | 27 | 95 | **4** |
| Within-row shuffle | 60 | 0 | 0 | 0 | 0 | **0** |

Four of 400,000 row-preserving nulls satisfy the complete matched triple (`1e-5`). The zero whole-table hits are a limited Monte Carlo outcome, **not a mathematical impossibility**; the earlier importance-sampled two-constraint results in the previous section estimate that partial event better. Because the depth8 hypothesis was noticed after the graph and the historical DH packet were studied, these tests are **not** calibrated discovery-wide p-values and should not be multiplied across linked reports. The row-preserving null does, however, show the three-coordinate closure is not an automatic consequence of the particular original row token inventory.

**Causal next gate:** an independently sourced *consumer* is still missing. The eight-edge trajectory freezes a reproducible eight-node operand sequence, but without a source-defined GP29 serialization, page recipient and reversible operation, direct key/phase sweeps would be overfitting. Do not promote fitted plaintext from this state coincidence.

## Corrected locked-target controls

The target is frozen by the authenticated DH tuple plus the already-established mirror: address189 must be the pointer sink and its mirror address186 must contain value19.

### Exact placement charge under whole-table token permutation

In the canonical 256-token multiset:

- base59 value189 occurs four times (`3C`); base60 value189 occurs twice;
- value19 occurs exactly once under each radix;
- the base59/base60 value189 token classes are disjoint.

For a uniform token permutation, before asking about the rest of the graph:

- base59 placement probability `P(V59[189]=189 and V59[186]=19) = 4/(256×255) = 1/16,320`;
- base60 placement probability `= 2/(256×255) = 1/32,640`;
- either-radix placement probability `= 1/10,880`.

### Basin condition by importance sampling

Rather than wait for roughly one exact event per million full permutations, the SFT conditions on the two locked placements and uniformly shuffles the remaining 254 values, then asks whether all 256 nodes flow to cell189.

With deterministic seeds:

- base59: **3,551 / 300,000 = 0.0118367** conditional all-to-189 basins;
- base60: **1,188 / 300,000 = 0.0039600**;
- multiplying by the exact placement charges gives an either-radix whole-table joint-rate estimate **8.4661×10⁻7**, about **1 in 1.18 million**.

A row-conditioned control preserves each physical row's eight-token multiset. Original row23 contains exactly one base59 189 and one value19, so the exact two-position placement factor is `1/(8×7)=1/56`. Base60 row23 contains no value189, making the analogous base60 event impossible under this matched null. Conditional base59 basin sampling gives **2,570 / 200,000 = 0.01285**, for a row-conditioned joint-rate estimate **2.29464×10⁻4**, about **1 in 4,358**.

These are locked-family permutation diagnostics, not universal discovery probabilities. The pointer model, DH comparison, and reflection were all historically explored before this combined closure was noticed, so no claim is made that the quoted rates correct for the full research process.

## What this changes

The useful new inference is not “base59 has a sink”; that was already known. It is that **the source-selected mirror turns the sink's historical generator coordinate into the historical shared-key coordinate and lands on the historical peer public value**:

`(p=23,g=5) at cell189 -> mirror -> (p=23,K=2) at cell186 -> B=19`,

with the authenticated DH operation returning `B^a mod p = K=2`.

This materially strengthens the interpretation of p50 as a DH-state navigation object and explains why cell186/DH19 keeps reappearing in independent p27/p50 work. It also resolves a circularity in the older DH-coordinate observation: column2 no longer has to be chosen *because* K was already known.

It still does not specify which unknown ciphertext interval consumes `K=2` or `B=19`, nor a GP29 serialization, clock, reset, or reversible cipher. The signed 2013 TCP protocol tells a server how to compute shared DH data, but does not define an LP2 cipher. The next useful experiment must obtain a receiver/operation from another source clue and make a frozen original-cipher prediction; generic DH-state key sweeps remain unjustified.

## Reproduction and prior evidence

Run:

`node sims/lp2_p50_pointer_sink_reflection_sft.cjs`

The SFT reads the canonical panel and the repository's authenticated 2013 TCP-source record, rechecks the prior sink, verifies the source-mirror/DH geometry, recovers `a=6,b=15` by exact discrete logs, verifies `B^a=K`, and runs the corrected conditional nulls.

Prior work explicitly credited here:

- `sims/lp2_p50_dh23_base59_pointer_sft.cjs` — prior base59 all-to-189 sink and DH coordinate/value observations.
- `im-results/lp2-p50-functional-graph-2016-wordmap.md` — established base60 successor-map work and source-motivated pointer semantics.
- `im-results/lp2-p50-tree-reflection-selector.md` — independent source-visible horizontal reflection `c -> 7-c`.
- `im-results/lp2-p50-scaffold-address-origin-dh19-gate.md` — independent cell186/DH19 route from the later scaffold/address audit.
