# Authorial correction-channel gate: the 2012 Blake Chorus

**Decision:** no independently selected correction channel is supported. The only qualifying source-fixed quotation pair found in the preserved first-party signed-text corpus is the 2012 MIDI email's Blake Chorus. Its 56 word tokens match Blake's plate-27 Chorus exactly; the complete difference is three punctuation edits. Those edits do not form a repeated rule, select an LP2 operand, or identify an LP2 receiver. Keep this branch retired unless a second independently fixed quotation pair and an original LP2 selector are produced.

## Frozen source pair

- **Author output:** the clear-signed 2012 message in [resources/historical/cicada2012-midi-email.asc](../resources/historical/cicada2012-midi-email.asc). The repository's historical solve-path contract records verification against the preserved Cicada key ID 181F01E57A35090F and links the successful verification workflow. The signed message itself says, “Let the Chorus be your guide to the depths,” then supplies the Chorus.
- **Pre-release source:** William Blake, *The Marriage of Heaven and Hell*, plate 27, “A Song of Liberty,” Chorus. The ASU scholarly transcription identifies the passage as MHH27; E45: [ASU text](https://blake.lib.asu.edu/html/marriage_of_heaven_and_hell.html). Jack Lynch's transcription says it follows the 1790 original and preserves Blake's eccentric spelling, capitalization and punctuation (while noting a few silent punctuation insertions): [editorial note and text](https://jacklynch.net/Texts/mhh.html).
- The visible “Chorus” heading and the Cicada instruction select this source without edition mining. The 2012 player route uses the Blake Chorus as the known text for the MIDI track's pitch/duration substitution; it is not a textual correction instruction. See [the existing historical solve-path contract](../workplace/historical-player-solvepath-operator-contract.md) and [MIDI source metadata](2012-midi-source-metadata.md).

## Exact comparison

Whitespace, tabs, line wrapping and indentation are ignored; spelling, word order and punctuation are retained. A deterministic comparison gives **56 source word tokens and 56 signed-message word tokens, identical in order**.

| Position | Blake transcript (ASU / Lynch) | Signed Cicada text | Exact edit |
|---|---|---|---|
| after **brethren** | brethren whom | brethren, whom | insert comma |
| after **free** | free; lay | free lay | delete semicolon |
| terminal word | Holy | Holy. | insert full stop |

There are no letter substitutions, word insertions/deletions, word-order changes or number changes. The signed text preserves **letchery** and **every thing**, both present in the ASU and Lynch Blake transcriptions. They are not Cicada misspellings or corrections. Modernized editions can normalize these forms and vary punctuation; comparing a chosen modern edition would manufacture differences rather than establish an authorial edit.

The literal edit script is therefore only:

1. Insert a comma after **brethren**.
2. Delete the semicolon after **free**.
3. Insert a full stop after **Holy**.

The three punctuation changes are not repeated elsewhere in the quote, do not encode a stable symbol mapping, and have no independently selected reading order. They are consistent with ordinary transcription or edition-level punctuation variation. The two local archival renderings of the same signed email also differ in wrapping/trailing whitespace; that formatting is not a second textual source pair.

## Second-pair check and LP2 consequence

No second qualifying **quotation-to-author-output** pair was found in the preserved first-party signed 2012–2016 text corpus. The 2013 Liber AL and 2014 Self-Reliance examples are explicit book-code/coordinate extractions, not quoted text copied with a correction sequence; the 2013 sender's forward construction is the distinct [#2892 investigation](https://github.com/FlareZ123/liber-primus/issues/2892). The 2013 “knock on the sky” line and the 2016 “path lies empty” wording have no independently fixed pre-release source in the checked corpus, so neither can serve as a second source pair without violating the issue's source-selection gate.

No original LP2 page, mark, boundary, or external first-party instruction selects the three punctuation edits or supplies a receiver that turns them into a key. Do not derive a key from these edits, expand to other Blake editions, or search arbitrary spelling/punctuation distances. The result is a bounded historical negative, not evidence that all possible correction channels are impossible.

## Reproduction

Run:

\`\`\`sh
node sims/lp2_blake_chorus_source_diff_sft.cjs
\`\`\`

The script freezes the ASU/Jack Lynch transcript and the signed Cicada quote, asserts equality of all 56 word tokens, applies exactly the three punctuation edits above, and asserts that the result equals the signed text after whitespace removal. It also asserts the two easily misread Blake forms, **letchery** and **every thing**.

**Research status:** no LP2 plaintext, key, cipher mechanism or destination recovered. Issue [#2897](https://github.com/FlareZ123/liber-primus/issues/2897) can close as “no qualifying correction channel found in the preserved source pair; no second pair or LP2 receiver.”
