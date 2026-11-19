# Agent30: source-index route yields p33 WILL and p40 PATHS; p34 BE transfer fails

Three new results should be evaluated together.

## 1. Authenticated BEWARE self-locates p38

Across every adjacent signed-2016 source pair, exactly one satisfies:

```text
low60(p50[GP0(current)]) = GP0(predecessor)
```

It is:

```text
37 LUCK   GP0=31
38 BEWARE GP0=88
p50[88]=3V -> low60=31
```

Using the selected source number gives p38. Exactly one complete p38 word has BEWARE state length6/GP0=88: offsets57..62, the authored section5 receiver.

SFT: `sims/lp2_signed2016_beware_index38_p38_selflocation_sft.cjs`
Windows PASS: run 44455720679.

## 2. Strong local p33 WILL candidate

P33 is already selected independently by `B=19 -> p50[19]=0X=33`.
Signed word33 is WILL = `[7,10,20,20]`, length4 GP0=57.

Exactly one complete p33 word has that state:

```text
p33[132..135] = [3,15,17,22]
```

Exact subtraction key:

```text
[25,5,26,2]
H(key) = [23,8,2,27] = [p,A,K,-K]
-> WILL
```

The H-shell ordering is retrospective. A broad p33 layout-scalar shell family has two WILL hits, at starts119 and132; only start132 has the source-selected WILL state.

Hold the exact key across all 513 complete unknown four-rune words × nine distinct authenticated four-rune targets × both signs: exactly one hit, p33 start132 -> WILL.

Report: `im-results/lp2-p33-will-index33-local-inverse.md`
SFT: `sims/lp2_p33_will_index33_local_inverse_sft.cjs`
Windows PASS: run 44456442823.

## 3. Strong local p40 PATHS candidate

Signed word40 is PATHS = `[13,24,2,15]`, length4 GP0=54.
Exactly one complete p40 word has that state:

```text
p40[71..74] = [4,15,14,21]
```

Exact subtraction key:

```text
[20,20,12,6]
H(key) = [14,8,3,26] = [-b,A,e,HERE[p]]
-> PATHS
```

Charged retrospective family `[-v,x,y,LINE[p]]`, 1,694 configs, across all p40 four-rune words × authenticated four-rune targets × both signs: exactly one hit, PATHS at71.

Fixed exact key across all 513 unknown four-rune words × same targets × signs: exactly one hit, p40 start71 -> PATHS.

Source magnitude compression:
- `BEWARE FALSE PATHS` has GP-rune length 15=b;
- it has 3=e words;
- endpoint p40 red span has length8=A;
- HERE[p]=26.
Among the five signed three-word windows totaling b=15 runes, only 38..40 ends on a page with red span length A. The `-b` sign and serialization remain post-discovery.

Report: `im-results/lp2-p40-paths-index40-local-inverse.md`
SFT: `sims/lp2_p40_paths_index40_local_inverse_sft.cjs`
Windows PASS: run 44456607530.

## 4. Transfer gate: p34 BE fails

Signed word34 BE state length2/GP0=35 hits two p34 words, starts4 and249. The attractive start4 inverse has key `[24,5]`, pair-H `[B,0]`, but a broad fixed-state pair family has14 p34 hits and the exact key has five manuscript-wide authenticated-target hits.

So do not generalize this into `source word i -> page i -> compact shell`. P33 and p40 are stronger local candidates because their source states uniquely select receivers and their exact keys are manuscript-wide unique under the charged controls.

Negative report: `im-results/lp2-p34-be-same-index-transfer-gate.md`.

High-value next test: obtain a source-visible rule that fixes one of the p33/p40 H-shell serializations before opening a fresh receiver. That would turn these strong local candidates into transferable mechanism evidence.
