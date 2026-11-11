# Retired p32 M7 / signed-2016 word-address chain: four spurious line-wrap splits

**Status: source-input correction, 11 November 2026.** The previously reported seven-word M7 extraction and 30/32 fragment alignment have **no valid p32 word-address premise**. The original 32-fragment boundaries and the historical 2016 message remain real inputs; the claimed bridge between them was introduced by a transcription parser defect. No unknown LP2 plaintext or key was recovered.

## Decisive source correction

The original physical p32 JPEG (`resources/liber-primus/49.jpg`) has **121 runes arranged into 22 complete printed words**. The first sentence ends after **7 words / 33 runes**. The authoritative source parser `sims/lp2_word_pages.cjs` treats the slash-plus-newline layout marker as a wrap, preserving a word across a printed line ending.

The earlier `sims/p32_m7_2016_word_fragment_alignment.cjs` instead used `.replace(/\//g,'')` followed by `match(/[\u16A0-\u16FF]+/gu)`. The slash disappeared but the newline survived, so four words were falsely split into two. Both variants still total 121 runes, obscuring the defect in rune-count-only checks.

| Legacy line-split pieces | Correct complete p32 printed word | Correct one-based ordinal |
| --- | --- | ---: |
| `NGBEOIA` + `LA` | `NGBEOIALA` | 9 |
| `WBSRXIAX` + `A` | `WBSRXIAXA` | 12 |
| `OENGO` + `MBUDS` | `OENGOMBUDS` | 16 |
| `UT` + `FJT` | `UTFJT` | 21 |

Those four false splits made the earlier script report **26 words**. Under the corrected 22-word contract, the frozen M7 cycle `13,24,19,3,6,20,17` attempts to read **p32 word 24, which does not exist**. It cannot be repaired by silently taking a different phase, changing index bases, wrapping 24 modulo 22, or retuning the cycle after inspecting message outputs.

## Exact scope of the retired interpretation

The old script picked seven words using the invalid 26-token sequence. Their prime sums `[345,62,277,267,184,98,160]` and signed-2016 message projections `THEROADMAPPATHEPIPHANYTHEIRARE` (30 letters) / `DIRECTIONARESEEKSPATHSLIESTHEAND` (32 letters) remain reproducible **only under that erroneous source tokenization**. Therefore the attractive match to 30 nonempty and 32 total thirteen-dot-delimited full-text fragments, including the `NE` letters at the two empty positions, is not a source-constrained LP2 operation. Treat it as a conditional artifact of invalid addresses.

The algebraic overlap-matrix result itself remains correct **under the frozen legacy partition strings**: partitioning one chronological stream into two sets of contiguous intervals yields the same chronological fragment order in both row-major and column-major occupied-cell readings. It cannot produce a nontrivial permutation. The separate source facts of 31 thirteen-dot marks, 32 fragments and two empty fragments are unaffected by this p32 correction.

## Reproduction and next research decision

`node sims/p32_m7_2016_word_fragment_alignment.cjs` now asserts both the **correct 22-word / 121-rune** source parser and the **legacy 26-token / 121-rune** error, explicitly labels its old numerical output `RETIRED`, and identifies the out-of-range word ordinal. Future M7/2016 routes must start from an independent original clue selecting **valid physical p32 words or another non-word operation**, with frozen indices before any message-word extraction. Do not cite this 30/32 alignment as evidence of a plaintext key, intended solve path, or fragment permutation.
