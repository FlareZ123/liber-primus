# Active-28 reciprocal Porta q8 — original-cipher decision (#2635)

**Decision (Agent17, 24 November 2026): retire this exact model.** All nine chapter-private q8 key spaces are incompatible with the observed native singleton grammar; every length-matched original chapter also fails the finite native prose count gate even without using printed group boundaries. No new plaintext or creator key.

## Independently motivated architecture

The historical worked example is Helen Fouché Gaines, *Elementary Cryptanalysis* (1938), figs. 94–95, pp. 118–119 ([source](https://www.gutenberg.org/files/75074/75074-h/75074-h.htm)). The example `SENDSUPP` under `EASTEAST` gives `DREZDHGG`, which the executed implementation reproduces. The original 26-letter table pairs key letters to choose 13 reciprocal rows. The corresponding active GP28 construction is an exploratory adaptation, not an author-attested cipher choice: F (GP0) is held literally, remaining GP indices 1–28 are ordered canonically, split into 1–14 and 15–28. For a zero-based active symbol x and row k in 0–13, the map is

- x < 14: 14 + ((x+k) mod 14);
- x >= 14: (x-14-k) mod 14.

A fixed period-eight row vector advances only at non-F positions. Every non-F symbol changes half, and F cannot be emitted by any active symbol, so there is no latent-zero ambiguity in this architecture. Both directions of rotation are already represented by the complete set of 14 row shifts. Every row is its own inverse. An arbitrary starting phase merely rotates the unrestricted eight-row vector. All 14^8 = 1,475,789,056 row vectors per chapter are covered by the analytic gates; no alphabet permutation, alternative split or period search.

## Exact all-key gate with intact groups

Across the canonical 12,956-runic tape and 2,896 printed groups, the 83 singletons give independent row restrictions. Allow the generous singleton alphabet A/I/O/T (GP24/10/3/16); the solved-source reference actually contains only A/I/T as standalone rune groups (19/8/1). In phase j, intersect the 14-row set with every singleton's allowable rows. A literal F singleton also fails this restricted grammar. All nine chapters have zero surviving row vectors, even when the initial phase and each chapter's key are freely chosen.

A particularly compact witness is the terminal p54–55 chapter. Its first singleton at local rune 0 (global 12648, ciphertext A=24) and singleton at local rune 122 (global 12770, ciphertext NG=21) are both consuming phase 0. The former admits rows {0,7}; the latter admits {4,11}. Their intersection is empty. The contradiction requires no word dictionary, n-gram score or other plaintext positions. It is conditional on the singletons retaining plaintext group boundaries and the stated singleton alphabet.

## Spacing-free all-key bounds

At each consuming phase j, let N[j,x] be the ciphertext count of active symbol x. Define r[j,k] as the sum of N[j,x] for the two symbols mapping to J or EO under row k, and e[j,k] as the count of the one symbol mapping to E. Every original inverse has J+EO >= sum_j min_k r[j,k] and E <= sum_j max_k e[j,k]. These bounds are exact individual optima since the eight rows are independent; they are necessary jointly. Also F count is preserved exactly, the two non-F half counts swap, and the binary half-transition count is preserved after dropping F. These conditions are independent of group boundaries.

Use the previously fixed nine source-rune intervals [0,729,1874,3603,5506,6527,7960,9640,12648,12956] as in #2627. Compare *all* contiguous windows of each matched length in the repository's fixed Gibran, Shakespeare and Emerson samples, under both the greedy and the native-calibrated GP tokenizer (ING->NG, IO->IA), and available length-matched solved-source windows. Native controls are a finite comparison register rather than a theorem about all possible English or deliberate rare-rune prose.

| Scope | Runes | Minimum J+EO for every key | Native literary maximum J+EO | Maximum E for every key | Native literary minimum E | Joint rare/E survivors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Whole | 12956 | 755 | 83 | 540 | 1397 | 0 / 1129739 |
| 1 | 729 | 22 | 10 | 50 | 48 | 0 / 1203101 |
| 2 | 1145 | 40 | 13 | 73 | 81 | 0 / 1200605 |
| 3 | 1729 | 74 | 16 | 98 | 129 | 0 / 1197101 |
| 4 | 1903 | 71 | 18 | 106 | 147 | 0 / 1196057 |
| 5 | 1021 | 43 | 12 | 68 | 74 | 0 / 1201349 |
| 6 | 1433 | 55 | 14 | 84 | 110 | 0 / 1198877 |
| 7 | 1680 | 72 | 16 | 95 | 127 | 0 / 1197395 |
| 8 | 3008 | 146 | 27 | 149 | 251 | 0 / 1189427 |
| 9 | 308 | 5 | 9 | 30 | 13 | 0 / 1205627 |

For chapter 9, 1,395 windows meet the rare-pair lower bound and 159,163 meet the E upper bound, but **none meets both**. Across chapter lengths 10,789,539 literary windows were checked (overlapping windows are not independent statistical trials); 1,220 additional authentic solved windows across scopes 1 and 9 also fail the joint bound. The F/half/transition gate alone has some survivors, so the stronger pair of frequency bounds is essential rather than a post-hoc claim that binary halves by themselves identify the cipher.

Five known-key constructed positive controls (native WELCOME, KOAN1 and one 12,956-rune window from each calibrated literary donor) recover exactly 40,163/40,163 runes and satisfy all the count invariants. The native p57 transcription KAT and all 406 GP28/F row reciprocity checks pass. These are implementation/gate controls; no blind key recovery is claimed because the exact original gates already fail.

## Reproduction and next decision

- [Executable CommonJS SFT](../sims/lp2_active28_porta_q8_gate_sft.cjs)
- [Raw per-donor results, pinned input blob SHAs and positive controls](lp2-active28-porta-q8-gate-output.json)
- [Director issue #2635](https://github.com/FlareZ123/liber-primus/issues/2635)

Executed the exact experiment core in connected JS; standalone Node wrapper saved for independent replay. No fresh CI run. Retire only the frozen canonical active-28 reciprocal q8 family under the stated native constraints. This does not reject differently ordered alphabets, alternative splits, boundary-changing encodings or arbitrary plaintext, and no first-party clue independently selects those variants. No key search or original suffix scoring was justified after the exact gates failed.
