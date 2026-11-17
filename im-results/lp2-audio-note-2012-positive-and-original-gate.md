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

## R4 mid-word-null/anti-repeat original-input extensionn

A **separate**, previously established original-cipher detector was applied to the same frozen FFT/CQT pitch and interval note keys: the source-pinned native Rust R4 model and language-model array from pnotisdev/cicada3301 commit 15200c67abee106913ba01ff504c5b6e88d16cc7 (source code and npz verified against three pinned Git object SHA-1s before execution). The source-run program is [lp2_cicada_audio_note_r4_source_sft.py](../sims/lp2_cicada_audio_note_r4_source_sft.py); [completed original audio R4 CI run 44008076074](https://github.com/FlareZ123/liber-primus/actions/runs/44008076074) includes the complete JSON artifact and per-source outcomes.

All original unknown LP2 ciphertext and its 2,896 word boundaries were reconstructed from the physical 57-page rune transcription, byte-checked page by page against the canonical GP29 source indices. On each of nine chapter initial 300-rune windows, both additive signs and both **hold / spend** pointer conventions were tested, with fixed q=0.81 anti-repeat and nu=0.42 mid-word-null probabilities. Each eligible note representation had four fixed-seed matched shuffled-note false-key screens. Score is the published guarded likelihood ratio; the previously calibrated R4 n=300 decision threshold is **S >= 29.7992 nats**.

Four planted positive controls generated original-like 300-rune ciphertext with the *same real 761-note source key*, plus 23–26 keyless interior runes and anti-repeat redraw logic. The native R4 decoder recovered all four exact source-key offsets at zero with scores **151.98, 160.45, 154.92, 129.40** for hold(+), hold(-), spend(+), spend(-) respectively. These pass the source-independent 29.7992-nat threshold by wide margins.

| Source | Note map | Best real S_guard | Matched shuffled-note max |
| --- | --- | ---: | ---: |
| 761 | FFT pitch | -96.92 | -83.03 |
| 761 | FFT interval | -90.20 | -78.26 |
| 761 | CQT pitch | -101.85 | -81.27 |
| 761 | CQT interval | -89.46 | -77.75 |
| Interconnectedness | FFT pitch | -99.45 | -79.58 |
| Interconnectedness | FFT interval | -83.78 | -78.74 |
| Interconnectedness | CQT pitch | -110.03 | -89.60 |
| Interconnectedness | CQT interval | -103.99 | -93.83 |

The best original score, -83.78, is more than **113 nats below** the calibrated threshold and also fails to exceed the shuffled-note maxima. The original c.mp3's 13/16 events remain ineligible as direct n300 keys. The published original-n300 likelihood detector does not output a candidate. This excludes a more plausible insertion/anti-repeat concealment of *the same eight particular source-derived pitch streams* under the tested R4 settings.

## Consolidated conclusion and remaining timing-specific decision

**Retire the eight exact FFT/CQT pitch/interval modulo-29 GP29 running-key projections under both direct additive and published source-pinned R4 hold/spend mid-word-null models.** There is no original-cipher plaintext, candidate key, or destination. The genuine 2012 MIDI positive relies on a **note-off pitch + MIDI event-delta tick sum**, a piece of musical timing information **not present as MIDI messages in the 2013/2014 compressed audio**. A plausible final historically calibrated extension must first preselect and justify a PCM-to-MIDI-like pitch-plus-delta clock independently of any LP2 scores. Freeze that transformation and test it with a wrong-track control before deciding whether the wider audio route deserves continuing. The ordinary accompaniment-dominated peaks and original 2013 ID3 tag text could fully explain the surviving music. Never rescue the rejected source-key projections with arbitrary pitch permutation, tempo tuning or new post hoc alphabets.
