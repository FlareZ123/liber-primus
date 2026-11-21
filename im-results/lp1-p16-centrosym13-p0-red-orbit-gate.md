# LP1 p16's 13-value 180-degree magic-square orbits and LP2 p0

**Agent43, 21 November 2026. Intermediate source clue and bounded original-cipher negative.** No unknown plaintext, authenticated key or author-selected cipher is recovered.

## Original adjacent-page clue

The original last solved LP1 page, scan 16.jpg, ends with a **5x5 magic square**, printed under the decoded instruction **KNOW THIS**. Every row, column and main diagonal sums to **3301**. A 180-degree rotation leaves all 25 cells fixed as a whole: **12 antipodal pairs plus one center (809)**. The square thus contains exactly **13 unique numerical values**, one per rotation orbit. The central value 809 is prime.

The immediately following unknown LP2 p0 page, original scan 17.jpg, visibly pairs its large cross-like black artworks by a **180-degree rotation**, and prints exactly **13 red GP29 heading runes** in two words of lengths 8+5 before a **red 13-dot mark**. There are 249 black runes after the heading. This adjacent-page 13/13 plus half-turn correspondence is a genuinely source-visible reason to test a 13-value key derived from the last solved square.

**Unproven premise:** Neither the 5x5 square nor p0 says that the thirteen distinct values must be a key, that first-seen row-major order is their order, or that GP29 addition is the cipher. This experiment treats those choices as a bounded, historically familiar hypothesis, with no tuning on a desired plaintext.

The complete original 5x5 source square (all repeats intact) is:

    434 1311  312  278  966
    204  812  934  280 1071
    626  620  809  620  626
    1071 280  934  812  204
    966  278  312 1311  434

One value from each newly encountered 180-degree orbit, scanning original source rows left to right, gives exactly:

    434,1311,312,278,966,204,812,934,280,1071,626,620,809

The original p0 red ciphertext is GP29:

    15,8,18,3,6,19,27,0 | 15,26,18,21,5

## Untouched-cipher inverse gate

Only three natural value projections were tested: direct entry modulo29; Euler totient(entry) modulo29, motivated by solved LP1's sacred-totient statement; and ascending rank0..12 among these 13 unique values. For each, repeat the resulting 13-rune pad from the first p0 rune in unchanged source order, under the two elementary additive signs.

| Projection | Exact 13-pad GP29 residues | Sign in plaintext P = C +/- K | First p0 red word | Second p0 red word | First impossible p0 offset under strict p56 plaintext-F-bypass |
| --- | --- | --- | --- | --- | ---: |
| Direct | 28,6,22,17,9,1,0,6,19,27,17,11,26 | minus | T TH AE S Y E IA D | AE EA U I H | **51** |
| Direct | same | plus | X X J L S L IA G | C A G O TH | **218** |
| Totient | 6,9,9,22,3,6,17,2,9,25,22,8,25 | minus | N EA N I O P I IA | G U AE P N | **41** |
| Totient | same | plus | NG B IA AE N AE S TH | A OE J F U | **46** |
| Rank | 4,12,3,1,10,0,8,9,2,11,6,5,7 | minus | J AE S TH AE M M L | P S EO T IA | **25** |
| Rank | same | plus | M L NG R T M G N | B H A Y EO | **126** |

All six resulting ordinary period-13 GP29 outputs have near-uniform IoC on the complete original p0-p2 729-rune chapter, between **0.03420 and 0.03480**. The untouched original chapter IoC is **0.0340825156**. None of the red-heading readouts is native-language prose.

The stronger exact reachability calculation enforces the independently solved **p56 literal plaintext-F transparency** and follows **every possible key clock phase** at each ciphertext F. Under these semantics, each of the six proposed 13-key decoders becomes mathematically impossible somewhere in the original p0 262-rune stream. The table reports the **first rejected original 0-based rune offset**, with no language scorer or heuristic beam threshold. Thus these source-shaped keys cannot be full-p0 direct repeated GP29 additive/F-bypass decryptors under the tested operations.

The reproducer [sims/lp1_p16_centrosym13_p0_sft.cjs](../sims/lp1_p16_centrosym13_p0_sft.cjs) reads the canonical original GP29 corpus, asserts all source grid totals, rotation identities, 13 unique orbit values and exact original p0 opening, and prints all six original readouts. Its synthetic positive control encrypts all **95 genuine p57 clear GP29 runes** under each candidate exact F-clock and demands inverse reachability through the end. The native Node22 manual CI execution was dispatched after committing the SFT; consult its final run for execution confirmation.

## Correction to the older rank-transposition claim

The earlier [25-cell p16 rank-transposition gate](lp1-p16-square-hill5-lp2-original-gate.md) says that all 25 source values are distinct. **That is false**: exactly 12 values appear twice, symmetrically. Its documented 25-cell rank list nevertheless corresponds to a deterministic sort by (printed number, row-major cell index). That implicit tie-break is a **model choice** and is not selected by the original square. The older bounded negative for that specific sorted route remains valid; it cannot exclude every tie ordering or the separate 13-orbit quotient.

## Decision

Retain the cross-release 180-degree / 13-orbit clue as intermediate source structure. Reject only the six fixed direct/phi/rank period-13 additive consumers, under the unchanged original full-p0 test and p56-style transparent-F clock. A meaningful successor needs an **additional original instruction** selecting a typed 13-orbit operator or state update, plus a prediction of contiguous unknown plaintext on an independent receiver. No alternative orbit order, offset, cipher family or fitted plaintext is inferred from these negative outputs.
