# GP29 graphical key selectors: 2012 Mayan banner and LP2 marked groups

**Director #3044, Agent12, 26 November 2026.** Bounded source-selector negative; no new LP2 key or plaintext.

## Executable historical control

The preserved 2012 subreddit [banner](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/banner/UMa-nedknxEIvArh.png) (Git blob bd2e29da4bfbe9bb94e1f4f9ae4beeb30beabbe0, 24,851 bytes) visibly has thirteen separated Mayan numeral groups, each with bars worth five and dots worth one (shell means zero). Inspected actual PNG bytes in the connector image renderer: the values are 10,2,14,7,19,6,18,12,7,8,17,0,19. The archived subreddit information includes `a2e7j6ic78h0j7eiejd0120`. The first thirteen characters give exactly the thirteen visible values when a=10, b=11, etc. The final ten characters extend the numerical key to 23 shifts:

    10 2 14 7 19 6 18 12 7 8 17 0 19 7 14 18 14 19 13 0 1 2 0

With the [archived ciphertext](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/ciphertext.txt) (blob 785e7d964770a07d99d11934f129ab1ee4f98aad), uppercase A–Z, subtract these shifts mod26, reset to phase zero at newline, skip all nonletters. The actual executed reproduction returned **12,385/12,385 matching characters** against the independently stored archive plaintext (blob da595691468ae514686ac693ac6ee70411fb06ec), with 9,526 letters consuming key. Its first line is King Arthur prose. This reproduces a solver-established operation, not a claim that the subreddit banner itself was PGP-signed. Crucial selection information is the thirteen **separated numerical values** in the banner and the independently printed 23-character string, not just the counts 13 and 23.

## Original LP2 comparison

Inspected actual [2013 GP chart](../resources/historical/cicada2013-gematria-jpeg.b64) (blob 625717bab1bff316c204b197c1cd901eb3cd7cb6), and original scans 17,49,72 (LP2 p0,p32,p55). The chart explicitly pairs each glyph with a Latin letter/digraph and its assigned prime; it supplies no Mayan bar/dot reading or alternate homograph convention. On p0 there is one enlarged red initial plus twelve other red runes, two words (8+5), one dense red 13-dot punctuation mark, and the black three-crossbar staves. There are no thirteen separate bar/dot/shell numerical records and no paired 23-character auxiliary key string. The p32 tree and p55 tree illustrations likewise supply no grouped Mayan bar/dot notation; p55's 3 and 5 margin dots are separate ornaments, not a five-valued bar. Ordinary neighboring black glyphs on p0 use the same chart identities and the marks are not a second glyph alphabet.

The numerical comparison below tests the strongest narrowly specified direct historical analogue, rather than visually guessing letters from shapes. With the first thirteen canonical p0 runes as printed (red), the existing GP0, GP1 and GP-prime readings are:

| Reading | Values | Exact positions matching historical banner |
|---|---|---:|
| GP0 | 15 8 18 3 6 19 27 0 15 26 18 21 5 | 0/13 |
| GP1 | 16 9 19 4 7 20 28 1 16 27 19 22 6 | 0/13 |
| GP primes | 53 23 67 7 17 71 107 2 53 103 67 79 13 | 1/13 |

These are fixed source readings, not an optimization over numeral permutations. The one match is the fourth entry (7), and does not identify the vector. Although p0 has a 13-dot mark and p57 has a terminal 23-dot mark, these are single punctuation clusters, not the historical thirteen-value prefix paired with an explicit 23-character string. Counting them does not recreate the 2012 disambiguation. No original ciphertext was decrypted using this key, no output was selected for visual resemblance, no generalized homograph mapping was fitted, and no claim is made against arbitrary graphical rebuses. The independent U1165 stave-to-TH result in #3043 is a distinct convention and remains intact. Neither source supplies a 29-rune continuation from the same rule.

**Decision:** the 2012 example demonstrates a usable visual numerical key selector with a fixed independent operand. The marked LP2 pages do not instantiate that specific selector. Retire this particular transfer; a new first-party graphical-to-key correspondence, not a bare numeral count, is required. See [historical operation profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md).

## Independent exploratory direct-key receiver (not a source-selector claim)

After the visual-selector decision, a single fixed, inexpensive decipherment was attempted because the earlier actual 2012 key has 23 shifts and a 13-value visual prefix, and original LP2 visibly uses 13-dot and 23-dot markers. This is only a historical transfer conjecture, explicitly **not** a consequence of the preceding source-selector gate. The complete historical vector was frozen before original scoring; transfer its exact per-physical-line phase-zero reset and subtract under GP29, with either ordinary consumption or the separately attested native plaintext-F hold. No phase offsets, alternate orders, signs, alphabets, derived keys or modulus search. The transcription's 57 runic page records map to physical pages with missing runeless p50; every page's rune tape matches the canonical corpus. Original unknown input contains 594 physical lines / 12,956 runes. For the hold variant, dynamic programming preserves all legal phase/last-two-symbol states and returns the highest-score complete path under a trigram model trained on the first seven independent solved-native records; p56 and p57 are held out as freshly encrypted controls, not assumed to have this historical key in their actual ciphertext. Both 85-rune and 95-rune controls recover every rune in both variants, with −2.3873 and −2.3979 nats/rune respectively. Every decoded path is forward replayed.

| GP29 historical-key transfer | Legal lines | Complete physical pages | Score on legal runes |
|---|---:|---:|---:|
| Ordinary | 594/594 | 55/55 | −4.99973 nats/rune |
| Literal F hold | 345/594 | 1/55 (p51) | −4.93677 nats/rune |

The hold law is algebraically impossible on the complete original tape (first infeasible line is the third on p0). Its only all-legal page p51 has score −5.13594. Ordinary p0 scores −5.10701, and even the best of the 55 post hoc page summaries is −4.71006, far below the held native controls. This is a fixed direct-key search negative, not a proof against all historical-key-derived KDFs, nonstandard registers, or all alternate clock laws. No new original plaintext or key. [SFT](../sims/lp2_2012_maya23_native_linekey_sft.cjs), [raw output](lp2-2012-maya23-native-linekey-output.json); actual connected V8 execution, no independent Node wrapper/CI claim.

### Unknown-alphabet extension: exact rank constraints and constructive recovery

The same frozen historical 23-shift vector and physical-line zero phase are now tested under **every permutation of GP29 fixing F**, using (C=\pi^{-1}(\pi(P)+k_j)\). The permutation is a speculative extension, not selected by the historical banner. No alternate shift vector, phase offsets or clock rules were fitted.

For literal F hold, before the first ciphertext F on a line, every position necessarily consumes its shift and is a non-F plaintext rune. Thus for ciphertext symbol x and known phase j, \(\pi(x)\ne k_j\). Across all 594 unknown physical lines, 8,784 such positions suffice. Maximum bipartite matching on all 29 symbols to permissible ranks has size **17**. The exact Hall witness is all 28 non-F symbols, whose union of permissible ranks is only `{3,4,5,9,11,15,16,20,21,22,23,24,25,26,27,28}` (16 ranks). The global line-reset literal-F law is impossible under any fixed GP29 permutation. The p0–2-only gate has a full matching and is not excluded by this necessary condition. Two re-encrypted authentic native-text controls using independently randomized alphabets retain their true ranks and each have a full matching. Full symbol/rank source-position witness is preserved in the output.

For ordinary consumption, train only the 156 complete black-body p0–2 groups (716 runes), withhold all 161 complete p3–5 groups (740 runes), and freeze the 38,910-form unaugmented native GP lexicon and at-most-seven OOV threshold (floor 5%). Each word option adds exact fixed-shift rank equations; a numeric weighted component graph joins them and rejects impossible coordinate collisions. Unknown component translations are packed exactly when only three remain. The solver chooses a constrained word by viable domains, branches on every candidate and explicit omissions, and checks the complete training register only after packing the rank permutation. Two blinded matched-profile uniform-register plants with two unsupported words and independent hidden alphabets recover the exact action in **9 and 7 nodes**, respectively, every training rune and every withheld rune. Neither true key nor heldout groups enter the search. Both controls use precisely the frozen known shifts.

On original p0–2, **nine individual complete groups** (zero-based body indices 5,15,18,35,62,71,83,139,149) already have empty domains under every rank permutation. This is an exact finite-register obstruction exceeding the frozen seven-OOV allowance before any multiword search; no original candidate key or plaintext. It is conditional on that register, native printed group boundaries and the 5% budget; it does not exclude a larger OOV allowance or arbitrary glyph transport. The literal-F Hall result is dictionary-free, but requires a single shared alphabet over the full original line set. No further enlargement of the speculative historical transfer is justified.

[Standalone receiver](../sims/lp2_2012_maya23_mixed_alphabet_recovery_sft.cjs), frozen commit 331b371d; [complete Hall witnesses and original/control output](lp2-2012-maya23-mixed-alphabet-output.json), d063967a. Both controls and original execution ran in V8; the Node wrapper was not separately executed.
