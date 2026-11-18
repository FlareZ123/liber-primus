# LP2 pointer-direction pilot: source-authenticated number streams

## Question

The 2016 signed clue "their numbers are the direction" plausibly describes a word-wise key-pointer direction rule: the key pointer walks forward or backward according to a numerical property of each word. Public parallel research has an unfinished 18-convention pointer-direction campaign; the full 581-stream run is not yet complete.

This pilot asks a narrower, independently reproducible question: does the verified LP2 p56 prime/totient family become plausible when its key pointer is allowed to reverse according to the most literal Gematria-prime word rules?

## Exact pilot

Canonical inputs:
- resources/liber-primus/lp2-transcription.txt
- resources/liber-primus/lp2-corpus.json

Windows:
- first 300 runes of section 0.7 (729-rune section)
- first 300 runes of section 0.8 (1145-rune section)

Direction rules:
- G4_prev: previous word's Gematria-prime sum is 0/1 mod 4 -> forward, else backward
- GP_prev: previous word's Gematria-prime sum is prime -> forward, else backward
- G2_cur: current word's Gematria-prime sum is even -> forward, else backward
- G4_cur: current word's Gematria-prime sum is 0/1 mod 4 -> forward, else backward
- GP_cur: current word's Gematria-prime sum is prime -> forward, else backward

Pointer conventions:
- 000, 100, 020, 120, 010, 110
- both direction orientations
- key multipliers +1 and -1
- both collision models from the reference pdir specification
- beam width 8
- key offsets 400, 800, ..., 4800

Key streams:
- p_n - 1 (the exact family used by the solved p56 phi(prime) key, reduced mod 29)
- phi(n)
- n
- n^2
- Fibonacci
- prime gaps

Reproduction code: sims/lp2_pdir_gp_prime_key_pilot.cjs.

## Result

The pilot found no candidate above the 0.045 IoC screen gate used for this pilot as a conservative, above-baseline screening heuristic. This threshold was not pre-registered and is not a formal significance bar. Best per stream:

| key stream | best IoC | section | rule | convention | orientation | multiplier | model | offset |
|---|---:|---:|---|---|---|---:|---:|---:|
| primes-1 | 0.04136 | 0.7 | GP_cur | 120 | forward | +1 | 1 | 3600 |
| phi(n) | 0.04080 | 0.7 | GP_cur | 110 | reverse | +1 | 1 | 2400 |
| n | 0.04080 | 0.8 | GP_cur | 000 | forward | +1 | 0 | 400 |
| n^2 | 0.04107 | 0.7 | G4_prev | 120 | forward | +1 | 1 | 2000 |
| Fibonacci | 0.04036 | 0.7 | GP_prev | 010 | forward | -1 | 1 | 2000 |
| prime gaps | **0.04310** | 0.7 | G4_cur | 100 | forward | -1 | 0 | 4800 |

Random baseline for a 29-symbol alphabet is 1/29 = 0.03448. The best screen value is only +0.0086 above baseline and remains below the predeclared 0.045 gate.

## Interpretation

This is a **bounded negative**, not an exclusion of pointer-direction decoding.

It rules out only this intersection:

six simple numerical key streams × five literal Gematria-prime direction rules × six early pointer conventions × both orientations × both key signs × both collision models × the tested offsets, on the two tested 300-rune windows.

It does **not** rule out:
- the full 581-stream library;
- the remaining 61 direction rules;
- the other 12 conventions;
- different offsets or starts;
- other source-authenticated key families;
- a pointer rule using page/line/position numbers rather than word Gematria numbers.

The strongest next step, if compute is available, is therefore the independently described stage-1 screen over the full flat-IoC stream library and six conventions, rather than tuning the six streams tested here.

## Reproducibility

The script reconstructs the word direction vectors directly from the canonical transcription and implements the pointer plan and beam scoring in-process. It does not depend on another project's binary engine or cached results.
