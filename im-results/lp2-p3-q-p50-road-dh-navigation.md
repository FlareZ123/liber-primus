# Signed WORDS→MAP→DIRECTION navigation: p49 ROAD cell drives p39 → p7 → ROAD23

**Agent5, 28 November 2026. Classification: exact source-instruction/table/Q-coordinate navigation result; no unknown plaintext.**

> Terminology correction: the canonical 256-cell numeric table spans physical **p49, p50 and p51** (10+13+9 rows of 8). Earlier working notes called it the “p50 table” as a shorthand. Cell23 is physically **p49 row2 col7**.

## Decision

The authenticated signed-2016 instruction and the original p49–p51 numeric table now compose with the frozen p3/Q state map in a low-freedom way.

The field remains

```text
GF(29²), u² = 3u + 8
Q = [17,24], order(Q)=840
```

and nonzero red residues have unique Q exponents `k=29r+c`.

The signed source has 43 zero-based words. Those **word numbers literally address the first 43 cells of the physical p49 numeric grid**, because p49 is the first 10×8 rows of the 256-cell p49–p51 table. In particular:

```text
indices 16..23 / p49 row2:
ARE THE MAP THEIR MEANING IS THE ROAD

indices 24..31 / p49 row3:
AND THEIR NUMBERS ARE THE DIRECTION SEEK AND
```

This gives a direct reading of the source instruction:

```text
ITS WORDS ARE THE MAP
...
THEIR NUMBERS ARE THE DIRECTION
```

as **signed word number → physical table cell → numeric direction**.

Reproducer for this source/table alignment and the navigation below:
[`sims/lp2_signed_source_p49_map_direction_road_sft.cjs`](../sims/lp2_signed_source_p49_map_direction_road_sft.cjs).

## ROAD is the unique source-word pure-row direction selected by p3

The printed red states include

```text
p39 red: log_Q(E) = 516 = 17·29 + 23
         coordinate [17,23]
         source interval: THE MAP THEIR MEANING IS THE ROAD

p7 red:  log_Q(E) = 603 = 20·29 + 23
         coordinate [20,23]
         source interval: MEANING IS THE ROAD
```

The shared endpoint is signed word **ROAD=23**.

Word23 addresses p49 cell23, the last cell of row2:

```text
cell23 token = 1R
canonical base60 value = 87
87 = 3 · 29
```

The factor3 is not fitted from the red-state hop. Physical p3's marked triad `[13,23,2]` independently gives

```text
u² = 3u + 8
```

so the table number is exactly

```text
ROAD23 number87 = p3 field coefficient3 × DIRECTION29.
```

Adding 87 to a Q exponent therefore advances exactly three base29 rows while preserving the ROAD column:

```text
[17,23] --ROAD87--> [20,23] --ROAD87--> [23,23]

THE MAP THEIR MEANING IS THE ROAD
                 ↓
        MEANING IS THE ROAD
                 ↓
                ROAD
```

The first step lands **exactly on the printed p7 red state**. The second contracts to singleton `[23,23]=[ROAD,ROAD]`.

This is a concrete human solve-path hypothesis: the signed instruction tells the solver that the words index the map and their table numbers give the direction; the ROAD word supplies the number that walks the Q-coordinate map until only ROAD remains.

## Bounded controls

There are 17 nonzero printed red spans and 272 ordered distinct printed-red pairs.

Using the endpoint word number as the table address, the natural printed-state variants give:

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

Thus the only nontrivial undirected connection in this eight-variant family is the same ROAD edge.

The radix distinction is operational. Token `1R` is 87 in canonical base60 but 86 in base59:

```text
base60: 516 + 87 = 603 = [20,23]  -> printed p7
base59: 516 + 86 = 602 = [20,22]  -> no printed p7, ROAD endpoint lost
```

Across **all 43 authenticated signed word cells**, only two canonical table values are divisible by29:

```text
HELLO0 -> 203 = 7·29
ROAD23 ->  87 = 3·29
```

ROAD is the only one whose row stride equals the independently derived p3 coefficient3. In the complete printed-red census, the word-number→canonical-number direction rule has exactly the single p39→p7 edge above.

Supporting finite-family reproducer:
[`sims/lp2_p3_q_p50_road_red_path_sft.cjs`](../sims/lp2_p3_q_p50_road_red_path_sft.cjs).

### Full 840-state functional graph

The ROAD rule has a natural uniform extension to every Q exponent:

```text
f(k) = k + table[k mod29]  (mod840)
```

where `k mod29` is the signed-word/table address supplied by the Q-discrete-log column.

The complete canonical-base60 map has eight cycles: seven of length4 and one of length54. The 54-cycle has a large 753-state basin, so **eventual entry into that basin is weak evidence**.

Cycle membership is more selective. Four distinct printed nonzero red residues lie directly on cycles, and all four lie on the same 54-cycle:

```text
from p39 start:
step  0  k516 [17,23] = THE / ROAD       p39 red
step  1  k603 [20,23] = MEANING / ROAD   p7 red
step  7  k456 [15,21] = WORDS / IS       p6 red
step 19  k748 [25,23] = THEIR / ROAD     p15-second = solved p57 red
... 54 steps total, then back to k516
```

Thus the uniform dlog-coordinate walk itself reaches the solved/Q-defining p57 residue without switching to the separate plain-Q-output representation.

The matched historical-base59 map has only three cycles (lengths14,14,53) and **no printed red residue lies on any base59 cycle**. This is a finite radix discriminator. It is still post-discovery structural evidence; the dominant base60 basin and the prior visibility of p39/p7 prevent treating the cycle enrichment as a discovery-wide probability.

Full graph reproducer:
[`sims/lp2_q_dlog_table_functional_graph_sft.cjs`](../sims/lp2_q_dlog_table_functional_graph_sft.cjs).

## Independent one-step entry: plain Q uniquely exposes HELLO / MEANING

The solved-p56-selected **plain Q** map supplies a separate one-step source/table transition. It must be kept distinct from the Q-discrete-log ROAD walk above.

Across all 17 nonzero printed red spans, the signed words **HELLO0** and **MEANING20** each occur exactly once among plain-Q outputs, together and ordered on p54:

```text
Q * E(p54 red) = [0,20] = HELLO / MEANING.
```

MEANING20 addresses original p49 cell20 `1g`, whose canonical base60 value **102** occurs once in all256 cells. Advancing p54's Q exponent by that table number gives

```text
k646 + 102 = k748 = [25,23] = THEIR / ROAD.
```

Exponent748 is exactly the shared p15-second / solved-p57 residue used to define the p3 quotient and Q. The solved p57 red opener is **PARABLE**, providing a post-discovery semantic checkpoint for a MEANING-selected landing.

The full radix×coordinate×direction charge leaves exactly this one red→red edge in the canonical zero-based base60 family. Base59 sends MEANING to THEIR/IS.

A representation-continuity control prevents splicing this automatically into the ROAD walk. At k748 the same plain-Q rule produces

```text
Q * E(k748) = [21,9] = IS / LIBER.
```

Using the same second-coordinate table rule then takes cell9=249 to k157, which is not a printed red state. The attractive ROAD23→87 continuation instead reads the **Q-discrete-log coordinate** [25,23], switching representations.

Therefore the supported plain-Q sequence is only:

```text
unique HELLO / MEANING on p54
 -> MEANING number102 as DIRECTION
 -> Q-defining solved p57 / PARABLE state
 -> STOP.
```

The p39→p7→ROAD contraction remains a separate dlog-coordinate navigation grammar. No clue yet authorizes switching between the two.

Detailed report: [`lp2-q-hello-meaning-road-direction.md`](lp2-q-hello-meaning-road-direction.md).  
Reproducer: [`sims/lp2_q_plain_wordnumber_direction_redgraph_sft.cjs`](../sims/lp2_q_plain_wordnumber_direction_redgraph_sft.cjs).

## Existing ROAD23 handoff closes the new walk onto the p23→p25 circuit

The new ROAD contraction does **not** need a newly invented `ROAD=23 -> physical p23` address rule.

A chronologically earlier p29 route had already used the repository's source-number-as-project-page convention. Its source-selected p29 word29 gives

```text
H2 = [22,23] = THE ROAD
```

and the established handoff is

```text
ROAD23 -> project p23.
```

That route predates this p39/p7 ROAD87 construction and therefore supplies an independent terminal type. Its own caveat remains: source-number-as-project-page is a navigation convention, not a body-cipher inverse.

The current p23 synthesis then fixes

```text
THE ONE RISE
one RISE = +2 pages
p23 + 2 -> p25.
```

A later chronological cross-holdout independently supports the destination: p23's red instruction ends at offset16, and its **immediately following complete black word** has raw GP0 sum141, hence `141 mod29 = 25`. Among p23's 42 black words, only the immediate post-rubric length8 word has both that length and sum25. This supports p25 as the page-local operand/destination without using the new ROAD walk.

Therefore the new source/table route attaches to a pre-existing navigation circuit as

```text
p39 red [17,23]
 -> signed ROAD23 addresses p49 cell23
 -> numeric direction87 = 3*29
 -> p7 red [20,23]
 -> same ROAD87
 -> [23,23] = ROAD
 -> existing ROAD23 handoff
 -> p23 THE ONE RISE
 -> +2
 -> p25.
```

This is a stronger causal endpoint than treating `[23,23]` as an attractive word label. It still does not recover black-body plaintext; the next missing operation is the reversible payload consumer after the navigation lands.

Earlier p29 handoff report: [`lp2-p29-direction-selfindex-packet.md`](lp2-p29-direction-selfindex-packet.md).  
P23 causal cross-holdout: [`lp2-p23-one-rise-plus2-p25-convergence.md`](lp2-p23-one-rise-plus2-p25-convergence.md).

## Independent ordinary-Q DH convergence on physical p23

A separate exact relation reaches physical p23 without the ROAD lookup.

The printed p40 red state has

```text
log_Q(E(p40 red)) = 153 = 5·29 + 8
                   -> [g,A]
```

under the authenticated historical DH state `p=23,g=5,A=8,K=2`. It is the only printed nonzero red span whose two Q-coordinate entries are both in the core DH value set.

Advancing the ordinary Q exponent by the independently recovered shared secret `K=2` gives

```text
153 + 2 = 155
155 = log_Q(E(p23 red))
coord(p23 red) = [5,10] = [g,A+K]
physical destination page = 23 = p
```

Across all ordered printed nonzero-red pairs, the only differences equal to a named core DH value are p0→p27 by `A=8` and p40→p23 by `K=2`; only p40→p23 starts from a fully DH-typed Q coordinate and lands on physical page `p=23`.

Reproducer:
[`sims/lp2_p3_q_dh_red_transition_sft.cjs`](../sims/lp2_p3_q_dh_red_transition_sft.cjs).

The ROAD walk and DH transition are different computations. Their convergence strengthens p23 as a navigation node, while the exact post-ROAD consumer still needs source selection.

## Q interval semantics and semilinear T are not promoted

Two prospective Director gates prevent overclaiming the navigation route.

### General signed-source interval semantics fails its p8 holdout

Director #3461 froze p8's independently source-visible red two-word lengths `[4,8]` before opening its Q coordinate and required exact endpoint typing.

Observed:

```text
p8 predicted [4,8]
p8 observed  [7,19] = THE ... THEIR
```

The entire eight-span complete two-word red class gives **zero** word-length/end-point matches under canonical, reversed and ±1-origin conventions. Therefore attractive opened intervals such as p39/p7 remain route-local evidence rather than proof that every Q coordinate is a signed-source interval.

Report:
[`lp2-p3-q-interval-p8-holdout.md`](lp2-p3-q-interval-p8-holdout.md).

### DIRECTION29 does not source-select F(Qx)

Director #3462 charged the minimal Q/Frobenius family. Independent solved p56 uniquely selects plain `Qx` because only that operation yields its already established `[1,2]` prime-minus-one opening pair.

Plain Q has **zero** nontrivial printed-red one-step edges. The attractive semilinear `F(Qx)` p15→p40→p27 chain therefore remains conditional/post-discovery rather than an authenticated transition opcode.

Report:
[`lp2-p3-q-direction-operation-adjudication.md`](lp2-p3-q-direction-operation-adjudication.md).

These negatives sharpen the ROAD result: the supported operation is the explicit source/table **numeric direction lookup**, not unrestricted interval storytelling or a fitted semilinear state walk.

## Direct body consumers closed prospectively

Two obvious ways to turn Q into a bulk decoder also fail with positive controls.

### Constant GF(29²) pair multiplier

All 840 nonzero field multipliers were ranked on the complete 12,956-rune p0–p55 tape.

A native Gibran plant encrypted by Q recovers Q⁻¹ at rank **1/840**. On original LP2:

```text
Q    decoder rank 248/840, score -4.6166403003
Q^-1 decoder rank 682/840, score -4.6403723752
best family score           -4.5653384277
```

Direct global pair multiplication/inversion by Q is rejected.

Reproducer:
[`sims/lp2_p3_q_global_fieldpair_inverse_sft.cjs`](../sims/lp2_p3_q_global_fieldpair_inverse_sft.cjs).

### p23 post-red additive Q path

Physical p23, its red seed `[5,22]`, Q-state advance, coordinate emission and subtraction sign were frozen before output grading.

A held native plant ranks the exact phase **1/840**. Original p23 post-red body:

```text
raw score                -4.4852303059
frozen Q-path phase rank 610/840
frozen subtraction score -4.6958243147
inverse-sign score       -4.5041615783
best searched phase      -4.1519952099
```

The frozen output is nonprose. Do not rescue this body consumer with phase/seed/sign/order tuning.

Preregistration:
[`workplace/agent5-p40-p23-qpath-body-preregister.md`](../workplace/agent5-p40-p23-qpath-body-preregister.md).  
Reproducer:
[`sims/lp2_p40_p23_qpath_body_sft.cjs`](../sims/lp2_p40_p23_qpath_body_sft.cjs).

## Current causal interpretation

The strongest supported Q use is now narrower and more human-facing than a generic field cipher:

1. authenticated signed words are numbered;
2. those word numbers directly address the first cells of the original p49–p51 numeric table;
3. the source explicitly says the words are the MAP and their numbers are the DIRECTION;
4. the Q discrete-log representation supplies a 29-wide coordinate map;
5. the ROAD endpoint word23 addresses original p49 cell23;
6. its canonical number87 equals p3 coefficient3 × DIRECTION29;
7. that exact direction walks printed p39 red to printed p7 red and then to singleton ROAD.

This materially advances a plausible intended navigation grammar while leaving the body cipher unsolved. The next useful experiment must consume the selected ROAD23/p23 node through an independently visible manuscript operation; widening Q keystream or semilinear searches is already contraindicated by prospective negatives.
