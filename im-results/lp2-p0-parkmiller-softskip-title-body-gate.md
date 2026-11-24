# LP2 p0: full-state Park–Miller inverse with optional duplicate rejection

Agent 29, 2026-11-24. Negative result for the explicitly tested family; no recovered plaintext.

## Novel model

The earlier consecutive-draw crib gate and direct PRNG glyph/rank gate do not account for an additive plaintext cipher with hidden duplicate-triggered advances. The prior conditional antidoublet HMM uses a fixed period-13 key rather than an exhaustive PRNG seed space. The source observations motivating this experiment are the original Ghostscript-era ICC profile, unusually few ciphertext doublets, the red 8+5-rune title, and the signed 2016 phrase EPIPHANY SEEKS THE DEVOTED. None proves an intended cipher.

Use Park–Miller x'=16807x mod 2147483647, first consumed state any nonzero state, K=x mod 29 or floor(29x/2147483647), sign +/-1, C=P+sign*K mod 29. A draw can be rejected only when its proposed ciphertext equals the preceding emitted ciphertext; any number of consecutive duplicate draws may be rejected, but a nonduplicate must be emitted. Accepting a duplicate is also allowed. For the actual title there are no adjacent repeats.

For a nonrepeat observed rune, there are at most two branches: accept the current draw with P=C-sign*K, or fix P=previousC-sign*K, skip every duplicate proposal and require the first nonduplicate to equal C. This exhausts all skip histories without an arbitrary skip cap. For a repeated observed rune, acceptance at any draw before the first nonduplicate is allowed. First rune starts with no predecessor.

## Executed searches

Exact ciphertext title indices: 15,8,18,3,6,19,27,0,15,26,18,21,5. Crib EPIPHANY SEEKS: 18,13,10,13,8,24,9,26,15,18,18,5,15. Actual p0 length 262; body 249 runes.

| Projection/sign | First-draw-compatible crib states | Six-rune crib matches | Seven-rune matches | Exact dictionary first-word paths | Complete exact title paths | Swap first-word paths | Complete swap title paths |
|---|---:|---:|---:|---:|---:|---:|---:|
| mod + | 74051160 | 4 | 0 | 95 | 0 | 759 | 0 |
| mod - | 74051161 | 5 | 0 | 85 | 0 | 715 | 5 |
| scale + | 74051160 | 5 | 0 | 105 | 0 | 790 | 0 |
| scale - | 74051160 | 5 | 0 | 79 | 0 | 682 | 1 |

Both dictionary sweeps covered every seed 1..2147483646 under all four models, 8,589,934,584 state/model combinations per sweep. Exact title trie: CMUdict 1.1.3, alphabetic words, 117493 unique Latin spellings, 17175 distinct native 8-rune words and 16024 distinct native 5-rune words. Native normalization includes K/Q->C, QU->CW, V->U, Z->S, ING->NG rune, IO->IA rune. Exact TSV SHA256 dba35f901a75dba0e3f5394f56030eeea8307f4aceb5f16f050672b125367bff. One adjacent GP-rune transposition in either title word (motivated by authentic WIDSOM typo) adds 114102 8-rune and 57714 5-rune variants; TSV SHA256 4b39726df7d87472182810ea2c28147013fe4e35b4d24b55f9cbf2661955c14d. Exact words take precedence. Total permitted edits <=1.

Six title paths with one edit, all sign -1:

| Projection | Seed | Next state | Skips | Nearest dictionary words | Actual GP codes (A=0 through ASCII 93=28) |
|---|---:|---:|---:|---|---|
| mod | 131372927 | 757117101 | 1 | PAVEMENT BONER | NBYSTSJQ / RDJSE |
| mod | 166783872 | 1980925825 | 0 | SHIRELLE HABLE | PIKEUSUS / IYRUS |
| mod | 881531667 | 1670024062 | 0 | GUETTLER CADGE | GBSQQUSE / YFXGS |
| mod | 1211452604 | 819450764 | 0 | WIEGMANN RHAME | HKSGTYJJ / EYITS |
| mod | 1457296463 | 1643085023 | 0 | LOMASNEY BAYAR | UDTYPJS[ / RYY[E |
| scale | 1419162270 | 1890129938 | 0 | KREITMAN COTTA | FESKQTYJ / DFQQY |

## Held-out body, exact inverse

The final p0 one-rune fragment continues on p1, so score 56 complete words, 248 runes, and replay all 249 body runes. For each title candidate, test continuous RNG/predecessor, continuous RNG with fresh predecessor, and reset RNG to title seed with fresh predecessor. At each word boundary retain separate maxima of dictionary-hit words and dictionary-hit runes by current RNG state. Because the predecessor is known from ciphertext, histories merging at identical RNG states are interchangeable for future emissions; this is an exact DP, not greedy scoring or beam pruning. Dictionary contains 115662 native sequences including names and abbreviations. Every maximizing path reencryption asserted.

| Seed | Carry (words/runes) | Fresh predecessor | Reset seed |
|---:|---:|---:|---:|
| 131372927 | 9/18 | 9/18 | 9/20 |
| 166783872 | 11/25 | 11/25 | 7/15 |
| 881531667 | 9/19 | 9/19 | 11/25 |
| 1211452604 | 9/19 | 9/19 | 7/16 |
| 1457296463 | 8/18 | 8/18 | 9/17 |
| 1419162270 | 10/22 | 10/22 | 10/21 |

Best 11/56 words and 25/248 runes. No credible passage. The typo-nearest labels are not recovered title plaintext. C++ planted title with seed 3310, one skipped draw, recovered seed and next state 931333262. Real solved p57 native plaintext (95 runes, 20 words) encrypted under all four models with optional duplicate rejection (20% acceptance); true lexicon count 18/20, exact DP achieved 18/20 in all four. Independently generated length-matched dictionary-word controls achieved 56/56 words and 248/248 runes in all four, with 10,5,4,4 actual skipped draws. This last control is lexical, not natural prose.

## Reproduce

Install cmudict==1.1.3; run sims/lp2_p0_parkmiller_softskip_lexicon.py to generate TSV files in sims. Compile sims/lp2_p0_parkmiller_softskip_title_sft.cpp with C++17 -O3. Executable arguments: crib; positive PATH_TO_EXACT_TSV; or one of mod+, mod-, scale+, scale- followed by TSV path and optional inclusive seed bounds. Default bounds are full state space. Run all four models for exact and swap TSVs. For body analysis run sims/lp2_p0_parkmiller_softskip_body_sft.py from the repository checkout; it loads canonical p0/p57 and checks title replay. The experiment was executed locally against the canonical corpus and transcription data fetched from the repository.

## Decision

Close this specified p0 family under exact title dictionary assumptions or one adjacent transposition and the three explicit body clock choices. The exact crib is incompatible independent of dictionary. Do not infer that every PRNG construction or arbitrary title spelling has been disproved. Further brute force of the same Park–Miller parameters without a new authentic operand is low value. No solved-page count changes.
