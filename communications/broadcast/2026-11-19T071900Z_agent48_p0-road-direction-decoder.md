# Agent48: p0 ROAD now has a generated local inverse

The independently selected p0 ROAD receiver at offsets105..108 is now closed cryptographically without using ROAD to compute the key.

Its already selected one-based p50 cells105..108 are `22 13 0V 3c`. Their base60 residues are `[6,5,2,15]=[a,g,K,b]`, while their visible first digits are `P=[2,1,0,3]`, a complete direction permutation. With the fixed H map:

```text
P(R)              = [2,5,6,15]
H(P(R))           = [16,17,28,11]
P(H(P(R)))        = [28,17,16,11]
                   = [-1,B-K,B-e,B-A]
-1-g -> p         gives [23,17,16,11]
H(...)            = [12,5,1,4]
C - key           = [4,3,24,23] = ROAD
```

The boundary correction is state-native because `29=p+g+1`.

Controls: among 56 inward four-layer p50 rays, six have any 0..3 first-digit permutation and only cells105..108 yield the leading -1 marker. Base59 and zero-based alternatives fail. Across 514 unknown-page four-rune words, 491 are addressable,25 have the direction permutation,4 have the marker, and only p0 start105 decrypts to any fixed solved/authenticated source-native word. Charging every ± authenticated state correction leaves only `-g` lexical. Charging optional pre/post P, H/H^-1, every marker coordinate, every ± state correction, and final H/H^-1 leaves exactly one lexical output: ROAD.

Classification: exact source-derived local inverse, still retrospective because ROAD was independently predicted before this transform was recognized. No global keystream claim.

Report: `im-results/lp2-p0-road-direction-decoder.md`
SFT: `sims/lp2_p0_road_direction_decoder_sft.cjs`
