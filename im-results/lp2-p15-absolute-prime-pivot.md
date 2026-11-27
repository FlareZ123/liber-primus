# P15 absolute-prime distance clock: all-pivot relaxation and original inverse

**Agent28, 27 November 2026. Decision:** reject the direct GP29 absolute-prime clock on the original p15–22 text. The exact transparent-F test excludes even an arbitrary pivot residue and an independently chosen single reflection point, for all initial prime ordinals 0–3301. The ordinary source-pivot inverse also fails its frozen continuation. No unknown plaintext or authentic new key recovered.

## Source-selected interpolation

The established p15 spiral is `abs(3301 - prime[F+1])` at Fibonacci ordinals 0,1,2,3,5,...,987 (one-based prime indices 1,2,3,4,6,...,988). All 16 printed differences are reproduced exactly; prime 3301 is the 464th prime. Instead of interpolating arbitrary digits or moving along sparse Fibonacci indices, test the simplest dense interpolation of the very operation that produced the visible numerals:

```
K(j) = abs(3301 - prime[j]) mod 29    // zero-based j
C_i = P_i + K(j) mod 29
```

The source determines the pivot 3301 conditional on the established graphic construction. It does not explicitly say to use dense prime indices or a GP29 additive receiver. The latter is historically motivated by solved p56, which uses the prime-minus-one shift and transparent plaintext F. The alternative receiver permits ordinary consumption for every rune. Unlike the earlier [Fibonacci-ordinal complement](lp2-p15-fibonacci-prime-complement.md), this hypothesis removes no primes; unlike the [modulo-3301 Fibonacci continuation](lp2-p15-fibprime-mod3301-infinity-original-gate.md), it does not advance by Fibonacci recurrence. The [affine-prime gate](lp2-affine-prime-fhold-singleton-original-gate.md) concerns a single affine slope and a different original target, not a freely reflected clock.

## Exact arbitrary-pivot upper relaxation

For any integer pivot B, write b=B mod29. Since the primes increase strictly, `abs(B-prime[j])` equals B-prime[j] before the crossing and prime[j]-B after it. The GP29 stream is therefore a single change from `b-prime[j]` to `prime[j]-b`. Grant every b=0..28 and a single freely placed switch at any consuming key event (including immediately or never). This is a *superset* of every integer-pivot clock; the switch need not be consistent with an actual integer B between the two surrounding primes.

Exact transparent-F reachability tracks (h,m), where h is the number of literal-F holds and m is the before/after reflection mode. At physical position i and start s, the next prime is j=s+i-h. A hold is allowed iff C_i=0, and leaves m unchanged. A consume is allowed iff C_i differs from the selected shift, since otherwise the implied plaintext F would have had to bypass. Before mode may switch to after on that consume. After mode cannot return to before. A switch during a hold can be deferred to the next consume without affecting any output. Merge equivalent states; no beam, dictionary, or language judgment.

All 3,302 starts s=0..3301 and 29 residues are tested, i.e. 95,758 start/residue classes per target, each representing every possible one-switch location and F history. The original corpus is unchanged; no printed-word assumptions. The two source boundaries are p15 offset20 (after its 13-dot mark) or physical p16. The exact fixed-pivot receiver separately tests all 3,302 origins.

## Original result

| Target | Runes | Source origin0 legal prefix | Fixed 3301: best legal prefix | Arbitrary pivot/switch: best legal prefix | Full legal classes |
|---|---:|---:|---:|---:|---:|
| p15 offset20–p22 | 1,883 | 12 | 435 (s=3024) | 1,323 (s=1494/1495,b=11) | 0 |
| p16–p22 | 1,744 | 38 | 443 (s=72) | 1,239 (s=687,b=24) | 0 |

Legal prefix counts are numbers of processed runes, not offsets of a surviving last symbol. Neither relaxed prefix reaches the physical p22 holdout boundary (1,752 or 1,613). Thus **no integer absolute-prime pivot at any of the bounded origins can produce either entire original target under the authentic plaintext-F hold rule**, even before source-language constraints.

For ordinary consumption, exhaust all 3,302 origins for the source pivot 3301, select the maximal hierarchical native trigram log likelihood on text before physical p22, freeze the origin and decode all 131 withheld p22 runes. Score is log likelihood relative to uniform GP29, nats/rune. Train the model from the nine solved-native records, excluding no original target text.

| Target | Best fit origin | Fit score | Frozen p22 score | Best vs second fit gap (nats) |
|---|---:|---:|---:|---:|
| p15 offset20–p22 | 1578 | -1.688427 | -1.863662 | 24.585127 |
| p16–p22 | 2967 | -1.688747 | -1.824848 | 13.313211 |

Both complete ordinary outputs are nonprose; the first begins `M IA O N Y D W Y H Y F AE B X A Y ...`, the second `O TH EA S D G F U A O J EA TH M H ...`. All outputs replay exactly by construction. No arbitrary-pivot ordinary language search is claimed. The p22 split is a within-experiment frozen continuation, not globally unexamined LP2 material.

## Calibration and reproducibility

- Real solved p56: all 85/85 original ciphertext runes replay, 84 consuming.
- 240 seeded 12-rune small cases, each with two forced-zero placements (which may coincide), compare the two-mode relaxation's maximal legal prefix against explicit enumeration of every switch count and the independent fixed-key reachability implementation; all agree. This checks prefix reachability, not every endpoint set.
- Three solved-native plants, excluding each donor record from its own ordinary language-model training, use origins 100,400,20 and pivots 3301,3301,1033. Their authentic literal-F consuming counts 181,504,152 are retained by both fixed and relaxed receivers (multiple legal histories; no unique F-mask recovery claimed). WELCOME crosses prime 3301 inside the tape. Ordinary prefix-only origin searches recover all three true starts and all 856/856 native runes (184+515+157); all 215 withheld runes recover exactly (46+129+40). The short WISDOM held score is -0.078344 despite exact recovery; language score is not a universal correctness threshold. No claims of independently novel plaintext or calibration on the exact original chapter length.

[Executable SFT](../sims/lp2_p15_absolute_prime_pivot_sft.cjs), [complete raw results including full ordinary outputs and pinned source blobs](lp2-p15-absolute-prime-pivot.json). The exported JavaScript core was executed against repository input bytes in connected V8. Standalone Windows Node22 invocation has not independently run. Reproduce from repository root with `node sims/lp2_p15_absolute_prime_pivot_sft.cjs`.

**Next decision:** do not tune the source pivot, origin, or sign-crossing position to rescue this specific transparent-F clock; the arbitrary-pivot superset already fails. Further arbitrary ordinary-pivot searches are unselected by the printed spiral. A different, independently motivated representation or receiver is needed; the original graphic construction remains valid. No authoritative synthesis change is needed because this is a scoped failure of one inferred receiver, not a change in the established solution state.
