# Terminal grid/rune 256-byte digest gate

**Status, 11 November 2026:** The source-motivated 76/180 terminal partition has now been tested against both the later LP2 printed-token table and the earlier 2014 stage11 `sexagesimal.bin` table. Neither table produces an AN END digest match under the frozen direct byte-composition family; the 2014 raw source files also fail direct 64-byte digest tests. Separately, a completely unknown stationary byte-to-rune lookup cannot map the 180 interior cells to the two solved terminal pages under the eight natural rectangle orientations. The original source geometry remains exact, but a decoder, key, or unknown plaintext has not been recovered.

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

## Known-plaintext obstruction for the 180-cell interior

The original printed 32×8 table's outer circumference contains **76 cells**, exactly the original unsolved p55 rune count; its 30×6 interior contains **180 cells**, exactly the **85+95 known runes of solved p56 and p57**. The latter allows a discriminator with genuine, historically solved text before extrapolating to p55. The hypothesis tested here is a *single stationary unknown codebook* mapping each independently printed source byte to a visible GP rune. Any such mapping must give the same rune at both occurrences of a byte, regardless of the codebook or secret alphabet.

The [source-native SFT](../sims/terminal_grid_known_tail_lookup_gate.cjs) extracts the physically defined 180-cell interior and checks all eight natural rectangle orientations (row-major or column-major, two independent axis flips), both p56/p57 concatenation orders, and both the independently known p56 **plaintext** and p56 original **ciphertext** (p57 is independently solved and carried literally). It independently grants every possible stationary unknown output codebook for each full source byte or each source byte residue mod29, a total of **64** finite models. For each codebook input class the algorithm chooses the most common desired rune, so its error count is the **global exact minimum over all possible secret lookups**, with no key search left open in that family.

The best **full-byte** reading forces at least **46/180** original rune discrepancies among **127 distinct original input bytes**; the best **mod29** reading forces **126/180** discrepancies. Both are incompatible with the exact known terminal text. Native GP plants encoded under a secret lookup are recovered with **0** changes; introducing one conflicting source-symbol target forces exactly **1** minimum change.

For statistical context, the SFT refits the *entire eight-orientation, four-target-model family* to 2,000 deterministic target-position permutations that preserve each known rune inventory. **1,895/2,000** have a minimum change count **no worse than 46** (add-one upper-tail **p=0.947526**), so the observed best fit is fully consistent with chance under this family. The executable source and passed [manual GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42956587906) preserve both the original-source gate and the null calculation.

**Decision:** Exclude a direct location-independent **one table cell → one GP rune** mapping for the solved 180-rune interior, whether the secret codebook acts on all 256 source byte values or only 29 residue classes. This does **not** exclude an evolving lookup, positional salt, multi-cell encoding, or a different original-source traversal. It makes an unchanged stationary byte-codebook explanation of the p55/p56/p57 76/180 correspondence untenable without inventing at least 46 edited solved runes.

## Alternative: four nested grid rings aligned with pp53–55

The printed 32×8 numeric grid has four concentric circumferences of **[76, 68, 60, 52]** cells, exhausting all 256 entries. The three consecutive original illustrated pages **p53–p55** (original JPEGs `70.jpg`, `71.jpg`, `72.jpg`) carry a second, more differentiated source grouping than the known 76/180 terminal-page correspondence:

| Table region | Source-visible 29-rune material | Length |
| --- | --- | ---: |
| Outer ring | Entire p55 | **76** |
| Second ring | p53's first 68 black runes | **68** |
| Third ring | p53's remaining 60 black runes | **60** |
| Inner ring | p53's 51 red runes and the standalone oversized Ac24 glyph on intervening p54 | **52** |

Original annotations establish p53's exact **128 black / 51 red** split and a terminal red **13-dot marker**. Both its 51-rune red inscription and p55's 76-rune full page are unique by length in the 58-page original corpus. The one extra ring event could alternatively be the p53 13-dot terminal marker; the p54 oversized Ac is independently sourced by the original image and already appears as the GF29 double root of the printed table polynomial. The forced **68/60 split crosses a printed word** on p53, however, and which extra event or ring orientation was intended is unknown. As with the earlier p55+p56+p57=256 relation, a numerical correspondence alone does not authenticate a cipher.

To check simple readings before proposing a transport, I formed all four rings at the original 256 cell positions and aligned 256 source symbols across **16 length-preserving** common-corner/direction/black-order layouts. The two black-order variants assign p53's first 68 then next 60 black runes to the 68/60 rings, or assign its final 68 then first 60; each fills all four rings exactly. Direct `byte mod29` gives just **5–14/256** exact symbols. Even granting an optimal *arbitrary unknown fixed lookup* `f: byte%29 → rune`, at least **197–209 glyph changes** are required; a secret `f: full 8-bit byte → rune` still requires **86–93** edits. The optimization independently chooses the best output glyph for every input class, without constraining the secret alphabet. Native 256-symbol lookup plants recover 256/256. Thus the direct residue or whole-byte stationary substitution readings are excluded. Evolving state, nonlinear encodings and alternative placement conventions remain open.

The same 16 layouts were also tested as candidate preimages for the 512-bit digest printed on p56. Each ring-aligned rune stream was encoded as GP index, GP prime weight, or prime-minus-one; combined positionwise with its corresponding table byte by XOR, addition mod256, or subtraction mod256; then hashed with SHA-512, SHA3-512, BLAKE2b-512, or SHAKE256(64). **0/576** combinations match the printed target. The checked-in binary witness is a byte conversion of that literal digest, not an independent server-captured preimage or algorithm identification. This closes only the stated simple ringwise compositions and four 64-byte hash families.

This is a **source-constrained terminal ring hypothesis**, supported by independently original image geometry and red/black structure. It yields no plaintext or key. [Reproducer](../sims/lp2_grid_p53_p55_four_ring_source_sft.cjs).

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
