# Original p49–51 byte-pointer graph: first-cell 11-cycle and a bounded inverse

**Decision, 15 November 2026:** Under one simple, unverified reading of the original 2014 32×8 table, its first printed cell sits on a length-11 directed cycle. The immediately preceding **66-rune** paragraph equals six cycles in length. A frozen repeating-GP29-key consumer fails to recover readable plaintext from the adjacent p49/p51 prose. This is source-adjacent structural evidence, **not a solved cipher, authenticated instruction or discovered key**.

## Original inputs and human-solvable route

Original LP2 physical pp49–51 (scans 66–68.jpg) present **256 two-character cells**, printed as 80/104/72 entries. Interpret the canonical *conditional base60* value of cell index `i` as the zero-based address of the next cell: `next(i)=byte[i]`, 0≤i≤255. No arbitrary rotation/keypad is needed. The first visible cell, index 0, supplies a natural start. Exactly:

```
0 → 203 → 68 → 199 → 47 → 76 → 114
  → 197 → 115 → 247 → 192 → 0
```

These are **eleven distinct cells and zero transient steps**. The other directed cycle is **249↔158**; all other nodes lead into one of the two. The source-adjacent **p49 pre-table rune count is 66 = 6×11**, while the p51 post-table count is 92. The contemporaneously authenticated 2016 clue that the book's “numbers are the direction” is a motivation to test direct address navigation, but does not prescribe these steps. In particular, treating base60 values as addresses is still an analyst interpretation and base59 is a competing radix.

## Exact fixed consumer and honest negative

The 11 visited table-cell values, taken modulo 29, give a source-fixed repeating GP29 key:

```
[0, 10, 25, 18, 18, 27, 23, 28, 15, 18, 0]
```

Apply `P[i]=(C[i]±key[i mod 11]) mod 29`, each physical page at phase zero. The exact original ciphertext results are:

| Page | Runes | Subtract-key GP29 IoC | Add-key GP29 IoC |
|---|---:|---:|---:|
| p49 | 66 | 0.034498834499 | 0.031235431235 |
| p51 | 92 | 0.036072623029 | 0.033683707597 |
| p52 (independent continuation) | 263 | 0.034336632514 | 0.034975183583 |

Outputs remain uniform-like with no coherent native-English text. Synthetic keyed inversions round-trip exactly, including an authentic 95-rune p57 clear-text control. The direct additive mechanism is therefore **bounded negative**. We did not expand this into arbitrary phases, secret alphabets, transformations or graph variations.

## Matched source-table shuffle controls

In **50,000 seeded table-byte multiset shuffles** per null, keep either all 256 values globally, the exact inventory of every 8-cell row, or the exact inventory of every 32-cell column. Compare whether cell0 is on any cycle, an exact length-11 cycle, or any cycle whose length divides the independently printed p49 66-rune paragraph.

| Byte shuffle | Any first-cell cycle | Exact length 11 | Length dividing 66 |
|---|---:|---:|---:|
| Global | 7,601 | 326 | 2,088 |
| Within rows | 10,414 | 450 | 2,585 |
| Within columns | 8,324 | 298 | 3,068 |

The 11-cycle was observed before its conditional rarity was calculated, so the **exact11 frequency is not an unconditional p-value**. The more conservative length-dividing-66 event occurs **4.176–6.136%** across these controls. A random byte table necessarily forms a functional graph under this interpretation. No strong evidence yet selects this graph as the author's intended mechanism. This is distinct from the previous [base60 quotient/remainder keypad graph](lp2-p50-directional-functional-graph-prime-ordinal-starts.md), which also lacks a solved original inverse.

**Decision:** Retain the source-fixed route as a narrowly stated possible navigation clue, while retiring its direct repeating additive-key consumer. Advance only with an independent original instruction selecting the address graph and a genuine recovered unknown-page plaintext prediction.

**Reproduction:** [Node22 SFT](../sims/lp2_p50_direct_byte_pointer_firstcycle_sft.cjs) and the [successful original-source Windows run 43707288670](https://github.com/FlareZ123/liber-primus/actions/runs/43707288670).
