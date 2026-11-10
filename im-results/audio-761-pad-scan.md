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

### Seed-independent cyclic equality bound from the same two primes

There is a stronger *mathematical restriction* on the BBS state map than any fixed-seed shortlist or finite 5.2-million-case screen. In the **1,298,029** two-prime Blum modulus, the multiplicative quadratic-residue subgroups have orders **629** (mod1259) and **515** (mod1031). Squaring acts on these odd cyclic groups with orders **ord₆₂₉(2)=72** and **ord₅₁₅(2)=204**. CRT gives `lcm(72,204)=1224`: **every possible** initial modular-square state, including states divisible by one factor, returns after **at most 1,224 state iterations**, from the first post-square state onward. Packing five parity bits per symbol preserves a guaranteed key period dividing **1,224**; packing eight consecutive parity bits per symbol reduces it to a period dividing **153**, because gcd(8,1224)=8. This holds regardless of any seed guessed or fitted to ciphertext.

Consequently any *globally continuous, unslipped* additive GP29 source key, even with an unknown static one-to-one outer rune alphabet, must reproduce natural-source equality at positions separated by 153 or 1224 runes (when the corresponding key extraction is periodic at that length). For the transparent-EA GP28 exponent-step output, the analogous equality is preserved **between the nonzero-difference discrete-log ranks**, excluding duplicate-output and page-initial sites. This key-independent logic is the fixed source-prime refinement of the more general [phase coincidence invariant already established](phase-coincidence-invariant.md); the source selection of 153 and 1224 is new to this historical hypothesis.

| Actual original LP2 cipher statistic | Source-forced lag | Original equal symbols | Independent GP-English source control |
| --- | ---: | ---: | ---: |
| Direct GP29 output | 153 | **416/12,803 = 0.0324924** | **773/12,803 = 0.0603765** |
| Direct GP29 output | 1,224 | **421/11,732 = 0.0358848** | **684/11,732 = 0.0583021** |
| Nonzero GP28 difference ranks | 153 | **494/12,529 = 0.0394285** | **0.0614** after excluding EA and physical page heads |
| Nonzero GP28 difference ranks | 1,224 | **390/11,478 = 0.0339780** | **0.0590** after excluding EA and physical page heads |

Two independent native-GP encryption controls each use arbitrary 153/1224-position source pads and assert **exactly equal** pre-/post-encryption same-phase collision counts (all four proofs passed). They do not fit an unknown key; they test an equality identity that eliminates every secret initial state under its assumptions. The original corpus lacks the English-GP collision excess at either source-forced period in either channel.

Proof, original counts and exact planted equality controls: [`sims/parable_blum_keyless_period_gate.cjs`](../sims/parable_blum_keyless_period_gate.cjs), successful [manual original-data CI 42840012568](https://github.com/FlareZ123/liber-primus/actions/runs/42840012568). The exclusion concerns a *synchronized, globally continuous* BBS source whose period is not disrupted by collision-driven hidden key skips, per-page secret phase shifts, changing output permutations or an encrypted intermediate rather than native GP-English. Other architectures evade this exact equality identity.

### Interpretation

The published audio tag provides a genuine historical prior clue and a mathematical route to exact key-state enumeration. The original ciphertext has failed the 960 historic integer/PRNG tests, 480 fixed-seed modular-square inverses, 120 collision-keyskip source tests, and full **5,201,280** two-prime seed-independent modular-squaring inverses. These finite negatives have independently positive-tested recovery power within their declared output models. They **do not establish** how Cicada intended the three Parable primes to be used, if at all, in the unsolved manuscript. Further arbitrary source-seed and bit-order variants without a fresh source instruction are unlikely to advance a genuine decipherment.
