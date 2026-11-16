# Original 2014 256-byte numeral table as a 2012-style 32-point GPS list

**16 November 2026, Agent9. Original-input decision:** direct IEEE-754 GPS serialization is impossible as a complete original-row 32-float32-coordinate list **or** a complete consecutive two-row 16-float64-coordinate list under any conventional byte order. No previously unknown LP2 plaintext, genuine location, cryptographic key or continuation was recovered. The genuine 2012 GPS precedent motivates the test, but no 2014 source instructs float32 interpretation.

## Human-directed hypothesis and decisive reading

The original 2012 Cicada 3301 stage openly sent participants to physical posters by pairs of decimal latitude/longitude coordinates. LP2's printed physical pp49–51 contain **exactly 32 rows, eight radix60-encoded byte tokens per row**, a possible storage width either for two ordinary four-byte IEEE-754 numbers (32 locations) or one eight-byte IEEE-754 double (pair adjacent rows, 16 locations). If the later book hid another coordinates page, a player already trained by 2012 could read each row as a location without first decrypting the rune pages. Rival: the table is high-entropy cipher material, not a coordinate file. The table **does not specify IEEE754, float32, coordinates, or endian order**.

Use the repository's unchanged \`resources/liber-primus/lp2-grid-256.json\` table, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\` over original 256 conventional-base60 numeric bytes. Primary reading: pair each original printed row's first four bytes as latitude and remaining four as longitude; decode each as *big-endian or little-endian float32* independently. Secondary native-width reading: take each complete eight-byte printed row as one float64, use pairs of *adjacent original rows* as latitude and longitude, and again test both byte-order options independently. This yields exactly four frozen byte-order combinations for each numeric width, without swapping field roles, regrouping nonadjacent rows, fitting offsets, tuning scales or altering source glyphs.

Any real latitude/longitude list must consist entirely of finite coordinates with latitude magnitude ≤90 and longitude magnitude ≤180. This necessary condition is independent of any place-name interpretation or language model.

| IEEE754 byte order for latitude, longitude | Original rows with valid geography | Invalid original rows | Longest run of successive valid rows | With both coordinate magnitudes ≥1° |
| --- | ---: | ---: | ---: | ---: |
| Big, big | **6/32** | **26** | 2 | 0 |
| Big, little | **7/32** | **25** | 2 | 0 |
| Little, big | **7/32** | **25** | 2 | 0 |
| Little, little | **10/32** | **22** | 2 | **1** |

Under the independent **float64 adjacent-two-row model**, big/big yields **1/16** geographically valid pairs, big/little **3/16**, little/big **2/16** and little/little **3/16**; **none** has both latitude and longitude magnitude ≥1 degree. Thus all 16-point versions fail even before the float32 result is considered. The raw float64 coordinates are near-zero scientific-notation values, not recognizable poster coordinates.

For sensitivity, little/little float32 row index10 (the first row on original physical p50) happens to encode **latitude −25.15359116°, longitude +14.94450092°**, a position in Namibia. This is an **isolated numerically plausible result, not a verified Cicada location**. Since most rows are nongeographic under the identical prescribed operation, no whole-list decoder exists; selecting just that row after inspection would be post-hoc fitting without a source-chosen row selector. A scalar encoded in arbitrary float32 bytes sometimes falls inside geographic bounds by accident. A GPS-looking pair is also not cryptographic evidence of address intent.

## Native positive, exact source and execution

The read-only [single runnable CommonJS test](../sims/lp2_grid32_2012_gps_float_pair_sft.cjs) uses the literal 2014 table and reconstructs three independently supplied positive-control **2012-style real geographic positions** (Warsaw, Paris, Sydney) by explicit float32 and float64 encoding and decoding under both endian conventions, each with error tolerance <0.00001 degrees. All controls return valid, nontrivial positions. Each original row is then decoded in all four frozen endian interpretations and counted using the same acceptance rules. Original float32 and float64 big/big and little/little counts, total 256 bytes, 32 original rows and source width are asserted.

[Windows Node.js 22 original-source GitHub Actions run **43810387470**](https://github.com/FlareZ123/liber-primus/actions/runs/43810387470) passed the original float32 gate (16 November 2026, 05:28 UTC). The same SFT was extended to float64 with exact positive controls and rerun independently (see subsequent run of the same workflow). [Manual workflow](../.github/workflows/agent9-p50-ieee754-gps-gate-manual.yml) is disabled from scheduled execution.

## Causal decision

**Retire both ordinary source-shaped GPS serializations:** one float32 latitude/longitude pair per row is falsified by at least **22 invalid rows** under the best endian variant, while one float64 number per row, paired into 16 locations, is falsified by at least **13 invalid coordinate pairs**. The procedure recovers neither an original authenticated site nor a key usable against the 12,956 encrypted GP29 runes. Alternative binary structures, transformed bytes, a separate key, row-specific encoding, encrypted coordinates, or a non-coordinate purpose remain open, but no historical instruction presently selects these. Do not try ad-hoc endian swaps, row subsets, or coordinate projections to rescue the single post-selected Namibia pair.

Historical precedent: the verified 2012 coordinates/puzzles are reconstructed from Cicada source witnesses in [the 2012 historical account](cicada2012-pgp-uid-original-prime-domain-resolution.md). Original table transcription/provenance and the necessary non-permutation certificate are at [the p50 table-fingerprint source study](lp2-grid-published-byte-table-fingerprint.md).
