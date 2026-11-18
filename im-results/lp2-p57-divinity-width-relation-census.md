# p57 DIUINITY difference-equals-width census

**18 November 2026, Agent10, Director #1548. Classification: bounded source-family positive. DIUINITY is the only complete p57 word satisfying the frozen `O-I=L` relation with both GP-prime sums usable as literal p50 addresses, and the pinned solved GP-native control has no other lexical type satisfying the width-specific `O-I=L=8` relation. The broader `O-I=L` relation is not globally rare in solved text. No plaintext, key, or downstream cipher is recovered.**

## Frozen test

For each complete GP word, let `I` be the GP-prime sum of the strict interior after shedding the first and last rune, `O` the GP-prime sum of the two shed endpoint runes, and `L` the word's GP rune count. A word is eligible only when both `I` and `O` lie in the literal p50 address range 0..255.

The issue freezes two tests before the census: the broad source-natural equality `O-I=L`, and the p50-width-specific equality `O-I=L=8`. No sign changes, absolute values, modular reductions, alternate widths, or post-hoc address conventions are used.

## Original p57 result

The clear p57 PARABLE contains **20 complete words**, of which **18** have both sums in range. Exactly **one** satisfies `O-I=L`:

| word | L | I | O | O-I |
| --- | ---: | ---: | ---: | ---: |
| **DIUINITY** | **8** | **184** | **192** | **8** |

Thus DIUINITY is also the only p57 word satisfying the width-specific `O-I=L=8` relation. This reproduces the already-observed one-row p50 separation because cells 184 and 192 differ by the printed table width 8.

## Pinned solved-GP scale control

Applying the identical operation to the pinned solved GP-native corpus gives **735 complete words**, **639 addressable**. The broad relation `O-I=L` occurs **31/639** times, across five lexical types: WHO 13, STUDY 7, MAN 4, DIUINITY 4, and HEAD 3. The broad equality is therefore a recurring lexical arithmetic property rather than a uniquely diagnostic one.

The width-specific conjunction is much sharper. The solved corpus contains **25 eight-rune words**, **15** of them addressable. Exactly **4** satisfy `O-I=L=8`, and **all four are DIUINITY**: three occurrences in `0_loss_of_divinity` and the p57 occurrence. No other addressable eight-rune lexical type satisfies the relation.

## Decision

Director #1548's specific width test is positive: within p57, DIUINITY alone supplies `184 -> 192` with difference equal to both its rune length and the visibly printed p50 width. The solved control shows that this width-specific conjunction is a stable property of the DIUINITY spelling rather than a generic feature of eight-rune solved words.

The evidence boundary remains important. The broader `O-I=L` relation occurs repeatedly in ordinary solved GP text, so the arithmetic equality alone does not establish authorship intent. This result strengthens the internal motivation for treating 184 and 192 as vertically adjacent p50 addresses conditional on the already-inferred GP-prime-sum address operation. It does not independently prove that operation, authenticate the historical 2800 session, or recover unknown LP2 plaintext.

Reproducer: [`sims/lp2_p57_divinity_width_relation_sft.cjs`](../sims/lp2_p57_divinity_width_relation_sft.cjs). Windows Node 22 [PASS 44393741503](https://github.com/FlareZ123/liber-primus/actions/runs/44393741503). Inputs are the repository-pinned `resources/liber-primus/lp2-corpus.json` and `resources/external/relikd-solved-gp29-native-v1.json`.
