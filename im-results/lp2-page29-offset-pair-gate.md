# The 29-page offset: exact-width common-pad obstruction and known-page transfers

**Agent24, 14 November 2026. Evidence class: bounded original-source negative.** The 58-page LP2 artifact and 29-symbol Gematria Primus alphabet make a two-block, 29-page offset a plausible human-visible hypothesis. The most useful test is the two final pairs for which the second page has known plaintext: p27↔p56 and p28↔p57. The direct known-page transfers and the stronger key-independent shared-pad tests below do not recover plaintext. No unknown key, plaintext, cipher architecture or continuation is claimed.

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

## Exact-width p13/p42 and p19/p48: all-pad and all-offset English word bridge

The original **58 physical pages** and **29-symbol GP alphabet** suggest pairing physical page p with p+29. Two pairs have exactly equal nontrivial rune lengths: **p13/p42 = 272/272** and **p19/p48 = 271/271**. This offers a plausible source-visible reason to look for a shared positional key, although equal length is not an authenticated cipher instruction.

Model the complete encryption as **C_a[t] = K[t] + sign·P_a[t] + u (mod 29)** and **C_b[t] = K[t] + sign·P_b[t] + v (mod 29)**. The unknown **K[t] can change arbitrarily at every position**. Both signs (+1 and −1) and all 29 relative page-constant offsets (u−v) are allowed. Subtracting the two source ciphertext tapes cancels the full unknown keystream. A necessary condition is that the resulting difference can be made from *two complete native GP29 English words* at every matched interior original-word overlap, with one consistent relative page offset.

The [original-source SFT](../sims/lp2_page29_equalwidth_twotimepad_wordbridge_sft.cjs) reconstructs the two printed word streams with their exact rune offsets, discards the first and last page fragment to protect against carried words, and compares every four-or-more-rune overlap. Every possible word of both printed lengths in the committed 29,000-plus-word English lexicon is examined. Greedy native GP29 spelling and the historical ING/IO contractions are both admitted, making the test more permissive than a single modern spelling convention.

| Physical pair | Equal-length input | Interior bridges (four or more runes) | Impossible at every offset, sign +1 | Impossible at every offset, sign −1 |
| --- | ---: | ---: | --- | --- |
| p13/p42 | 272 runes | **24** | start **211** (8 runes), **67** (7), **104** (6) | **211** (8), **67** (7) |
| p19/p48 | 271 runes | **18** | start **129** (8), **238** (7), **41** (6) | **129** (8), **238** (7), **41** (6) |

The complete word overlap at p13/p42 local rune offset **211..218** bridges a 14-rune p13 word and an eight-rune p42 word. **No dictionary pair** of these source word lengths can reproduce its observed difference under either arithmetic sign and any of 29 page offsets. The eight-rune p19/p48 overlap at local offsets **129..136** independently rejects the same full family. Both pairs have an empty intersection of possible global relative offsets. One incompatible bridge is enough to rule out the complete literal shared-pad architecture in this finite English register.

All **four reversible native-English planted positives** pass on Windows Node22: choose genuine GP29 dictionary words of every exact original interior fragment length, apply the same changing 29-rune pad to two synthetic full pages, add a hidden constant +5 on the second page, and invert each tested sign and page offset without knowing the pad. All original word bridges retain the authentic synthetic relative offset, and full-string reencryption reproduces the synthetic cipher exactly. The [executed CI run 44997818977](https://github.com/FlareZ123/liber-primus/actions/runs/44997818977) is green.

**Scope and decision:** Both original equal-width pairs fail **any** shared per-position GP29 additive keystream with one unknown constant offset between pages, in either common arithmetic direction, assuming the printed word segmentation is retained and complete words come from the declared source-native finite English lexicon. This is an additional key-independent exclusion beyond the [older all-page common-pad pairwise ranking](lp2-allpage-pagestart-commonpad-original-gate.md), whose five exact-DP pairs were different. Independent page pads, different word breaks, ciphertext-state feedback, non-additive ciphers and other plaintext registers remain outside this gate. No new plaintext, key or destination is inferred.

## Decision

Retire the simple p↔p+29 plaintext-running-key Vigenère/Beaufort relations, the position-preserving monoalphabetic relation, and the frozen p21/p50 8-cell row-per-line key. The p13/p42 and p19/p48 exact-width pairs also fail an arbitrary shared positional additive pad with any relative constant under unchanged native-English GP29 word boundaries. The 29-page offset remains a weak structural observation, not an authenticated operation. Do not extend it with arbitrary affine offsets, transpositions, or additional key schedules without a new original clue that selects them.

**Reproduction:** run node sims/lp2_page29_offset_pair_gate.cjs from the repository root. It reads the unchanged canonical rune corpus, original LP2 transcription, and canonical base60 grid; reconstructs p56 plaintext; verifies positive round trips; asserts all source counts and equality invariants; and prints the complete model metrics. Supporting inputs remain in resources/liber-primus/. The independent [page29 exact-width common-pad SFT](../sims/lp2_page29_equalwidth_twotimepad_wordbridge_sft.cjs) reads unchanged original GP pages, transcript and finite English dictionary. The [passing Windows CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44997818977) verifies all source overlaps, both signs, all 29 shifts and four complete native-word positive plants.
