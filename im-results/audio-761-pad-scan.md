# Original Cicada 2013 audio 761.MP3 as a literal LP2 running pad

**Classification: complete bounded original-source key inversion search, negative; no decrypted LP2 plaintext or identified key. Agent 45, 2026-11-10.**

## Source-directed hypothesis

This is a different source family from Liber Primus image bytes, arbitrary pseudorandom seeds, or LP2 number-table keys. A real artifact published by Cicada in the **2013** puzzle, \`audio/761.MP3\`, contains an ID3 user-text field with **"Parable 1,595,277,641"** and the poem that appears in the later **LP2 PARABLE**. The historical linkage makes the file a concrete candidate for a running key, without assuming its audio samples actually encode a cipher. Its original exact byte content is pinned to [rtkd/iddqd commit f2267b0](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3).

The [original downloaded MP3](https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) was **4,010,732 bytes**, SHA-256 \`83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460\`. The 206-byte ID3 tag contains the named later Parable and is excluded from the 4,010,526-byte compressed-audio pad. The test reads the binary file directly, not an MP3 transcription, waveform resampling, or re-encoded audio.

## Frozen cipher family

Use each of the **4,010,526 original compressed audio bytes**, in their natural forward order, as a section-start additive mod-29 candidate key. Two declared byte-to-key symbol reductions, \`byte % 29\` and \`floor(byte*29/256)\`, are tested with both sign directions. Every safe byte start is tested without using an arbitrary shortlist of mystical offsets. The original LP2 page0 first **24 runes** are screened with exact hidden-skip Viterbi (up to **two collision-rejected key draws per emitted rune**, with fixed 3.5-unit skip penalty and a Shakespeare-trained GP trigram model). The best 400 head candidates are then decoded on **all first 220 runes**, with the same forward mechanism and key source.

Every pad/reducer/sign combination has **4,009,867 safe offsets**, yielding exactly **16,039,468 candidates** tested, before the head shortlisting. The selected six strongest full220 decoders are also evaluated on the first220 runes from independent LP2 pages 1 and 5 at their same selected byte offsets (a *page-reset* held-out variant). This evaluates a finite source-specific cipher family, not every way an MP3 waveform could be turned into a keystream.

## Executed results

**Successful manual GitHub Actions [run 42755802150](https://github.com/FlareZ123/liber-primus/actions/runs/42755802150)**, Node 22, original source pinned to immutable commit.

| Evidence | GP trigram score per rune, higher is better |
|---|---:|
| Source-true planted LP1 plaintext, 220/220 correctly recovered, 7/7 hidden key skips | **−2.50546** |
| Real LP2 best of top400 short-window candidates, first220 runes | **−5.23131** |
| Real six strongest candidates, page1 first220 held-out | **−5.68580 to −6.32006** |
| Real six strongest candidates, page5 first220 held-out | **−5.77643 to −6.41931** |

The strongest long-window LP2 candidate is \`mp3-payload-scaled29\`, **sign −**, audio payload **offset 2,237,650**, score **−5.231307** per rune and two inferred extra pad draws. Its decoded 40 GP indices are \`[23,10,15,18,20,23,4,18,12,10,14,3,23,19,28,18,6,15,3,20,26,16,5,18,5,15,17,6,7,18,2,9,1,18,9,21,6,10,2,19]\`, with no English words. Page1 heldout is −6.18969 and page5 −5.95409. The best 24-rune head by itself is at a **different** audio offset 2,357,308 and head score −2.89385; its dominance does not survive a longer window.

**Positive control:** Encrypt independently known **LP1 solved text**, 220 real GP symbols, under the actual downloaded audio's \`byte%29\` pad at offset **3301**, positive encryption sign and 82%-chance repeat-triggered additional key consumption (seed \`0x7613301\`). A fixed-key exact Viterbi inversion recovers **220/220 original runes** and exactly **seven** additional pad draws, full score −2.50546. Its 24-rune head score is −2.55703. This validates the full decoder given the true key/offset. A **second exhaustive positive-control search** then scored that exact 24-rune planted ciphertext at all **4,009,867** safe start offsets in its correct modulo-29/sign+1 family. The **correct key ranked 1st of 4,009,867**, head score **−2.55703**; the best wrong offset (108,248) scored **−2.81667**. [Successful Actions run 42756732792](https://github.com/FlareZ123/liber-primus/actions/runs/42756732792), runnable source `sims/audio_761_plant_rank.cjs`. This confirms the top-400 filter can retain a genuine audio-pad key with seven key skips against all alternative offsets *within the true mode*. It does not demonstrate rank against the other three reducer/sign families or different skip distributions, and does not rule out audio-derived keys outside the tested family.

### Interpretation and limitations

The 400 strongest LP2 short-window candidates did **not** yield a meaningful 220-rune plaintext or survive straightforward page-reset generalization. The 16,039,468-count is an **exact candidate test count**, and no separate whole-search empirical null p-value is claimed. This test does not cover reverse-ordered audio bytes, alternative PCM transformations (with direct decoded PCM tested separately below), chained/keyed hashes of the file, alternative key byte encodings, unknown output rune permutations, page/section offsets other than literal byte positions, more than two skipped draws, or symbol-by-symbol variable key generation. The page1/page5 held-out tests reset the key at the same selected byte offset; an actual continuous cross-page pad could advance instead. Therefore **no evidence** that original compressed MP3 bytes form a usable additive LP2 key was recovered by this bounded screen.

**Reproducer:** \`node sims/audio_761_pad_scan.cjs\` with \`LP761_MP3\` pointing to the original file. One-time workflow \`.github/workflows/audio-761-pad-scan.yml\` downloads the immutable source and invokes the code. All offsets, source SHA, planted skip count, full-score shortlist and heldout scores are emitted as parseable JSON in the successful run.

## Decoded historical AUDIO/761.MP3 waveform as a key source (Agent 28)

This tests the **decoded waveform samples**, a distinct and historically grounded source that the preceding compressed-audio-byte offset search did not cover. The original pre-LP2 2013 `761.MP3` was fetched from the immutable [archived commit](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) and decoded using FFmpeg to **mono signed16-bit little-endian PCM at the source sampling rate**, with no user-selected resampling. The resulting waveform contains **7,365,632 samples** and its decoded PCM SHA-256 is `7859a94f648eb0d3ca1ee94d8aeeb8606c4a2d2cb68c8a8ae95171b4d81ebb9b`. FFmpeg's precise decoder output bytes, SHA and source URL are retained in the successful CI job.

Two concrete rune-pad projections of those actual PCM samples were frozen before scanning original LP2: normalized signed16 sample modulo29, and the low eight bits of each sample modulo29. Both ± arithmetic signs were screened with exactly the same collision-only rejected-key Viterbi used for prior JPEG/MP3 byte-source tests. Every **7,364,973** safe sample offset was evaluated for **each of the four source/sign settings**, producing **29,459,892 original page0 first24-rune head evaluations**. The top400 head candidates across all four configurations were extended to 220 actual page0 runes, then compared on two different original pages with the same source offsets.

| Source-controlled original result | Trigram log likelihood per GP rune, higher better |
| --- | ---: |
| Best of 400 shortlisted, p0 first220, signed16 modulo29, negative sign, offset **4,964,408** | **−5.121655634** |
| That same source key on separate original p1 first220 | **−5.936426765** |
| That same source key on separate original p5 first220 | **−5.649533410** |
| Second-best full p0 model, low byte modulo29, negative sign, offset **5,465,669** | **−5.156150205** |
| Blind source-true English GP control, 220 runes, original PCM modulo29 | **220/220 exact recovered** |

The winning full-original candidate decoded p0 to `ALUSTUEOPFBISOREBARDECEDNFULPBRWSWOLBSFIATRRCFB` over its first45 GP letters, with **five** inferred hidden key skips. The best short24 head score alone, **−2.82446** at a different sample offset **5,263,049**, deteriorated when decoded over 220 runes. None of the actual p0, p1, or p5 candidate outputs constitutes credible prose or a source-authentic decryption.

**Blind source-native original-waveform positive:** independently known solved-Cicada text was encrypted as **220 genuine GP runes** using the actual signed16-mod29 PCM source at hidden sample offset **3301**, positive sign, and 15 collision-triggered secret pad rejections. With neither offset nor skips supplied to the search, the correct offset ranked **first among all 7,364,973 possible offsets in that same true source/sign family** on a 24-rune head, versus nearest incorrect head −2.86427. The full 220-rune decoder recovered **all 220/220 GP plaintext runes and all 15 skipped pad draws** exactly. The true model is guaranteed to remain in the top400 within that source/sign family; no claim is made that this constitutes a full cross-source/sign ranking.

[Exact executable](../sims/audio_761_pcm_keyskip_scan.cjs), [opt-in workflow](../.github/workflows/audio-761-pad-scan.yml) with input `probe=decoded-pcm`, successful [GitHub Actions run 42840114636](https://github.com/FlareZ123/liber-primus/actions/runs/42840114636). This is a bounded source-true negative for the two fixed sample-to-pad conventions, both signs, literal sample indices and the specified collision-keyskip model. The experiment does **not** exclude a stereo-channel rule, different resampling, spectral transforms other than the specific carrier and direct note/interval/rhythm mappings below, synchronization of lyrics/melody to page boundaries, other keyed projections, changing alphabets, or an unknown encoded intermediate.


### 15.4–16.1 kHz high-band carrier and phase test (Agent 47)

The earlier PCM report noted a persistent component in the 15.4–16.1 kHz band but did not test its modulation. A dedicated original-audio workflow now decodes the pinned 761.MP3 to 44.1 kHz stereo float PCM and computes an 8,192-point Hann-windowed FFT every 4,096 samples (1,797 frames over 167.021 seconds). It records the left, right, mid and side channels, the high-band envelope, musical chroma, and the complex phase at the dominant carrier bin.

- **Frequency:** bin 2,906, **15,643.872 Hz**, is the dominant peak in 1,774/1,797 left frames, 1,739/1,797 right frames, 1,774/1,797 mid frames and 1,723/1,797 side frames. The peak does not hop between distinct frequencies; simple FSK is unsupported.
- **Absolute phase:** weighted phase coherence at orders 1–4 is below **0.02 in every individual channel**. The BPSK projection changes state in 763–768 of 1,797 frames, with median runs of two frames; the linear phase fits have 3.9–8.0 rad residual RMS. There is no stable BPSK/QPSK phase constellation or coherent absolute carrier.
- **Stereo differential phase:** the left-minus-right phase is highly coherent (order-1 coherence **0.9946**, order-2 **0.9795**) with **0.116 rad** linear-fit residual and only 11 projected state transitions. This is a nearly fixed inter-channel phase relationship, not a differential phase bitstream.
- **Amplitude:** median-threshold runs have a two-frame median and no stable symbol clock. The high-band energy fraction is below 0.1% in each derived channel. The measured envelope therefore supplies no evidence for a simple ASK channel either.

**Interpretation:** the reported high-frequency feature is a persistent narrowband spectral peak, but it lacks the frequency hopping, coherent phase states, or stable amplitude symbol timing expected of a straightforward FSK/PSK/ASK payload. Do not treat this line as a recovered key stream. This rejects only simple modulation of this measured carrier; it does not exclude other spectral transforms, stereo-specific pad extraction, resampling, or synchronization to the melody/lyrics.

Reproducer: [spectral/phase probe](../sims/audio_761_spectral_modulation_probe.cjs), [path-filtered workflow](../.github/workflows/audio-761-spectral-modulation-probe.yml), successful original-audio [phase run 42896300684](https://github.com/FlareZ123/liber-primus/actions/runs/42896300684) (the preceding amplitude/frequency run is [42895698884](https://github.com/FlareZ123/liber-primus/actions/runs/42895698884)). The JSON artifact contains the per-frame phase and envelope series.


### Direct musical note, interval and rhythm sequences as GP29 keys (Agent 47)

The high-band carrier test does not settle whether the audible music itself supplies a key. A bounded follow-up used the extracted left/right dominant-note sequences as direct 29-symbol additive key streams under the existing collision-aware decoder.

The test generated **88,512** candidates from frame-level and event-level MIDI notes, signed note intervals, and note-event durations measured in 4,096-sample hops. It tested forward/reversed audio order, both arithmetic signs, every start offset leaving 660 key symbols (the maximum three draws per each of 220 plaintext runes), and the six documented D-flat guitar open-string MIDI offsets **[37,44,49,54,56,61]**. Each of the eight LP2 sections received the same 24-rune head ranking and top-24 220-rune Viterbi evaluation.

| LP2 section | Best 220-rune score |
| ---: | ---: |
| 0 | −5.208 |
| 1 | −5.475 |
| 2 | −5.441 |
| 3 | −5.457 |
| 4 | −5.563 |
| 5 | −5.346 |
| 6 | −5.535 |
| 7 | −5.566 |

The best short-head matches do not survive the full window: decoded strings remain incoherent, with no authentic plaintext. The best full-window score (section 0, −5.208) is far below the independently planted control (approximately −2.49/rune) and is not a decryption. This is a negative for direct MIDI/mod29, signed-interval/mod29, and duration-hop/mod29 key mappings, including the source-derived open-string offsets. It does **not** test lyric-to-text synchronization, note-to-fretboard transposition, or a different music-derived intermediate; those remain hypotheses requiring a more specific clue.

Reproducer: `sims/audio_761_note_key_probe.cjs`; workflow: `../.github/workflows/audio-761-spectral-modulation-probe.yml`; successful original-audio [note-key run 42897650301](https://github.com/FlareZ123/liber-primus/actions/runs/42897650301).


## Historical Parable-number seed inversion (Agent 22)

The original 2013 Cicada AUDIO/761.MP3 ID3 tag announces the later solved PARABLE and 1,595,277,641 = 1,259 × 1,031 × 1,229, its three GP clause primes. It is a genuine prior source, so a direct reproducible seed derivation is worth testing separately from the original audio-byte pad above.

A finite original-input program (sims/audio761_numeric_prng_seed_probe.cjs) tests eight historical integers (the tag number, its three factors, 761, 167, 3301, 1033) through six deterministic 32-bit generators, page-reset and book-continuous clocks, five mod29/rank28 reversible input families and both signs: **960 exact original-cipher candidates** covering all 12,956 runes. The top source-trained GP unigram log score is **−4.22930919 nats/rune** (761, Numerical Recipes LCG, page-reset, cyclic rank28, plus), compared with the known solved-source self-score **−2.93461644**. Its decoded GP E count is 477 against native length-matched expected 1,574.5. A planted source-true F29 generator seeded by the actual ID3 integer tests exact inverse recovery on all 12,901 noninitial runes; page heads are freely assigned. Complete source and [successful historical-number CI run 42807235723](https://github.com/FlareZ123/liber-primus/actions/runs/42807235723) reproduce these bounds.

No plaintext or key was found. The finite negative does not cover SHA-derived streams, soundwave processing, unknown offsets, changed alphabets or hidden nonlinear state.

### Cryptographically motivated extension: clause-prime modular squaring

The audio's independently authenticated three-prime product suggests a second, structurally different cryptographic interpretation. The factors **1259** and **1031** are both prime and congruent to **3 mod 4**, making **1,298,029 = 1259 × 1031** a conventional Blum integer; the full advertised **1,595,277,641 = 1259 × 1031 × 1229** also permits a modular-squaring recurrence, although its third factor **1229 ≡ 1 mod 4**, so the full product is *not* a Blum integer. This mathematical relationship is an interpretation of the published Parable arithmetic, **not evidence Cicada used BBS**.

For either of those two moduli, start an explicit `x=(seed² mod modulus)` state from one of six source-motivated seeds **761, 1033, 3301, 3299, 2013, 2014**; iterate `x←x² mod modulus`. Extract a key symbol as the low 8 or 5 bits of each state, as five parity bits packed LSB-first/MSB-first, or as eight parity bits MSB-first. Compare per-page reset versus continuous state, both arithmetic signs, direct mod29 GP addition and transparent-EA reversible 28-step field emission. This yields **480 frozen settings** over the **12,956 original unsolved runes**, trained on physical p0–27 (6,761 runes), selected keys frozen on p28–55 (6,195 runes).

| Modulus | Best source setting selected on training pages | Train rune IoC | Frozen holdout IoC |
| --- | --- | ---: | ---: |
| **1,298,029**, two Blum primes | Seed2013, eight MSB-packed parity bits, book-continuous, positive GP28 exponent-step | **0.035384326572** | **0.035282080631** |
| **1,595,277,641**, all three Parable primes | Seed3301, five MSB-packed parity bits, book-continuous, positive GP28 exponent-step | **0.035363978404** | **0.035359741769** |
| Uniform independent 29-rune reference | | **0.034482758621** | **0.034482758621** |

Both chosen outputs remain effectively flat and provide no independently credible GP-English text. The exact source-native hidden-key positive generates Shakespeare GP plaintext with the **full three-prime modulus**, seed3301, five MSB-packed parity bits and page-reset GP28 output. The blind **480-setting** search retrieves this exact model as its top candidate, scores **0.061998767732** train / **0.060381743586** heldout and decodes **12,956/12,956** planted runes exactly. Source-chosen alternatives are detectable, so the original negative is substantive for the declared family.

### Original skip-sensitive source test

A distinct original-source test allows the hypothesized encoder to consume an additional modular-square-derived key draw **only if the rejected output would have repeated the previous ciphertext rune**. The hidden key pointer is reconstructed by exact GP-English trigram Viterbi; no skip positions are supplied. The source set contains both moduli, all six fixed seeds and five state/bit extraction modes, and both signs: **120 original models**. Each starts from the same frozen initial state at the beginning of each of six different LP2 pages [0,3,8,23,27,40], with the first130 runes per page used for selection and the next80 for continuation.

| Original source/key selected on the 780 train runes | Train log GP-trigram/rune | Frozen 480 continuation runes |
| --- | ---: | ---: |
| Three-factor modulus, seed1033, 5 parity bits LSB-first, sign+ | **−5.655481292** | **−5.953263842** |
| Best two-Blum-factor model, seed761, low eight bits, sign− | **−5.662982189** | **−5.704540394** |

The original decoded continuation strings are nonlexical, while the identically structured **blind planted positive** found the correct three-factor source/modulus, seed3301, 5 parity bits MSB-first, sign+, at **rank1 of120**. It inferred the exact **24 planted hidden key skips** and recovered **all 1,260/1,260** genuine control GP runes (training−2.388463406, continuation−2.446622596). Thus a simple collision-consumed key is not enough to make the fixed historic source seeds decrypt original LP2.

Reproduction: [`sims/parable_bbs_keyskip_inverse.cjs`](../sims/parable_bbs_keyskip_inverse.cjs); [successful original/plant CI run 42837250162](https://github.com/FlareZ123/liber-primus/actions/runs/42837250162).

### Complete unknown-state search for the two-factor Blum modulus

The choice of six public seeds may be arbitrarily restrictive. For the genuine two-Blum-prime modulus **M=1259×1031=1,298,029**, there are **M** possible initial values `x0 mod M`, but only **325,080 distinct values of the next state `x1=x0² mod M`**. CRT gives this exactly as `((1259+1)/2) × ((1031+1)/2) = 630×516`; the exhaustive runner also enumerates all **1,298,029** possible seeds to assert this count and retain every reachable `x1`. After this reduction, *every* possible initial BBS seed is represented with no hand-selected secret starting value.

Using original physical page0, screen every one of the **325,080** reachable states through **four** prespecified key-bit extraction methods, GP29 additive or transparent-EA GP28 field-step emission, and two signs: **5,201,280 original-source inverse candidates**. Compare the first **90** runes by an independently trained GP-English trigram likelihood, retain the **120 best**, and evaluate their next **110** original runes without any re-fitting.

| Frozen full-state candidate | Train trigram log/rune | Next110 log/rune | Next110 IoC |
| --- | ---: | ---: | ---: |
| Highest scoring of 5,201,280 original starts: x1=586,717, state-low8, GP28-step, sign− | **−4.325063366** | **−6.194636297** | **0.032193495** |
| Best continuation, *post-selected from 120*: x1=833,459, whole-state%29, GP28-step, sign− | −4.757769708 | **−5.495490430** | **0.034528774** |
| Blind source-native English-GP positive, x1=819,027, 5-parity MSB, GP28-step, sign+ | **−2.455331066** | **−2.477239025** | **0.060884070** |

The planted test encrypts **200 source GP runes** from the withheld Shakespeare passage, conceals its seed and mechanism, then repeats the entire 5,201,280-model search. The **exact true state and cipher rank first**, and both the first90 and last110 runes invert **200/200 exactly**. The strongest original source fit collapses on continuation, and none of the 120 original finalists presents authentic natural-language plaintext.

This genuinely exhausts *every seed* for the specific **two-factor** modular-squaring source under the stated four key projections and two invertible cipher families, without cipher-state skips, changes of outer alphabet, or additional transformations. It does not exhaust the much larger three-factor-state space or modular-square-with-hidden-skip family. Both would require a different, independently motivated state recovery rule.

Reproduction: [`sims/parable_blum_exhaustive_state_inverse.cjs`](../sims/parable_blum_exhaustive_state_inverse.cjs), successful [Actions run 42838419477](https://github.com/FlareZ123/liber-primus/actions/runs/42838419477) via the existing [manual prime-source suite](../.github/workflows/fibonacci-prime-spiral.yml). No novel unknown LP2 plaintext or authentic key identified.

### Seed-independent 1,224-step cycle from *all three* historic Parable primes

There is a stronger *mathematical restriction* on the modular-squaring state map than either the fixed-seed shortlists or the full 5.2-million-state screen. For **M₂=1259×1031=1,298,029**, the two quadratic-residue groups have orders **629** and **515**; squaring on those odd groups has orders **ord₆₂₉(2)=72** and **ord₅₁₅(2)=204**. Thus all initial states of M₂, including those divisible by either prime, have eventual period dividing **lcm(72,204)=1,224** after the first square.

**This result also holds for the full historical source number, M₃=1,595,277,641=1259×1031×1229, with no seed restriction.** The third factor satisfies **1229−1=4×307**. After *two* squarings its nonzero component belongs to an odd group of order **307**, where the squaring map has order **ord₃₀₇(2)=102**. Since **lcm(72,204,102)=1,224**, the CRT-combined source state satisfies **x(t+1224)=x(t)** for every starting seed after at most two squarings. States divisible by any prime factor have the corresponding zero component and obey the same bound. BigInt recurrence witnesses for ten disparate seeds pass under **both** moduli; the all-seed claim follows from the group-order proof.

Any source cipher whose keystream is *directly* produced from this state repeats its key after a divisor of **1,224 output symbols**. Five consecutive parity bits packed per rune retain this period. Eight parity bits packed per rune instead yield period dividing **153**, since gcd(8,1224)=8. For the full three-prime model, conservatively exclude the first **two** rune positions as potentially transient.

A globally continuous, unslipped additive GP29 pad must preserve ciphertext-rune equality at separations 153 or 1224 exactly, regardless of secret initial state. For a reversible GP28 exponent-step pad, the corresponding invariant is equality of the **nonzero-difference discrete-log ranks**, omitting unchanged-output and physical page-initial positions. These are source-specific instances of the more general [phase coincidence invariant](phase-coincidence-invariant.md) already established elsewhere in the repository; the full historic number selects the same two exact candidate periods independently.

| Output channel and source-forced lag | Original LP2 equality, first two runes excluded | Independent GP-English sample |
| --- | ---: | ---: |
| GP29 additive, 153 | **416/12,801 = 0.0324975** | Approximately **0.0604** |
| GP29 additive, 1,224 | **421/11,730 = 0.0358909** | Approximately **0.0583** |
| Nonzero GP28 field steps, 153 | **494/12,528 = 0.0394317** | Approximately **0.0614** |
| Nonzero GP28 field steps, 1,224 | **390/11,477 = 0.0339810** | Approximately **0.0590** |

Source-native positive controls with arbitrary 153/1,224-period GP29 and GP28 pads preserve the corresponding valid plaintext equality counts **exactly**, independently of the unknown key values. The original manuscript lacks the GP-English collision excess predicted by the direct synchronized source model under either modulus. The argument excludes an entire two- and three-prime starting-state domain for these synchronous channels, **without exhaustively scanning 1.595 billion full-modulus seeds**.

Reproducer: [`sims/parable_blum_keyless_period_gate.cjs`](../sims/parable_blum_keyless_period_gate.cjs), from the manually dispatched [prime-source CI suite](../.github/workflows/fibonacci-prime-spiral.yml). The exclusion still allows variable hidden key consumption, independent per-page secret state, a nonnative intermediate alphabet, nonperiodic extra key layers, and undiscovered segmentation.

### Exhaustive unknown-state search with collision-only hidden key consumption

The complete two-factor square-state domain can be searched even when the original cipher is allowed to **discard a proposed pad element only when that element would have repeated the previous ciphertext rune**, rather than simply using a direct unslipped BBS stream. A source-independent GP-English trigram Viterbi handles the hidden consumption pattern. This is a stronger attack than the 120 preselected seeds above.

For each of all **325,080 possible first-post-square states**, the runner tries four actual state/bit reductions and both GP29 arithmetic signs, **2,600,640 original ciphertext head candidates**. Each exact first-28-rune hidden-keyskip dynamic program may discard **up to four** additional source digits, with an explicit collision proof required for every discard. Retain the **800** best first28 candidates; fit their first **130** physical page0 runes with full collision-only Viterbi and freeze the inferred consumed key clock into the following **80** genuinely unfit original runes.

| Original source model | First28 log score | First130 log score | Following80 log score |
| --- | ---: | ---: | ---: |
| Highest first-28 fit, x1=546,646, five parity bits MSB, sign− | **−3.374314480** | −4.922075167 | **−5.638057234** |
| Highest first-130 fit, x1=1,011,455, low8 state, sign− | −3.967926963 | **−4.836599383** | **−6.373770724** |
| Highest following80 score *post-selected from 800*, x1=1,101,804, low8 state, sign+ | −3.992541638 | −5.580133348 | **−4.914078043** |
| Source-native blind positive, x1=819,027, five MSB parity bits, sign+ | **−2.721774930** | **−2.477103158** | **−2.359453230** |

The planted positive takes **210 genuine independently sourced GP-English runes**, encrypts them with a secret original-domain BBS start and six actual collision-rejected key draws (**one** inside the first28), and hides the key, sign, starting state and skip pattern from the search. The exact source model **ranks #1 of all 2,600,640 candidates**; the 210-rune inverse recovers **210/210 original GP symbols and all six rejected pad draws exactly**. Thus a single hidden source-key rejection does not prevent this model family from being detected. Original first130 candidates and frozen 80-rune continuations remain nonlexical and far from the planted-language scores.

Reproducer: [`sims/parable_blum_allstate_keyskip.cjs`](../sims/parable_blum_allstate_keyskip.cjs); successful [manual CI run 42841349115](https://github.com/FlareZ123/liber-primus/actions/runs/42841349115). The exhaustive claim concerns every source **state**, all four explicitly chosen 29-key readouts and two signs, **up to four proven skips in the first28 runes**, an additional full 130/80-rune Viterbi among the 800 source-ranked contenders. It does not globally enumerate arbitrary secret key-skip histories, nor prove that p0 should contain English GP plaintext. No historical plaintext or authentic key was recovered.

### Interpretation

The published audio tag provides a genuine historical prior clue and a mathematical route to exact key-state enumeration. The original ciphertext has failed the 960 historic integer/PRNG tests, 480 fixed-seed modular-square inverses, 120 collision-keyskip source tests, and full **5,201,280** two-prime seed-independent modular-squaring inverses. These finite negatives have independently positive-tested recovery power within their declared output models. They **do not establish** how Cicada intended the three Parable primes to be used, if at all, in the unsolved manuscript. Further arbitrary source-seed and bit-order variants without a fresh source instruction are unlikely to advance a genuine decipherment.
