# 2012 MIDI chorus ↔ LP2 p36: exact 238-symbol alignment and field-key tests

**Classification (Agents 7, 17, 31 and 34, 11 November 2026):** source-motivated cross-round clue with retrospective page selection; bounded negative for direct GP29 letters, the exact historical 7-/14-column running-key permutations, full-block GF(29²³⁸) field-key transfers, and direct MIDI-timing→GP29 key reuse. The MIDI's 23-bar/23-pair chorus structure is exact but internal to the 2012 decode. No unknown LP2 plaintext, key, or intended continuation recovered.

## Why this was worth testing

The archived 2012 MIDI stage says, “Let the Chorus be your guide to the depths.” Its second musical track decodes to the William Blake chorus. The first complete chorus contains **238 alphabetic characters**. Liber Primus physical page 36 contains **238 GP29 runes**, and it is the only page in the canonical 56-page LP2 corpus with that rune count.

The archived MIDI contains 714 Track-2 note-off events: one 238-event decoded chorus repeated three times. The source decoder sorts the distinct note-plus-note-off-delta sums and maps them to the 23-character key alphabet abcdefghijklmnoprstuvwy. Reproducing that exact rank mapping recovers the 238-letter stanza in the pinned chorus transcription.

This is a real, inexpensive cross-round alignment. It does **not** prove that p36 is selected by the 2012 instruction: the archive is secondary, the PGP signature was not independently verified in this run, and no source explicitly says to apply the chorus to LP2 page 36.

## Frozen source inputs

- LP2 corpus: resources/liber-primus/lp2-corpus.json, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
- 2012 chorus transcription: resources/control/cicada2012_blake_chorus.txt, blob 179513fc484d22c710ca06660d766e045ccbf642. It preserves letchery and every thing; both spelling variants have the same alphabetic-character count.
- Archived MIDI: [neuroretransmit/cicada, pinned commit b13600373d3400d75ec4208198019f3d92a304dd](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle), file 2012/009-midi-puzzle/song.mid, blob SHA-1 11924e0e195208c2eea757655035e149fb8a190f, 10,889 bytes.
- The archived README and decode.py specify note-off pitch plus delta ticks, sorted distinct sums, and Track-2 alphabet abcdefghijklmnoprstuvwy. The MIDI is format 1, 96 ticks/quarter, three tracks; both musical tracks carry an explicit 7/2 time signature (1,344 ticks/bar); Track 2 has 714 note-offs and 23 distinct sums.
- Derived first-cycle event sums are preserved in 2012-midi-chorus-p36-238-inputs.json; the 238 ranks reproduce the chorus letters exactly.
- p36 is page 36 in the restored LP2 numbering, not a JPEG scan index.

The 2012 sample's separate Track-1 wordlist also has 49 entries, and p36 has 49 page-local words. Do not promote this second count match: the archived 2012 wordlist is explicitly participant-specific, while the chorus has 56 words. The two lists do not define a shared 49-word key.

## Tests and results

### 1. Direct running-key use

Treat the 238-letter Blake chorus as a one-time/running key against the 238 p36 rune values. Test only simple, recognizable mappings:

- Latin alphabet ordinal (A=0);
- GP29 transliteration index, with the standard aliases K→C and V→U;
- the 2012 MIDI's own source-defined 23-letter rank alphabet;
- the MIDI note-plus-delta sums reduced modulo 29;
- GP prime weights and their totients (prime−1).

For each mapping, test the two natural additive directions. All 12 outputs remain near the uniform GP29 IoC baseline \(1/29=0.034483\); none approaches the Blake plaintext's GP-mapped IoC **0.064745**. Candidate IoCs:

| Key mapping | Subtract | Add |
|---|---:|---:|
| Latin A=0 | 0.034074 | 0.033826 |
| GP29 rune index | 0.034287 | 0.033401 |
| 2012 MIDI alphabet rank | 0.033826 | 0.032940 |
| MIDI note+delta mod 29 | 0.032762 | 0.035138 |
| GP prime weight | 0.033330 | 0.034110 |
| GP phi(prime) weight | 0.033330 | 0.034110 |

No phases, reversals, tuned offsets, or language-score-selected variants were searched.

### 1a. Source-fixed historical columnar transpositions

The cross-round source analysis records a seven-column 2012 transposition with zero-based read order **[0,6,2,5,1,4,3]** and a fourteen-column 2014 transposition with order **[2,8,9,1,12,13,11,4,5,7,3,0,6,10]**. Since **238=34×7=17×14**, a solver could reasonably test these known operations on the 238-symbol chorus before using it as a p36 running key. This is a finite historical hypothesis, not a free permutation search; the source orders are documented in [the cross-round route analysis](../workplace/2012-845145127-lp2-cross-round-route.md).

For each order, fill row-major and read columns in the stated order, then test the exact inverse. Use the resulting permuted GP29 chorus as the key against original p36, with both additive directions:

| Historical operation | Key permutation | Subtract | Add |
|---|---|---:|---:|
| 2012 seven-column | Forward | 0.03623728 | 0.03382619 |
| 2012 seven-column | Inverse | 0.03559905 | 0.03481899 |
| 2014 fourteen-column | Forward | 0.03517356 | 0.03527993 |
| 2014 fourteen-column | Inverse | 0.03503173 | 0.03435805 |

The best IoC is **0.03623728**, close to the uniform GP29 baseline **0.034483** and far below the GP-mapped Blake chorus **0.064745**. None of the eight outputs is convincing plaintext. Applying the corresponding inverse permutation to p36 with the untransposed chorus gives an output that is exactly the inverse positional permutation of the key-transposed output; the reproducer verifies this identity, so it is not an independent key family. No other column orders, phases, or offsets were searched.

This closes the two historically source-fixed columnar variants as running-key transformations. It does not prove that the 238-symbol alignment is accidental; it establishes that the obvious reuse of the known 2012/2014 columnar orders does not recover p36 plaintext.

### 2. Is the Blake chorus itself p36 plaintext?

The 238-character crib does not admit a direct symbol substitution:

- GP-mapped chorus has 21 distinct symbols after K/C and V/U normalization; p36 uses all 29 runes.
- A plaintext-symbol→cipher-symbol monoalphabetic mapping conflicts at **207** positions.
- A cipher-symbol→plaintext-symbol homophonic mapping conflicts at **191** positions.
- No exact affine monoalphabetic map C=aP+b (mod 29) exists.
- A general affine 2×2 Hill map over GF(29), using adjacent source-order pairs, is fixed by the first three non-collinear pairs. Its matrix is [[27,2],[17,25]], bias [1,2], determinant 3; it matches only the **3 fitted pairs out of 119**. It does not predict the remaining 116 pairs.
- p36 has 49 page-local words; the Blake chorus has 56. Their word boundaries are not preserved.

The IoC mismatch also excludes a pure transposition of the chorus under this GP mapping: positional permutation and monoalphabetic relabeling cannot raise the source chorus's frequency profile to match p36.

### 3. The 2014 p50 degree-238 residual as a same-length key

The independently derived p50 table factorization also has a unique monic degree-238 residual Q238. Its 238 non-leading coefficients are a natural cross-round candidate because the chorus and p36 both have 238 symbols. The reproducer divides the original 256-byte p50 polynomial by the four already-established low-degree factors, verifies zero remainder and a monic degree-238 quotient, then compares both coefficient orders against the chorus GP indices, Latin ordinals, MIDI alphabet ranks, note-plus-delta residues, and the p36 known-plaintext keystream.

No exact equality or exact affine relabeling exists. The best post-hoc single-affine relabeling (812 possible scale/offset pairs) gives only 17–20 matches out of 238, depending on sequence and coefficient orientation; this optimized maximum is not a source-selected transform and is not evidence of a relationship. In particular, the best rank-stream fit is 19/238 and the best low-to-high fit to the p36 crib keystream is 20/238.

This rejects the obvious direct Q238 coefficient/chorus/key-stream correspondence. It does not invalidate the independently established polynomial factorization or prove the three 238 counts are accidental.

### 3. Three-source GF(29²³⁸) field-key continuation (Agent 17)

A newly available independent source structure sharpens this test without fitted keys: the manuscript's original 256-byte p49–51 table has a [unique irreducible degree-238 factor](lp2-grid-complete-gf29-factorization.md) `Q238(X)` over GF29. It is possible to view **all 238 p36 runes** and the **238 source song letters** as two coefficients vectors in the field `GF(29)[X]/Q238(X)`. This is a genuinely reversible *full-block* operation. The juxtaposition of the 2012 song and 2014 book source is our hypothesis, rather than an authenticated multiplication instruction.

Freeze exactly three source-native chorus mappings: GP29 rune index (K→C, V→U), conventional Latin ordinal (A=0), and 2012 MIDI note-off pitch-plus-delta modulo29. Their 238 entries are field elements under the existing `Q238`. Read both text sequences together in printed high-to-low order or low-to-high polynomial order. Decrypt by field multiplication or by multiplication with the *full polynomial inverse*, for **3×2×2=12** models. The reference is p57's independently known plaintext, GP29 IoC **0.06271**; p36 raw GP IoC is **0.0359890792**.

| Chorus field key | Original p36 output IoC, divide (high / low) | Original p36 output IoC, multiply (high / low) |
|---|---:|---:|
| GP29 letter mapping | 0.03485445 / 0.03340070 | 0.03240790 / 0.03453533 |
| Latin A=0 mapping | 0.03510265 / 0.03336524 | 0.03396802 / 0.03513811 |
| 2012 MIDI event mod29 | 0.03290430 / 0.03524448 | 0.03520902 / 0.03421622 |

Every original output is close to uniform GP29 frequency; the highest IoC is **0.03524448**, far from native solved text. The strongest output begins `ENGTHOHNCRPDBSYOFNCXEXXPEOEENGIA` and is not a readable phrase. All twelve original outputs reproduce **238/238** ciphertext runes when reencrypted. A source-disjoint p57 solved-rune sequence planted into each reversible transformation recovers **238/238** runes, independently testing inversion. Those checks validate the code and delimit this exact field mechanism; they do not validate a key or find unknown plaintext.

[Standalone CommonJS field-key SFT](../sims/2012_chorus_grid_q238_p36_field_sft.cjs) reconstructs `Q238` from the original table, checks its SHA-256, validates the actual MIDI source and p36 length, and runs the twelve original field decoders with a native-GP source plant. No arbitrary phase, affine fitted matrix, passage slicing, word-list tuning or ciphertext-optimized key is involved.

**Decision for this extension:** retire direct full-block multiplication/division by the entire 238-symbol chorus in the already identified grid field. The **triple 238 alignment** is now documented, although all 12 natural field mappings fail to select p36 plaintext. A further test would need an original instruction naming a new field operation or addressing a different source, rather than stacking related coincidences.

### 4. Raw MIDI timing and GP29-key source gate (Agent34)

The pinned 10,889-byte `song.mid` was parsed from its original SMF event stream, not from the 238-event transcription. Its metadata records format 1, 96 ticks/quarter, tempo 500,000 µs/quarter, and an explicit **7/2** time signature, so a bar is **1,344 ticks**. Both musical tracks are monophonic: for every paired note, the note-off event's delta equals that note's duration. The historical `note + note_off_delta` rule is therefore exactly `pitch + duration` for this file.

| Source timing feature | Track 1 | Track 2 |
|---|---:|---:|
| Note-on / note-off pairs | 558 | 714 |
| Unique pitch + note-off delta (same as pitch + duration) | **25** | **23** |
| Unique pitch + note-on delta | 30 | 26 |
| Unique pitch + within-bar position | 315 | 345 |
| Unique pitch + bar index | 72 | 82 |

Track 2's 714-event `(pitch, note-off-delta)` sequence has minimal period **238** and repeats exactly three times. Each 238-event chorus spans **30,912 ticks = 23 bars**; the complete track spans 69 bars. The number of distinct pitch-duration pairs is also 23. This is an exact internal structure of the already-decoded 2012 chorus, but the bar count and alphabet size are derived from the same event stream; it does not independently select a 29-symbol LP2 key.

A bounded alternative treated each Track-1 note-on event's `pitch + onset-delta` as a symbol. It has 30 distinct values (Track 2 has 26). The most frequent Track-1 value is **61**, occurring **95/558** times. Assigning that value to a space and mapping the other 29 sorted values to the published GP29 transliteration order gives a non-readable sequence beginning `R UFCCCOSC XFR XUCR RICH JCTHOI OFTHFO OICNC`. This is only a bounded plausibility probe: the historical decoder explicitly uses note-off deltas, and no original clue selects onset-delta timing or a space state. The bar-relative variants likewise yield 315/345 and 72/82 states, not 29. The union of both tracks' source-defined note-off sums has 46 values.

**Decision:** the source-selected MIDI operation remains the solved 25-/23-symbol 2012 substitution. No natural timing interpretation supplies a 29-symbol alphabet or an independently selected reusable GP29 key stream. Do not continue by adding modulo-29 reductions, fitted boundary states, arbitrary phase, or an unmotivated transfer to LP2. Reproduction: [`sims/2012_midi_timing_source_gate.cjs`](../sims/2012_midi_timing_source_gate.cjs), run against the exact pinned `song.mid` blob listed in [`resources/external/cicada2012-midi-source.json`](../resources/external/cicada2012-midi-source.json).

### Decision

**Retire the direct p36-as-Blake-chorus crib, the direct and source-fixed T7/T14 transposed running-key interpretations, and the tested full-block Q238 field-key correspondence.** The exact 238/238 length alignment remains an unresolved cross-round clue, not a decryption. A new attempt must identify a distinct independently motivated reversible operation or key representation from an original source; do not rescue this route with arbitrary phase, reversal, transposition, or alphabet searches.

Reproducers: ../sims/2012_midi_chorus_p36_238_gate.cjs (cross-round p36 tests) and ../sims/2012_midi_timing_source_gate.cjs (raw MIDI timing gate). Derived MIDI input and timing summary: 2012-midi-chorus-p36-238-inputs.json; pinned source pointer: ../resources/external/cicada2012-midi-source.json. The script verifies the source-rank decode, page-length uniqueness, word counts, direct-key IoCs, source-fixed 7-/14-column transpositions in both directions, exact ciphertext-side permutation equivalence, substitution consistency, held-out affine-pair prediction, and the Q238 cross-round coefficient gate. The p50 factorization source is im-results/lp2-grid-complete-gf29-factorization.md.
