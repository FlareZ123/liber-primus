# Terminal H9 non-center coordinates do not supply the p27→DIVINITY ordered key

**Agent 9, 28 November 2026. Classification: prospectively frozen KDF negative on a newly strengthened source-selected receiver.**

## Frozen upstream route

Agent7's terminal p53-centered page-count construction independently supplies:

- the p49–p57 terminal frame;
- BASE29 high/low digit columns;
- canonical outside-in H9 on both columns;
- paired outputs:

```text
[28,0] [27,2] [1,16] [1,2] [6,5] [17,2] [5,23] [2,27] [5,16]
```

with center p53 pair `[6,5]=[a,g]`;

- p27 / zero-based word B=19 / shed K=2;
- selected p27 word `EORNSOOCAEYEE`;
- eight-rune core `NSOOCAEY`;
- existing solved-page checksum candidate `DIVINITY`, also eight runes.

Because removing the H9 center leaves exactly eight ordered pairs, the most literal KDF was frozen before deriving the exact required pad.

Pretarget commit:

`ec68d175387f6c319b7be2cf4270f4f64f459589`.

## Frozen four-variant family

Preserve canonical H9 order and remove only the center pair.

The two direct coordinate streams are:

```text
HIGH = [28,27,1,1,17,5,2,5]
LOW  = [0,2,16,2,2,23,27,16]
```

Charge only:

- core - HIGH;
- core + HIGH;
- core - LOW;
- core + LOW.

No reversal, rotation, interleaving, per-position coordinate choice, shell reorder, or fitted correction.

## Result

P27 core:

`NSOOCAEY = [9,15,3,3,5,24,18,26]`.

Target:

`DIUINITY = [23,10,1,10,9,10,16,26]`.

Frozen outputs:

| key stream | sign | raw output | transliteration | exact DIVINITY |
|---|---:|---|---|---|
| HIGH | subtract | [10,17,2,2,17,19,16,21] | IBTHTHBMTNG | no |
| HIGH | add | [8,13,4,4,22,0,20,2] | HPRROEFLTH | no |
| LOW | subtract | [9,13,16,1,3,1,20,10] | NPTUOULI | no |
| LOW | add | [9,17,19,5,7,18,16,13] | NBMCWETP | no |

The exact subtraction pad required to map the selected core to DIVINITY is:

`[15,5,2,22,25,14,2,0]`.

It is neither direct H9 coordinate stream.

## Decision

Retain the terminal-shell result as a strong independent source-only route to the already-frozen p27/B/K receiver.

Reject the simplest ordered KDF:

`canonical terminal H9 non-center coordinate stream -> p27 core additive key`.

Do not rescue the miss by selecting HIGH/LOW independently per position, rotating the sequence, reversing it, interleaving the pairs, or fitting state labels to the required pad. Those operations introduce the exact ordering freedom the terminal-shell result had not supplied.

The remaining missing step is still a first-party ordered operation/KDF that predicts the eight-rune transformation before DIVINITY grading.

Reproducer: `sims/lp2_terminal_h9_p27_kdf_gate_sft.cjs`.
