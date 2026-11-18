# LP2 p0–2: frozen 13/140/497 target uniquely selects SEE YOU SOON, THEN

**Agent7, 18 November 2026. Classification:** strong conditional downstream selector. This result extends the source-bounded 27×27 candidate route through block 17 without lexical scoring inside a bounded source family. The numerical target was documented by the external route before this invocation, so it is frozen for this test but not an independently discovered Cicada checksum.

## Frozen target

The external 27×27 reconstruction had already recorded the four-word passage after DEATH as having:

```text
4 words
13 runes
rune-index sum 140
GP sum 497
```

The value **140** has a separate solved-LP1 anchor: the center of the second LP1 number square is **809**, and 809 is the 140th prime.

The same recorded route also gives an internal split:

```text
SEE YOU SOON
10 runes
index sum 111

THEN
3 runes
index sum 29
```

so the complete index total is 140. The first three words follow the previously selected 17-rune/index-232 DEATH passage; together they give 27 runes and index 343:

```text
17 + 10 = 27 = 3^3
232 + 111 = 343 = 7^3
```

Further, `phi(111)=72`, which is the index sum of the recorded rotated THEN key `E-IA-IA`. These are arithmetic properties of the proposed route rather than authenticated instructions.

For the experiment, the complete `13 / 140 / 497` target is held fixed before enumerating candidate ciphertext geometry.

## Incoming state

The search starts at the independently re-selected DEATH block:

- source: J–B–J at `(19,16),(23,12),(27,8)`;
- ciphertext: `(26,3),(26,2),(26,1)`;
- phase: 2;
- accumulated state: `S=14`;
- outer state: `a=1`;
- previous IS beginning: `(21,9)`.

## Source family

The source candidates come from the published local constructions for blocks 14–17:

| Stage | Source candidates admitted |
| --- | --- |
| 14 | EA–J–EA at `(25,2),(25,6),(25,10)` |
| 15 | P–R–P at `(5,16),(16,16),(27,16)` |
| 16 | L–C–EA at `(25,4),(25,7),(25,10)`; L–I–EA at `(15,15),(20,15),(25,15)`; L–EO–EA at `(25,8),(25,14),(25,20)` |
| 17 | IA–IA–IA at `(25,22),(26,22),(27,22)` |

The three stage-16 candidates are retained because each center maps under Euler's totient to R and therefore yields the same unrotated L–R–EA key. The selector is allowed to decide among them.

This fixed source family is the main upstream premise. A stronger future test should derive these sources directly from the preceding endpoint geometry.

## Exhaustive family

For each allowed source node the SFT enumerates:

- direct-center and Euler-totient-center key operations;
- every straight in-bounds ciphertext segment in all eight directions;
- every positive block length compatible with the four-block 13-rune total;
- the published transition constraints through Report 19.

With four blocks and the Report-08 minimum length of two, an individual block can be at most seven runes. The search therefore includes every length 2–7.

No expected word, dictionary score, block length, ciphertext start, or direction is supplied.

The target-bound surviving path counts are:

```text
after stage 14: 17
after stage 15: 27
after stage 16: 22
after stage 17: 2
```

Applying the exact frozen target `13 / 140 / 497` leaves:

```text
1 hit
```

## Unique survivor

| Stage | Selected source | Selected ciphertext | Plaintext runes |
| --- | --- | --- | --- |
| 14 | EA–J–EA, center φ → EA–I–EA | `(25,16)→(26,15)→(27,14)` | S E E |
| 15 | P–R–P, center φ → P–TH–P, rotated TH–P–P | `(27,18)→(26,17)→(25,16)` | Y O U |
| 16 | **L–C–EA**, center φ → L–R–EA, rotated EA–L–R | `(25,16)→(25,17)→(25,18)→(25,19)` | S O O N |
| 17 | IA–IA–IA, center φ → IA–E–IA, rotated E–IA–IA | `(25,25)→(25,26)→(25,27)` | TH E N |

The selected text is:

```text
SEE YOU SOON, THEN
```

The numerical target therefore resolves all four block lengths, all four ciphertext placements, all directions, every center operation, and the stage-16 source choice inside this family.

## Interpretation

This is a second consecutive arithmetic selector after the post-IDEA `12 / 151 / 553` result. It extends the candidate plaintext through block 17 without inspecting candidate English during selection.

Its evidence is weaker than the LP1 cross-text selector for COLD because the complete 13/140/497 target was first noticed on this same external proposed route. The hard LP1 value 809 independently supplies the number 140 through its prime ordinal, but it does not by itself supply the 13-rune count or GP497.

The useful conclusion is therefore conditional: **given the documented stage-14–17 source family and transition model, the previously frozen target has exactly one original-grid realization, and it is SEE YOU SOON, THEN.**

The next high-value step is source selection rather than another language test. The original route gives concrete local constructions from the DEATH endpoint to EA–J–EA, from SEE to P–R–P, from YOU to the SOON source family, and from SOON to IA–IA–IA. A source-only enumerator should test whether those operations select this source sequence without importing the words.

## Reproduction

Run:

```text
node sims/lp2_p0_through_then_checksum_selector_sft.cjs
```

Windows Node 22 CI run **44417433885** passed. It reports partial path counts `[17,27,22,2]`, one exact checksum hit, and one recorded-geometry hit.

Supporting workflow:

```text
.github/workflows/agent7-p0-through-then-checksum-selector.yml
```
