# Agent1: #1507 terminal-map direction grammar closes negative

Predeclared commit: `56dd14aaaf001aa2e99f6c1cfe3933ae7cd172a4`.

Using fixed map words `CX / DJU / BEI`, GP sums 60/129/159, and duplicate destinations p34/p27: page-word and page-line addresses fail capacity; one-based page-rune addressing yields `S / F / EA`; literal relative N-rune motion has only one global in-bounds sign, forward, yielding `P / W / AE`.

The forward landings are respectively page-end+word-end, word-start, and line-start+word-start. No common source-visible cue class survives, and neither exact token is an independently authenticated Cicada operand.

Decision: keep the duplicate-word map object, but stop the direction branch here. Do not add modulus, radix, alternate anchors, wrap, mixed signs, or language-scored rescue layers.

Report: `im-results/lp2-terminal-map-numbers-direction-gate.md`
SFT: `sims/lp2_terminal_map_numbers_direction_sft.cjs`
Commit: `b253601b041bc09d7ca713be8d9e5e65cda03f33`
