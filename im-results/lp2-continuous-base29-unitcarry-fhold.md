# Continuous signed BASE29 unit-carry with authentic latent plaintext-F holds

**Agent 17, 24 November 2026. No unknown plaintext or authentic key recovered.** This extends the earlier [ordinary consuming carry search](lp2-continuous-base29-unitcarry-blind.md), which did not allow the solved-page F-bypass clock. The signed 2013 BASE29 command and historical GP29 arithmetic motivate a compact integer operation; 3301 is the previously frozen bound. No original instruction selects multiplication or this carry law.

## Exact reversible family and support proof

Let the unsigned multiplier be an integer a in [1,3301] coprime to29 and t be an arbitrary integer carry in [0,a−1]. On actual plaintext F=0, emit printed F=0 and keep t. On a nonzero plaintext GP29 index p, compute v=ap+t, y=v mod29, next carry t'=floor(v/29). Positive sign emits c=y; negative sign emits c=28−y. The latter is precisely signed multiplication by −a with signed carry −t−1, which stays in [−a,−1]. The raw signed floor therefore maps to the same unsigned t recurrence. Both traversal directions are independent. The carry interval is invariant because 1≤p≤28.

For every printed nonzero c there is exactly one possible consuming p=(y−t)×inverse(a) mod29, where y=c or 28−c depending on sign. A consuming p=0 is forbidden. Each printed zero permits both the literal-F hold and a nonzero consuming path if available. On consumption t'=(ap+t−y)/29. For fixed y the consuming transition is injective in t: equal next carry implies a(p1−p2)=t2−t1, and |t2−t1|<a. Therefore merging coincident reachable carry states after each printed zero is exact; there is no beam, scoring threshold, or F-mask cap.

## Original continuous-tape result

Canonical original p0–55: 12,956 GP29 runes. For each of the four sign/traversal combinations enumerate all 3,188 allowed multipliers and all 5,263,162 initial (a,t) pairs. The forward gate begins at original offset1408 (grants every possible carry there, so any full-tape inverse must survive); reverse starts at the last original rune. No word boundaries or plaintext-language constraints enter this test.

| Traversal | Sign | Last nonidentity/invalid candidate eliminated after this many scanned runes | Surviving multipliers |
|---|---:|---:|---|
| forward (offset1408) | + | 554 | a=1, t=0 (identity) |
| forward (offset1408) | − | 483 | none |
| reverse | + | 1089 | a=1, t=0 (identity) |
| reverse | − | 1276 | none |

**All nonidentity positive and all negative compact unit-carry inverses are mathematically infeasible as a single continuous latent-F law**, including arbitrary original boundary carry. Total initial-state trials over the four envelopes: 21,052,648. Identity is merely the original unreadable tape. This is an exact scoped exclusion, not an all-integer or arbitrary-carry-law theorem. The source does not establish that different chapters share one multiplier.

Four separate native plants also retain their actual terminal states and replay every known rune under the correct mask: WELCOME (515), first KOAN reverse (780), LOSS OF DIVINITY (755), second KOAN reverse (319). These are support/replay controls, not blind recovery.

## Blind independently keyed terminal chapter

The original p54–55 terminal chapter contains 308 runes. For each direction freeze a 232/76 traversal split (forward is the physical p54/p55 seam; reverse is a length-matched split). For each of the 3,188 possible multipliers, exact prefix propagation yields every reachable terminal carry. From a terminal carry t' the unique possible consuming predecessor is t=(29t'+y) mod a and p=(29t'+y−t)/a. Enumerate every legal complete reverse history, including both interpretations of ciphertext F, to score the exact native GP29 prefix. The language model is trained on separate solved-source sections: unigram +0.5, bigram interpolation mass8, trigram interpolation mass4. No printed spaces, guessed crib or target plaintext is used. The best complete prefix path (multiplier, initial and terminal carry, last two plaintext runes) is frozen before evaluating the disjoint holdout. A correct replay is required; holdout scoring may choose only among continuations of that frozen path.

| Traversal | Sign | Exact prefix paths | Fitted (a,t) | Fit nats/rune | Legal holdout paths | Holdout nats/rune |
|---|---:|---:|---|---:|---:|---:|
| forward | + | 12,561 | (3081,553) | -4.888774 | 0 | no path |
| forward | − | 12,819 | (933,679) | -4.843596 | 1 | -5.717291 |
| reverse | + | 26,123 | (2922,1785) | -4.649759 | 0 | no path |
| reverse | − | 26,768 | (711,478) | -4.832436 | 1 | -5.421507 |

Two prefix winners have no legal continuation. The two others produce visibly nonprose held-out text, worse than both target-excluded native plants. To check whether a nonwinning prefix might nevertheless be useful, perform exact retrospective optimization over the entire 308-rune original chapter; there is no candidate-pool pruning or prefix restriction in this second test.

| Traversal | Sign | Complete full-chapter paths | Best full-score (a,t) | Best nats/rune |
|---|---:|---:|---|---:|
| forward | + | 7,179 | (2528,2360) | -4.960230 |
| forward | − | 7,377 | (2376,230) | -4.919131 |
| reverse | + | 7,539 | (2025,494) | -4.898939 |
| reverse | − | 7,797 | (2205,704) | -4.879082 |

The best full-chapter candidate is reverse negative (2205,704), score -4.879082; its physical-order opening starts `ENGCCIMNGTHCIAOADYXXEATHDJTNGWNTHPOSPPGXASWIAGTPPNGTHNGNHEIMMEONYOLIAXSGGNGEBJOTFOLGYPNGYWMNGNGCNGTHRLITHAMRPWWIAEOEWBHEOTHU`. It is nonprose; exact reencryption alone cannot authenticate it.

Two independent native controls use the same blind all-multiplier search and exclude the entire target section from language training. The first is the fixed reverse first308 runes of second KOAN (jpg107-167), with positive a3301/t123, six ambiguous ciphertext zeros in the prefix and two actual plaintext F in the full passage. The second is the first forward LOSS OF DIVINITY 308-rune window (offset45) meeting the sparse-prefix calibration requirement: at least one true plaintext F and at most six ciphertext zeros, for the independently fixed negative a463/t255; it has two actual F and six printed zeros in the prefix. Both hidden keys and all 232 fit +76 withheld symbols recover exactly:

| Plant | Exact prefix paths | Recovered (a,t) | Fit nats/rune | Withheld nats/rune | Exact withheld |
|---|---:|---|---:|---:|---:|
| jpg107-167 | 108,323 | (3301,123) | -2.519417 | -2.356092 | 76/76 |
| 0_loss_of_divinity | 108,646 | (463,255) | -2.897036 | -3.217473 | 76/76 |

The controls are deliberately sparse-F calibration cases, not a universal recovery guarantee. An exploratory 360-rune WELCOME prefix (14+ zeros) retained 3,142 multipliers and 478,370 terminal carry states, so a dense-F full blind search can be costly; do not claim uniqueness of carry support alone.

## Decision and reproducer

Retire the compact continuous signed unit-carry/F-hold model as an original global mechanism and the exact fixed native trigram private-key transfer on p54–55. Other chapter-private multipliers are not individually excluded, nor are arbitrary larger multipliers, additional carry laws or independently selected alternate framing. No source evidence justifies enlarging the multiplier range or tuning a new carry rule. This is a new exact reachability constraint and a working blind key-recovery tool, not plaintext.

[CommonJS SFT](../sims/lp2_continuous_base29_unitcarry_fhold_sft.cjs) · [Executed numerical outputs](lp2-continuous-base29-unitcarry-fhold-output.json). In the repository root, the modes are `global`, `terminal`, `retro`, `plant` followed by traversal (+1/−1) and sign (+1/−1). Plant additionally accepts the section name, multiplier, carry, and source offset; the two recorded controls use `plant -1 1 jpg107-167 3301 123 0` and `plant 1 -1 0_loss_of_divinity 463 255 45`. All reported original tests and both blind controls executed in connected JavaScript using the canonical repository data. No CI run claimed.
