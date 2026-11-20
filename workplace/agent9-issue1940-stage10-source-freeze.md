# Issue #1940 — Stage10 square chain: consolidated source-selector audit

**Agent16, 20 November 2026.** Took over after the previous Agent9 identity lease became stale. Scope is the original LP2 p22 / LP1 p14–p16 images and preserved 2013/2014/2016 source records. This run is not a blind p0 holdout: the candidate phrase had already appeared in prior synthesis.

## Source-fixed facts

### 2014 Stage10 form and square order

The contemporaneous Stage10 form copy lists these fields in document order:

1. Order 5 Square, 3301
2. Order 7 Square, 1033
3. Order 5 Square, 1033

The signed instruction asks participants to paste the three magic squares into the appropriate textareas. The HTML field labels/order are preserved in a participant archive copy; the surrounding HTML is not itself signed. The form has no visible client-side transform. Its POST target is /cgi-bin/squares; the server handler is not preserved. The static response references three image assets but does not expose a readout rule.

The repository's numeric transcription is resources/cicada2014-openpuff-magic-squares.txt. Its first 5×5/3301 matrix exactly matches the numeric square printed on original LP1 p16. This supports p16 as the carrier of the first Stage10 object. The 7×7/1033 and 5×5/1033 matrices are preserved as a separate text transcription; the form/response HTML does not itself contain their numeric cells.

### p22 artwork and LP1 page selection

Original LP2 p22 is resources/liber-primus/39.jpg; LP1 p14–p16 are resources/liber-primus/14.jpg–16.jpg. The lower body illustration is repeated across all three LP1 pages; the p22 image shows the mirrored motif. Therefore the artwork points to the p14–p16 page set, not uniquely to p16. The exact 5×5/3301 matrix match and the Stage10 field order identify p16 as the first square carrier. The mirror-to-digit-pair reversal remains an interpretation, not a direct instruction.

### BASE29 and the 2016 word register

The signed 2013 TCP source at resources/external/2013-tcp-server-signed-source.md authenticates the BASE29 command and the worked example BASE29 3301 → 3QO. It does not instruct solvers to apply BASE29 to square centres/cells or use the digits as word positions.

The signed 2016 message at resources/historical/cicada2016-4gq25-outguess.asc says that words are the map and numbers are the direction. Its alphabetic word register contains **43 words**, hence 42 adjacent pair starts. The terminal numeric token 3301 and hexadecimal key ID 7A35090F are not word-register entries. The signed message does not specify whether a word list is indexed from zero or one.

## Source-only counterexample: both word origins survive

The preserved square centres are 809, 331 and 91, with BASE29 digits [27,26], [11,12] and [3,4]. If the first pair is reversed under the plausible p22 mirror reading, the centre outputs are:

| Centre | Zero-based | One-based |
|---|---|---|
| 809 → [26,27] | NUMBERS ARE | THEIR NUMBERS |
| 331 → [11,12] | IS THE | PRIMUS IS |
| 91 → [3,4] | LIES EMPTY | PATH LIES |

Both columns are literal adjacent phrases in the signed 2016 message. Every digit is valid under both origins. The signed BASE29 example does not resolve this origin.

The 1033-square cell values 91, 121, 151 and 181 form a four-edge chain. Under zero-based indexing the chain reads LIES EMPTY EPIPHANY SEEKS THE; under one-based indexing it reads PATH LIES EMPTY EPIPHANY SEEKS. Both are contiguous substrings of the signed 2016 message. The p0 candidate phrase EPIPHANY SEEKS appears under both origins, selected by different square cells (151 versus 181).

This also exposes a traversal issue: the four values interleave the two 1033 geometries, while the Stage10 form lists 7×7 before 5×5. No source prescribes that interleaving, a centre-out start/handedness, or the digit-to-word origin. The p57 circumference wording is suggestive but does not resolve these choices.

## Source-only decision

The Stage10 field order is a real contemporaneous archive fact; p16 genuinely carries the first 5×5/3301 matrix; BASE29 is a genuine signed operation; and the 2016 message genuinely foregrounds words and numbers. These are useful correspondences.

For the Stage10-only question, the decisive operation from square values/cells to a unique signed-word phrase remains unfixed: the square-only word-index origin has two valid readings, the p22 mirror is not unique to p16, and the 1033-cell chain interleaves two geometries without a source-fixed path. The server-side Stage10 handler is unavailable. The positive criterion for Issue #1940 therefore failed at its original selector gate.

A separate conditional route emerged later: the p27/p55 cicada motifs may point to the 2013 Science News page-27 lineage figure and its 221-year/2013–2015 data; these select p50 cells 221–223, whose values 52/51/151 map through BASE29 to signed-2016 word pairs. This route favors zero-based table addressing, but its proposed 2016-message-word receiver remains unsupported in light of closed #304 (which reads “Its words” as referring to Liber Primus). Its table address is inferred, and it does not fix the two-1033-square traversal or establish a reversible cipher. See im-results/lp2-cicada-article-p50-row27-word-map.md. Treat it as a successor hypothesis for Director review, not as a retroactive positive result for the square-only gate.

## Blinding limitation

This invocation had already seen the p0 candidate phrase in the existing synthesis and reports before claiming Issue #1940. The calculations above use only the square transcription and signed 2016 source, not p0 ciphertext, but this run cannot claim a strictly blind p0 holdout.

## Reproduction

Run node sims/issue1940_word_origin_audit_sft.cjs. The earlier numeric searches remain at sims/lp2_three_square_centers_base29_source_pairs_sft.cjs and sims/lp2_square_cells_base29_source_chain_sft.cjs.
