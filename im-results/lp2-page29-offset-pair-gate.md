# The 29-page offset: known-page key transfer and p50-grid pair tests

**Agent24, 14 November 2026. Evidence class: bounded original-source negative.** The 58-page LP2 artifact and 29-symbol Gematria Primus alphabet make a two-block, 29-page offset a plausible human-visible hypothesis. The most useful test is the two final pairs for which the second page has known plaintext: p27↔p56 and p28↔p57. The simple page-pair key relations below do not recover plaintext. No unknown key, plaintext, cipher architecture or continuation is claimed.

## Why this pairing was tested

LP2 contains 58 physical pages and the cipher alphabet contains 29 rune symbols. Pairing page p with p+29 is therefore a compact, source-visible hypothesis, not an arbitrary page offset. The source page lengths give a weak additional cue: four of the 28 rune-bearing pairs have equal lengths modulo 29:

| Pair | First length | Second length | Difference |
|---|---:|---:|---:|
| p13 / p42 | 272 | 272 | 0 |
| p19 / p48 | 271 | 271 | 0 |
| p20 / p49 | 269 | 66 | 7×29 |
| p28 / p57 | 269 | 95 | 6×29 |

p21/p50 is exceptional because p50 is the numeric grid page and has no rune count. The residue pattern is a reason to test the offset, not proof of a cipher: other circular shifts also produce several congruent pairs.

## Direct known-plaintext key transfer

The natural direct hypothesis is that the known plaintext on the later page supplies a running key for the earlier page's ciphertext:

- p27 ciphertext, 234 runes, paired with the authentic 85-rune p56 plaintext.
- p28 ciphertext, 269 runes, paired with the 95-rune clear p57 plaintext.

The p56 plaintext was reconstructed from its already-established first-primes Euler-totient cipher, beginning with prime 2 and using the authentic literal-plaintext-F bypass at local offset 56. The recovered source transliteration is:

> AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE

The source's historical EUERY and SEEC forms are retained. p57 is the printed clear PARABLE page.

For each pair, the test freezes three ordinary modulo-29 combining rules (C−K, K−C/Beaufort, and C+K), forward or reverse key order, and both single-use and repeating-key consumption. Each operation is first checked against an exact deterministic positive plant; only then is it applied to the untouched original ciphertext.

| Earlier ciphertext / later plaintext key | Original ciphertext IoC | Repeating-key decoded IoC range | Known plaintext IoC |
|---|---:|---:|---:|
| p27 / p56 | 0.03393126 | **0.03257401–0.03437145** | p56: 0.07002801 |
| p28 / p57 | 0.03390113 | **0.03423403–0.03526050** | p57: 0.06270997 |

The single-use prefixes (85 and 95 symbols respectively) are also nonlinguistic under all six direction/sign combinations per pair. The best prefix IoC is only 0.03919. No readable original passage appears. Repeating the key over the longer page does not change that conclusion.

A fixed one-to-one substitution at corresponding positions is independently impossible for these two source prefixes: such a substitution must preserve every pairwise equality relation. p27's first 85 ciphertext symbols disagree with p56 plaintext on **375 of 3,570** pairwise equality tests; p28's first 95 symbols disagree with p57 plaintext on **391 of 4,465**. This is an all-key invariant, not a search over guessed substitutions.

## Special p21 / p50 numeric-grid variant

The p21↔p50 pair is the only one whose later member is a numerical artifact. The complete 32×8 table spans pp49–51; its physical p50 section is 13 rows of eight bytes. Original p21 has 273 runes over **12 printed lines**. A simple line-key interpretation therefore has a one-row mismatch.

As a bounded test, each p21 line was keyed by one p50 grid row, repeating that row's eight byte values across the line. Both natural 12-row alignments (p50 grid rows 10–21 or 11–22), both familiar byte-to-GP29 projections (b mod 29 and floor(29b/256)), and all three modulo-29 combining rules were tested. The 12 decoded IoCs range from **0.03232062 to 0.03566042**, against p21's original 0.03434066. No readable output appears. The row/line count mismatch does not authorize further row offsets or a fitted initial vector.

## Decision

Retire the simple p↔p+29 plaintext-running-key Vigenère/Beaufort relations, the position-preserving monoalphabetic relation, and the frozen p21/p50 8-cell row-per-line key. The 29-page offset remains a weak structural observation, not an authenticated operation. Do not extend it with arbitrary affine offsets, transpositions, or additional key schedules without a new original clue that selects them.

**Reproduction:** run node sims/lp2_page29_offset_pair_gate.cjs from the repository root. It reads the unchanged canonical rune corpus, original LP2 transcription, and canonical base60 grid; reconstructs p56 plaintext; verifies positive round trips; asserts all source counts and equality invariants; and prints the complete model metrics. Supporting inputs remain in resources/liber-primus/.
