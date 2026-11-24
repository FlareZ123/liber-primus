# Third-onion growing-string timing witness and LP2 direct receiver test

Agent35, issue #2457, 2026-11-24.

## Recovered operand

The 2014 contemporary chronology, [Puzzle Facts Part 3](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3), records the third onion's growing string and references a Numinit gist. [What Happened Part 1](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)) separately summarizes the observed byte growth and collection of timing data. These are related community sources, not two proven independent contemporaneous witnesses. The archive [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/tree/main/2014/005-third-onion) attributes its timing data to numinit's GitHub; the original gist was not recovered. Its README loosely describes the timing file as status-page growth, but the numerical rows establish that it concerns the 256-byte string, not the multi-megabyte JPEG payload.

Recovered [timing JSON](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/hex-growth-over-time.json), blob 59196eb20470b711f200ff28f61c861950a51a4c, and [final byte string](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/512.hex), blob 946b0820d4669d307c4f9c5b7ae8b081c680ef20. Preserved together in [resources/external/2014-third-onion-timing.json](../resources/external/2014-third-onion-timing.json).

241 rows from Jan 9 05:54:01 UTC (length 16) through Jan 11 01:09:01 UTC (length 256). All 241 prefix means/minima/maxima match the final bytes exactly. Every recorded delta equals timestamp subtraction. 235 consecutive single-byte intervals are within 2 seconds of integral minutes. Exclusions: duplicate length 106; off-grid intervals ending at 133,134,135 (52,225,203 seconds); skipped length 181 (180→182, 539 seconds). Lengths 17–120 are quantized to three-minute intervals, then the sampling grid changes. Treat as participant observation timestamps, not exact server generation times. No missing values were inferred. This is distinct from the second-onion timing channel. It is not a newly authenticated author instruction.

## Direct LP2 test

Frozen issue comment 7118155675 before decoding. Source segments 17–132 (minutes), 17–120 (three-minute units), 121–132, 136–180, 183–256 (minutes). For each segment, four pad constructions: interval, byte XOR interval, byte plus interval mod 256, byte minus interval mod 256, then modulo 29. Each repeated pad was tested at every phase in additive, subtractive and Beaufort forms, reset at every original page. All 55 rune-bearing unknown pages, 4212 candidates per page, 231660 total. Fit at first complete-word boundary at or after 60 runes; withheld rest. Exact native-GP word boundaries; Shakespeare dictionary + smoothed within-word bigram scorer. Source [SFT](../sims/lp2_third_onion_timing_receiver_sft.cjs).

Best training p54: 13.33% dictionary coverage; heldout 0.58%. Best heldout by score p14: 8% coverage, score -4.14079; training 3.23%. All previews remain incoherent. Positive control using third-onion XOR pad phase 19 on p0 layout recovered exact pad, phase, operation and 100% training and heldout dictionary coverage. Control sampled from training dictionary; it establishes mechanical recovery, not independent generalization or a calibrated null.

The 256-cell LP2 table offers an independent size-based candidate receiver, but not a source instruction selecting this operation. At the same 235 observed indices, exact matches to table bytes: timing minutes 0, third-onion byte 1, byte XOR time 0, byte+time mod256 1, byte-time mod256 0. Pearson correlations respectively -0.05336, -0.00977, -0.02147, -0.05332, -0.02699. No direct same-index byte relation. No plaintext obtained. A period-authenticated executable clue and specific original receiver are still missing; issue remains incomplete under its strict success criterion. The archive is newly held locally, so this is a recoverable research operand rather than another hypothetical missing key.

## Reproduce

`node sims/lp2_third_onion_timing_receiver_sft.cjs` from repository root. Experiment executed against current source content in connected JS runtime, standalone invocation not separately run.
