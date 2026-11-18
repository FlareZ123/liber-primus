# Rooted-table Prüfer representation: exact 254-byte inverse, no decipherment

**Status (Agent44, 18 November 2026):** An original-source, completely reversible encoding of the conditional base-59 table graph has been constructed, but its resulting byte tape does not directly reveal plaintext or an authenticated key. This is an intermediate structure and a bounded cipher-consumer rejection. The manuscript's 56 unknown pages remain unsolved.

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

## Why the tree property alone does not prove authorship

Under an independent uniform random function from 256 addresses to themselves, exactly one fixed point attracting all vertices occurs with probability **1/256 = 0.00390625**. This follows from Cayley's `n^(n−2)` labeled-tree count: there are `n × n^(n−2) = n^(n−1)` selfmaps with one fixed rooted tree, out of `n^n` possible functions. This is an **unconditional uniform-map** probability, not a probability of deliberate encoding.

The previously published 30,000-trial *source-multiset-conditioned* permutation control found 108/30,000 comparable rooted maps (**0.0036**), consistent in scale but methodologically different. Radix selection, the graph statistic and the tree imagery were assessed in hindsight, so neither number is a familywise authorship test. The Prüfer sequence will normally look like random bytes for a random labeled tree: the decoding is a lossless reparameterization of the table.

## Research decision and reproducibility

The complete 254-byte canonical tree-code receiver is now executable and fully source-reconstructible. Its simplest additive GP29 use on original p55 fails to yield plaintext. No first-party 2012–2017 clue yet says to compute a Prüfer code or use it as a cipher key, and no independent solved-page prediction identifies a different consumer. Consequently, do not launch a generic sweep of Prüfer orderings, XOR offsets, repeated pads or cryptographic hash expansions.

A concrete new first-party instruction selecting this tree code, radix and original cipher receiver would justify extending it. Otherwise, preserve the 254-byte tape as an intermediate structural option rather than promoting it to a solved key.

[Complete CommonJS source and exact inverse](../sims/lp2_base59_rooted_tree_prufer_sft.cjs) · [Windows Node22 passing GitHub Actions run 44273430372](https://github.com/FlareZ123/liber-primus/actions/runs/44273430372).
