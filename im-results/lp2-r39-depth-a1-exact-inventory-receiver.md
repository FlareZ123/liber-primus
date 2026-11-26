# R39 D-R29 A1 exact inventory inverse (#2973)

**Decision:** correct-sender recovery succeeds, but wrong-inventory discrimination fails. No original ciphertext scoring or unknown plaintext/key.

## Sender and scope
[R39 exact sender](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round39/C1-sense-similarity/enciphers.py), A1 D-R29, [726-row archived depth index](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round39/C1-sense-similarity/lp1_sense_index.json), blob 164e66f63cf5ff13c32ee23afb2d4d1cc30b325f. All 726 local D values match. Encrypt word k by adding sign*D[(s+k)%726] mod29, s=0..28, signs +/-. No F hold or skip. Distinct from #2964 decoded-word sum and #2965 public cipher-prefix state. Same word-clock form as #2963 but different frozen external index: zero identical 19-word schedules among 84x84 D and B effective offset/sign pairs. R47 L2 printed-order receiver had zero b-prime power. Agent6's earlier latent A3 key-pointer receiver is separate.

## Matched control geometry
Opening sentences [13,154), [154,275), [434,531), [531,729) have zero matching contiguous word windows across Gibran (12572 words), Emerson (74866), Shakespeare (55407), under existing native GP encoding. Full opening calibration unavailable without changing inventory. Select by geometry alone [275,297) fit and [297,350) untouched continuation, wholly inside page 1. Exact original inventories [8,4,6,4] and [2,3,2,9,6,3,2,2,5,3,4,3,3,4,2]. CS effective offset t=s+k0 conservatively 0..41 from preceding 13-rune page prefix; cannot separately identify s and k0. 107 fit matches and 15 continuation matches, 11 disjoint pairs chosen in corpus order. Each excerpt contiguous, but paired excerpts need not be adjacent prose. Prior use of individual windows elsewhere in repository not comprehensively ruled out.

Use frozen #2963 TextBlob conditional-length score (33350 native-spelled forms), OOV cost 12+length*ln29. For each shift schedule, exact memoized DP over remaining length counts; offset and word ordinal are determined by counts, no pruning/cap. Fit selects schedule from four-word sentence; hold uses same schedule advanced four words, no key reselection. All returned paths replay. Passing gate fixed in code: >=10 pairs, >=80% controls with >=90% accuracy, unique correct effective schedule, both scores <=2.5, zero accepted wrong-law or wrong-length controls. Wrong law B-R29 A1 on same donor; wrong lengths transfer one rune from a 9-word to a 2-word in held inventory, maintaining count and total.

| Metric | Result |
|---|---:|
| Unique correct effective schedule | 11/11 |
| Correct recovery and score gate | 11/11 |
| Exact complete rune tape | 10/11 |
| Minimum complete tape accuracy | 74/75 |
| Wrong-law accepted | 0/11 |
| Wrong-length accepted | 10/11 |
| Wrong-length held rune tape still exact | 4/11 |
| Original scoring | withheld |

An identifiability reason: adjacent equal scheduled shifts make their shared boundary invisible to rune ciphertext. Incorrect inventory acceptance is not necessarily false plaintext (four wrong inventories preserve every held rune), but it is false acceptance of the stipulated geometry. Cannot establish geometry from score alone. Do not tune on these controls or weaken the gate. No original exclusion; new independently selected geometry/operation needed.

[SFT](../sims/lp2_r39_depth_a1_exact_inventory_sft.cjs) commit 20bbe96e235ecb52cfe406cbdc5552a1e936720a; [raw results/input SHAs](lp2-r39-depth-a1-exact-inventory-output.json) commit d922735b6320b2e55e55495fa447e2508c770fa5. Exact JS core executed in connected V8 with archived index comparison; standalone Node wrapper not separately run. No unknown LP2 plaintext or key.
