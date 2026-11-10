# External 27×27 three-rune-key reading: original-cipher candidate multiplicity

**Status:** independent original-input check of a *proposed*, unverified LP2 plaintext. No recovered authentic plaintext, key, new cipher mechanism, or puzzle destination. Agent 13, 10 November 2026.

## Question and primary observations

The [2retooz270703 27×27 map proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption), updated 8 November 2026, proposes a sentence-level reading for LP2 pages 0–2, now extending from “AS I GO, THE WEATHER TURNS COLD” through “GO, DO AS I ASK.” Its method takes three equally spaced runes in the 27×27 source grid, optionally replaces the center index with Euler's totient, rotates the resulting key left by the Möbius signature sum modulo 3, then subtracts the repeated key from an independently selected ciphertext block modulo 29. Its later transition documents add geometric filters and phase states.

The actual pages 0, 1, and 2 contain **262 + 266 + 201 = 729 runes**, exactly enough for the proposed 27×27 row-major matrix. The [source-asserted enumerator](../sims/external_27square_word_density.cjs) reads these original cipher indices from `resources/liber-primus/lp2-corpus.json`. It reproduces the claimed fixed `WEATHER` example:

- Key source at one-based row 14, columns 4–6: `X–OE–X` with indexes **14,22,14**. Center totient yields **14,10,14**; Möbius-signature phase 2 yields aligned key **14,14,10**.
- Cipher row 14, columns 14–18: **21,13,12,3,18**. Subtraction modulo 29 gives **7,28,2,18,4**, transliterated `W–EA–TH–E–R`.
- The first three plaintext-index symbols **7,28,2** also appear literally in original ciphertext row 13, columns 14–16, directly above that example. This extra positional echo is real within the proposed configuration, and its significance has not been established by a search-corrected control.

The same script reproduces the published *opening*, which wraps across rows and is excluded from the straight-line count below. The three-rune node at row 13, columns 11–13 has indices **25,11,28**, yielding derived key **25,10,28**. The seven subsequent cipher indices at row 13 columns 25–27, then row 14 columns 1–4 are **20,25,9,2,13,1,14**. Modulo-29 subtraction gives **24,15,10,6,3,2,18**, corresponding to `A–S–I–G–O–TH–E`. This exact replay concerns the chosen source and start; those coordinates have not been independently predicted with a proven algorithm.

The check establishes numerical correctness of the selected example. It does not establish that the key and ciphertext cells are uniquely selected or authorially intended.

## Full candidate enumeration instead of one hand-picked location

To measure selection freedom in the shared basic cipher rule, the reproducer scans **every** equally spaced three-rune source node on horizontal, vertical and either diagonal axis, with every valid integer radius, both reading orientations, and both direct versus center-totient keys. Source components zero are disallowed to match the proposal's positive-input definition. It aligns each key with the proposed `μ(φ(k))` phase rule and indexes its three-position repeated pad.

The actual 729-rune grid yields **52,048 source-node/mode assignments** and **17,095 distinct aligned 3-rune keys**, covering **70.093% of all 29³ possible 3-rune keys**. This high coverage is a substantive combinatorial constraint on interpretations: a chosen target is often representable without any genuine cryptographic discovery.

For each externally claimed target word, the reproducible search enumerates every contiguous straight-line cipher segment in all eight compass directions. It requires the exact period-three subtraction equality for the whole target; nodes must really exist in the original source matrix. It then reports distinct compatible *cipher segments* and total physical node/mode assignments.

| Externally claimed word | GP-rune length | Original matched cipher locations | Compatible source assignments | Mean matched locations among 250 shuffled 729-rune grids | Shuffles with ≥ original | Add-one upper tail |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `WEATHER` | 5 | **5** | 16 | 3.576 | 75 / 250 | 0.30279 |
| `COLD` | 4 | **95** | 286 | 116.800 | 249 / 250 | 0.99602 |
| `DEATH` | 4 | **124** | 374 | 118.236 | 75 / 250 | 0.30279 |

Every shuffled control preserves the complete original rune inventory and uses the *same full source-node and cipher-segment search* after a Fisher–Yates shuffle. The random generator is deterministic xorshift32 with seed `0x20261029`, 250 controls. A genuine positive source-key/ciphertext plant produces the expected `WEATHER` location. [GitHub Actions run 42803582336](https://github.com/FlareZ123/liber-primus/actions/runs/42803582336) completed all assertions and controls.

The five distinct original `WEATHER` cipher starts are **(14,14) east**, **(21,13) west**, **(23,12) southeast**, **(25,14) west**, and **(27,16) west**. The published central location is among them. The original count of five is typical of the stated shuffled-reference family. Four-rune target words occur at dozens or hundreds of original locations under the same permissive node construction.

## Going beyond the reported end: preselected outgoing properties from block 38

The external proposal now publishes 38 decryption blocks, ending in `I ASK` with state `S=32`. Its block-38 [outgoing forecast](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/38-i-ask.md) predicts a next key signature **(0,+1,0)** (phase 1), a horizontal, nonmirror source with even row/column center and even radius, and a diagonal ciphertext beginning on an exact geometric ray from previous leftmost cell **(8,17)**. The predicted new beginning has odd row and even column, the ciphertext is read to the right with its leftmost cell at the beginning, and its endpoint has odd row.

The reproducer therefore enumerates **every** source node satisfying this stated partial key geometry, signature and center parity, and all compatible start/direction/odd-length straight segments. This avoids supplying a hoped-for next English word.

| Outgoing constraint search | Genuine original-grid count |
| --- | ---: |
| Valid horizontal source-node and operation assignments | **172** |
| Ciphertext start, direction and length assignments | **166** |
| Source/cipher pairs | **28,552** |
| Distinct decoded three-rune beginnings | **4,938 of 24,389** possible |
| Pairs whose first two GP runes spell `TH–E` | **33** |

The counts come from the actual 729-rune matrix and are asserted in the [successful updated original-grid run 42803582336](https://github.com/FlareZ123/liber-primus/actions/runs/42803582336). Applying all **four** subsequently stated [Report 10 squarefree-GCD conditions](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/10-squarefree-gcd-compatibility.md) to each source center and next ciphertext beginning, leftmost cell and endpoint leaves **27,580 pairs**, a reduction of **972/28,552**. Their four respective *individual* failure counts are **360, 360, 350 and 298**; overlaps mean they cannot be summed to find the joint exclusion. More importantly, the claimed next block's leftmost cell equals its beginning, making Report 10 tests **G1 and G2 mathematically the same predicate**. The 27,580 survivors still permit **4,867 different three-rune beginnings**, with 29 source/cipher combinations beginning with GP `TH–E`. The original search results and planted controls remain asserted in the same executable.

These counts do **not** include all other reports' detailed path-specific selectors or future intended word segmentation. Thus the 27,580 pairs are a precisely declared intermediate family, rather than the final accepted search space. This family remains too underdetermined to identify unique authentic plaintext by arithmetic alone. It nonetheless demonstrates that the claimed end-state forecast alone does not determine a single next plaintext or cryptographic key. To make this a predictive decryption, the further exact source and cipher position rules must be frozen and applied before deciding which decoded string reads as a sentence.

## Relation to already completed stronger route-39 research

Before this independent base-model multiplicity screen, **Agent 5 had already implemented the fully frozen outgoing block-39 grammar** using the published Reports 00–16. Its [original-source analysis](./route39-frozen-enumeration.md) and [reproducer](../sims/route39_frozen_constraints.cjs) are the authoritative, broader successor prediction test; [successful CI 42764587718](https://github.com/FlareZ123/liber-primus/actions/runs/42764587718) predates this audit.

Our **172 source assignments** exactly agree with Agent 5. The earlier **166 candidate lines** are a deliberately *partially filtered* superset: Agent 5 also applies the previous direct-mode leftmost compatibility requirement (reject if the Möbius value of the proposed beginning's 90-degree position is −1), reducing to **132** candidate lines. Agent 5's comprehensive test gives **22,704 = 172×132** source/line pairs before the squarefree-GCD predicates and **21,818** after those four predicates, compared with our corresponding wider **28,552 → 27,580**. Neither count describes a unique predicted continuation.

Crucially, Agent 5 already applied a fixed Shakespeare GP-word lexicon and obtained **60 eligible original single-word source/line decodings**, with **52 distinct English spellings**. Its **60 original-anchor-preserving permutation controls** averaged **50.30** dictionary hits, and 13/60 controls had at least as many hits as the original (add-one tail **0.22951**). A proper successor prediction remains unresolved; this newer note should not be interpreted as proposing work that the preexisting exhaustive source-rule test has already completed.

The genuinely distinct contribution of this audit is the **whole-grid key-coverage calculation** (17,095/29³), exact original replay of the selected *row-wrapped* opening, exact source-relative WEATHER three-rune echo, and preselected WEATHER/COLD/DEATH candidate-density nulls. The partial 38→39 counts above provide an independently sourced consistency check and a precise redundant-GCD observation, while the existing Agent 5 study supplies the stronger already-completed state-of-research on the next-block prediction.

## Boundary of the conclusion and what would discriminate a real solution

This result evaluates the **declared base key-and-segment cipher family** and the multiplicity of selected words. It does not replicate the external project's many later, path-dependent geometric filters, nor does it test the opening `AS I GO THE` block, which wraps from one matrix row to the next. The fixed center-of-grid `WEATHER` echo is a further conditional observation, and no discovery-wide multiple-choice significance test of that echo has been established. It is therefore unjustified to reject every possible refined map-based cipher, as it is to promote the selected arithmetic into a verified LP2 decryption.

The remaining decisive experiment is a **genuinely new source-supplied deterministic successor rule** that chooses next source coordinates, center-transform flag, ciphertext start, direction and length without first inspecting English candidates. Existing Agent 5 research has already performed the full reported-grammar successor enumeration and found 60 original dictionary-word candidates. Re-running that enumerator, extending the dictionary, or choosing one appealing completion without an independent source rule would only repeat an already established ambiguity. A novel external clue or cryptographic invariant that selects a unique next original-rune block would change the status.

**Reproduction:** `node sims/external_27square_word_density.cjs` (original corpus, full source-node inventory, original word hits, synthetic positive, 250 matched controls). Source-position and key assertions make the fixed `WEATHER` calculation directly auditable.
