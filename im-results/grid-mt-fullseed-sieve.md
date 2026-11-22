# Full-width MT19937 seeds from the LP2 numeric-table columns

**Status:** Reproducible clue-derived direct-stream negative. Agent 41, 2026-11-10. No recovered LP2 plaintext, key, mechanism or destination.

## Candidate construction

LP2 pages 49–51 print 32 rows by eight columns of base-60 byte tokens. Each vertical column is exactly 32 bytes. Eight rune-text groups are 729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680 and 3,316 symbols, using the eight literal '. A 256-bit column could seed a full-width MT19937 generator via Python 3 random.Random(int.from_bytes(column, endian)). This is a specified conjecture, not an established Cicada key schedule.

Each section starts a fresh stream. Three 29-symbol output methods: randrange(29) (bit-rejection), int(random()*29) (53-bit float), and getrandbits(32)%29. Both byte orders and both signs of additive modulo-29 GP cryptography are tested. An exact dynamic-programming assignment optimizes the eight column keys across all 8! = 40,320 arrangements separately for each of twelve parameter settings. The score is weighted within-group index of coincidence. All 12,956 original LP2 unsolved runes are evaluated.

## Direct inversion and independent planted check

The plant contains 12,956 GP-encoded English runes from the last 60,000 characters of the repo's Shakespeare fixture. It encrypts all groups under their actual table columns, in order, using big-endian integer seeds and the floating generator, plus modulo-29 encryption. An 81%-probability overwrite avoids a would-be repeated neighboring ciphertext rune in place, leaving the PRNG key pointer unchanged. The *same* twelve-setting/all-assignment search is run blind on the plant.

| Measure | Unsolved LP2 | Planted authentic-source English |
| --- | ---: | ---: |
| Best weighted decoded index of coincidence | **0.034772018** | **0.057471115** |
| Mode / seed endian / decrypt sign | float / big / − | **float / big / − (exact)** |
| Optimal assignment | [3,6,4,7,2,5,1,0] (search-selected) | **[0,1,2,3,4,5,6,7] (exact)** |
| Individual selected group IoCs | 0.03460–0.03510 | 0.05588–0.05914 |

The uniform-rune benchmark is 1/29 = 0.034482759. Real text's best model only slightly exceeds this reference despite optimizing the column assignment. The planted source substantially exceeds the benchmark and recovers its true mode and all eight column assignments exactly.

**Decision:** none of the 12 original direct additive MT column-seed settings produces English-like plaintext. The original selected assignment is a fit parameter, not a key recovery. This bounds only Python 3 integer-seeded MT19937 with these output reductions, direct pad alignment, and section reset. Python 2 seeding differences, external seed derivation, hidden skips, changing rune alphabets, transformed grid layouts, and atypical plaintext remain outside scope. No familywise randomization p-value is asserted and searching variants selected after examining this output is not justified without external constraints.

## Reproduction

Executable: [sims/grid_mt_fullseed_sieve.py](../sims/grid_mt_fullseed_sieve.py) using standard Python3. Inputs: resources/liber-primus/base60-grid.json, resources/lp2-transcription.txt, resources/control/shakespeare_first300k.txt. Manual CI: [.github/workflows/grid-mt-fullseed-sieve.yml](../.github/workflows/grid-mt-fullseed-sieve.yml). Successful [GitHub Actions run 42757661917](https://github.com/FlareZ123/liber-primus/actions/runs/42757661917) prints all original and positive-control top settings, and asserts the planted column assignment and source language recovery. Reads only immutable inputs and writes no local files.
-delimited nonempty text groups. A 256-bit column could seed a full-width MT19937 generator via Python 3 random.Random(int.from_bytes(column, endian)). This is a specified conjecture, not an established Cicada key schedule.

Each section starts a fresh stream. Three 29-symbol output methods: randrange(29) (bit-rejection), int(random()*29) (53-bit float), and getrandbits(32)%29. Both byte orders and both signs of additive modulo-29 GP cryptography are tested. An exact dynamic-programming assignment optimizes the eight column keys across all 8! = 40,320 arrangements separately for each of twelve parameter settings. The score is weighted within-group index of coincidence. All 12,956 original LP2 unsolved runes are evaluated.

## Direct inversion and independent planted check

The plant contains 12,956 GP-encoded English runes from the last 60,000 characters of the repo's Shakespeare fixture. It encrypts all groups under their actual table columns, in order, using big-endian integer seeds and the floating generator, plus modulo-29 encryption. An 81%-probability overwrite avoids a would-be repeated neighboring ciphertext rune in place, leaving the PRNG key pointer unchanged. The *same* twelve-setting/all-assignment search is run blind on the plant.

| Measure | Unsolved LP2 | Planted authentic-source English |
| --- | ---: | ---: |
| Best weighted decoded index of coincidence | **0.034772018** | **0.057471115** |
| Mode / seed endian / decrypt sign | float / big / − | **float / big / − (exact)** |
| Optimal assignment | [3,6,4,7,2,5,1,0] (search-selected) | **[0,1,2,3,4,5,6,7] (exact)** |
| Individual selected group IoCs | 0.03460–0.03510 | 0.05588–0.05914 |

The uniform-rune benchmark is 1/29 = 0.034482759. Real text's best model only slightly exceeds this reference despite optimizing the column assignment. The planted source substantially exceeds the benchmark and recovers its true mode and all eight column assignments exactly.

**Decision:** none of the 12 original direct additive MT column-seed settings produces English-like plaintext. The original selected assignment is a fit parameter, not a key recovery. This bounds only Python 3 integer-seeded MT19937 with these output reductions, direct pad alignment, and section reset. Python 2 seeding differences, external seed derivation, hidden skips, changing rune alphabets, transformed grid layouts, and atypical plaintext remain outside scope. No familywise randomization p-value is asserted and searching variants selected after examining this output is not justified without external constraints.

## Reproduction

Executable: [sims/grid_mt_fullseed_sieve.py](../sims/grid_mt_fullseed_sieve.py) using standard Python3. Inputs: resources/liber-primus/base60-grid.json, resources/lp2-transcription.txt, resources/control/shakespeare_first300k.txt. Manual CI: [.github/workflows/grid-mt-fullseed-sieve.yml](../.github/workflows/grid-mt-fullseed-sieve.yml). Successful [GitHub Actions run 42757661917](https://github.com/FlareZ123/liber-primus/actions/runs/42757661917) prints all original and positive-control top settings, and asserts the planted column assignment and source language recovery. Reads only immutable inputs and writes no local files.
