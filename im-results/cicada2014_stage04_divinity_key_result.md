# 2014 Stage04 page04: literal divinity OutGuess test

**Result: bounded negative.** The literal lowercase password **divinity** changes the extraction, but the resulting bytes contain no authenticated or recognizable payload.

## Exact test

- Carrier: original LP1 page04 JPEG, resources/liber-primus/04.jpg.
- Extractor: OutGuess 0.4, pinned source commit 24810e14327c2bbeedeaadd3e24491f2a4425c02.
- Source-selected command: **outguess -k divinity -r 04.jpg 04-divinity.bin**.
- No password variants, case variants, or alternate carriers were searched.

## Controls

1. The documented default extraction of original page03 reproduced the archived 31,809-byte output byte-for-byte. The extracted object is identified as a PGP-signed message.
2. The default extraction of original page04 reproduced the archived 7,524-byte baseline byte-for-byte.
3. The keyed OutGuess interface independently passed a synthetic known-key round trip on page17, recovering the exact 44-byte control string.

These controls establish that the pinned extractor, default extraction path, and keyed interface work.

## Literal divinity output

OutGuess returned status 0 and reported seed 51019, length 5320. The complete output is preserved at [04-divinity.bin](stage04-divinity/04-divinity.bin).

| Property | Result |
|---|---|
| Length | 5,320 bytes |
| SHA-256 | 16a1964808a1b9674efffb910404ffc7e273319dde5aa155cf32038b661a7fa1 |
| SHA-1 | 1601a36483aef5d408a7c296f493536019c5c9e8 |
| Git blob SHA-1 | a24568aa2773c7faf7f408ad57fc95bf6095a8a9 |
| Shannon entropy | 7.9636 bits/byte |
| Printable ASCII ratio | 0.3799 |
| File identification | generic data |
| Recognized signatures | none |
| Printable runs (24+ characters) | none |
| GnuPG | no valid OpenPGP data found |
| Same as default page04 extraction | no |

The output is therefore not the known PGP message, a recognized file, or readable text. A successful OutGuess exit and nonempty bytes are not evidence of a successful password.

## Decision

Close the page04 literal-divinity test as negative. This rejects only **divinity as the OutGuess extraction key for this original page04 carrier under the pinned OutGuess 0.4 path**. It does not reject the word as a key for another, independently selected operation or carrier. No additional password guessing is justified by this result.

Reproducer: [cicada2014_stage04_divinity_outguess_sft.cjs](../sims/cicada2014_stage04_divinity_outguess_sft.cjs)  
Workflow: [run 43108456185](https://github.com/FlareZ123/liber-primus/actions/runs/43108456185)  
Original default objects: [page03](../resources/external/derived/2014-stage04/03-outguess.asc), [page04](../resources/external/derived/2014-stage04/04-outguess.bin).
