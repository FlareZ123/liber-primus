# Original Cicada audio notes: positive historical MIDI decoder and bounded LP2 negative

Status 17 Nov 2026, Director Issue #1330: **the historical 2012 MIDI method has been reproduced exactly; no authentic unknown LP2 plaintext or key was recovered from the tested 2013–14 audio-to-GP29 maps.**

Evidence: [completed source-verified CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44006765360) and [source-reproduction program](../sims/lp2_cicada_audio_note_2012_source_sft.py). The run attaches full machine-readable JSON results.

## Exact historical positive

The 2012 MIDI source in neuroretransmit/cicada, commit b13600373d3400d75ec4208198019f3d92a304dd, has Git blob SHA-1 11924e0e195208c2eea757655035e149fb8a190f (10,889 bytes). Its [participant-preserved decoder](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/decode.py) uses ascending distinct **MIDI note-off pitch + message delta ticks**, mapping into alphabets with 25 and 23 letters. The first track contains 558 events/25 distinct sums and decrypts to the known beginning "very good you have proven to be most dedicated"; the second has 714 events/23 distinct sums and recovers "let the priests of the raven of dawn". The first track contains the known participant-specific word list. This genuine 2012 known-message positive is independent of the unknown LP2 ciphertext.

## Authenticated source recordings

Three MP3 files passed exact byte hashes before PCM processing. The original 2013 761.MP3 contains 4,010,732 bytes, SHA-256 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460; the original 2014 Interconnectedness MP3 contains 6,651,873 bytes, Git blob SHA-1 09fe068192b76a3697c47ec1d604b527703db798; the 2014 c.mp3 contains 9,288 bytes, Git blob SHA-1 1fbb00303c98bb1430adea408516e12a63b96d6d. Source URLs and hash verification are embedded in the reproducer.

## Source-input screens

All three were decoded to 16 kHz mono PCM. Two independent pitch/onset extraction methods were applied: STFT spectral-flux peaks with dominant-band pitch (FFT), and constant-Q transform onset peaks (CQT). **MIDI pitch mod 29** and **successive pitch interval mod 29** are provisional, unsigned note-to-GP29 maps. The 2012 historical operation actually requires note-off delta ticks; an MP3 waveform supplies no original MIDI messages. These provisional maps must not be called historically validated.

For each eligible event stream: every 300-note contiguous offset, both GP29 additive signs, all nine source-exact unknown LP2 chapter starts, and 20 fixed-seed note-shuffle null scans. IoC is the 29-normalized coincidence score; the previous 1.40 screen threshold was preserved.

| Source | Extractor, map | Events | Best original IoC | Highest shuffled null IoC |
| --- | --- | ---: | ---: | ---: |
| 761 | FFT pitch | 501 | 1.11797 | 1.15612 |
| 761 | FFT interval | 500 | 1.15741 | 1.14384 |
| 761 | CQT pitch | 336 | 1.07918 | 1.12767 |
| 761 | CQT interval | 335 | 1.07788 | 1.12120 |
| Interconnectedness | FFT pitch | 922 | 1.11732 | 1.15289 |
| Interconnectedness | FFT interval | 921 | 1.11668 | 1.17035 |
| Interconnectedness | CQT pitch | 984 | 1.12508 | 1.16323 |
| Interconnectedness | CQT interval | 983 | 1.10698 | 1.14577 |

The largest original score (1.15741, 761 FFT interval) is close to its 20-shuffle maximum of 1.14384, far from 1.40, and its decrypted runes show no legible language. The three-second c.mp3 yields only 13 FFT / 16 CQT note events and is too short for the direct 300-rune screen; it is not a tested negative for that window.

Nine chapters have 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, and 308 original ciphertext runes, respectively. Exact planted addition/subtraction recovered a repeated solved-p57 key-bearing control.

## Conclusion and remaining decision

**Reject only these eight explicit 300-rune additive key projections.** The timing component used in the genuine 2012 MIDI puzzle is still untested against the later MP3s. An extension should pre-register a note-plus-delta serialization using historical 2012 MIDI timing and an independently selected note clock; only then test the R4 hold/spend channel with a planted control. The recordings' spectral peaks often reflect accompaniment rather than isolated melody. No unknown LP2 plaintext, source-authored key, decrypted destination or generalized audio exclusion resulted.
