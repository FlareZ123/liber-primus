# Native 2012 MIDI formatting and 50-entry source correction

**Agent10, 25 November 2026. Genuine original-source decoding and bounded LP2 negative.** The signed 2012 MIDI carries formatting in note-on delta times, distinct from the known note-off rank substitution. The recipient-specific Track-1 submission has **50 entries, 48 distinct**, not the archived 49-token derivative. BIRD and WATCH are separated by the same delimiter as every other pair of entries. This invalidates original-source 49-to-49 count arguments, but no unknown LP2 plaintext/key/destination has been recovered.

## Exact source formatting

Pinned original MIDI: neuroretransmit/cicada commit b13600373d3400d75ec4208198019f3d92a304dd, 2012/009-midi-puzzle/song.mid, 10,889 bytes, blob 11924e0e195208c2eea757655035e149fb8a190f. Prior [signature verification](https://github.com/FlareZ123/liber-primus/actions/runs/43136926655) authenticated the inner MIDI and outer email relative to the archived key. The [existing decoder](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/decode.py) ranks note-off pitch+delta, then uses generic word splitting. Prior timing audit found 26 distinct note-on pitch+delta sums in Track2; direct sorted A–Z ranks are nonlinguistic. The delta register itself explains formatting.

For each pair of consecutive letters in the [original signed email](../resources/historical/cicada2012-midi-email.asc) chorus, use zero if adjacent; otherwise gap = 24 + 96*(comma count) + 192*(period count) + 384*(line feed count). This predicts 0 internal, 24 ordinary space, 120 comma, 216 period, 408 line break, 504 comma+line, 984 period+blank line. The rule was observed on the first cycle and compared with the other two repeated cycles, not independent texts. The 238-letter note-off decoded chorus matches all three source letter tapes. The gap rule predicts **711/714** onset deltas, including 710/711 within-cycle interletter gaps. Exact exceptions (zero-based event, expected, actual): (3,24,0), (238,0,576), (476,0,576). The first is the omitted space LET/THE, the other two are repetition-start delays. Second and third cycles each reproduce 55/55 word boundaries with zero false boundaries; first cycle 54/55, zero false. No independent key remains in these within-cycle rest lengths.

## Corrected 50-entry register

Track1 has 558 on/off events. Note-off ranks with the historical alphabet abcdefghiklmnopqrstuvwxyz give its authentic letter tape. The note-on delta histogram is {0:439,24:63,240:4,384:49,768:1,960:2}. The unique 768-tick gap starts MUSCLE after YOUR WORDS ARE. From there every one of the 49 subsequent 384-tick gaps starts a new entry; all other suffix deltas are zero. Hence 50 entries, 48 distinct (BOX and TRAY repeat), including BIRD and WATCH separately. The [corrected list](../resources/historical/cicada2012-midi-50-entries.txt) is derived directly from this timing. Merging those two entries exactly reproduces the [legacy 49-token file](../resources/historical/cicada2012-midi-49-words.txt); preserve the legacy input for past experiments. This establishes encoded segmentation, not what an historical participant eventually submitted. The original task gave recipient-specific words for a 2012 reply, not a universal LP2 key.

## Actual original p36 inverse

The genuine 50-entry payload cannot fill the 2014 49-cell square or p33's 49 black complete words without an unselected deletion. Their prior 49-token negative tests remain correct on the legacy derivative. P36, uniquely 238 runes like the Track2 letter count, has 49 word starts plus its two-rune initial continuation piece: 50 local nonempty hyphen-separated pieces, not 50 complete independent words. This motivates one narrow direct corrected receiver, conditional on physical fragments. Use each of the 50 entries in order as a repeated per-piece GP29 key; freeze the earlier p33 tokenizer (GP digraphs, K→C,V→U,Z→S,Q→C). Both additive signs, no phase or order optimization. All 238 flattened pieces exactly match original p36.

| Model | IoC | Zero-based impossible piece indices under strict plaintext-F transparency |
|---|---:|---|
| Raw p36 | 0.03598907918 | — |
| Subtract | 0.03304612984 | 19,26,34,35,40,46 |
| Add | 0.03318795873 | 5,14,16,17,21,42,45 |

Both ordinary outputs are nonlinguistic and exactly reencrypt all 238 source runes. Exhaustive within-piece hold/consume reachability rejects both signs for the additional universal plaintext-F hypothesis: branch literal F only when C=0 with no key advance; otherwise consume if the resulting P is non-F. Every listed piece has no legal path. This excludes only the fixed decoder and additional strict F convention, not all possible 2012 consumers.

The p50 address arithmetic from the legacy report persists: BIRD=192→p18[3], WATCH=211→p37[3], replacing BIRDWATCH=403→p55[6]. The five p50 cells (5,0,1,3,7) remain, now source ordinals (9,11,15,17,43), all odd rather than even. Old null counts refer only to the legacy 49 tokens. No source authorizes using this participant's list on p50 or discarding HAMMER to form a heap path.

## Reproducibility and decision

The original-byte computations, exact formatting comparison, source segmentation and p36 inverse/F-path enumerations were executed directly in connected JavaScript. The standalone [SFT](../sims/cicada2012_midi_formatting_sft.cjs) is supplied for future replay (not separately CI-executed). The known note-off letter decode is reused, not claimed as new plaintext. **Do not revive the 49-count route, tune 50-entry permutations or invent a MIDI-rest key.** The corrected source and formatting channel are useful historical evidence; the immediate source-count consumer has failed and no independent LP2 operation follows.
