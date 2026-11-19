# Authenticated 2013 command-family audit of the p28 NEXT route

**Agent11, 19 November 2026. Director #1690. Classification: sharp numeric alignment with a negative authenticated-opcode transfer. Preserve as conditional/thematic corroboration, not as a source-authenticated LP2 navigation opcode. No unknown plaintext or complete inverse is recovered.**

## Decision

The published NEXT alignment is exactly reproducible and is unique inside the charged command/radix/origin/page/direction family:

```text
NEXT GP0=57
p50[57]=1w
base60=118
one-based receiver -> p28 offset117
offset117 = start of p28 line6 = DH
forward from page-numbered word28 -> word29
GP1(word29)=51=GP0(MUST)
```

Across all eight authenticated commands, both source-supported numeral readings, both ordinary receiver origins and all55 rune-bearing unknown pages, the p28 line6 landing occurs once. Charging both immediate directions from every page-numbered word leaves the joint `DH`-line plus GP1=51 event once as well.

That selectivity does not authenticate NEXT as the operation. The signed 2013 protocol defines NEXT as a **client upload/storage command**: the client supplies text and the server stores it. The server does not compute a successor, choose a next instruction or advance one word. Closed Director #1031 recovered the original timestamped participant session and reached the same source-level conclusion.

A predeclared held-out semantic command also fails. Under the identical GP0→p50→numeral→p28-position grammar, authenticated `DH` maps to offsets133,132,131,130 under the four radix/origin modes. The manuscript's unique visible DH line starts at117. Thus the command whose authenticated name directly matches the source object does not select it under the same numeric grammar.

Director #1725 separately found no creator-authenticated or solved-page transfer support for the underlying p50-numeral→LP-rune-offset output type. The later EA109 state56→57 chronology is therefore useful conditional evidence inside that architecture, not a repair for the source-semantic failure here.

**Director fork: negative.** Keep the NEXT alignment as an unusually specific numerical coincidence around the p28 DH object and MUST successor. Retire wording that treats historical NEXT itself as an authenticated LP2 successor opcode unless a later first-party source explicitly redefines or consumes it that way.

## Frozen authenticated command family

The signed 2013 TCP specification supplies exactly:

`RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE`.

Canonical GP0 address, p50 token and two source-supported numeral readings are:

| Command | GP0 | p50 token | base60 | base59 |
| --- | ---: | --- | ---: | ---: |
| RAND | 60 | 1k | 106 | 104 |
| QUINE | 49 | 0G | 16 | 16 |
| BASE29 | 74 | 3P | 205 | 202 |
| CODE | 49 | 0G | 16 | 16 |
| KOAN | 41 | 1O | 84 | 83 |
| DH | 31 | 2D | 133 | 131 |
| NEXT | 57 | 1w | 118 | 116 |
| GOODBYE | 96 | 3g | 222 | 218 |

QUINE and CODE already collide at GP0=49, illustrating why command names cannot be assumed to remain typed after GP0 reduction.

## Full landing family

The charged location family is:

- 8 commands;
- base60 and drop-f base59;
- zero-based offset and one-based position;
- all55 rune-bearing physical pages.

That is 32 command/radix/origin modes applied to55 pages. They produce54 exact physical line-start landings. On p28 there is exactly one line-start landing:

`NEXT / base60 / one-based -> offset117 -> line6 -> DH`.

Because the `DH` physical-line start is itself unique across all604 rune lines, this is also the only charged landing on a line beginning `DH`.

For the literal-neighbor branch, both immediate directions from each page-numbered word are charged wherever present, giving **3,040** directed page-neighbor trials. The conjunction

- numeric landing is on a `DH` line; and
- the directed neighbor has GP1=51

occurs once:

`NEXT / base60 / one-based / p28 / forward`.

The selected neighbor is p28 word29 `[24,25]`, length2 and forward-consecutive, with GP1 `25+26=51=GP0(MUST)`.

This establishes selectivity of the numerical construction. It does not override the historical command semantics.

## Held-out authenticated-command prediction

The natural held-out command is `DH`, because the target source object is p28's unique visible `DH` line and no language scoring or downstream state is needed to define that prediction.

`GP0(DH)=31 -> p50[31]=2D`.

The four frozen numeric interpretations give p28 offsets:

```text
base60 / zero: 133
base60 / one:  132
base59 / zero: 131
base59 / one:  130
```

The target DH line starts at117. The held-out command therefore has **0/4** hits. No extra offset, alternate radix or semantic exception was introduced.

## Historical semantic control

The recovered signed source and original participant log settle the directionality:

- NEXT receives client-supplied text;
- the server acknowledges and stores that text;
- the organizer does not supply a computed NEXT result;
- no recovered 2014–2016 first-party instruction reuses that NEXT exchange as an LP2 page/key/offset handoff.

Consequently “take the next manuscript word” is an English-name reinterpretation, not the authenticated 2013 protocol operation.

## Reproduction

- SFT: [`sims/lp2_2013_next_command_family_audit_sft.cjs`](../sims/lp2_2013_next_command_family_audit_sft.cjs)
- Windows Node22 PASS: [44434039465](https://github.com/FlareZ123/liber-primus/actions/runs/44434039465)
- Authenticated source/NEXT semantics: [`resources/external/2013-tcp-server-signed-source.md`](../resources/external/2013-tcp-server-signed-source.md)
- Prior source acquisition: [Director #1031](https://github.com/FlareZ123/liber-primus/issues/1031)
- Output-type gate: [`lp2-p50-rune-offset-output-type-gate.md`](lp2-p50-rune-offset-output-type-gate.md)
