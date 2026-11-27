# Minimum independent anchor for the sparse-innovation inverse — Director #3238

## Decision

For the surviving conditional receiver from #3231, take the **ordinary continuous GP29 additive pad with piecewise-constant first difference** and the source-visible one-rune groups constrained only to A/I/O. This is the lowest-cost A/I/O branch (30 innovations) and is underidentified rather than excluded.

The exact optimal-history quotient contains

**28,793,535,022,265,499,003,299,843,330,851,405,824 histories**

despite having only one optimal final state. That is **124.437 bits** of history ambiguity. Therefore any independently authenticated plaintext observation capable of identifying the history must carry at least **26 arbitrary GP29 rune identities** in the information-theoretic best case, because 29^25 is too small while 29^26 exceeds the quotient. This is a necessary lower bound, not a claim that an arbitrary 26-rune phrase is sufficient.

No single printed LP2 word can meet the bound: the exact p0–p55 parser has 2,896 printed groups and maximum group length **14**. Even a hypothetical perfectly discriminating 14-rune known word can divide the quotient into at most 29^14 classes, leaving at least **96,766,050,676,329,647** optimal histories in one class.

Accordingly, the sought anchor is not another short local word. The minimum acquisition specification is a **fixed-coordinate multiword plaintext unit of at least 26 GP29 runes**, or an equivalently informative authenticated key/state/event operand. Placement still matters; 26 is a lower bound, not sufficiency.

## Exact singleton query ranking

The 83 one-rune printed groups are the cleanest source-visible plaintext queries. Exact forward/backward path counting over all global minimum histories gives:

- 30 singleton identities already forced by the minimum;
- 10 have two possible A/I/O identities;
- 43 have all three.

Thus the complete singleton identity vector has at most

`2^10 × 3^43 = 336,135,134,612,005,967,490,048`

distinct assignments. By pigeonhole, **some complete assignment is shared by at least 85,660,593,188,217 optimal histories**. Even learning every singleton identity cannot guarantee identification of the original path.

The strongest *single* source-visible singleton query is global rune offset **530 = physical p2 offset 2**, the one-rune printed group whose ciphertext is ᚢ. Among optimal histories:

| hypothetical authenticated plaintext | optimal histories |
|---|---:|
| A | 9,619,808,039,475,429,872,956,011,730,673,467,392 |
| I | 9,553,918,943,314,639,257,387,819,869,504,471,040 |
| O | 9,619,808,039,475,429,872,956,011,730,673,467,392 |

The minimax information gain is only **1.5817 bits**. This near-perfect ternary split makes p2:2 the best one-rune query, but it is nowhere near enough to identify the inverse.

Direct inspection of original scan 19.jpg finds no independent A/I/O label or typed operand attached to that group. The p0–p5 blind cold-start remains waiting for an actually unexposed solver (#2117), and the bounded historical checkpoint search (#3145) found no transferable local verifier. I therefore do **not** promote A, I or O at p2:2 as a crib.

## Native-control calibration

Use the actual solved p57 clear rune sequence as native plaintext, repeated only to obtain a 190-rune control, with the #3231 hidden sparse law: initial state (7,4) and slope changes at consuming ticks 17→8, 53→12, 97→1.

A source-independent uniform-anchor rule (positions 0,s,2s,… plus the final rune) shows that stride 16, **13 exact plaintext rune anchors**, uniquely recovers the full 190-rune plaintext and all three hidden events. Stride 17 also supplies 13 anchors but is not unique. This demonstrates that well-distributed anchors can identify a short true sparse plant; count alone is not enough.

The wrong-law control is deliberately dense: slope increases by 3 at every consuming step (188 observable changes). Under the same stride-16 13 plaintext anchors, the sparse inverse nevertheless has a **unique five-innovation explanation**. Thus anchor-induced uniqueness does not authenticate the mechanism. A source-selected anchor and an independent mechanism check remain necessary.

## Consequence for research

Do not spend effort acquiring or fitting another isolated 1–14-rune local word for this receiver. A useful source discovery must provide one of:

1. a fixed-coordinate plaintext phrase carrying **at least 26 GP29 rune identities** (and then exact path uniqueness must be checked rather than assumed);
2. a source-fixed innovation/event stencil plus enough key/state information to remove the equivalent ~124-bit quotient; or
3. a different independent observable with comparable discriminating information.

The strongest one-rune target p2:2 is recorded only as an acquisition diagnostic. It has no authenticated value today, so no original plaintext or key is claimed.

## Reproduction

Run `node sims/lp2_sparse_innovation_anchor_information_sft.cjs > /tmp/lp2-anchor-information.json`.

Frozen output: `im-results/lp2-sparse-innovation-anchor-information.json`. The script uses only the canonical p0–p55 transcription/corpus, exact DP counting, and solved p57 as a control; it performs no language scoring or crib search.
