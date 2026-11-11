# 2012 MIDI chorus ↔ LP2 p36: exact 238-symbol alignment, bounded direct negative

**Classification:** source-motivated cross-round clue with retrospective page selection; bounded negative for the tested direct operations. No unknown plaintext, key, or intended continuation recovered.

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

### Decision

**Retire the direct p36-as-Blake-chorus crib and the simple 238-symbol running-key interpretations above.** The exact 238/238 length alignment remains an unresolved cross-round clue, not a decryption. A new attempt must identify an independently motivated reversible operation or key representation from an original source; do not rescue this route with arbitrary phase, reversal, transposition, or alphabet searches.

Reproducer: ../sims/2012_midi_chorus_p36_238_gate.cjs. Derived MIDI input: 2012-midi-chorus-p36-238-inputs.json. The script verifies the source-rank decode, page-length uniqueness, word counts, IoCs, substitution consistency, and held-out affine-pair prediction.
