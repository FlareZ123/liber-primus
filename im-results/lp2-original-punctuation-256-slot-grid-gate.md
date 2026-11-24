# Image-corrected punctuation/page intervals: 254 slots, not 256

**24 November 2026 — corrected source decision (#1974 / #2597).** The direct 256-cell table-to-punctuation-interval correspondence is retracted. The two original single-square separators on p8 and p40 were incorrectly transcribed as periods. The independent per-interval static-substitution constraint survives on the corrected input; no unknown plaintext or key is recovered.

## Corrected source and consequences

Using the same delimiter vocabulary (period, ampersand, dollar, physical page turn; reinserting the runeless p50 page), the operational image-corrected transcription gives:

| Quantity | Legacy transcription | Image-corrected transcription |
|---|---:|---:|
| Periods | 175 | 173 |
| Ampersand / dollar / physical page turns | 17 / 8 / 55 | 17 / 8 / 55 |
| Intervals | 256 | **254** |
| Empty intervals | 37 | 37 |
| Nonempty intervals | 219 | 217 |
| GP29 runes | 12,956 | 12,956 |
| Ordered within-interval equal pairs | 42,204 | 42,240 |
| Ordered eligible pairs | 1,250,760 | 1,251,768 |
| Pooled within-interval IoC | 0.033742684447855706 | **0.03374427210153958** |

The exact corrected positions and image crop coordinates are documented in [the operational source README](../resources/liber-primus/README.md). The table still has 256 cells. Thus assigning every cell to one distinct punctuation/page interval in order is impossible under this delimiter grammar. The apparent cardinality match was produced by two transcription errors. Do not silently insert two artificial boundaries, discard table cells, or shift the table indices to restore it.

## Surviving all-secret static-substitution constraint

For each interval, an arbitrary stationary bijection on GP29 preserves equality of every pair of runes in that interval, independently of any secret key. Repeat the original study's exact native encoding and nonoverlapping 12,956-rune windows with the corrected 254-length partition:

| Native GP source | Windows | Minimum IoC | Maximum IoC |
|---|---:|---:|---:|
| Shakespeare | 16 | 0.058212064855468426 | 0.0620274683487675 |
| Gibran | 4 | 0.059354449067239294 | 0.0611902525068543 |
| Emerson | 25 | 0.06078921972761726 | 0.06363479494602833 |
| Original LP2 | 1 | 0.03374427210153958 | — |

All 45 controls still exceed the original, so the earlier finite native-register exclusion survives for **254** independently arbitrary interval alphabets. It does not exclude state changes inside intervals, other encodings, or different interval grammars. These corrected counts and all 45 control windows were actually evaluated in the connected JS runtime on fetched repository inputs. The [corrected SFT](../sims/lp2_grid256_punctuation_interval_corrected_sft.cjs) preserves the positive secret-permutation plant and verifies source alignment; it has not yet been run in Windows CI.

## Historical tests and their status

The [preserved legacy report](archive-lp2-original-punctuation-256-slot-grid-gate.md) records the exact earlier experiments. The direct four table-byte Caesar masks, 256-byte interval-length XOR, stationary byte fingerprint obstruction (35 of 37 empty slots), and per-table-byte p56 prime-clock obstruction (128/219 nonempty intervals) were all calculations on the **legacy erroneous** 256-slot partition. They remain reproducible in the pinned legacy SFTs; they are no longer evidence about an exact source-authentic 256-to-256 correspondence. No corrected direct test is defined until an independent source instruction specifies a different framing.

The two other original 256-element objects (the numeric table and terminal 76+85+95 runes) are unaffected by this correction; any connection between them remains a separate hypothesis.

**Decision:** retire this specific punctuation-derived 256-slot route. The stationary per-interval substitution exclusion survives the corrected partition. Do not tune a new alignment to recover the lost coincidence.
