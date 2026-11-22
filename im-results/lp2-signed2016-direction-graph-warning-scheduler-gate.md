# Signed-2016 direction graph -> warning-packet scheduler gate

**Agent1, 19 November 2026. Classification: new source-side structural constraint plus a bounded negative on a previously untested common scheduler family. No unknown LP2 plaintext is promoted.**

## Question

The authenticated 2016 source and original p50 table already define the frozen residue graph

```
s_i = low60(p50[i]) - i - GP_length(word_i) mod 29
word i -> word s_i
```

with two cycles among the first 29 signed words:

```
HELLO -> MAP -> ROAD -> HELLO
THE   -> SEEKS -> AND -> THE
```

The fixed p0 state75 warning packet at offsets166..188 has candidate plaintext

```
OPENPGP | PATHS | VERIFY | BEWARE
```

and exact additive key

```
23 3 24 1 18 17 27 | 9 13 18 13 | 28 25 21 3 6 17 | 12 2 0 17 12 7
```

The common-scheduler gate previously tested constant-stride walks over the authenticated word tape. It did **not** test the data-dependent signed-word direction graph above. This report closes that missing family.

## New source-only observation

Start at each of the four warning words and follow the frozen direction graph until its first repeated cycle is reached. The transient distances are:

| source word | signed index | first cycle node | graph distance |
| --- | ---: | --- | ---: |
| OPENPGP | 42 | HELLO (0) | **5** |
| PATHS | 40 | THE (22) | **4** |
| VERIFY | 41 | SEEKS (6) | **1** |
| BEWARE | 38 | AND (24) | **2** |

Thus the ordered distance vector is

```
[5,4,1,2] = [g, a-K, K-1, K]
```

under the independently reconstructed p28 state

```
p=23, g=5, a=6, b=15, A=8, B=19, K=2.
```

This equality uses no unknown-page ciphertext values. It is a genuine compression of the frozen source graph into the existing DH state. Its chronology still matters: the residue rule itself was recognized after the signed terminal block and p28 state were already known, so this is not an independent discovery probability.

## Direct distance consumers

Use the four fixed graph distances as operation counts on the already selected packet segments. Charge only operations already active in the route:

- repeated outside-in H;
- repeated outside-in Hinv;
- repeated cube x->x^3 on nonzero GP29 values;
- repeated inverse-cube x->x^19.

That is **16 source-fixed segment tests**. None yields its candidate plaintext segment exactly.

The output is therefore not rescued by interpreting the newly recovered graph distance as an H/cube iteration count.

## Graph scheduler family

The tested scheduler starts at each source warning word and uses the same rule for every output coordinate. Fourteen source-native node fields are admitted:

```
index, GP0 mod29, GP length, delta, H-diff, H-sum,
p50 high digit, p50 low digit, p50 byte mod29,
digit sum, digit difference, p50[GP0] mod29,
p50[delta] mod29, next-node index
```

Three related families were charged.

### Node walk

For each field:

- start at the source word or its first successor;
- emit current or next node;
- serialize each segment raw, by the fixed outside-in H shell, or by Hinv;
- compare to the exact 23-symbol key and its published 23-symbol H-shell.

Charged configurations: **336**. Exact hits: **0**.

### Edge walk

For every ordered pair of the 14 fields, evaluate the left field at the current node and the right field at its graph successor. Apply one uniform pair operation:

```
H-diff, H-sum, Hinv-left, Hinv-right, add, subtract, reverse-subtract
```

and compare against the key or H-shell.

Charged configurations: **2,744**. Exact hits: **0**.

### Reach-road-then-read

For each warning word, first advance by its frozen transient distance to the cycle entry:

```
OPENPGP -> HELLO
PATHS   -> THE
VERIFY  -> SEEKS
BEWARE  -> AND
```

Then walk the cycle for the segment length, emitting one fixed node field under raw/H/Hinv serialization. Charged configurations: **84**. Exact hits: **0**.

## Decision

The graph supplies a real additional state relation:

```
warning-word transient distances = [g, a-K, K-1, K].
```

But the graph does **not** generate the four exact packet keys or their H-shells under the low-description consumers above, and its distances do not directly decipher the packet under the already established H/cube operation vocabulary.

This materially narrows the packet's missing scheduler. Do not replace the failed graph consumers with coordinate-specific graph features or target-by-target node choices. The warning receiver and segmentation remain source-selected candidate evidence; the four fitted value-changing inverses remain below plaintext promotion.

The next useful advance must either:

1. supply a genuinely new manuscript-selected serialization from the graph/state into a key, fixed before ciphertext inspection; or
2. make an untouched plaintext/key prediction outside the warning vocabulary.

## Reproduction

Run:

```
node sims/lp2_signed2016_direction_graph_warning_scheduler_sft.cjs
```

The SFT reconstructs the signed source, p50 table, p28 DH state, both graph cycles, the packet ciphertext/plaintext/key, the four transient distances, and every charged consumer above from repository sources. Windows / Node.js 22 passed in Actions run **44448883735**.
