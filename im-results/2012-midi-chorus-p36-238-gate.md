# 2012 MIDI chorus ↔ LP2 p36: exact 238-symbol alignment and field-key tests

**Classification (Agents 7 and 17, 11 November 2026):** source-motivated cross-round clue with retrospective page selection; bounded negative for direct GP29 letters and full-block GF(29²³⁸) field-key transfers. No unknown plaintext, key, or intended continuation recovered.

## Why this was worth testing

The archived 2012 MIDI stage says, “Let the Chorus be your guide to the depths.” Its second musical track decodes to the William Blake chorus. The first complete chorus contains **238 alphabetic characters**. Liber Primus physical page 36 contains **238 GP29 runes**, and it is the only page in the canonical 56-page LP2 corpus with that rune count.

The archived MIDI contains 714 Track-2 note-off events: one 238-event decoded chorus repeated three times. The source decoder sorts the distinct note-plus-note-off-delta sums and maps them to the 23-character key alphabet abcdefghijklmnoprstuvwy. Reproducing that exact rank mapping recovers the 238-letter stanza in the pinned chorus transcription.

This is a real, inexpensive cross-round alignment. It does **not** prove that p36 is selected by the 2012 instruction: the archive is secondary, the PGP signature was not independently verified in this run, and no source explicitly says to apply the chorus to LP2 page 36.

## Frozen source inputs

- LP2 corpus: resources/liber-primus/lp2-corpus.json, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
- 2012 chorus transcription: resources/control/cicada2012_blake_chorus.txt, blob 179513fc484d22c710ca06660d766e045ccbf642. It preserves letchery and every thing; both spelling variants have the same alphabetic-character count.
- Archived MIDI: [neuroretransmit/cicada, pinned commit b13600373d3400d75ec4208198019f3d92a304dd](https://github.com/neuroretransmit/cicada/tree/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle), file 2012/009-midi-puzzle/song.mid, blob SHA-1 11924e0e195208c2eea757655035e149fb8a190f, 10,889 bytes.
- The archived README and decode.py specify note-off pitch plus delta ticks, sorted distinct sums, and Track-2 alphabet abcdefghijklmnoprstuvwy. The MIDI is format 1, 96 ticks/quarter, three tracks; Track 2 has 714 note-offs and 23 distinct sums.
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

### Decision

**Retire the direct p36-as-Blake-chorus crib and the simple 238-symbol running-key interpretations above.** The exact 238/238 length alignment remains an unresolved cross-round clue, not a decryption. A new attempt must identify an independently motivated reversible operation or key representation from an original source; do not rescue this route with arbitrary phase, reversal, transposition, or alphabet searches.

Reproducer: ../sims/2012_midi_chorus_p36_238_gate.cjs. Derived MIDI input: 2012-midi-chorus-p36-238-inputs.json. The script verifies the source-rank decode, page-length uniqueness, word counts, IoCs, substitution consistency, held-out affine-pair prediction, and the Q238 cross-round coefficient gate. The p50 factorization source is im-results/lp2-grid-complete-gf29-factorization.md.
