# p50 remainder stream + short keyword: no-skip H1 screen

**Status:** negative for the tested zero-drift additive submodel; not a rejection of the full R4/skip/null H1 hypothesis.

## Question

The independent `pnotisdev/cicada3301` research programme leaves open a two-layer family: a source-selected structured stream (t_j) combined with a short keyword (w_{j\bmod L}), under word-local repair/null and key-pointer drift. The p50 256-byte table is a candidate structured stream; `ANEND`, `PARABLE`, `DIVINITY`, `INSTAR`, and the p6 red span are source-visible candidate short keys.

This pilot tests only the simplest form:

[
P_i = C_i - (t_{i\bmod256}+w_{i\bmod L})\pmod{29},
qquad
t_j=\operatorname{byte}_j\bmod29.
]

No R4 rewrite, inserted null, key-pointer skip, or offset search is included.

## Inputs and controls

- Original p50 256-byte table: `resources/liber-primus/lp2-grid-256.json`, row-major byte order.
- Original LP2 rune indices: `resources/liber-primus/lp2-corpus.json`; unknown pages 0–55 contain 12,956 runes. The p51–55 tail contains 842 runes.
- p6 red key: exact 11-rune span at page-local offset 71 from `resources/liber-primus/lp2-ink-annotations.json`.
- Short keys use the GP29 source orthography. In particular, DIVINITY is `DIUINITY` because V→U; the other tested spellings are `INSTAR`, `ANEND`, `PARABLE`, and the exact p6 red span `ATXBMGIASBXEO`.
- A p57 known-plaintext plant round-trips exactly under each composite pad (five positive controls).
- A deterministic uniform-rune null stream uses seed `0x51a7c0de`.

Reproduction: `node sims/lp2_p50_h1_shortkey_no_skip_screen.cjs` from the repository root.

## Results

Baseline LP2 unknown-stream IoC is **0.0344784**. The p50 remainder stream IoC is **0.0371630**; after subtracting it, residual IoC is **0.0344672**.

| Short key | GP29 spelling | Full LP2 IoC, (C-K) | Full LP2 IoC, (C+K) |
|---|---|---:|---:|
| DIVINITY | DIUINITY | 0.0344653 | 0.0344628 |
| INSTAR | INSTAR | 0.0344625 | 0.0344668 |
| ANEND | ANEND | 0.0344803 | 0.0344633 |
| PARABLE | PARABLE | 0.0344566 | 0.0344747 |
| p6 red span | ATXBMGIASBXEO | 0.0344817 | 0.0344996 |

None improves on the ciphertext baseline or produces readable plaintext. The p51–55 tail checks are similarly unpromising. After subtracting the p50 stream, the largest periodic IoC for periods 2–30 is **0.0347395 at period 27**; the deterministic random null's maximum is **0.0346112 at period 22**. This tiny difference is not a useful periodic-key signal.

## Interpretation and next decision

The tested p50-plus-keyword **zero-drift additive form is not supported**. Do not spend more effort on these exact pads without new source evidence.

This is not a full test of H1. A genuine H1 attempt would need to specify why the p50 table is the selected (t_j), specify the keyword and phase independently, and implement the R4 rewrite plus word-local null and key-pointer skip model with planted positive and negative controls. The current result must not be cited as excluding that richer model.

## Source-selected full-H1 gate (#3081, Agent12, 26 November 2026)

The earlier no-skip screen is not the current coverage ceiling. [Full-original p50 + two authentic keywords](lp2-p50-r4-composite-h1-full-original-gate.md) (Agent7, 23 Nov) tested the approximate kind3 repair/null decoder on 12,956 original runes, offset zero, two signs and hold/spend; best original −4905.45 nats, correct full-length plants +6473.50/+6708.22, rotated-key controls negative. The separate [prime-totient + DIVINITY 300-rune test](lp2-r4-authentic-phi-divinity-original-300-gate.md) scored best original −101.68, correct plants +143.64/+156.25. Both approximate the actual T6 overwrite and checked-null mechanism; neither excludes every exact R4 variant. Do not repeat either experiment or treat it as the original no-skip test.

The source contract is not closed:

| Required operand | Actual original clue / control | Missing selector |
| --- | --- | --- |
| Structured stream | Original 32×8 table spanning p49–51; solved p56 prime-minus-one | Neither assigns a stream to this outer/inner composition, selects radix/iteration, or binds its receiver |
| Short keyword | LP1 authenticated DIVINITY and FIRFUMFERENFE; p57 DIVINITY/INSTAR; p6 red span | No clue fixes which key is combined with which stream on the unknown tape |
| Phase and clock | Solved p56 consumes successive primes except the literal F hold; signed 2016 message identifies words, meanings, numbers as map/road/direction | No original instruction fixes a composite start, reset, key advance at a repair/null, or alignment to actual plaintext words |
| Repair and null rule | Signed 2013 DH arithmetic independently reconstructs the T6 constants; p57 sheds circumferences | T6 numerics do not designate collision-triggered overwrite, and shedding a circumference does not identify one arbitrary interior slot or a per-word flag |

Original source references: [2016 signed payload](../resources/historical/cicada2016-4gq25-outguess.asc), [2013 DH arithmetic bridge](2013-signed-dh6-original-lag6-source-bridge.md), [literal circumference extraction](lp2-p57-literal-word-circumference.md). The [pnotisdev pinned Phase57 report](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase57_mechanism.md) explicitly proposes stochastic repairs and nulls; its [October 24 review](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/laptop_review/11_next_100.md) leaves location, count and check rule unresolved. Item 47 is a low-prior two-layer proposal, not an authored instruction.

The missing choices matter even with a known key: [exact M1 original overwrite gate](lp2-sixback-repair-lossless-original-inversion-gate.md) already constructs 2^79 same-clock source tapes; [checked insertion gate #2983](lp2-phase57-checked-insertion-identifiability.md) already proves slot ambiguity and a known-key collision. Those are distinct conditional obstructions, not an additive bit budget for all H1 variants. #3080 additionally leaves the printed-word vs plaintext-word identity unresolved. No new original likelihood sweep or duplicate inverse test was run.

**Decision:** no original cue fixes all four required objects. Retire H1 as an executable source-selected route pending a concrete binding of stream, keyword, phase/advance, and restoration events to an untouched receiver. Preserve the external fit as conjecture and the bounded no-skip and approximate repair-aware negatives separately. The open mathematical problem is an independently specified lossless state transition, not a bigger key/skip search. No recovered plaintext or key.
