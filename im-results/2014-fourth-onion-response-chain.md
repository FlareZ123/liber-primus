# 2014 fourth-onion response: recovered route, no LP2 continuation

**Agent44, 11 November 2026. Classification: recovered historical 2014 service content; bounded negative for an LP2-specific continuation.** The fourth onion's surviving archive material is present. Its updated response is a gzip-hex payload containing four images; the OutGuess message in the third image, decoded by the archived seven-column transposition, explicitly leads to the fifth onion. The documented fifth- and sixth-onion chain continues into the **first release (LP1)** and its participant-hosted magic-square submission, not into an LP2 key, p50 operation, GP29 transform, or the 2016 map message. No unknown LP2 plaintext or key is recovered.

## Exact host and preserved response material

The host is **`avowyfgl5lkzfj3n.onion`**, selected by the preceding Stage04 Vigenère clue and independently printed in the 2014 community chronology. The fourth-onion archive uses slightly inconsistent filenames (the letter `l` and digit `1` are visually confusable); do not infer a different hostname from those filenames.

Two preserved copies cover the initial page:

- [neuroretransmit participant archive: initial page](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/avowyfg151kzfj3n.html), Git blob `c386f1d4f43158af0a8e671d34f6248875068a7a`, 614 bytes.
- [krisyotam pinned archive: Stage05 index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage05/avowyfgl5lkzfj3n.onion/index.html), Git blob `69958517953dba63b8f5f76f34dda2c1967be01c`, 615 bytes.

The two HTML bodies are byte-identical after removing exactly one final LF. The participant README records the response header as `HTTP/1.0 200 OK`, `Date: Mon, 13 Jan 2014 05:39:41 GMT`, `Content-Length: 615`, and `X-Cicada: 3301`. The body has `<!--3301-->` and a 512-hex-character (256-byte) object. The 614/615-byte archive discrepancy is therefore a final-newline difference, not a different payload. The initial page is not an upload form.

The later post-downtime page is preserved at:

- [neuroretransmit updated page](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/avowyfg151kzfj3n_update_after_downtime.html)
- [krisyotam pinned Stage06 index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06/avowyfgl5lkzfj3n.onion/index.html)

Both are 5,149,029 bytes and have the same Git blob SHA `f8b6e108b8dab4fa095356f73a4f53e41918cb55`. The participant archive's page-history commit is dated 13 December 2022; that is the archive commit date, not the service capture date. A 2014 community chronology records the fourth onion returning after downtime at **29 January 2014, 00:05 GMT**; the surviving updated-page copy has no preserved HTTP response headers, so this timestamp is a contemporaneous community report rather than a recovered header ([2014 chronology](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014))).

The archive's [Stage06 README](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06/README.md) documents a deterministic extraction: hex-decode the page, gunzip it, split the concatenated stream into four JPEGs, reverse the byte order of the later image fragments as specified, and run OutGuess on the third image (`08.jpg`). The same extraction steps and image transcripts are preserved in the [neuroretransmit fourth-onion README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/README.md) and [decode script](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/decode.sh).

## Recovered message and exact reproduction

The archived OutGuess message from `08.jpg` is explicitly marked **unsigned** by the participant archive:

```text
For those who have fallen behind:

TL BE IE OV UT HT RE ID TS EO ST PO SO YR
SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M

Good luck.

3301
```

The archive specifies a period-7 columnar transposition with zero-based column order `[0, 6, 2, 5, 1, 4, 3]`. The source rows and the complete inverse are reproduced by [`sims/2014_fourth_onion_transposition_sft.cjs`](../sims/2014_fourth_onion_transposition_sft.cjs). It asserts the exact 56-character output and a reverse round-trip to the eight original rows.

```text
TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133
```

The explicit continuation is:

- Message: **TO BELIEVE TRUTH IS TO DESTROY POSSIBILITY**
- Next address: **`q4utgdi2n4m4uim5.onion`**
- Trailing token: **`9133`**, whose meaning the fourth-onion participant archive itself leaves unresolved.

The suffix is not reinterpreted here. Its possible LP2 relation is already the subject of the separate [Issue #281](https://github.com/FlareZ123/liber-primus/issues/281). The fourth-onion OutGuess message itself is not a signed Cicada message; the next stage's archived PGP-signed content is a separate attribution point.

## Original art-changing LP2 seam versus historical typed transport boundary (26 November, Director #2903)

**Bounded decision:** the original LP2 p54→p55 word carry does not select the historical binary control/payload format. This is a source-placement comparison, not a test of arbitrary punctuation clocks or a claim that artwork cannot hide information.

The reconstructed 2014 fourth-onion sender has a real transport mode transition at byte 1,647,321, after LP1 image 07: `06 || 07 || reverse(08 || 09)`. The exact decoded blob and source assembly are independently reproduced by [the forward gzip SFT](../sims/cicada_gzip_forward_sft.py). The physical transport boundary bytes are `00000000003fffd9 d9ff3f0000000000` (space added at the seam). A solver can recognize the **reversed JPEG EOI** `d9ff` where a new forward SOI would normally appear. This is a source-typed, mechanically actionable mode cue. It operates on bytes, not on rune offsets.

The original solved rune text of 07 ends with ciphertext `ᚪᛞ` and 08 begins `ᛠ-`. Under its native shifted Atbash rule `P=(31-C) mod29`, with GP29 zero-based ordinals, ciphertext [24,23,28] decodes [7,8,3] = **WHO**. The exact [07 transcription](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/07.jpg.runes.txt) and [08 transcription](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/08.jpg.runes.txt) are from the archived original images. Thus a real outer transport mode change need not change the inner rune cipher or interrupt its word. The images display matching master illustrations, not a new red-rune operator at this seam.

A second historical typed control/payload example is original LP1 05.jpg: `J || M || reverse(J)`, where J is the complete 336,353-byte JPEG and M is 360 bytes (two LF bytes followed by the reversed 358-character hex representation of a 179-byte 5×5 square text). Reproduced directly from the supplied original file: all 5 rows and all 5 columns sum to 1033, the rear image is exactly J reversed. The [existing parser](../sims/jpeg05_palindromic_magic.cjs) captures the exact format and both diagonal checks. The numeric middle field is visibly typed at the byte level; its intended use as a control for J is not established. This matters because the field has a physical location and decoder, unlike a guessed numeric state assigned to an ornament.

**Held original LP2 seam, chosen for art change and known carry:** p54 (archive71) and p55 (archive72) retain the same vine border, but p55 adds a gray tree and a moth below the black body. The full original printed group `63g2eis46q|l` straddles this seam, with the p55 first rune belonging to the word, followed immediately by an ordinary divider. The oversized red A and red heading occur at p54's beginning, while the terminal red punctuation follows p55's last body rune; neither is an intervening seam field. See the [corrected physical carry contract](../workplace/integrated-original-inversion-challenge.md).

Read the supplied two exact JPEGs: 774,295 and 614,928 bytes; Git blobs `5658a7f992c06ac7191f275cf32be2ce35b59754` and `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`. Both begin `ffd8ffe0`, end at EOI, and contain no trailing field. Concatenating them in the published order produces seam bytes `00000000007fffd9 ffd8ffe000104a46`. This is a normal EOI→SOI transition, with exactly zero intervening bytes, not a reversed EOI or a typed hex square. The actual p55 first body glyph cannot simultaneously be a separate nonempty contiguous control prefix under the printed-word-preserving interpretation. This is consistent with the independent [all-original JPEG carrier audit](lp2-2014-original-distribution-carrier-gate.md), which already excludes appended payloads across all 58 source files.

No observed mark at this original seam selects the historical reversal opcode, an independent field, or a receiving cipher state. The existing p54/p55 art is a legitimate candidate clue only if an independent source supplies its operand grammar; the known word carry alone is compatible with both continuous ciphertext and a separately transported page. Do not derive a key reset, arbitrary reversed rune suffix, or per-page state from the visual change. The specific historical typed format fails the original placement/signature prediction, so no original decryption is justified and no unknown plaintext is claimed. Prior #2600/#1085/#1089/#2174/#2716 cover different rubric, clock, state-persistence and local-cut proposals; this comparison does not extend their exclusions.

## Follow-through: the documented route ends in LP1

The fifth-onion archive records the explicit address above and preserves a PGP-clear-signed message at [`q4utgdi2n4m4uim5.onion.asc`](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/q4utgdi2n4m4uim5.onion.asc). Its README describes the message as validly signed by Cicada and gives a Gödel, Escher, Bach book-code route to **`ut3qtzbrvs7dtvzp.onion`**, the sixth onion. This is a source-derived next hop, not an adjacent address guessed by this investigation.

The sixth-onion archive preserves an HTTP header dated **31 January 2014, 06:57:04 GMT**, with `Content-Length: 8623291` and `X-Cicada: 1033` ([header capture](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.headers)). Its [README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md) documents four sequential, unencrypted new LP1 pages (pages 10–13) and PGP-clear-signed instructions to create a **participant-owned** Tor hidden service, accept CGI uploads, and submit the three previously supplied magic squares. The later Stage10 confirmation returns three further images; their byte identity with LP1 pages 14–16 is already established in [the Stage10 source-handoff result](2014-stage10-three-images-lp1-source-handoff.md).

This resolves the historical route as **fourth onion → fifth onion → sixth onion → LP1 pages 10–16 / participant submission**. The recovered fourth-onion payload does not mention LP2, p50, a GP29 key schedule, or the 2016 “words are the map” message. The 3301/1033 markers and the fifth-onion OpenPuff password `33011033` are documented parts of this 2014 chain; they do not by themselves specify an LP2 operation. The existing [3301/1033 source-role audit](3301-1033-source-operation-audit.md) remains the correct place for that separate question.

## The terminal `9133`: bounded original-source decision

The original unsigned OutGuess ciphertext comprises **eight complete seven-character rows** (56 characters). The archived period-seven order `[0,6,2,5,1,4,3]` gives exactly **36** characters of aphorism `TOBELIEVETRUTHISTODESTROYPOSSIBILITY`, followed by the **16**-character v2 onion hostname `Q4UTGDI2N4M4UIM5`, followed by the **four** characters `9133`. These characters are present in the contemporary ciphertext. The initial transposition test mistakenly sliced its hostname from offset 35 rather than 36, so its asserted host and suffix did not pass despite the correct expected 56-character string; the corrected [standalone reproducer](../sims/2014_fourth_onion_transposition_sft.cjs) fixes the boundary and asserts the full partition. This repair affects implementation confidence, not the historically established onion address.

**Original independent context.** In a [contemporaneous 29 January 2014 solver discussion](https://www.forums.unfiction.com/forums/viewtopic.php@p=1028647.html), participants separated the transposed output into the maxim and the working onion address, followed by `9133`. The [surviving 2014 IRC transcript](https://uncovering-cicada.fandom.com/wiki/Ports_of_Cicada_onions) explicitly records attempts to contact that host using ports `9133` and its reverse `3319`; these attempts were unsuccessful. The four terminal digits occupy the four positions left after the known phrase and hostname fill 52 of 56 cells. The surviving source establishes their exact presence, but does **not** determine whether the creator intended filler, a subsequent instruction, or another use. Their being prime or reversible is insufficient by itself to select a decoding operation.

**Frozen `91|33` pointer gate, Issue #281.** The original LP2 physical p33 does contain a red internal heading beginning at local GP29 rune offset 91. However, no original 2014 source independently selects concatenated two-digit `offset|page` addressing, a zero-based index, or that page as an LP2 target. The 2016 authenticated phrase “words are the map, numbers are the direction” does not specify the delimiter, numeric widths, coordinate order or these particular digits. The `91|33` split was selected after inspecting the heading, whereas 2014 users were already treating the digits as a separate unexplained token. The coincidence therefore does not authorize a p33 decoder, state reset or ciphertext-key search. **Decision:** retire the `9133 → p33:91` route as unsupported, preserve `9133` as unresolved original message content, and reconsider it only if an independent signed or contemporaneous instruction prescribes an actionable address/key grammar. No unknown LP2 plaintext or cryptographic key is recovered.

## Avoiding duplicate work and decision

- The three historical 256-byte onion excerpts are already covered by the [historical onion/grid source-key analysis](historical-onion-xor-grid-source-inversion.md), including all 15 nonempty raw-XOR subsets and bounded AES/ChaCha, totient and sharing families. This report does not rerun those searches.
- The `9133` suffix is left to Issue #281 rather than tuned into a page/offset interpretation.
- The LP1 pages returned at Stage10 are already byte-identified in the Stage10 handoff report. Any LP2-specific test of those pages belongs to the separate Stage10→LP2 issue, not to the fourth-onion response.

**Decision:** close this assignment as a bounded historical-route result. The surviving service content is recoverable, and its explicit continuation is the documented 2014 LP1 path. No actionable LP2 key or operation is present in this chain. Reopen only if a new attributable capture or signed instruction from this route explicitly selects LP2 material or a reversible operation on it. This is not a claim that all historical service bytes or the unexplained `9133` token have been resolved.
