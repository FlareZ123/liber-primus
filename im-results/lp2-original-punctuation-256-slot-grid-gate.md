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

The [preserved legacy report](archive-lp2-original-punctuation-256-slot-grid-gate.md) records the exact earlier experiments. The direct four table-byte Caesar masks, 256-byte interval-length XOR, stationary byte fingerprint obstruction (35 of 37 empty slots), and per-table-byte p56 prime-clock obstruction (128/219 nonempty intervals) were all calculations on the **legacy erroneous** 256-slot partition. They remain reproducible in the pinned legacy SFTs; they are no longer evidence about an exact source-authentic 256-to-256 correspondence. No source-authenticated corrected direct receiver is established. The separate conditional 254-byte tree-code framing below has now been tested and rejected for the specified prime clock.

The two other original 256-element objects (the numeric table and terminal 76+85+95 runes) are unaffected by this correction; any connection between them remains a separate hypothesis.

## Distinct corrected 254-to-254 receiver: canonical tree-code prime origins

**Agent29, 24 November 2026.** The provisional missing-`f` base59 table graph is a rooted tree on 256 labeled vertices. Its standard smallest-leaf [Prüfer representation](lp2-base59-tree-prufer-reversible-code.md) contains exactly 254 bytes, independently of the corrected punctuation/page partition. This is a new cardinality alignment, not a repaired 256-slot test: no table entries were dropped and no source boundaries were altered. The proposal is exploratory; neither the tree radix nor the prime-origin assignment is explicitly selected by Cicada.

Freeze the canonical Prüfer code, physical corrected interval order (including 37 empty intervals), zero-based prime origin equal to the aligned code byte, and the genuine p56 consuming rule: non-F plaintext adds prime-minus-one mod29 and advances; plaintext F emits F and holds. Exact inverse state propagation branches at ciphertext zero between a literal hold and a non-F consuming predecessor, rejecting every branch that would consume a decoded F. No language score or key guess is needed to test reachability.

- Canonical order: **126 of 217 nonempty original intervals have no legal inverse**, using all 12,956 original runes and 254 tree-code bytes.
- Relaxation: allow any of all 256 byte-valued prime origins independently for each nonempty interval. **Interval169 still has zero feasible origins.** It is the 193-rune interval at physical p35 rune offset78 (book-global 8513, all zero-based); every origin is dead by its first170 ciphertext runes. Only origin222 survives to offset169 before dying there. Thus even arbitrarily reassigning tree-code bytes cannot solve this exact clock model.
- Exact bipartite maximum matching of the 217 nonempty original intervals to the 254 individual code-byte occurrences (unit capacity; unused occurrences can be assigned to the empty intervals) is **216**, with a recorded witness. This is merely legality, not recovered plaintext. The singleton interval169 has no possible incoming edge.
- Controls: reconstruct all 256 original parent pointers from the code and root189; replay all 85 authentic p56 ciphertext runes under the actual historical prime/F rule; all 254 source-shaped p57 plants have legal inverse paths.

Executed the exact core function in the connected JS runtime on original canonical source blobs:
- `resources/transcriptions/lp2-image-corrected.txt`: `f7b534a33edeb212d427329798438325307463d7`
- `resources/liber-primus/lp2-corpus.json`: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`
- `resources/liber-primus/lp2-grid-256.json`: `2550eae357442912220e05dc51147523a61dd75a`

[SFT](../sims/lp2_prufer254_interval_prime_clock_sft.cjs) · [Full raw result with failure offsets and matching witness](lp2-prufer254-interval-prime-clock-output.json). Standalone Node filesystem wrapper has not been separately executed; the core function used in it was executed directly.

**Decision:** retire the exact canonical and arbitrary-assignment byte-origin receiver under the genuine prime/F clock. No unknown plaintext, authentic key or destination. The corrected 254-to-254 size relation does not establish a general consumer of the conditional tree code. Unbounded prime origins, changed clocks and other independently selected interval mechanisms are not excluded; no origin-range tuning is justified by this failure.

**Decision:** retire this specific punctuation-derived 256-slot route. The stationary per-interval substitution exclusion survives the corrected partition. Do not tune a new alignment to recover the lost coincidence.
