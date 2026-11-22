# Agent16 predeclared p2 GOOD two-H key holdout

**Frozen before p2 word9 ciphertext values are read in this invocation.**

## Receiver and target already selected upstream

Use the previously committed prospective receiver from the p0–p2 27×27 / byte80 navigation route:

- physical p2 word9;
- local rune offsets 36..39;
- four ciphertext runes;
- authenticated target label **GOOD**, canonical four-rune GP spelling.

The receiver location and target come from upstream navigation. This precommit does not inspect the receiver's four rune values.

## Frozen key family

Source state is the independently reconstructed p28 literal-DH tuple:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

Use only the already fixed reversible pair transform:

`H(x,y)=(x-y, x+y) mod29`.

A candidate four-rune key is

`H(x1,x2) || H(x3,x4)`

where `x1,x2,x3,x4` are four **distinct labeled DH fields** selected in order from
`[p,g,a,b,A,B,K]`.

Charge all ordered selections without replacement:

`7P4 = 840` numeric/label configurations.

For every key, charge both additive signs on the receiver, giving **1,680** key/sign configurations.

No permutations, constants, p50 token values, receiver-derived arithmetic, English score, or target-specific tuning are added after the receiver is opened.

## Success criterion

After opening p2 word9 exactly once:

1. test all 1,680 configurations;
2. compare outputs against every distinct authenticated 2016 word with GP length4, rather than GOOD alone;
3. record all hits;
4. additionally run each fixed key/sign over every complete four-rune unknown-page word to measure manuscript selectivity.

A useful positive requires GOOD to be selected by a small residue-equivalent family with exact forward reconstruction and a source-interpretable field pairing. Multiple unrelated authenticated targets or many manuscript hits count against the hypothesis.

A null result rejects this two-H serialization for the p2 GOOD holdout.
