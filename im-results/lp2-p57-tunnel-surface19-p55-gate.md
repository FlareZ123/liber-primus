# P57 TUNNELNG TO THE SURFACE → 19-node p50 pointer key → p55 gate

**Agent6, 18 November 2026. Classification: source-selected reversible receiver test.**

## Decision

The solved p57 phrase `TUNNELNG TO THE SURFACE` supplies a coherent p50 navigation path under the same GP0-addressing hypothesis already used by the terminal-table work:

- `TUNNELNG` has GP0 sum **94**, selecting p50 cell94;
- `SURFACE` has GP0 sum **67**, selecting p50 token `3C`;
- `3C` decodes under the documented base59 alphabet to **189**;
- cell189 is the **unique base59 fixed point** of the 256-cell p50 pointer map;
- following base59 pointers from cell94 reaches189 in a path containing exactly **19 visited cells**.

The 19-node path is:

`94,55,79,81,57,116,53,168,236,234,193,153,33,112,72,161,214,247,189`.

P55 has exactly **76 = 4×19** original runes. This makes a direct periodic key test source-motivated rather than numerically fitted.

The frozen four-candidate receiver fails decisively. Using either visited cell indices or their emitted base59 pointer values as a 19-symbol GP29 key, repeated exactly four times over p55, under either additive sign, the best original score is **-13.5524005205**. The worst of **2,000** exact-p55-word-shape native English controls scores **-8.3649176076**. The best original candidate is therefore **5.1874829129 nats per scored within-word trigram below even the worst native control**.

A source-shaped positive plant recovers **76/76** runes and scores **-7.1359061001**, inside the native range.

Close this direct 19-period additive-key interpretation. Preserve the TUNNELNG→SURFACE pointer path as a structural navigation clue.

## Source path

The source-fixed base59 pointer path from TUNNELNG is:

| Step | Cell | Printed token | Emitted base59 value |
| ---: | ---: | --- | ---: |
| 1 | 94 | `0u` | 55 |
| 2 | 55 | `1K` | 79 |
| 3 | 79 | `1M` | 81 |
| 4 | 81 | `0w` | 57 |
| 5 | 57 | `1w` | 116 |
| 6 | 116 | `0s` | 53 |
| 7 | 53 | `2p` | 168 |
| 8 | 168 | `40` | 236 |
| 9 | 236 | `3w` | 234 |
| 10 | 234 | `3G` | 193 |
| 11 | 193 | `2Z` | 153 |
| 12 | 153 | `0X` | 33 |
| 13 | 33 | `1s` | 112 |
| 14 | 112 | `1D` | 72 |
| 15 | 72 | `2i` | 161 |
| 16 | 161 | `3b` | 214 |
| 17 | 214 | `4B` | 247 |
| 18 | 247 | `3C` | 189 |
| 19 | 189 | `3C` | 189 |

Cell189 points to itself. The separately addressed word `SURFACE` therefore names the actual fixed-point token reached by the TUNNELNG path.

The table's base59 map is globally convergent to189, so convergence alone is not evidence. The useful source selector here is the phrase-level combination: TUNNELNG supplies the start and SURFACE independently identifies the unique terminal fixed point.

## Frozen receiver

No phase or direction was fitted after looking at p55.

The admitted key tapes were:

1. visited cell indices modulo29;
2. emitted pointer values modulo29.

Each 19-value tape was repeated exactly four times across the 76 original p55 runes. For each tape, test only:

`P_i = C_i + K_i mod29`

and

`P_i = C_i - K_i mod29`.

This yields four candidates total.

## Original result

Best candidate:

- source register: emitted pointers;
- sign: plus;
- score: **-13.5524005205**;
- transliteration:

`EBPNWIJENGCLIMTEOJPIOTHOEUOBDDEEONNNNOEHTHIACULMWEABOGNXHWOEGLUBURUNDAEBSYTNUFIANIHIAEOORAE`.

The other three candidates score from **-13.8598042552** through **-14.2208110975**. Original p55 unchanged scores **-13.9721595754**.

Short English-like fragments in the best transliteration are not evidence after scoring the complete word-shaped output. Every exact-word-shape native control is far above it.

## Matched control and positive control

The language scorer preserves p55's original printed word lengths:

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

Across 2,000 deterministic native samples:

- minimum: **-8.3649176076**;
- median: **-7.2892274672**;
- 95th percentile: **-6.8842487674**.

A synthetic plaintext with the same exact word shape was encrypted using the visited-cell 19-period key and then inverted. Recovery is **76/76**, with native score **-7.1359061001**.

## Four-rune-block follow-up

The independent 19×4 terminal grouping supplies one distinct serialization beyond the 19-period tape: assign each of the 19 pointer states to one consecutive four-rune p55 block. Agent6 froze the same two source registers and two additive signs, again four candidates total. The best score is **-13.61664628**, which is **5.25172867** below the worst of the same 2,000 exact-word-shape native controls; a source-shaped plant recovers76/76 at **-7.13590610**. This closes the second simple additive use as well ([blockwise gate](lp2-p57-tunnel-surface19-block4-p55-gate.md), [SFT](../sims/lp2_p57_tunnel_surface19_block4_p55_sft.cjs), [CI 44417135081](https://github.com/FlareZ123/liber-primus/actions/runs/44417135081)).

## Scope

This result closes only:

- the source-selected TUNNELNG→SURFACE base59 pointer path;
- interpreted as a 19-period GP29 additive key repeated four times;
- using visited cells or emitted pointers;
- under the two additive signs.

It does not close another use of the 19 path positions whose serialization is independently fixed by source structure. In particular, the manuscript already has a separate source-visible **19×4** p55 grouping, so one path state per four-rune block is a distinct bounded receiver rather than a phase adjustment to this test.

No unknown plaintext or key is recovered.

## Reproduction

`node sims/lp2_p57_tunnel_surface19_p55_sft.cjs`

Passing GitHub Actions run: **44416665712**.
