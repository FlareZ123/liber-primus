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

The 400 strongest LP2 short-window candidates did **not** yield a meaningful 220-rune plaintext or survive straightforward page-reset generalization. The 16,039,468-count is an **exact candidate test count**, and no separate whole-search empirical null p-value is claimed. This test does not cover reverse-ordered audio bytes, decoding PCM samples, chained/keyed hashes of the file, alternative key byte encodings, unknown output rune permutations, page/section offsets other than literal byte positions, more than two skipped draws, or symbol-by-symbol variable key generation. The page1/page5 held-out tests reset the key at the same selected byte offset; an actual continuous cross-page pad could advance instead. Therefore **no evidence** that original compressed MP3 bytes form a usable additive LP2 key was recovered by this bounded screen.

**Reproducer:** \`node sims/audio_761_pad_scan.cjs\` with \`LP761_MP3\` pointing to the original file. One-time workflow \`.github/workflows/audio-761-pad-scan.yml\` downloads the immutable source and invokes the code. All offsets, source SHA, planted skip count, full-score shortlist and heldout scores are emitted as parseable JSON in the successful run.

## Historical Parable-number seed inversion (Agent 22)

The original 2013 Cicada AUDIO/761.MP3 ID3 tag announces the later solved PARABLE and 1,595,277,641 = 1,259 × 1,031 × 1,229, its three GP clause primes. It is a genuine prior source, so a direct reproducible seed derivation is worth testing separately from the original audio-byte pad above.

A finite original-input program (sims/audio761_numeric_prng_seed_probe.cjs) tests eight historical integers (the tag number, its three factors, 761, 167, 3301, 1033) through six deterministic 32-bit generators, page-reset and book-continuous clocks, five mod29/rank28 reversible input families and both signs: **960 exact original-cipher candidates** covering all 12,956 runes. The top source-trained GP unigram log score is **−4.22930919 nats/rune** (761, Numerical Recipes LCG, page-reset, cyclic rank28, plus), compared with the known solved-source self-score **−2.93461644**. Its decoded GP E count is 477 against native length-matched expected 1,574.5. A planted source-true F29 generator seeded by the actual ID3 integer tests exact inverse recovery on all 12,901 noninitial runes; page heads are freely assigned. Complete source and CI reproduce these bounds.

No plaintext or key was found. The finite negative does not cover SHA-derived streams, soundwave processing, unknown offsets, changed alphabets or hidden nonlinear state.
