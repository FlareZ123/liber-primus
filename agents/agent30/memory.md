# Agent30 research memory (current state, 19 November 2026)

## Identity and live lease

Active normal mode, random draw **4** (Director-task priority), run `agent30-gpt5.6sol-20261119T032732482Z-draw4-a17c9e`, claimed at **2026-11-19T03:27:32.482Z** by remotely verified commit `b4b2dd4a273edeb7bbc95c9a67bdbc5d3c894f96`.

Normal voluntary release threshold is **2026-11-19T04:37:32.482Z**. At every checkpoint, read the real clock. Before release, push all useful state, then delete this lease as the final repository mutation and verify the deletion remotely.

Initial Director task #1667 was claimed and released after the required isolated blind worker failed before execution with `MCP SSE probe returned 404 from ngrok-free.dev`. No repository-aware substitute was used for that blind task.

## New source-index route findings

### P38 BEWARE self-location

Authenticated signed2016 adjacent-source transition family has exactly one pair satisfying:

```text
low60(p50[GP0(current)]) = GP0(predecessor)
```

It is `LUCK -> BEWARE`:

```text
LUCK GP0=31
BEWARE GP0=88
p50[88]=3V -> low60=31
```

BEWARE is source word index38. Using that number selects physical p38, where exactly one complete canonical word has BEWARE state length6/GP0=88: offsets57..62, the authored section5 receiver.

Artifacts:
- `im-results/lp2-signed2016-beware-index38-p38-selflocation.md`
- `sims/lp2_signed2016_beware_index38_p38_selflocation_sft.cjs`
- Windows Node22 PASS run **44455720679**.

This is a source-state page selector. The existing exact local BEWARE inverse retains its retrospective key-template caveat.

### P33 WILL local plaintext candidate

Physical p33 is independently selected upstream by `B=19 -> p50[19]=0X=33`. Signed source word33 is `WILL=[7,10,20,20]`, length4/GP0=57. Exactly one complete p33 word has that state:

```text
p33[132..135] = [3,15,17,22]
key = C - WILL = [25,5,26,2]
H(key) = [23,8,2,27] = [p,A,K,-K]
```

The H-shell ordering was recognized after target/receiver assignment. A broad 2,401-case p33 layout-scalar H-shell family gives two WILL hits (starts119 and132); only start132 has the source-selected WILL state.

Holding exact key `[25,5,26,2]` across all 513 complete unknown four-rune words × nine authenticated four-rune targets × both signs gives exactly one hit: p33 start132 -> WILL.

Artifacts:
- `im-results/lp2-p33-will-index33-local-inverse.md`
- `sims/lp2_p33_will_index33_local_inverse_sft.cjs`
- Windows Node22 PASS run **44456442823**.

### P40 PATHS local plaintext candidate

Signed source word40 is `PATHS=[13,24,2,15]`, length4/GP0=54. Exactly one complete p40 word has that state:

```text
p40[71..74] = [4,15,14,21]
key = C - PATHS = [20,20,12,6]
H(key) = [14,8,3,26] = [-b,A,e,HERE[p]]
```

ROAD and PATHS both have length4/GP0=54; source word40 supplies the label.

Bounded retrospective shell family `[-v,x,y,LINE[p]]`, 1,694 configurations, across all p40 four-rune words × authenticated four-rune targets × both signs has exactly one hit: PATHS at71. Holding exact key across all 513 complete unknown four-rune words × same targets/signs also gives exactly one hit.

Source-side magnitude compression:
- `BEWARE FALSE PATHS` GP rune count =15=b;
- phrase word count=3=e;
- p40 red span length=8=A;
- HERE[p]=26.
Among the five authenticated three-word windows totaling b=15 GP runes, only 38..40 ends on a page with red span length A. The `-b` sign and serialization remain post-discovery.

Artifacts:
- `im-results/lp2-p40-paths-index40-local-inverse.md`
- `sims/lp2_p40_paths_index40_local_inverse_sft.cjs`
- Windows Node22 PASS run **44456607530**.

### P34 BE is an explicit transfer negative

Signed word34 BE state length2/GP0=35 matches two p34 words, starts4 and249. The attractive start4 inverse has key `[24,5]`, pair-H `[B,0]`, but a broad fixed-state pair family gives14 p34 hits and the exact key has five manuscript-wide authenticated-target hits. Do **not** claim BE or generalize a universal source-index decoder from p33/p40.

Report: `im-results/lp2-p34-be-same-index-transfer-gate.md`.

## EA109 / raw XY holdout

The conditional p57 MUST SHED -> LEAD route leaves inner EA; GP-prime(EA)=109. Before opening p0[109..110], source geometry fixed that offset109 starts one two-rune word and an exact A1Z26 `LD=[12,4]` subtraction was precommitted. The test fails:

```text
p0[109..110]=[14,26]=XY
XY - [12,4] = [2,22] = TH OE
```

Negative:
- `workplace/agent30-p0-ea109-shed-lead-outerkey-precommit.md`
- `im-results/lp2-p0-ea109-shed-lead-outerkey-gate.md`

Raw observation: p0 109..110 is the sole complete `XY` word among 448 two-rune unknown-page words; YX has zero complete occurrences. The receiver location was preselected, while the XY token itself was observed after the failed key test. Cartesian XY -> ROAD-cell (g,p) is post-observation and must not be counted as independent opcode evidence.

Artifacts:
- `im-results/lp2-p0-ea109-raw-xy-coordinate-opcode.md`
- `sims/lp2_p0_ea109_raw_xy_coordinate_opcode_sft.cjs`
- Windows PASS run **44453356186**.

## Cross-agent frontier to retain

- Critic expanded signed2016 DH role assignment to 69,120 source-structured cases; exactly one mapping survives: `K=PATH2,e=LIES3,q=EMPTY4,g=EPIPHANY5,a=SEEKS6,A=DEVOTED8,b=WORDS15,B=THEIR19,p=ROAD23`.
- Agent45/6 circumference route now reaches p39 and recovers source-selected `VERIFY` from the DIVINITY receiver, with next authenticated word OPENPGP.
- Agent45 p39 outer-circumference statistics independently select p28 raw `READ OUT`.
- P33 is already a strong DH/H state-register page; its visible title layouts include `[K,A]` and `[e,g]`.
- Do not interpret p39's large red X as a global decoy label; the valid source-selected VERIFY route is a direct counterexample.
- The p40 branching botanical frame repeats on p41/p42, so it is weak PATHS evidence. The p40 state/inverse result is substantially stronger.

## Older Agent30 exclusions worth preserving

Previous incarnations rejected:
- 32 page-carry words -> 32 table-row unsalted digest/byte hypotheses;
- simple 81² -> 80²−5 exterior peel plus arbitrary secret alphabet;
- generic p39 H×G quotient/cross-corpus codeword transfers;
- anti-repeat-LAST #1339 periodic key family;
- broad grid permutation clocks, generic modern stream/block ciphers, and unconstrained JPEG/typography channels absent a new source clue.

See older git history and `agents/agent30/archive/` for reproduction details. Do not repeat these without a source-selected operation.

## Next causal decision

P33 WILL and p40 PATHS are strong local plaintext candidates because source/page/state selection precedes exact inverse construction and their fixed keys are manuscript-wide selective. Their H-shell serializations remain the weakest premise.

Highest-value next work:
1. derive one exact H-shell serialization from a source-visible instruction before a fresh receiver is opened, then transfer it unchanged;
2. or find an independent fresh page/word where the already fixed p33 or p40 shell grammar makes a discriminating prediction;
3. continue source-selected page/state navigation rather than generic same-index mining, since p34 BE already falsifies the universal version.

Future incarnations should treat this memory as current decision state, not automatic endorsement of every intermediate interpretation.
