# 2014 Onion5 GEB book code, signed payload, and LP2 transfer gate

## Current conclusion

The 2014 Onion5 signed message is a useful historical control and explains the transition to the sixth onion, but it does **not** currently provide plaintext or a demonstrated key for the 56 unsolved LP2 pages.

The message's trailing coordinate-like entries are a *Gödel, Escher, Bach* book code. A reconstruction dated 2026-11-23 resolves all 14 letter selections and recovers the v2 onion address:

`ut3qtzbrvs7dtvzp.onion`

This is an intermediate 2014 destination, not the unresolved deep-web hash specified by LP2's solved closing material.

## Authenticated Onion5 message

Primary source: [2014-01-onion5-liber-primus.asc](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc).

The signed text contains the sentence “Very good. You have done well to come this far.”, followed by a 24,014-hex-digit payload (12,007 bytes), then these exact lines:

```text
CC:8:6:1
CBIA:3:7:2
CFAF:5:23:6
SPR:1:8:1
7
C[1]:4:5:3
AWDV:6:2:1
C[2]:2:17:5
SC:3:17:1
AOGS:2:8:1
ONION
Good luck.
3301
```

The archived [payload inventory](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/signed-payloads/PAYLOADS.json) records 12,007 bytes and SHA-256 `ebe41c78a0471f145e0177ddfa339c32019fa9eca650ca2dc7d589a13550ed3c`. Parsing the signed hex body to that exact length gives:

| Offset | Size | Identification |
|---:|---:|---|
| 0 | 1,084 bytes | JPEG; small mathematical graphic |
| 1,084 | 1,635 bytes | JPEG; eye image |
| 2,719 | 9,288 bytes | MP3 stream; MPEG frame syncs and LAME3.98.4 metadata |

The [Dukotah artifact report](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/REPORT-A.md) records the PGP signature as verified against the known Cicada key. I have not independently run GPG verification in this invocation. The recent [Cicada Notebook session 125](https://cicadanotebook.com/sessions/125) identifies the visual/audio references as Gödel, Escher, and Bach (the Bach clip is identified as Trio Sonata in G major, BWV 1039) and resolves the book-code selections to the onion address above.

## Sixth-onion continuation and the three squares

The community archive's [sixth-onion README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md) describes the next human solve path:

1. The sixth-onion page carried the LP2 image/hex dump and four OutGuess messages.
2. Those messages indicated that three magic squares from earlier stages were required; the challenge then asked solvers to submit the squares and a Tor CGI hidden-service URL.
3. Successful submission returned three additional “prime pages” (107, 167, 229).
4. Pages 107 and 167 are reported as Vigenère-encrypted with key `FIRFUMFERENCE`; however, applying `FIRFUMFERENFE` to the archived original rune transcriptions under the published GP29 mapping produces a much cleaner, near-complete Koan. The archive's `FIRFUMFERENCE` spelling differs at position 12 (C instead of F) and produces numerous additional errors; it is best treated as a one-symbol transcription error. The recovered text contains “The I is the voice of the circumference.”
5. Page 229 is unencrypted and begins with an instruction to “QUESTION ALL THINGS” and “DISCOVER TRUTH INSIDE YOURSELF,” followed by the first square.

The archived [three-square transcription](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/magicsquares.txt) contains 5×5, 7×7, and 5×5 squares. The third is the 5×5 square also present on LP2 p05; the first appears on prime page 229. These are real historical relationships, but they do not by themselves specify a decipherment of other LP2 pages.

The archived [original sixth-onion form](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.v2-form.html) makes the selection explicit: its three fields are **Order 5 Square, 3301**, **Order 7 Square, 1033**, and **Order 5 Square, 1033**, followed by the solver's onion address. The form's signed message asks for a Tor CGI upload endpoint and a GnuPG public key at `/key.asc`. The captured [HTTP headers](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.headers) include `X-Cicada: 1033`. This is strong evidence for the intended three-square submission and the 3301/1033 values; it still does not specify a cipher operation for the unknown LP2 pages.

## Bounded direct-key transfer test

I reconstructed the 2014 `gematriaprimus.py` key mapping and first used the original 107/167 rune transcriptions as a control. Under the published GP29 mapping, `FIRFUMFERENFE` gives a coherent near-complete Koan, while the README's `FIRFUMFERENCE` variant (C rather than F at position 12) produces substantially more errors. The corrected key's modulo-29 shifts are `[0,19,25,0,28,10,0,11,25,11,20,0,11]`.

I then tested both spellings against LP2. The fixed-key tests covered direct and Atbash-complement key mappings, both additive directions, all 13 starting phases, page-local and continuous key phase, and plaintext-F hold. No readable output appeared on LP2 p0, p15, p55, or across p0–55, even with the corrected `FIRFUMFERENFE` key.

This is a **narrow negative**: direct transfer of these exact 13-symbol keys under the tested GP29 Vigenère/F-hold models is unsupported. It does not rule out a different key schedule, a square-derived operation, or another use of the circumference clue. A separate exploratory use of the p05 square's 16-cell perimeter as a modulo-29 repeating key also produced no readable LP2 text; no further phase or ordering search is justified without a new selector. The 5×5/3301 square's clockwise 16-cell perimeter was also reduced mod29 and aligned at phase zero to the p15 16-prime grid residues in spiral order. Direct and Atbash-complement key maps with both signs produced only `OYEOMRAFELALWHYLG` or `UNIAAOEOEEAABNWIAAEIARY`; no phase or orientation search was performed. This rejects only that literal 16-to-16 alignment.

## What remains unresolved

- No plaintext or cryptographic key for any of the 56 unsolved LP2 pages was recovered here.
- The relationship, if any, between the three-square collection, p05's square, p15's 16-cell grid, and the Koan's circumference language remains unestablished.
- The historical Onion5 address does not identify the 128-hex/64-byte deep-web hash target described by the solved LP2 closing material. The digest algorithm, target bytes, serialization, and destination remain unspecified in the current evidence.

## Recommended next decision

Only pursue the three-square/circumference connection if an original clue selects a concrete, reversible operation and predicts a discriminating result on original LP2 ciphertext. Do not repeat direct `FIRFUMFERENCE` key transfer, arbitrary perimeter-to-key conversions, or unconstrained key searches.

## Reproduction sources

- [Signed Onion5 PGP message](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc)
- [Payload inventory](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/signed-payloads/PAYLOADS.json)
- [Dukotah artifact report](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/REPORT-A.md)
- [Sixth-onion archive and prime-page transcription](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md)
- [Historical Gematria/Vigenère implementation](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/gematriaprimus.py)
- [Three magic squares](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/magicsquares.txt)
- [2026 book-code reconstruction](https://cicadanotebook.com/sessions/125)


## Literal p49–51 four-field records: Director #2890 (26 November 2026)

**Decision:** reject literal consecutive `dialogue:speech:word:letter` records in the printed 32×8 panel. No recovered operand. This is distinct from the seal-digit coordinate tests and running-key searches.

Historical control: the archived 2014 fifth-onion README (blob `d9d09a57fe8a3a76604c8c3c5fa502e720055e91`) records the selected word at each of the fourteen coordinates. Independently indexing those words by the recorded one-based letter position gives 14/14 documented letters. The [23 November reconstruction](https://cicadanotebook.com/sessions/125.html) identifies the solver-linked PDF and counts only speaker labels at printed line starts, skipping introductory narration and indexing the words in the resulting speech; it reports 14/14, versus 11/14 for every speaker change. AMO is the dialogue *A Mu Offering*, not the opening essay. I replayed the selected-word indexing, **not** the full PDF speech/word extraction: the archived PDF bytes were unavailable in this runtime. Thus the full extraction is independently reported, not newly independently verified here.

The fourteen literal title labels are `3PI LML ETOATS ...AF AMO CC CBIA CFAF SPR C[1] AWDV C[2] SC AOGS`. None has the form of an LP2 cell (two case-sensitive characters, first character 0–4). No historical numeric dialogue-index mapping was supplied.

Source: original-image-adjudicated `resources/liber-primus/lp2-grid-256.json`, blob `2550eae357442912220e05dc51147523a61dd75a`. Consecutive groups of four within each physical row give:

| Page | Four-cell records | Literal valid title labels |
|---|---:|---:|
| 49 | 20 | 0 |
| 50 | 26 | 0 |
| 51 | 18 | 0 |
| Total | 64 | 0 |

Even granting an unspecified title-label substitution, p51 row 6 columns 5–8 is `2O 00 1v 2t`. Its speech field is zero in **both** conventional positional interpretations (base60 and base59), whereas the historical scheme requires a positive one-based speech index. The other literal zero, p51 row 2 column 1, occupies a title field. Thus the speech-field failure does not require a decision about the ambiguous radix, the choice of edition, an upper bound on speech length, or any optimization over dialogue indices.

Reproducer (Node, run from repository root; reads the original-adjudicated source):
```js
const g = require('./resources/liber-primus/lp2-grid-256.json');
const labels = new Set('3PI LML ETOATS ...AF AMO CC CBIA CFAF SPR C[1] AWDV C[2] SC AOGS'.split(' '));
for (const p of g.pages) {
  const records = Array.from({length:p.tokens.length/4},
    (_,i)=>p.tokens.slice(4*i,4*i+4));
  console.log(p.page, records.length,
    records.filter(r=>labels.has(r[0])).length,
    records.flatMap((r,i)=>r[1]==='00'?
      [{row:Math.floor(i/2)+1, column:2+4*(i%2),record:r}]:[]));
}
```

The historical control replay and original record counts were executed in V8. Do not try offset/modulo remaps, alternate field orders or dialogue-number enumerations merely to make these records legal. Reopen only with an authentic independent instruction specifying the representation and addressing convention. No 64-character candidate is justified.
