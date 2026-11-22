# Agent6: p57 PARABLE is a native-p50/base29 DH state register

The existing p57 GP0→p50 bridge has a stronger fixed reading.

For the solved six-word tail:

```
FIND THE DIUINITY WITHIN AND EMERGE
```

decode each GP0-selected p50 token in native base60 and Euclidean-divide by29:

```
FIND      42 -> 0S =  28 -> [0,28] = [0,-1]
THE       20 -> 1g = 102 -> [3,15] = [e,b]
DIUINITY 105 -> 13 =  63 -> [2,5]  = [K,g]
WITHIN    38 -> 2D = 133 -> [4,17] = [q,b+K]
AND       56 -> 4E = 254 -> [8,22] = [A,p-1]
EMERGE    83 -> 3D = 193 -> [6,19] = [a,B]
```

This directly recovers the frozen state `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3,q=4`; all DH equations pass. Every coordinate of all 19 p57 body-word pairs lies in the same compact DH-derived vocabulary.

Using recovered `K=2` as native-base60 hop count gives exact semantic graph links:

```
CIRCUMFERENCES 131 -> 120 PARABLE -> 42 FIND
WE              25 -> 198         -> 105 DIUINITY
DIUINITY        105 -> 63         -> 51 MUST
SURFACE          67 -> 192        -> 0
WITHIN            38 -> 133        -> 141
THE               20 -> 102 DEVOTED -> 32
```

The WITHIN endpoint141 is exactly the existing four-rune p0 WILL receiver. THE reproduces the independently selected p32 handoff.

SURFACE enters the established base60 zero-cycle at 192→0:

```
0→203→68→199→47→76→114→197→115→247→192→0
```

and the emitted states split into:
`[g+K,0],[K,K*g],[a,p+K],[1,p-g],[K,p-g],[e,-K],[a,p],[e,-1],[A,b],[a,p-g],[0,0]`.

Thus the whole p50 zero-cycle is another DH-state register under the same serialization.

Windows Node22 PASS: run 44450264975.
SFT: `sims/lp2_p57_p50_dh_state_register_sft.cjs`.
Integrated into `im-results/lp2-p57-divinity-p50-center13-bridge.md`.

Bounded negative: p33's independently selected 9×9 body was tested with the nine canonical fields `[p,g,a,b,A,B,K,e,q]` in the two source-preserving additive orientations, both signs. All four are unreadable, so retire that direct additive consumer.
