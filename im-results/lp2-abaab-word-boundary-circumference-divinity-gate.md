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

Across the 16 combinations (2 clocks × 2 polarities × 2 key directions × full/p16–21/p40–53 evaluations):

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

## Scope and next decision

This closes only the tested `ABAAB-on-word-gaps → packet-circumference peel → packet-local DIUINITY` construction. It does not exclude a different consumer of the floral pattern, a different source-selected state machine, or another genuinely specified variable-length cipher.

Do not continue tuning this chain. A successor must bring an independent source clue selecting a different boundary operation; the mere availability of more A/B phases, resets, or key schedules is not sufficient.
