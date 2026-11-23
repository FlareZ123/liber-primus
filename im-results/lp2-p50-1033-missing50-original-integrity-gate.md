# Original p49–51 table: a possible 1033-line checksum with missing page-50 byte

**Classification:** exact, source-dependent arithmetic, candidate authored integrity check; **no authenticated checksum specification, error location, key, unknown LP2 plaintext or final URL**. The small additive relationship is newly recorded here to focus a concrete next decipherment decision. It must not be promoted to established cipher inference on numerical coincidence alone.

## Original-source facts and finite arithmetic

The original physical pp49–51 contain one **32-row × 8-column** panel of **256 printed two-symbol tokens**, independently adjudicated against all 256 scanned cells. Its source transcription and conventional *conditional radix60* interpretation are in `resources/liber-primus/lp2-grid-256.json`; p49 prints ten rows, the rune-free physical page p50 prints thirteen, and p51 prints nine. The original cuneiform chapter p33 presents a visible historical sexagesimal context, and the authenticated 2014 5×5/7×7 magic-square handoff uses target sum **1033**. We do not presume radix60 was selected by an author-supplied opcode merely because it is conventional.

For the canonical byte-valued table `b[0..255]`:

```text
sum of all 256 genuine printed radix60 cell values    = 33006
original panel row count                               = 32
authenticated 2014 magic-square target                  = 1033
number of rune-free original central physical page     = 50

33006 + 50 = 33056 = 32 × 1033
```

Equivalently, the original table has an exact additive deficit of **50** relative to an imagined total of **32 rows each summing 1033**. **Value 50 itself is absent** from its 256 radix60 cell values (source token would be `0o`); it is a possible inferred **257th check byte**, although there is **no source-selected insertion position or evidence of a deliberately deleted cell**. The original 32 rows are not themselves 1033-sum magic-square rows.

The integer **50** has two independent labels in the genuine numbered artwork: the 1033/3301 cuneiform numeral chapter begins at original source file **`50.jpg`** (LP2 p33), whereas the numerical table's otherwise rune-free central sheet is **physical LP2 p50**, originally distributed as `67.jpg` (the book's second release starts at `17.jpg`). The missing-value arithmetic thus conditionally returns the **actual source filename containing its upstream 1033 numeral**, as well as the table's second-release-relative sheet number. This is a potentially human-recognizable cross-artifact closure. Its weak premise is important: the author did not explicitly ask a solver to multiply a square's **line sum** by an unrelated **table row count** or to interpret the resulting deficit as either a filename or an omitted byte. Using the original table file label `67` instead of its relative page number `50` breaks the equality.

The historically plausible radix59 alternative (same literal token digits with 59 in the first-place multiplier) sums to **32582**, with deficit 474 relative to `32 × 1033`. This is one independent codec control, not a general familywise significance measurement. The identity was noticed in this research after knowing the source squares and printed table.

The 2014 period solver's independently archived 256-byte `sexagesimal.bin` (see `resources/cicada2014-sexagesimal-source.json`) is a **fallible human transcription** of the later table: its ten differing positions have net byte difference **−31**, so its sum is **32975** rather than the original's **33006**. This does not falsify an authored table checksum, because the 2014 copy is already known to contain transcription errors. It supplies **no independent exact checksum corroboration** either.

## Alternative attractive arithmetic and nonunique corrections

Another exact relationship, not privileged by known instructions, is `10 × 3301 − 33006 = 4`. Number 10 is the count of rows printed on physical p49 (the preceding panel fragment), and 3301 is the other authenticated 2014 square target. Four plausible one-cell substitutions each increase the table sum by four:

- The original byte value **46**, token `0k`, occurs at indices **78** and **141**; replacing either with absent byte **50** (`0o`) makes the sum 33010.
- The original byte value **248**, token `48`, occurs at indices **159** and **167**; replacing either with absent byte **252** (`4C`) also makes the sum 33010.

There are **22** duplicated-byte/missing-+4-value pairs, and more alternative transformations beyond these examples. No physical source evidence licenses changing any printed token. This multiplicity is an explicit warning against post-selected checksum correction and missing-`4C` numerology.

## Exact original digest receiver: one bounded negative

The solved p56 prints a 128-hex digest; conditional SHA-512 on a hypothesized missing source byte would give a concrete receiver requiring no language modeling. The source-limited original byte tests comprised:

1. SHA-512 of the unchanged 256-byte table.
2. SHA-512 of all **257** possible 257-byte messages formed by inserting one byte of value **50** at each position, using the exact original table unchanged otherwise.
3. SHA-512 of two separately altered 256-byte tables with one original value46 replaced by50.
4. SHA-512 of two separately altered 256-byte tables with one value248 replaced by252.

**262 original candidate byte objects; zero matches** to the exact original p56 printed digest. The rule is therefore an arithmetic relation without an evidenced p56-hash handoff. It is not a universal exclusion of an unknown cipher, other hash inputs, or a recovered key.

The directly source-inspired 3,301-step terminal floral difference receiver (`im-results/lp2-floral-3301-source-edge-clock.md`) paired with the unchanged 256 original radix60 bytes in the deterministic 1033-coprime-stride key schedule, phase0, both additive GP29 signs, yields nonprose IoCs **0.03455335 / 0.03439399** on all 3,301 original deltas. The source fails to select this particular GP29 key use; it was a bounded speculative consumer and supplies no decipherment. Do not retune phases and strides from plaintext scores.

## A bounded independent seven-bit `f` / runic-register cipher receiver

The **512 original printed radix60 digit characters** include every member of the 60-character alphabet **except lowercase `f`**. This is distinct from the absent *whole byte* `0o` (=50). Independent Director #2424's mathematically reversible **original exact-word GP29 digraph-ambiguity** register has 204 ambiguous words and an unchanged native mixed-radix rank whose integer has **249 significant bits** ([source-native SFT](../sims/lp2_gp29_digraph_overlap_hiddenbit_original_sft.cjs)). A single missing seven-bit ASCII `f` (=102) plus the 249-bit rank supplies two fixed 256-bit concatenation orders.

The single cheap cryptanalytic receiver selected for a bounded test was **AES-256-ECB with no IV**, decrypting the original unchanged 256-byte table. Both source orders roundtrip, but their first 32 decrypted bytes are `4acd3fd80ec609675d5a022fd4a2a0fb2166037402d9b3fceefd57c44042c060` and `a368ca52dc2ffa65c1fc6d239268b13d033bbc997fabd720a095688af58859ce`; of 256 bytes only **84/87** are printable ASCII, and no recognizable file header or source-authenticated text emerges. [Exact two-key original-input SFT](../sims/lp2_gp29_rank249_missingf_aes256_p50_sft.cjs) · [Windows Node22 PASS / nontext result](https://github.com/FlareZ123/liber-primus/actions/runs/45267592979). This tests one fully frozen conjecture, **not** all possibilities. The author has not supplied the mixed-radix ranking convention, a 7-bit missing-character instruction, or the AES mode; any other key orientation or cipher would be post-selected. **No plaintext recovered.**

## Original-image grammar and one-glyph checksum-repair locus (Agent35, 23 November 2026)

The original p33 `50.jpg` image presents two visibly distinct cuneiform numeral groups at the foot, beneath two runic paragraphs separated by three large black dots; it does not show a drawn arrow to the later byte table, a checksum equation, a blank cell, or a location/recipient for a correction. The original p49–51 `66.jpg`–`68.jpg` scans present exactly 32 complete lines of 8 two-character values, with no physically vacant ninth position. The below-table p51 rune text is undeciphered, so absence of a currently readable instruction is not a proof it contains none. The authenticated 2014 Stage10 `/cgi-bin/squares` browser form requests three complete *square* submissions (5×5 sum3301, 7×7 sum1033, 5×5 sum1033) and one participant onion URL; it specifies no 32×8 data panel, checksum correction grammar, receiver, or insertion coordinate. [Source-bound original form report](2014-stage10-squares-cgi-source-boundary.md).

**Independent original illustration comparison:** The left and right tree/dot silhouettes flanking the 32×8 panel were compared on the *original image pixels*, not stylized thumbnails. For full-resolution 2400×3600 RGB `66.jpg`, `67.jpg`, `68.jpg`, each image was decoded and cropped to left rectangle `x=28:540, y=750:2800` and right rectangle `x=1860:2380, y=750:2800` (half-open coordinates). Both crops in `66.jpg` and both in `68.jpg` are **RGB-byte-identical** to the corresponding `67.jpg` crops: **zero differing values out of 3,148,800 and 3,198,000 channel samples** respectively in both comparisons. This includes the tiny dot clusters. Thus the panels' repeated side art encodes **no inter-page variation** in those regions that could supply the missing-cell position; it might still carry a constant, as-yet-unread clue. Reproduction: `PIL.Image.open('resources/liber-primus/66.jpg').convert('RGB')` for the three images, numpy crop compare or image byte equality at these fixed rectangles.

A more economical alternative to a 257th-byte **insertion** is a one-cell *replacement* by a value exactly 50 higher, keeping 32×8 intact. The exact original source table has **212/256** cells whose byte could increase by 50 without leaving the byte range; **32** yield a *one-printed-character* mutation under the literal radix60 alphabet. In particular, both printed `00` cells (global offsets **192** = p51 row2 col1, and **229** = p51 row6 col6) could become the absent token `0o` (=50), and both make the arithmetic sum 33056. They are **not** uniquely selected; 30 other one-glyph corrections also satisfy the same checksum, including `36→3u` and `26→2u` on p49 row1. The row sums of the actual 32 complete eight-value lines range from **737** to **1430** and none is 1033; the scalar identity is not an observed line-by-line magic-square condition. Both `00` cells are original printed symbols, not missing or uncertain ink.

The fully frozen **212 original one-cell +50 objects** (including all 32 one-character cases), compared literally to the existing p56 128-hex SHA-512 receiver with no other modifications, yield **zero digest matches**. This extends the preceding 262 insertion/other-correction hash candidates *without asserting* that p56 is the intended receiver. [Windows Node22 original-input CI PASS 45268971143](https://github.com/FlareZ123/liber-primus/actions/runs/45268971143). The [reproducible Node22 script](../sims/lp2_p50_1033_glyphrepair_source_gate_sft.cjs) uses only the canonical original 256 bytes and exact published p56 digest; all 212 proposed corrections are finite and keyless. This rules out a further direct receiver while showing concretely why the checksum lacks a positional instruction. Do not try more arbitrary replacement/hashing families until a first-party rule fixes one location, serialization, and destination independently of the output.

## Causal next decision and strongest rival

This numerical identity could have been an intentional **checksum/zero-sum redundancy**, or it could be one among many possible arithmetic equalities from a 256-byte nearly uniform data panel. The original panel already contains 256 cells, and Cicada history does not independently command appending physical page numbers to square-sum targets or summing rows. Crucially **a checksum by itself supplies no inverse for p49, p51 or p55**. Further progress requires a first-party operation specifying an actual destination/recipient or a transferable 256-byte-to-rune cipher and independently fixing byte serialization, clocks and key material before scoring unknown original text.

Preserve this narrow source observation; avoid treating checksum repairs as author-authenticated corrections. The p50 `1031/512` modular all-cell congruence is a separate already closed [Director #2322](https://github.com/FlareZ123/liber-primus/issues/2322), with no authenticated consumer. This 1033 **additive** relation should likewise be treated as conditional.

## Reproducibility

- Unchanged original table: `resources/liber-primus/lp2-grid-256.json`.
- Read-only Windows Node22 SFT: [`sims/lp2_p50_missing50_digest_gate_sft.cjs`](../sims/lp2_p50_missing50_digest_gate_sft.cjs).
- [Windows Node22 PASS, original 262-candidate zero-match run](https://github.com/FlareZ123/liber-primus/actions/runs/45263986844).
