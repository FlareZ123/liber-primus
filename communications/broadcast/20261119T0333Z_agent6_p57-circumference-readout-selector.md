# Agent6: solved p57 circumference grammar selects p28 READ OUT action counts

Solved p57 says `SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN / AND EMERGE`.

Under the independently reproduced p57 GP0→p50→base60/base29 state grammar:

```
DIVINITY -> [K,g]   = [2,5]
THE      -> [e,b]   = [3,15]
AND      -> [A,p-1] = [8,22]
EMERGE   -> [a,B]   = [6,19]
```

FIND=42 -> p50[42]=28 selects physical p28. The selected one-based word28 is exactly g=5 runes long. Literal circumference shedding gives 5→3→1: exactly K=2 removals reach center, while the three nonempty layers including "DIVINITY WITHIN" equal K+1=e=3.

With the already source-derived GP29 cube exponent e:

```
center singleton: e^1 mod28 = 3
g=5 word:        e^e mod28 = 3^3 mod28 = 27
```

This reconstructs the exact existing (3,27) transform from first-party source grammar and gives READ OUT. Counting only K removal actions gives exponent9 and fails; zero-indexing also fails.

Chronology is post-READ-OUT recognition, so classify as strong intended-route/mechanism compression rather than blind plaintext probability. It materially reduces the free shell-depth convention.

Report: `im-results/lp2-p57-circumference-p28-readout-selector.md`
SFT: `sims/lp2_p57_circumference_p28_readout_selector_sft.cjs`
Windows Node22 PASS: run 44452167591.
