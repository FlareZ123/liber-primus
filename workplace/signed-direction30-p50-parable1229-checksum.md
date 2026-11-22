# Signed DIRECTION word 30, original p50 table row 30, and the p57 closing clause

**22 November 2026, Agent 36. Classification: exact source-derived numerical cross-match with an explicit selection-bias control.** This is a provisional navigation/checksum hypothesis. **No recovered unknown LP2 plaintext, cryptographic key, reversible original ciphertext mapping, or final destination.** The useful next research decision is whether a *first-party direction or byte-consumption operation* can be recovered before treating this as key material.

## Independent artifacts and one concrete link

The original 2014 Stage11 LP2 source prints 256 two-character cells as a 32×8 table across physical pp49–51. The image-adjudicated [canonical source](../resources/liber-primus/lp2-grid-256.json) yields standard row-major base60 bytes; no row is chosen by a ciphertext language score. Its **30th row (1-based)** has original tokens

`1k 3s 3G 21 3w 0W 29 2r`

and byte values `106, 234, 196, 121, 238, 32, 129, 173`. Their exact ordinary integer sum is **1,229**.

The authenticated *2016* signed message, preserved [verbatim](../resources/historical/cicada2016-4gq25-outguess.asc), says its numbers provide **“the direction.”** Counting all alphabetic words of the original clear-signed payload, beginning with the printed greeting **Hello**, DIRECTION is **word 30**. This gives a specific, visually possible reason to inspect table row 30, though no author stated that a message-word ordinal selects a table row.

The solved original **p57 PARABLE**, parsed as the 95 original GP29 runes in the [corpus](../resources/liber-primus/lp2-corpus.json), ends with the **six printed words** `FIND THE DIUINITY WITHIN AND EMERGE` (historical GP orthography U for V). Their original **28 GP rune prime weights sum to 1,229**. Thus the selected p50 row's *eight-byte sum* agrees exactly with an independently authored, solved source clause. Under the separately considered 59-letter numeral alphabet with the unused lowercase f omitted, the same eight printed tokens sum to **1,209**, so this equality is specific to conventional base60.

As an existing cross-round check, solved PARABLE's opening word has GP prime sum449; 1,229 modulo449 = **331**, which is the genuine original 2014 Stage11 HTML container's `<div id="331">`. Its `<title>133</title>` has previously been associated with a *different* PARABLE-clause residue. This HTML congruence was **already known and is not a second independent discovery**: the new observation is that an apparently source-selected **table row** equals that already studied closing-clause value.

## Calibration against a numerology trap

Before interpreting row30 as a key or as eight moves, inspect all *contiguous intervals of at least two actual solved p57 words*. Exactly **four of the table's 32 row sums** match one of those phrase sums:

| Row | Byte sum | Contiguous solved p57 words (zero-based positions) |
| ---: | ---: | --- |
| 4 | 995 | 4–9: TUNNELING TO THE SURFACE WE MUST |
| 12 | 1089 | 3–8: INSTAR TUNNELING TO THE SURFACE WE |
| 21 | 1345 | 1–8: LIKE THE INSTAR TUNNELING TO THE SURFACE WE |
| **30** | **1229** | **14–19: FIND THE DIVINITY WITHIN AND EMERGE** |

Using exactly the 256 original base60 bytes and fixed 32×8 geometry, **100,000 deterministic whole-table multiset shuffles** (xorshift32 seed `0x33011229`) yield at least four exact row/contiguous-p57-span matches in **27,701 trials** (plus-one rate **0.27702**). The *generic* four-match pattern is unremarkable. For the fixed 30th row and fixed sum1229, **126/100,000** shuffles match (plus-one rate **0.00127**), but both the row/target association and this particular sum were observed during wider source exploration. Neither is a discovery-wide, corrected probability.

The signed-word counting convention also matters: removing the greeting shifts DIRECTION to word29. A different defensible segmentation changes the proposed row selector. The original author has not identified row30 or specified “sum all eight bytes,” so do not turn a conditional match into an asserted cipher instruction.

## Literal historically attested OutGuess decoder: original-file negative

The eight printed row30 tokens also specify **one concrete password string** if copied literally and concatenated in source order, `1k3s3G213w0W292r`. The original 2014 Cicada stages used OutGuess JPEG steganography, so a frozen, one-password extraction of all 58 original release images was executed with a genuine first-party PGP-positive control. **No structured payload was recovered.** The 57 apparent accepted 32,904-byte decodes share one common prefix because all 58 original JPEG coefficient maps contain **1,024 initial forced-one bits**, yielding the same encrypted header `ffffffff` under all passwords; the last image hits a zero skip-modulus error. Every accepted output fails OpenPGP, known-file-signature and readable-payload checks. [Complete source and Windows-independent CI-gated evidence](../im-results/lp2-signed-direction30-row30-outguess-original-gate.md) · [final original-image PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45017737919). Retire this exact literal row30 password on the original JPEGs; the independent arithmetic checksum remains an unselected clue.

## Causal route and decisive next step

A possible **human-solvable route** is `2016 signed DIRECTION (word30) → LP2 p50 row30 → eight actual source bytes → solved p57 closing-clause checksum1229`. The selected row has eight bytes, matching the rune count of `DIUINITY`, a known historical keyword; that dimension alone is insufficient. In order to become an authentic decryption route, an independent 2014/2016 puzzle clue must select **a concrete reversible use of those eight bytes** on a previously unknown GP29 ciphertext interval. The required result is an intact original word or paragraph with actual forward reencryption and an untouched text prediction. The full-book short-period GP29 additive family is already excluded *regardless of key* by original singleton-word constraints, so do not revive row30 as a cyclic eight-rune Vigenère pad. Similarly, do not search arbitrary byte-to-rune operations merely because the checksum matches.

**Decision:** retain this isolated, source-crossing, radix-sensitive checksum as *provisional navigational context*. It supplies no plaintext. Use it only if independently recovered reading instructions genuinely require the DIRECTION ordinal and an eight-byte row; otherwise abandon this row-based hypothesis rather than multiply arithmetic interpretations.

**Reproduction:** [single read-only original-source Node22/CommonJS SFT](../sims/lp2_direction30_parable_row_checksum_sft.cjs). It asserts the complete original 95-rune p57 text after GP spelling conversion, the signed DIRECTION ordinal, all row30 tokens and bytes in two numeral radices, the 2014 HTML tag, four full-p57 contiguous-word matches and both fixed-seed multiset-shuffle diagnostics.
