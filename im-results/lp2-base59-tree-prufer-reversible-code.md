# Rooted-table Prüfer representation: exact 254-byte inverse, no decipherment

**Status (Agent44, 18 November 2026):** An original-source, completely reversible encoding of the conditional base-59 table graph has been constructed, but its resulting byte tape does not directly reveal plaintext or an authenticated key. A separate source-size alignment, 95 graph leaves to 95 clear p57 runes and 161 internal vertices to the 76+85 p55–56 runes, also fails an exact known-p56 recursive-sum prediction. Both are bounded cipher-consumer rejections. The manuscript's 56 unknown pages remain unsolved.

## Why a tree-code decoder is a motivated but conditional experiment

The manuscript illustrates trees prominently on original LP2 pages 32 and 55. Its 2016 PGP-signed clue discusses words as a map and numbers as direction. The original physical numerical table spans LP2 pages 49–51 and contains exactly 32×8 = **256 two-character numeral cells**.

Prior work, especially [the base-59/base-60 self-map source gate](lp2-p50-base59-source-convergent-map.md), established that deleting lowercase `f` from the conventional 60-digit alphabet gives a valid alternate **59-digit** interpretation of every original cell. In that interpretation, each two-character numeral is a value 0–255 and therefore addresses a position in the same 256-cell table. The complete functional graph has one self-loop at **index 189**, and all other 255 vertices lead to that root. The original table also admits a competing, entirely valid base-60 reading, under which the graph has two nontrivial cycles. The source does **not** explicitly specify a radix, a pointer operation, the tree-code name, or a cipher consumer.

A finite, historically available interpretation of the rooted graph is a labeled tree. Delete the root's trivial self-loop and treat every remaining pointer `i→parent[i]` as an undirected edge. There are 256 labeled vertices and exactly 255 edges. The repeated tree illustrations provide a potential human reason to examine a tree encoding, but selecting the particular Prüfer code is still our hypothesis.

## Canonical reversible transformation

Use the original 256 printed cells in row-major order; parse them with the exact character order `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` after removing the single lowercase `f`. The root is the unique fixed point, **189**. All pointers are already in range 0–255.

1. Build the undirected labeled tree from the 255 non-root pointers.
2. Repeatedly take the **smallest-numbered leaf**, emit the index of its unique neighbor, and remove the leaf.
3. Stop after exactly 254 removals. This gives a standard canonical **254-byte Prüfer sequence**, each symbol an unsigned 0–255 integer.
4. To invert, use the standard smallest-leaf Prüfer decoder to reconstruct all 255 undirected edges. Orient the edges outward from the separately recorded root 189. Restore the root self-loop.

This reverses the entire original 256-address table exactly. It does **not** recover an original English sentence; the 254 bytes encode the same information as the known pointer tree, under a newly imposed serialization.

The first 32 output bytes are:

```text
e3a4b7b45bf5daf3c7566baa19418b4f1c48e24b1077559a44c132fb19c3c4a6
```

SHA-256 of the 254-byte Prüfer code:

```text
efbd8e6b93853c623ee33b32ef767bc88caec1019bbd53fb3f2e4b6b1f60f74b
```

It contains **105/254 printable ASCII-range bytes** and its longest printable run is **six characters**. Neither ordinary text nor a familiar complete binary packet is identified by the present direct readout.

## One frozen original-cipher inverse

The final unknown physical LP2 page55 contains 76 GP29 runes. Treat the **first 76 canonical Prüfer byte values, reduced modulo29**, as a proposed direct GP29 key in source order. Both natural signs of the additive model were examined without changes to key phase, orientation, word segmentation or page start.

| Original-input receiver | GP29 index of coincidence | Recovered coherent plaintext |
| --- | ---: | --- |
| Original untouched p55 ciphertext | **0.0378947368** | none established |
| `P[i] = (C[i] − key[i]) mod29` | **0.0301754386** | no |
| `P[i] = (C[i] + key[i]) mod29` | **0.0326315789** | no |
| Independently clear solved-p57 source, for reference | **0.0627099664** | original clear text |

The two original candidate output streams are archived in the reproducer's deterministic JSON output. Each receiver re-encrypts **76/76** original p55 runes. A separate true-plaintext positive plants the same first 76 code bytes into the first 76 genuinely clear p57 runes and recovers **76/76** native runes exactly. Roundtrip verifies the code, but supplies no independent evidence that p55 used this cipher.

## A stronger terminal-page test: 95 known leaves → 161 candidate internal GP29 symbols

The conditional base-59 rooted table has **exactly 95 leaves** (in-degree zero) and **161 interior vertices** (with one or more inward children). The terminal three original GP29 pages happen to have the exact matching lengths **p55=76 original unsolved, p56=85 independently solved, p57=95 original clear**, giving `95 = |leaves|` and `161 = 76+85 = |interiors|`. The physical book's illustrated trees and the solved p57 wording about shedding circumferences and emerging toward the surface make leaves a potentially human-readable object. This is an exact source alignment, yet the *choice* to assign p57 to graph leaves, interpret internal vertices as runes, or adopt base59 is not explicitly made by the original authors. The leaf count was previously described in the base59 graph audit; the terminal three-page coupling is an exploratory interpretation, not independent evidence of authorship. **This 95/161 count is also radix-independent:** both conventional base60 and provisional base59 parse the 256 original printed tokens as byte values in 0–255, with **161 distinct values in both parsings**. For any complete table function `i→V[i]`, leaves are exactly values absent from the table, so `256−161=95` for both. Under the simple null of 256 independent uniformly sampled byte values, the **exact probability of 161 distinct values is 0.0782264371**, with expected **162.0071** (standard deviation **4.99045**). It is an ordinary occupancy count; the count coincidence alone should not be read as proof of a deliberate 95-rune key.

One economical, lossless-input and uniquely defined **predictive test** requires no original unknown plaintext:

1. Read all 256 original table tokens in printed row-major address order, under the same conditional 59-character numeric alphabet. Orient each non-root edge from address `i` to its literal table value `parent[i]`.
2. Sort the **95 distinct leaf addresses** in ascending original row-major address order, and assign the **95 genuine, unencrypted GP29 p57 rune values** to these leaves one-to-one, in ordinary p57 reading order.
3. For each of the **161 internal addresses**, derive a GP29 rune by **recursively adding the values of all immediate children modulo29**, from the leaves toward the root.
4. Sort the 161 internal addresses in their original printed address order. Reserve the first76 predicted values for unknown p55, and **predict the remaining85** completely independently known p56 values, without fitting a single secret parameter.

The source-native heldout gate definitively rejects this precise `p57 leaf labels → GP29 child-sum interior labels → ascending p55/p56` construction:

| Independent target on authentic p56 | Exact GP29 positions correct / 85 |
| --- | ---: |
| Verified solved plaintext after authentic prime-totient F-transparent inverse | **2 / 85**, zero-based offsets **39,43** |
| Literal original printed p56 ciphertext (wrong-register control) | **2 / 85**, zero-based offsets **46,69** |

The solved plaintext is taken from the historically verified full p56 sentence: `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`. The test independently re-encrypts all **85/85** runes into the *unaltered original p56 ciphertext* using the authentic prime-totient clock and the genuine plaintext-F bypass (F at local offset56, non-key-consuming), ensuring the proposed comparison actually uses the historical solved passage.

More decisively, **arbitrary secret rearrangement of the 161 derived interior positions cannot rescue the same literal GP29 symbol identities**. All 161 predicted interior labels have GP29 rune **Y count0**, while the known p56 plaintext contains **2 Y**; the full exact inventory shortfalls are **S: 5 predicted vs 7 required; E: 9 vs 16; A: 2 vs 6; Y: 0 vs 2**. No choice of 85 distinct interior vertices can supply the authentic p56 count inventory, and at least **15 rune identities** would have to change across the inferred full 161-vector for the known p56 to appear as a subset. This obstruction is independent of internal-node traversal, page split, permutation and English scoring, *provided the child-sum labels themselves are unchanged*. It also excludes **one single secret global GP29 output bijection applied alike to leaves and internals while preserving the clear p57 leaf message**: p57 contains each of S, E, A and Y, forcing a global bijection to fix these 4 rune identities and leaving the four interior count deficits intact. An arbitrary **internal-only** secret alphabet relabeling, different child operation, different leaf association or an intervening cipher is **not** eliminated; indeed the rank-sorted interior counts admit some secret internal-only bijection.

This predicts an exact, early source-independent **failure before inspecting p55's unknown ciphertext**. Thus do not propagate the 95/161 coincidence into more tuned tree-valued ciphers without a primary author-selected child operation, alphabet mapping and target clock. The basic split is still mathematically interesting as an observation but **no original LP2 plaintext or key** follows.

[Standalone exact table/known-plaintext CommonJS gate](../sims/lp2_base59_leaf95_terminal256_knownp56_sft.cjs) · [Windows Node22 PASS 44275582946](https://github.com/FlareZ123/liber-primus/actions/runs/44275582946); the subsequent stronger radix-null and global-leaf-alphabet assertions rerun in the same SFT.

## Why the tree property alone does not prove authorship

Under an independent uniform random function from 256 addresses to themselves, exactly one fixed point attracting all vertices occurs with probability **1/256 = 0.00390625**. This follows from Cayley's `n^(n−2)` labeled-tree count: there are `n × n^(n−2) = n^(n−1)` selfmaps with one fixed rooted tree, out of `n^n` possible functions. This is an **unconditional uniform-map** probability, not a probability of deliberate encoding.

The previously published 30,000-trial *source-multiset-conditioned* permutation control found 108/30,000 comparable rooted maps (**0.0036**), consistent in scale but methodologically different. Radix selection, the graph statistic and the tree imagery were assessed in hindsight, so neither number is a familywise authorship test. The Prüfer sequence will normally look like random bytes for a random labeled tree: the decoding is a lossless reparameterization of the table.

## Research decision and reproducibility

The complete 254-byte canonical tree-code receiver is now executable and fully source-reconstructible. Its simplest additive GP29 use on original p55 fails to yield plaintext. The independent 95-leaf/161-internal direct recursive-sum model is excluded by 85 genuinely known p56 target values, including every position permutation without rune-identity changes. No first-party 2012–2017 clue yet says to compute a Prüfer code or use it as a cipher key, and no independent solved-page prediction identifies a different consumer. Consequently, do not launch a generic sweep of Prüfer orderings, XOR offsets, repeated pads or cryptographic hash expansions.

A distinct original-source crosslink became available after the p8/p40 punctuation corrections: the image-corrected interval partition and canonical tree code both have 254 elements. The [conditional 254-interval prime-clock receiver](lp2-original-punctuation-256-slot-grid-gate.md#distinct-corrected-254-to-254-receiver-canonical-tree-code-prime-origins) nevertheless fails 126/217 nonempty intervals in canonical order; physical p35 interval169 admits no byte-valued origin at all. Arbitrary code-byte reassignment also fails (maximum matching 216/217). The size equality alone does not establish a decipherment.

A concrete new first-party instruction selecting this tree code, radix and original cipher receiver would justify extending it. Otherwise, preserve the 254-byte tape as an intermediate structural option rather than promoting it to a solved key.

[Complete CommonJS source and exact inverse](../sims/lp2_base59_rooted_tree_prufer_sft.cjs) · [Windows Node22 passing GitHub Actions run 44273430372](https://github.com/FlareZ123/liber-primus/actions/runs/44273430372).
