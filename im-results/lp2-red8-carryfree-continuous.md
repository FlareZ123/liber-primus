# Carry-free source-red8 continuous common-cycle receiver (Agent11)

**Status:** 24/128 original fixed key/clock/history configurations exactly excluded, 104 capped, no candidate with at most three OOV complete groups. Two genuine OOV native positive controls recovered their hidden alphabet, exact training plaintext and legal continuation replay. This is a partial negative result, not an original plaintext recovery or a general q8 exclusion.

## Motivation and locked scope

Critic broadcast 20261126T1038Z identified a substantive limitation of the earlier terminal common-cycle search: requiring the ten-rune prefix of the eleven-rune p54/p55 carry to be in the augmented dictionary rules out real native examples. Test a narrower historically motivated clock (continuous consuming, literal plaintext F hold), with fixed source-red8 keys and arbitrary bijective alphabet pi fixing F. Do not use the carry prefix, suffix or later body in fitting. Fit only the 47 complete p54 black-body groups (213 runes, three visible F). The unaugmented TextBlob GP29 register has 38,910 forms; do not add the 28 native OOV types. Allow at most three OOV among the 47 groups.

Let P,C be ordinary GP29 ordinals, pi a permutation fixing 0, K one of the literal red8 ordinal [19,21,23,27,2,14,10,19] or prime residue [13,21,2,20,5,18,2,13]. On a consuming position pi(C)=pi(P)+K[j] mod29, P != 0; P=0 writes C=0 without advancing j. The 8 starts and 8 visible-F masks give 64 configurations per K. Sign reversal is equivalent under pi -> -pi. Key choice remains a hypothesis, not authenticated.

## Exact receiver

[Compiled single-file test](../sims/lp2_red8_carryfree_continuous_sft.cpp). Each possible word contributes difference constraints pi(c)-pi(p)=k. Weighted connected components maintain exact modular differences and reject residue collisions. A fixed zero component anchors absolute residue domains; all consuming ciphertext positions impose nonzero decoded P even in omitted words. Component-placement domains include this forbidden-label constraint. Indexed bitsets prune word options using necessary single-edge compatibility; retained options are checked by complete graph extension before branching. Explicit OOV branch or empty-domain charge retains all solutions within budget. When <=4 components remain (or no word domains remain), exact disjoint placement enumeration produces permutations and full fit scores. Caps are explicit, and a clipped run cannot certify exclusion.

## Real native controls

Pinned source resources/external/relikd-solved-gp29-native-v1.json (blob 1b064ef6d85819b7d96adaff31a82d1ec551598f), section 0_loss_of_divinity; first 47 words before native indexes 67 and 141, followed by the actual 11-rune OOV carry d4ifi41ogr9 (PRESERUATIAN) and 16 more words. Carry prefix absent from the unaugmented register. Deterministic hidden pi from mt19937 seeds 0x59ba31 and 0x6cf32b. Controls supplied their true start and visible-F history to the receiver; these are conditional alphabet-recovery controls, not blind clock recovery. Both six-second searches were clipped after retaining the true alphabet and exact 47-word fit. Continuation replay checks known true held plaintext against held ciphertext with the recovered alphabet and end phase; not independent unique held plaintext inference. No original p55 groups have been scored or fitted.

| Native index | OOV fit | K | Start | F mask | Recovered pi | Nodes | Qualifying |
|---:|---:|---:|---:|---:|---|---:|---:|
| 67 | 2 | 0 | 0 | 1 | 04heg5ro7la69nc3ifskbqdpj182m | 305664 | 1 |
| 141 | 3 | 1 | 1 | 70 | 0eghp5iq1749mdcojsfrn83alk6b2 | 324864 | 1 |

Initial JS search timed out; compiled word-domain branch order was developed against these controls, including tracing true paths. Final bitset solver retained both controls. Do not count these as untouched blind controls.

## Original test

Input: resources/liber-primus/lp2-page-groups-54-55-derived.json, complete black groups only. ID = 64*key + 8*Fmask + start. All 128 attempted at 3 seconds each; 15,088,898 nodes and 95 completed permutations across searches (possible duplicate permutations within configurations). Zero qualifying. **Completed/excluded IDs:** 13,24,28,29,31,40,44,45,47,48,51,53,55,56,57,60,61,62,63,112,115,117,119,126. Remaining 104 are unresolved, not excluded. Ordinal 19 complete; prime 5 complete.

Dictionary source resources/control/english_wordfreq_textblob.txt, blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938. The locally installed spelling file had identical 29,157 recognized lines by FNV-1a 3351310445 and reproduced 38,910 forms. Source embedding in test is explicit.

Run with a C++17 compiler supporting the GCC/Clang bit intrinsics:
```sh
g++ -O3 -march=native -std=c++17 sims/lp2_red8_carryfree_continuous_sft.cpp -o carryfree
./carryfree resources/control/english_wordfreq_textblob.txt control 6
./carryfree resources/control/english_wordfreq_textblob.txt original 3 0 128
```
Return status 3 in original mode indicates at least one clipped configuration; use per-ID clipped flags to distinguish exact negatives. Time-capped node counts are machine-dependent.

## Decision

Keep the mandatory-carry exclusion clearly conditional. The missing-carry escape is now executable with true native OOV examples, without widening source keys or changing the clock. A complete no-carry-free fit exclusion would remove this particular escape from the fixed-source-key/continuous-clock branch, but it would not address arbitrary key residues, alternate clocks, different lexical coverage, or unknown plaintext generally. The 24 completed configurations are a reproducible partial constraint. Continue only if a stronger solver materially advances actual candidate recovery or completion.
