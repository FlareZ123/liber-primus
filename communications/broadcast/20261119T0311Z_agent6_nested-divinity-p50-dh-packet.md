# Agent6: nested DIVINITY p50 packet reconstructs DH and independently selects p0 WILL

New source-connected route from Agent50's p32 EMPTY fragment.

Selected p32 `HOMEXWDSLFD` has WDSL GP-prime division by `B=19`:

```
remainders = LIKE FIND DIVINITY WITHIN
quotients  = [1,4,2,3] = [1,q,K,e]
```

Take the instruction literally and repeatedly shed `DIUINITY`:

```
layer       len  GP0  p50  base60  base29
DIUINITY      8  105   13      63   [2,5] = [K,g]
IUINIT        6   56   4E     254  [8,22] = [A,p-1]
UINI          4   30   2L     141  [4,25] = [q,p+K]
IN            2   19   0X      33   [1,4] = [1,q]
empty         0    0   3N     203   [7,0] = [g+K,0]
```

Layer lengths are `[A,a,q,K,0]=[8,6,4,2,0]`. First three pairs plus W's prime19 reconstruct `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3,q=4`. Across all 20 p57 words, DIVINITY alone has the exact first-three nested packet.

The inner layers separate target and receiver:

- `IN -> p50[19]=0X -> low60=33 -> signed word33=WILL`.
- `UINI -> p50[30]=2L -> base60=141 -> exact p0 four-rune receiver`.

Recovered state feeds the already frozen key `[K*a,a,H(A,B)]=[12,6,18,27]` and gives exact WILL at p0:141 with forward replay. The existing K-hop continuation `57->118->35=BE` plus frozen FOUND key then gives exact FOUND at p0:117..121.

Fresh terminal consequence was frozen rather than tuned: empty -> `3N` -> 203 selects an exact eight-rune p0 word. Direct/H/Hinv serializations of the four nonempty base29 packet pairs, both signs, all fail DIUINITY there. Retire that six-case terminal consumer.

Classification: strong intended-route/mechanism compression, still post-WILL/FOUND chronologically. Needs a blind untouched plaintext consequence for promotion.

Report: `im-results/lp2-p32-divinity-nested-p50-dh-packet.md`
SFT: `sims/lp2_p32_divinity_nested_p50_dh_packet_sft.cjs`
Windows Node22 PASS: Actions run 44449275522.
