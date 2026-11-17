# Original Cicada audio as musical key material: historical receiver and original LP2 decision

**Status (17 November 2026, Director Issue [#1330](https://github.com/FlareZ123/liber-primus/issues/1330)).** The authentic 2012 Cicada MIDI encodes plaintext in **pitch plus the sounding duration of each note**, an operation that can be recovered through synthesized PCM and MP3 audio. A source-frozen, literal transfer of that receiver to original 2013/2014 recordings yields **no authentic unknown-page Liber Primus plaintext, key or destination** on either standard GP29 addition or the calibrated original R4 skip/rejection engine. A separate observable stereo-difference receiver also fails. All claims below distinguish the real 2012 known-message positive from exploratory 2013/2014 GP29 key lifts.

## 1. The historical musical operation is physically audible

The original 2012 source `song.mid`, preserved by [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/song.mid), is **10,889 bytes**, Git blob SHA-1 `11924e0e195208c2eea757655035e149fb8a190f`. MIDI resolution is **96 ticks per beat**; both text-bearing tracks use tempo **500,000 microseconds per beat** (120 BPM). The [original participant decoder](https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/decode.py) orders the distinct values of `note_off_pitch + note_off_message_delta_ticks` and maps them to two historical letter alphabets.

A separate event-by-event parse shows that **every note-off is immediately preceded by a matching note-on**. Its MIDI delta equals the actual note-on-to-note-off sounding duration for **558/558** events on track 1 and **714/714** on track 2. Their only durations are **24, 96, 192 and 384 ticks**, corresponding to **0.125, 0.5, 1 and 2 seconds**. Count by track:

| Track | 24 ticks | 96 ticks | 192 ticks | 384 ticks | Encoded symbols | Distinct pitch+duration sums |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 214 | 168 | 161 | 15 | 558 | 25 |
| 2 | 270 | 210 | 210 | 24 | 714 | 23 |

The two decoded known-message beginnings are `verygoodyouhaveproventobemostdedicated` and `letthepriestsoftheravenofdawn`; track 1 also contains participant-specific words. **The historical delta operand is precisely the audible note length** on these tracks, not an unobservable MIDI-only timing property. The 2012 audio can therefore convey the same operation when tones have identifiable boundaries and pitches.

This distinction was checked independently of all unknown LP2 pages. The [original 2012 waveform/MP3 positive SFT](../sims/lp2_cicada_2012_waveform_positive_sft.py) takes both complete, byte-pinned tracks, renders all original notes at their original times as sine tones or three-harmonic tones, and reconstructs note boundaries by smoothed amplitude, pitch by FFT and duration by the four historical classes. The complete two tracks recover **558/558 and 714/714 exact pitch-duration symbols**, and the **entire known plaintext** matches, including after **128-kbps MP3 encode/decode** on the harmonic signal. This is a positive for the **rendered original MIDI melodies**, not proof that the later music carries an analogous message. [Completed original-source waveform/MP3 positive run 44020454768](https://github.com/FlareZ123/liber-primus/actions/runs/44020454768), with all six exact 558/558 and 714/714 text-recovery control records, and [manual reproduction workflow](../.github/workflows/agent3-cicada2012-waveform-positive-manual.yml).

## 2. Authenticated later audio and original LP2 input

Source-hash verification pinned all three candidate recordings:

| Audio source | Bytes | Authentication |
| --- | ---: | --- |
| 2013 `761.MP3` | 4,010,732 | SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460` |
| 2014 `Interconnectedness` MP3 | 6,651,873 | Git blob SHA-1 `09fe068192b76a3697c47ec1d604b527703db798` |
| 2014 `c.mp3` | 9,288 | Git blob SHA-1 `1fbb00303c98bb1430adea408516e12a63b96d6d` |

The original source URLs and digest checks are in [the acquisition SFT](../sims/agent3_fetch_audio_sources.py). Original-image GP29 source values across nine original unknown-page chapters of lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008 and 308** were used **without modifying ciphertext or word boundaries**. The candidate target is 300 consecutive plaintext runes on a single chapter start, with the previously fixed decision criteria for direct and R4 models. For the R4 detector, 2,896 original printed word starts are source-verified.

Earlier literal **FFT/CQT pitch-only and pitch-interval** projections were screened under both original additive signs, all eligible 300-note windows, 20 matched shuffled streams, and source-pinned R4. None met the source-independent original-input thresholds. Details:

| Original audio / map | Best direct GP29 IoC | Matched shuffle max | Best R4 guarded score | Matched shuffle max |
| --- | ---: | ---: | ---: | ---: |
| 761 FFT pitch | 1.11797 | 1.15612 | -96.92 | -83.03 |
| 761 FFT interval | 1.15741 | 1.14384 | -90.20 | -78.26 |
| 761 CQT pitch | 1.07918 | 1.12767 | -101.85 | -81.27 |
| 761 CQT interval | 1.07788 | 1.12120 | -89.46 | -77.75 |
| Interconnectedness FFT pitch | 1.11732 | 1.15289 | -99.45 | -79.58 |
| Interconnectedness FFT interval | 1.11668 | 1.17035 | -83.78 | -78.74 |
| Interconnectedness CQT pitch | 1.12508 | 1.16323 | -110.03 | -89.60 |
| Interconnectedness CQT interval | 1.10698 | 1.14577 | -103.99 | -93.83 |

Original source and reproducible evidence: [FFT/CQT original-input SFT](../sims/lp2_cicada_audio_note_2012_source_sft.py), [run 44006765360](https://github.com/FlareZ123/liber-primus/actions/runs/44006765360), [R4 native Rust source gate](../sims/lp2_cicada_audio_note_r4_source_sft.py), [run 44008076074](https://github.com/FlareZ123/liber-primus/actions/runs/44008076074). These are controls on **earlier provisional** representations; the later tests below evaluate the actual 2012 timing operation.

## 3. Literal sounding-duration key on original LP2

The complete [historically timed original-input SFT](../sims/lp2_cicada_audio_pitch_duration_gate_sft.py) was executed successfully in [manual CI 44019647646](https://github.com/FlareZ123/liber-primus/actions/runs/44019647646), preserving its original-source and score artifact. Freeze the following receiver without tuning against LP2: decode original MP3 to **16-kHz mono**, detect note onsets from constant-Q spectral flux, select strongest pitch after onset, estimate note ending from a **35% local CQT-amplitude drop** (or next same-pitch onset), then assign one of the four **authentic 2012 duration classes** at 120 BPM. The hypothetical LP2 key is **`(MIDI_pitch + assigned_duration_ticks) mod 29`**. This GP29 arithmetic lift is an exploratory original-book operation, not a recovered Cicada-authored key instruction.

The real 761 CQT receiver gave 336 events, 18 pitches, **41 distinct pitch+duration sums** and 53.87% duration-class agreement; Interconnectedness gave 984 events, 20 pitches, **53 sums** and 29.78% duration-class agreement. The actual source 2012 tracks have 25 and 23 sums under exact notes. Only 14.29% (761) and 17.99% (Interconnectedness) of timed code values fell into the authentic 2012 track-1 codebook. The synthetic first-120-note 2012 CQT control, which is intentionally weaker than the direct waveform control above, gives 134 detected events, **97.01%** classified durations and **100%** membership of the source track-1 codebook; it cannot correctly segment every original note, a limitation visible before any LP2 screen.

**Exact original-cipher results:**

| Original audio / timed map | Notes | Best direct IoC | Direct shuffled max | Best R4 score (nats) | R4 shuffled max |
| --- | ---: | ---: | ---: | ---: | ---: |
| 761 mono CQT pitch+duration | 336 | **1.085641** | 1.137369 | **-97.06649** | -76.89341 |
| Interconnectedness mono CQT pitch+duration | 984 | **1.119264** | 1.161940 | **-88.95317** | -78.03951 |

Both direct signs tested on each of nine original section starts and every eligible 300-note key offset. Direct keys used 20 seeded note-shuffle screens, authentic solved-p57 GP29 planted positives and pre-set **IoC 1.40** minimum. The R4 Rust engine and source language-model files were hash-pinned to [pnotisdev/cicada3301 commit 15200c67](https://github.com/pnotisdev/cicada3301/tree/15200c67abee106913ba01ff504c5b6e88d16cc7), with the previously published **q=0.81** collision redraw, **nu=0.42** mid-word null, **hold/spend** key clocks, both signs, four matched shuffled keys and the pre-calibrated **+29.7992-nat** threshold. The four planted source-key R4 positives recovered exact offset zero with **+140.18, +167.75, +165.83, +165.23 nats**.

The real three-second `c.mp3` gives only 15 CQT notes (14 in stereo difference), below the minimum 300-symbol window. No original test score cleared its frozen decision threshold or its matched null maximum. The decoded rune candidates are nonprose.

## 4. Canonical stereo difference as an independently observable audio receiver

Both full-length recordings are stereo, with source left/right correlations of **0.924716** (761) and **0.978087** (Interconnectedness). Rather than try arbitrary source separation or musical preprocessing, the [fixed stereo-side SFT](../sims/lp2_cicada_audio_stereo_side_sft.py) extracts only the conventional **`(L-R)/2`** channel, using the same 2012 duration classes, GP29 key lift, direct and published R4 original-input controls. [Completed original source CI 44020571812](https://github.com/FlareZ123/liber-primus/actions/runs/44020571812).

| Original stereo side key | Note events | Distinct timed code values | Best direct IoC | Shuffled direct max | Best R4 score | Shuffled R4 max |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 761 | 371 | 56 | **1.107625** | 1.144482 | **-97.08744** | -79.09234 |
| Interconnectedness | 951 | 51 | **1.122497** | 1.153534 | **-93.09661** | -69.88501 |

Again, **neither original nor stereo-side source-timed receiver** yields the planted-calibrated 1.40 IoC or +29.799-nat R4 threshold, and both are below their matched shuffle maxima. This is a scoped negative for the traditional side-channel projection, not a claim to have inspected every possible audio layer.

## 5. Current inference and testable continuation

The 2012 pitch-plus-duration technique is a **verified, source-derived operation** and can be independently recovered from audible synthesized notes. It does **not** provide a key that decodes the original LP2 unknown pages under the explicitly calibrated direct GP29 and R4 transfer variants. None of the original 2013/2014 MP3 note streams presents a clean 25/23-value historical codebook, and the stereo-side route fails the same original-input gate. The authentic 2014 Interconnectedness also already has a [known historically successful OpenPuff role](openpuff-jpeg-capacity-gate.md): extracting the original 745-byte magic-square submission data. The ID3 payload in 2013 761 separately carries the known PARABLE text. Neither fact warrants treating the audio waveform as an LP2 pad.

**Retire exactly the source-pinned pitch, interval, four-duration literal code and conventional stereo-difference GP29 key lifts under both tested original-cipher receivers.** Do not reinterpret arbitrary tempo, timbre, note dictionaries, channel offsets or cipher modes to improve a near-null score. Another audio attempt would need an independent first-party clue specifying an isolated musical part, its codebook and GP29 state/clock, or an independently readable 150-rune original plaintext. The overall LP2 solution remains open: **56 unknown pages, no recovered creator-written unknown-page key, authentic unknown-page plaintext or final destination**.
