# Q-path ROAD navigation: p39 → p7 → ROAD23, with independent p40 → p23 DH convergence

**Agent5, 28 November 2026. Classification: exact source-linked navigation/state result with prospective body-cipher negatives; no unknown plaintext.**

## Decision

The p3 quotient route now supports a concrete, low-freedom navigation interpretation on the **printed** red states.

The already-frozen field is

```text
GF(29²),  u² = 3u + 8
Q = [17,24], order(Q)=840
```

and the signed 2016 source gives the zero-based word indices used by the existing Q discrete-log map. Two printed red spans have

```text
p39 red: log_Q(E) = 516 = 17·29 + 23  -> [THE ... ROAD]
p7  red: log_Q(E) = 603 = 20·29 + 23  -> [MEANING ... ROAD]
```

Canonical p50 cell **ROAD=23** is token `1R`, base60 value **87**. Therefore

```text
87 = 3 · 29
    = p3 field coefficient · DIRECTION
```

because the physical p3 triad `[13,23,2]` source-derives `u²=3u+8`, while authenticated signed word29 is **DIRECTION**.

Adding that exact p50 ROAD value to the Q exponent moves three base29 rows while preserving column ROAD:

```text
[17,23] --ROAD87--> [20,23] --ROAD87--> [23,23]

THE MAP THEIR MEANING IS THE ROAD
                  ↓
         MEANING IS THE ROAD
                  ↓
                 ROAD
```

The first step lands exactly on the printed p7 red state. The second lands on singleton `[23,23]=[ROAD,ROAD]`. This is a source-coherent **map/path contraction**, not a plaintext decryption.

## Finite controls

There are 17 nonzero printed red states and 272 ordered distinct printed-red pairs.

For the natural finite family

- coordinate used as p50 address: row or column;
- direction on the Q orbit: forward or backward;
- radix: canonical base60 or historical base59 alternative;

the complete printed-state results are:

```text
base60 row forward    0 edges
base60 row backward   0 edges
base60 col forward    1 edge: p39 -> p7
base60 col backward   1 edge: p7 -> p39
base59 row forward    0 edges
base59 row backward   0 edges
base59 col forward    0 edges
base59 col backward   0 edges
```

Thus the only nontrivial undirected printed-state connection in this eight-variant family is the same ROAD edge, with forward/backward giving its two orientations.

Base59 reads p50 ROAD token `1R` as 86 rather than87 and misses the printed p7 state. Canonical base60 is therefore discriminated by the red-state landing itself.

Within the first29 p50 cells—the source register addressed by signed word numbers—only two canonical values are divisible by29:

```text
HELLO0 -> 203 = 7·29
ROAD23 ->  87 = 3·29
```

ROAD is the one whose quotient equals the independently source-derived p3 field coefficient3. This is an exact bounded statement; it is not a discovery-wide probability.

Reproducer: [`sims/lp2_p3_q_p50_road_red_path_sft.cjs`](../sims/lp2_p3_q_p50_road_red_path_sft.cjs).

## Independent ordinary-Q DH convergence on physical p23

A separate exact route reaches the same page number without using the ROAD stride.

The complete printed p40 red state is

```text
log_Q(E(p40 red)) = 153 = 5·29 + 8
                   -> [g,A]
```

under the authenticated historical DH state `p=23,g=5,A=8,K=2`. It is the **only** printed nonzero red span whose two Q-coordinate entries are both in the core DH value set.

Advancing the ordinary Q orbit by the independently recovered shared secret `K=2` gives

```text
153 + 2 = 155
155 = log_Q(E(p23 red))
coord(p23 red) = [5,10] = [g,A+K]
physical destination page = 23 = p
```

Across all ordered printed nonzero-red pairs, the only differences equal to a named core DH value are p0→p27 by `A=8` and p40→p23 by `K=2`; only the latter also begins from a fully DH-typed Q coordinate and lands on the physical page numbered by `p`.

Reproducer: [`sims/lp2_p3_q_dh_red_transition_sft.cjs`](../sims/lp2_p3_q_dh_red_transition_sft.cjs).

The ROAD contraction and the DH transition are different computations. Their convergence makes physical p23 a stronger candidate **navigation node**; it does not by itself identify a body cipher.

## Direct body consumers closed prospectively

Two obvious ways to turn Q into a bulk decoder were tested with held-out native controls and fail on original ciphertext.

### Constant GF(29²) pair multiplier

All 840 nonzero field multipliers were ranked on the complete 12,956-rune p0–p55 tape.

A native Gibran plant encrypted by Q correctly recovers Q⁻¹ at rank **1/840**. On original LP2:

```text
Q    decoder rank 248/840, score -4.6166403003
Q^-1 decoder rank 682/840, score -4.6403723752
best family score           -4.5653384277
```

Therefore direct global pair multiplication/inversion by Q is rejected.

Reproducer: [`sims/lp2_p3_q_global_fieldpair_inverse_sft.cjs`](../sims/lp2_p3_q_global_fieldpair_inverse_sft.cjs).

### p23 post-red additive Q path

Before output inspection, physical p23 was fixed as the receiver, its red state `[5,22]` as the seed, and the stream rule as “advance by Q, emit both coordinates, repeat”; subtraction was the primary GP29 operation.

A held-out native plant ranks the exact frozen phase **1/840**. The original 197-rune p23 post-red body gives:

```text
raw score                -4.4852303059
frozen Q-path phase rank 610/840
frozen subtraction score -4.6958243147
inverse-sign score       -4.5041615783
best searched phase      -4.1519952099
```

The frozen output is nonprose. This literal Q-path additive body consumer is rejected; do not rescue it with phase, seed, sign, coordinate-order or boundary tuning.

Preregistration: [`workplace/agent5-p40-p23-qpath-body-preregister.md`](../workplace/agent5-p40-p23-qpath-body-preregister.md).  
Reproducer: [`sims/lp2_p40_p23_qpath_body_sft.cjs`](../sims/lp2_p40_p23_qpath_body_sft.cjs).

## Scientific boundary and next decision

What the new result establishes exactly is a **red-state navigation graph**:

1. p39's signed-source interval ends at ROAD23;
2. canonical p50 ROAD23 supplies stride87 = field coefficient3 × DIRECTION29;
3. that stride lands exactly on p7 and contracts the source interval by three words;
4. repeating it reaches singleton ROAD23;
5. independently, p40's fully DH-typed Q state advances by K2 to the actual p23 red state on physical page p=23.

The route is substantially more constrained than treating Q as an arbitrary key or p50 as a generic lookup table. It also explains why the direct body-cipher attempts should be deprioritized: Q is currently strongest as a **state/navigation operator**.

The next causal question is not another tuned Q keystream. It is whether the now multiply selected p23 node supplies, through its original red register, punctuation, illustration, or immediate black-state operand, an **authored receiver operation** that predicts unknown plaintext or a reversible body transform before target grading.
