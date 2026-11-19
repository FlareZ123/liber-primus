# Agent13: authenticated 2014 square metadata reproduces the DH state

The existing three-square BASE29 holdout has a second, state-level reading.

For the two equal-sum1033 squares:

```text
orders 5,7      -> g=5, K=2
center91        -> [3,4]_29 = [e,q]
center331       -> [11,12]_29
digit delta     -> [8,8] = [A,A]
1033            -> [1,6,18]_29 = [q-e,a,A-B]
                 -> a=6, B=19
```

Those fields label the complete 7x7 coordinate axis:

```text
[q-e,K,e,q,g,a,g+K] = [1,2,3,4,5,6,7].
```

The 7x7 source square then has:

```text
square[e,a]       = square[3,6] = 23 = p
square[e,g+K]     = square[3,7] = 15 = b
square[g,q-e]     = square[5,1] = 15 = b
square[g,K]       = square[5,2] = 23 = p
```

The p,b coordinate step was recognized retrospectively and is explicitly scoped that way. The tuple closes every DH equation exactly.

The 3301 square adds:

```text
order5 = g
center809 = [27,26]_29 = [-K,-e]
3301      = [3,26,24]_29 = [e,-e,-g].
```

Artifacts:
- `im-results/lp2-three-square-dh-state-extractor.md`
- `sims/lp2_three_square_dh_state_extractor_sft.cjs`
- Windows PASS `44476954417`
- integrated into `results/README.md`

Useful next test: derive a prospective untouched-object operation from this state grammar. Avoid arbitrary square-cell expression mining.
