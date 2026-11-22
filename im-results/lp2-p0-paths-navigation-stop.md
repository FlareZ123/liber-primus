# P0 PATHS navigation stop under the frozen p50 address grammar

**Agent14, 19 November 2026. Classification: bounded prospective negative. The source-constrained `GP0(plaintext word) -> p50 token -> p0 rune offset` grammar that carries the current p0 chain through LUCK -> PATHS has no continuation after PATHS under either documented table radix and either zero-/one-based rune-offset origin. This prevents a tuned continuation to VERIFY or OPENPGP under the same grammar.**

## Upstream state

The current p0 candidate route reaches **PATHS** after FOUND -> GOOD -> LUCK. The PATHS recovery itself remains a strong candidate rather than established plaintext because its exact inverse-key grammar was recognized after its target/receiver were exposed.

This test does not re-evaluate that inverse. It freezes PATHS as the conditional upstream plaintext and asks only whether the *already used navigation grammar* predicts the next authenticated 2016 word without adding a new address convention.

## Frozen source calculation

Canonical GP29 gives

```text
PATHS = [13,24,2,15]
GP0(PATHS) = 54
p50[54] = 2a
```

The two already documented table alphabets decode the printed token as:

```text
drop-f base59: 154
conventional base60: 156
```

Charge both zero-based and one-based interpretations of that number as a p0 rune position. The four resulting positions are:

| radix | origin | p0 zero-based offset | containing p0 word |
| --- | ---: | ---: | --- |
| base59 | 0 | 154 | word36, offsets154..157, length4 |
| base59 | 1 | 153 | word35, offsets151..153, length3 |
| base60 | 0 | 156 | word36, offsets154..157, length4 |
| base60 | 1 | 155 | word36, offsets154..157, length4 |

The signed 2016 carrier has only two alphabetic words after PATHS before its hexadecimal fingerprint:

```text
VERIFY   GP length 6
OPENPGP  GP length 7
```

Therefore none of the four charged address conventions lands in a p0 word whose GP length can represent either remaining authenticated carrier word.

## Decision

The existing navigation grammar **stops at PATHS**.

This is useful because it removes an obvious degree of freedom before another target is proposed:

- do not force PATHS -> VERIFY or PATHS -> OPENPGP by switching radix, changing zero/one origin, or accepting an interior hit;
- a continuation beyond PATHS requires a genuinely new source-selected transition or receiver type;
- the result does not refute PATHS itself, and it does not rule out a different instruction beginning at PATHS;
- the raw-cipher PATHS -> YOU return reported upstream is a different channel and is unaffected.

Reproducer: `sims/lp2_p0_paths_navigation_stop_sft.cjs`.

Windows Node22 PASS: Actions run **44441494117**.
