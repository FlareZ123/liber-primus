# Terminal grid/rune 256-byte digest gate

**Status, 11 November 2026:** The source-motivated 76/180 terminal partition has now been tested against both the later LP2 printed-token table and the earlier 2014 stage11 `sexagesimal.bin` table. Neither table produces an AN END digest match under the frozen direct byte-composition family; the 2014 raw source files also fail direct 64-byte digest tests. Separately, a completely unknown stationary byte-to-rune lookup cannot map the 180 interior cells to the two solved terminal pages under the eight natural rectangle orientations. A separate one-to-one 76-byte clockwise table-perimeter key test on p55 (two natural byte-to-GP29 maps, both signs, both table versions) is also negative against held-out native Gibran windows. The original source geometry remains exact, but a decoder, key, or unknown plaintext has not been recovered.

## Human-solve-path hypothesis

The solved *PARABLE* text says to “shed our own circumferences” and “find the divinity within.” The original 32×8 table has a 76-cell outer perimeter and a 30×6 interior of 180 cells. Independently, the final three rune-bearing LP2 pages have lengths:

- p55: **76** runes (unsolved)
- p56: **85** runes (AN END; solved)
- p57: **95** runes (PARABLE; solved)

Thus p55 + p56 + p57 contains **256** published runes, and the final two pages contain **180**. A plausible human experiment is to pair the 76-cell table perimeter with p55 and the 180-cell interior with p56+p57, then test whether the 256-byte result is the object committed to by the p56 digest.

The correspondence is an exact count match, not evidence by itself that these cells and pages are meant to be combined.

## Frozen source extraction

Inputs are the canonical resources/liber-primus/lp2-grid-256.json, resources/liber-primus/lp2-corpus.json, and resources/cicada2014-anend-binary-witness.json.

1. Interpret the printed 32×8 table in its canonical base60-derived byte representation.
2. Extract the **76-cell perimeter clockwise**: top row left-to-right, right edge downward, bottom row right-to-left, left edge upward.
3. Extract the remaining **30×6 = 180 interior cells** in row-major order.
4. Concatenate perimeter then interior. This aligns the first 76 table bytes with p55 and the remaining 180 with p56+p57.
5. Preserve the original published rune order for p55, p56, p57. Test three natural byte encodings of each rune: its GP index, its GP prime weight, and φ(GP prime) = prime−1.
6. Combine the table byte and rune byte positionwise by XOR, addition modulo 256, or subtraction modulo 256.
7. Hash each resulting 256-byte object with SHA-512, SHA3-512, BLAKE2b-512, and SHAKE256 with a 64-byte output. Compare the complete digest against the 128-hex-character value printed on p56:

    36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

## Result

<badge color="warning">Bounded negative</badge>

- The perimeter and interior contain exactly **76 + 180 = 256** distinct table cells.
- The terminal pages contain exactly **76 + 85 + 95 = 256** published runes.
- LP2 canonical table: all **36** frozen combinations (3 rune encodings × 3 byte operations × 4 digest families) were evaluated; **0/36** match.
- Original 2014 `sexagesimal.bin` table: the same **36** combinations were independently evaluated; **0/36** match.
- Raw `sexagesimal.bin`, `decimal.txt`, and `decimaltobyte.pm`: **0/12** matches across SHA-512, SHA3-512, BLAKE2b-512, and SHAKE256(64).
- Combined direct tests: **0/84** candidate digests match the printed AN END target.

The deterministic reproducer is `sims/terminal_grid_xor_anend_digest_sft.cjs`. Run from the repository root with Node.js 22:

~~~sh
node sims/terminal_grid_xor_anend_digest_sft.cjs
~~~

It reconstructs the canonical and historical partitions, verifies the 2014 Git blob identities and ten-cell difference list, prints all 72 table/rune compositions and 12 raw-file hashes, and asserts that none equals the target. The original 36-case canonical run is preserved in the earlier manual workflow; the new historical-input extension is committed but awaits a manual rerun.

## Historical 2014 stage11 `sexagesimal.bin` source

The original solver archive `micheloosterhof/cicada-2014` records commit [`a9201dd`](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462), dated 2014-05-11 21:39:09Z with message `bytestring`, adding `decimal.txt`, `decimaltobyte.pm`, and `sexagesimal.bin` under `stage11/ky2khlqdf7qdznac.onion/`. The Perl script converts each decimal line to one byte with `pack 'C'`. Reconstructing the 256-byte file from the decimal values reproduces its Git blob SHA-1 exactly (`ad3dd7a3d37879d04bd506d2eecea86f27543928`).

This is a **historical source variant**, not the exact later LP2 table: it differs from the LP2 canonical 256-byte sequence at ten positions: **25, 45, 50, 165, 170, 172, 175, 182, 199, 246**. Nine of these overlap the eleven LP2 cells previously disputed in the glyph-adjudication report; index 170 is an additional difference. The source file is therefore a useful historical witness, but it must not override the original LP2 JPEG readings.

The `sexagesimal.bin` commit is recorded 17 minutes 3 seconds before the repository's later [p56 digest commit](https://github.com/micheloosterhof/cicada-2014/commit/06f57643821f1cadf597471c2b9c813bd08d2e37). These are Git author timestamps, not independently authenticated chronology. Direct hashes of the three raw source files fail all four tested 64-byte digest families. The 2014 table's 36 ring/interior-to-terminal-rune compositions also produce no target match. This excludes only those direct forms; the table may still be a key or transformed input.

Stable source transcription and provenance: [`resources/cicada2014-sexagesimal-source.json`](../resources/cicada2014-sexagesimal-source.json).

## Direct table circumference as a 76-rune p55 key

A solver following the solved p57 circumference language could take the **76-cell clockwise perimeter** of the 32×8 table as a one-to-one key for p55, which has exactly **76 runes**. This fixes the source order without phase or rotation search: top row left-to-right, right edge top-to-bottom, bottom row right-to-left, left edge bottom-to-top. The simplest reversible operation is GP29 addition/subtraction after mapping each byte to 0–28.

Frozen test: both the 2014 `sexagesimal.bin` variant and LP2 canonical table; byte maps `b mod 29` and `floor(29b/256)`; signs C−K and C+K. This is **8 fixed variants**. A Gibran trigram model trained on the first 40,000 GP runes was compared against all **22,621** held-out 76-rune windows (native min/median/max **−9.748394 / −8.209936 / −6.843136**). Raw p55 scores **−12.199601**. Candidate scores:

| Table | Byte map | Direction | Trigram score |
|---|---|---|---:|
| 2014 sexagesimal | `b mod 29` | C−K | −12.116275 |
| 2014 sexagesimal | `b mod 29` | C+K | −12.125606 |
| 2014 sexagesimal | `floor(29b/256)` | C−K | **−11.825488** |
| 2014 sexagesimal | `floor(29b/256)` | C+K | −12.183507 |
| LP2 canonical | `b mod 29` | C−K | −12.057880 |
| LP2 canonical | `b mod 29` | C+K | −12.180217 |
| LP2 canonical | `floor(29b/256)` | C−K | −11.866630 |
| LP2 canonical | `floor(29b/256)` | C+K | −12.115735 |

**All 8 candidates score below every held-out native 76-rune window**; even the best is more than 2.07 nats/rune below the worst native window. The result rejects the direct one-to-one perimeter-as-Vigenere-key interpretation, not every possible word-level or stateful use of circumference.

The in-invocation computation used the same Gibran training/held-out method as the p50 GF(29²) report. Reproducer: `sims/p55_table_perimeter_key_sft.cjs`; it now includes both the full-byte and 9-state quotient-perimeter tests, plus exact positive-control encryption/decryption checks. No phase, orientation, key, or cipher-family sweep was performed.

### 9-state quotient-perimeter Gronsfeld key

**Original-source correction:** p49 ends with a 10-dot 3×7 red block marker; p55 with a separate 13-dot 3×9 punctuation glyph. There is **no common red 3×3 mark** ([native-JPEG matched controls](../sims/lp2_red_marker_identity_sft.py); [stencil census](lp1-lp2-red-stencil-cross-release.md)). Independently, the p50 table's clockwise perimeter has **76 cells**, exactly p55's **76 runes**. The fixed experiment below decomposes each base60 byte as `B=29q+r` and tests the nine-valued quotient `q∈[0,8]` as a perimeter key. Its negative result remains valid but the former shared-marker justification is retired. It is distinct from the rejected full-byte perimeter mappings above.

The key order is fixed by the original table reading: top row left-to-right, right edge downward, bottom row right-to-left, left edge upward. It starts at p55 local rune 0; no phase, rotation, row/column permutation, or reset is searched. Base59 quotient values are included only as a radix control.

| Quotient key | Direction | Gibran trigram score | Held-out native 76-rune windows at or below candidate |
|---|---|---:|---:|
| Base60 `q` | C−K | −12.803527 | 0 / 22,621 |
| Base60 `q` | C+K | **−12.012381** | 0 / 22,621 |
| Base59 `q` | C−K | −12.812674 | 0 / 22,621 |
| Base59 `q` | C+K | −12.090374 | 0 / 22,621 |

Raw p55 is **−12.199601**; the worst native held-out window is **−9.748394**. Thus even the best quotient-key candidate remains **2.263 nats/rune below every native window**. The same key exactly recovers a planted 76-rune native segment under the forward/inverse pair, so the negative is not a broken decoder implementation.

**Decision:** reject the direct 76-cell quotient-perimeter Gronsfeld key. The claimed repeated 3×3 red marker is a source error (10 dots at p49 versus 13 at p55). The 76/76 geometrical equality is real, but the two different punctuation glyphs give no shared nine-state selector and the computed key does not recover p55 plaintext. The updated reproducer includes the quotient-perimeter test and its plant control; it performs no orientation or phase search.

## Known-plaintext obstruction for the 180-cell interior

The original printed 32×8 table's outer circumference contains **76 cells**, exactly the original unsolved p55 rune count; its 30×6 interior contains **180 cells**, exactly the **85+95 known runes of solved p56 and p57**. The latter allows a discriminator with genuine, historically solved text before extrapolating to p55. The hypothesis tested here is a *single stationary unknown codebook* mapping each independently printed source byte to a visible GP rune. Any such mapping must give the same rune at both occurrences of a byte, regardless of the codebook or secret alphabet.

The [source-native SFT](../sims/terminal_grid_known_tail_lookup_gate.cjs) extracts the physically defined 180-cell interior and checks all eight natural rectangle orientations (row-major or column-major, two independent axis flips), both p56/p57 concatenation orders, and both the independently known p56 **plaintext** and p56 original **ciphertext** (p57 is independently solved and carried literally). It independently grants every possible stationary unknown output codebook for each full source byte or each source byte residue mod29, a total of **64** finite models. For each codebook input class the algorithm chooses the most common desired rune, so its error count is the **global exact minimum over all possible secret lookups**, with no key search left open in that family.

The best **full-byte** reading forces at least **46/180** original rune discrepancies among **127 distinct original input bytes**; the best **mod29** reading forces **126/180** discrepancies. Both are incompatible with the exact known terminal text. Native GP plants encoded under a secret lookup are recovered with **0** changes; introducing one conflicting source-symbol target forces exactly **1** minimum change.

For statistical context, the SFT refits the *entire eight-orientation, four-target-model family* to 2,000 deterministic target-position permutations that preserve each known rune inventory. **1,895/2,000** have a minimum change count **no worse than 46** (add-one upper-tail **p=0.947526**), so the observed best fit is fully consistent with chance under this family. The executable source and passed [manual GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42956587906) preserve both the original-source gate and the null calculation.

**Decision:** Exclude a direct location-independent **one table cell → one GP rune** mapping for the solved 180-rune interior, whether the secret codebook acts on all 256 source byte values or only 29 residue classes. This does **not** exclude an evolving lookup, positional salt, multi-cell encoding, or a different original-source traversal. It makes an unchanged stationary byte-codebook explanation of the p55/p56/p57 76/180 correspondence untenable without inventing at least 46 edited solved runes.

## Alternative: four nested grid rings aligned with pp53–55

**Selector decision (11 November 2026): the exact source counts survive; the proposed readout does not.** The physical 32×8 p50 table has four inward rectangular circumferences of **[76,68,60,52]** cells, exhausting all **256**. The independently adjudicated p53 ink annotation has **128 black runes and 51 consecutive red runes**, p55 has **76 runes**, and the intervening p54 begins with an oversized red **Ac24**. All three nontrivial counts are unique in the 58-page original LP2 census: the only total-length-76 page is p55, and p53 is the only page with either 128 black or 51 red runes. These are exact original observations, and they motivated the earlier direct ring tests; their structural appeal merits preservation.

The causal problem is specific. **The required 68/60 cut has no printed selector.** On original p53, the first 128 black runes have 28 printed words, with word boundaries immediately after local positions **67 and 70**. The proposed 68/60 split cuts **inside** the three-rune black word at source-local positions **[67,70)**, just after its first rune. The visible black full stops are at positions **53 and 128**, and p53's physical line breaks are at **22,44,64,87,110,129,153,175,179**. Thus **68** is neither a word, sentence, colour, nor line boundary. Under 100,000 deterministic word-order shuffles retaining the 28 *exact source word lengths* and the full 128 black-rune total, only **21,903** put a word boundary at 68. A within-word cut occurs in the remaining **78.097%**, so the observed position provides no unusual clue to a deliberate 68/60 division. This conditional shuffle is a typography calibration, not a globally corrected historical-discovery p-value.

The proposed **52-event inner ring** is ambiguous as well. The source gives **51** red p53 runes; any one other visible event makes 52. Three materially different candidate extras are (i) p53's own terminal red 13-dot punctuation, (ii) the p54 enlarged red **Ac24** rune, and (iii) p55's own terminal red 13-dot punctuation. No original instruction selects one, and they give different material and orderings. In particular **p53+p55 already total 179+76=255 runes**, so selecting any single punctuation or oversized glyph supplies a nominal 256-event total. The identity **128=68+60** then follows automatically from the two inner dimensions of the table. This is a weaker independent cross-artifact coincidence than four separately indicated ring channels.

**Matched-source comparison:** across all 58 original pages there is just one total 76, one black 128, and one red 51, and those last two belong to the same page. The match is therefore unique *within the selected source feature family*; it was discovered by choosing these page, ink and single-event dimensions, so its rarity cannot be converted into an unconditional puzzle-design probability. The already equally exact **p55 76 + p56 85 + p57 95 =256** / perimeter+interior construction offers a materially independent, competing alignment. The purported repeated p49/p55 red **3×3** selector is contradicted by original pixels: p49's terminal glyph has **10** dots in a 3×7 stencil, while p55's has **13** in a 3×9 stencil. The source gives no relative orientation or compass direction for reading the four nested rings.

The direct finite inversions were already completed and need **no rerun**. They formed four nested p50 rings with 16 predeclared common-corner/direction/black-order layouts, and retained both the p54-Ac and p53-terminal-marker interpretations as unresolved. The unmodified printed byte residues match only **5–14/256** rune events. Even allowing the *globally optimal arbitrary stationary lookup* on each source byte residue requires **197–209/256** changed runes; allowing an arbitrary stationary full-byte-to-rune lookup still requires **86–93**. Exact native control plants have zero lookup contradictions. The 16 layouts with three GP rune encodings, three direct byte operations and four 64-byte digest families gave **0/576** matches to the p56 AN END target. These are tests of direct bijection/composition families, and no other stateful mechanism was independently selected.

**Decision for Director #391:** retire the **76/68/60/52 ↔ p55/p53/p54 four-ring assignment as a source-selected decipherment route**. Its count identities remain facts; the 68/60 black-word cut, ambiguous 52nd event, multiple orientations and competing 76/180 terminal alignment prevent a single human-motivated operation or a withheld ciphertext prediction. Reopening requires a new visible or historically authenticated selector for at least the split, extra event and traversal. No plaintext, key, mechanism, or destination follows.

The exact source counts, typography boundary, all-page unique-length comparison and 100,000-shuffle reproducibility are frozen in [the standalone source-selector test](../sims/lp2_four_ring_selector_gate_sft.cjs). The earlier 16-layout cipher and digest data remain reproducible through [the direct ring test](../sims/lp2_grid_p53_p55_four_ring_source_sft.cjs).

## Decision and scope

Retire the **direct source-aligned bytewise composition** as an AN END preimage candidate and the **stationary one-byte-to-one-rune lookup** as a known-terminal 180-cell decoder. The latter fails with every 29-way or 256-way secret codebook under the eight declared physical reading orientations. In particular, the exact 76/180 geometry does not, by itself, turn GP indices, GP primes, or prime totients into a byte codec for the table.

This test is distinct from the earlier four-aligned-64-byte-share XOR test of the table alone: it combines the entire terminal 256-rune stream with the table using the source-derived perimeter/interior alignment. It also differs from the raw-grid serialization comparisons in the AN END hash audit.

The result does **not** exclude:
- a different, independently specified traversal or alignment;
- a different byte encoding, stateful transform, or additional source-forced layer;
- a digest algorithm outside the four tested 64-byte families;
- another role for the 76/180 correspondence that does not produce the AN END preimage.

The grid resource retains a radix-59/base60 transcription caveat and is not a full independent adjudication of every printed cell. The AN END digest algorithm and canonical target bytes remain unknown. No LP2 plaintext, key, destination, or target-page content was recovered.

**Repository placement:** intermediate source-gated evidence only; not promoted to results/README.md because this finite negative does not change the overall established solution status.
