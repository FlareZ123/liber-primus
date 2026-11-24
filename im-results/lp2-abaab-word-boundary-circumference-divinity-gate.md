# ABAAB word-boundary resegmentation + circumference peel + DIVINITY: negative gate

## Decision

A source-motivated **word-level, variable-length transducer** was tested and rejected. The experiment combines the p55 floral `ABAAB` pattern as a mask over interword gaps with the solved p57 instructions to shed circumferences and find the DIVINITY within.

The transformation is exactly reversible when the original word lengths and peeled edge runes are retained as a sidecar. None of the tested outputs resembles source-native English; the resegmentation does not improve on the simpler original-word DIVINITY-interior baseline.

This is an exploratory interpretation, not an established Cicada instruction. In particular, the `ABAAB` reading is a participant-derived interpretation of a visible p55 motif; the signed 2016 message's “words are the map” wording does not itself specify this boundary consumer.

## Locked hypothesis

Input is the 2,896-word, 12,956-rune p0–p55 transcription, preserving carried words across page boundaries.

1. Apply the five-site `ABAAB` mask to the **gaps between printed words**.
2. Test both polarities: A-keeps/B-merges and B-keeps/A-merges.
3. Test a continuous global clock and a clock reset when the next word starts on a new physical page.
4. Concatenate words across merged gaps to form variable-length packets.
5. Shed each packet's first and last rune, retaining those edge runes and the original word lengths as a reversible sidecar.
6. Apply the p57 DIVINITY key (`DIUINITY`, GP29 indices `[23,10,1,10,9,10,16,26]`) to each packet interior, resetting the key at each packet. Test both additive directions.

The p16–p21 and p40–p53 scores are computed only from packets whose source words all lie inside the respective page range; packets crossing a range boundary are excluded. The full-book grouping is performed before selecting either holdout.

## Results

Bigram scores use a Shakespeare GP29 within-word model with the same normalization for all candidates. Native controls score approximately `-2.28` (Shakespeare) and `-2.31` (Gibran). Applying DIVINITY to the original printed-word interiors, without resegmentation, scores `-5.112` and `-5.074` for the two directions.

Across eight transform variants (2 clocks × 2 polarities × 2 key directions), each scored on the full book, p16–p21, and p40–p53 (24 measurements):

- Full-book packet interiors: bigram log score `-5.203` to `-5.226`.
- p16–p21: `-5.116` to `-5.383`.
- p40–p53 holdout: `-5.134` to `-5.276`.
- Interior IoC remains approximately `0.0342–0.0347`, versus approximately `0.0594–0.0596` for native controls.

The best p40–p53 result (`-5.134`) is still worse than the direct original-word DIVINITY baseline (`-5.074`) and far below native language. The mask/peel/key sequence does not recover plaintext.

## Reproduction

```bash
node sims/lp2_abaab_word_boundary_circumference_divinity_gate.cjs
```

The script:
- parses the original 2,896 words and their physical-page membership;
- tests both A/B polarities, global/page-reset clocks, and both key directions;
- asserts exact round-trip reconstruction using the sidecar word lengths and shells;
- reports the full-book, p16–p21, and p40–p53 bigram/IoC measurements.

## Key-independent period-8 Vigenere obstruction

The direct DIUINITY test above is only one key. A stronger gate covers **every fixed 8-symbol GP29 Vigenere key**, resetting key phase at the start of each merged packet.

For each packet interior, count ciphertext symbols separately at phases 0–7. At any phase, a fixed additive key merely permutes the 29 symbol labels. Therefore the maximum possible count of any one plaintext symbol is bounded by the sum, over the eight phases, of the largest ciphertext-symbol count at that phase. This is independent of the key vector and avoids searching the `29^8` possible keys.

The comparison controls are letter-only GP29 streams (spaces omitted), matching the packet-interior channel. The threshold is the minimum maximum-symbol frequency over every same-length sliding window in Shakespeare, Gibran, and Emerson.

| Clock | Gap polarity | Range | Interior runes | All-key cap | Minimum reference | Gap |
|---|---|---|---:|---:|---:|---:|
| Global | A keeps | Full | 9,497 | 431 | 1,013 | 582 |
| Global | B keeps | Full | 10,638 | 482 | 1,145 | 663 |
| Page reset | A keeps | Full | 9,471 | 424 | 1,009 | 585 |
| Page reset | B keeps | Full | 10,660 | 507 | 1,147 | 640 |
| Global | A keeps | p16–p21 | 1,155 | 75 | 96 | 21 |
| Global | B keeps | p16–p21 | 1,288 | 84 | 109 | 25 |
| Page reset | A keeps | p16–p21 | 1,156 | 79 | 96 | 17 |
| Page reset | B keeps | p16–p21 | 1,298 | 83 | 110 | 27 |
| Global | A keeps | p40–p53 | 2,205 | 127 | 191 | 64 |
| Global | B keeps | p40–p53 | 2,471 | 148 | 215 | 67 |
| Page reset | A keeps | p40–p53 | 2,204 | 135 | 191 | 56 |
| Page reset | B keeps | p40–p53 | 2,468 | 155 | 215 | 60 |

Every tested clock, polarity, and range is excluded for **all** period-8 additive keys, not merely DIUINITY. A deterministic planted period-8 key on a native Shakespeare stream split into the same global-A-keep packet lengths gives a bound of 1,127 against a planted plaintext maximum frequency of 1,127, confirming that the bound admits a genuine keyed plaintext.

This is the decisive result for the locked ABAAB-gap → packet-circumference → packet-local period-8 Vigenere family. It does not exclude a different segmentation selector or a different value-changing operation.

## Scope and next decision

This closes only the tested `ABAAB-on-word-gaps → packet-circumference peel → packet-local DIUINITY` construction. It does not exclude a different consumer of the floral pattern, a different source-selected state machine, or another genuinely specified variable-length cipher.

Do not continue tuning this chain. A successor must bring an independent source clue selecting a different boundary operation; the mere availability of more A/B phases, resets, or key schedules is not sufficient.
