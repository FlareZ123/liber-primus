# LP2 pp0–2 square / pp49–51 numerical page-block ring transfer

**Agent 13, 14 November 2026. Original-source finite negative; no authentic plaintext or key recovered.** This is one new, testable cross-artifact layout hypothesis. The 2014 manuscript does not supply the missing instruction pairing the objects, and the result should remain intermediate rather than be promoted as a designed mechanism.

## Causal candidate and independently printed inputs

The first three original encrypted LP2 pages have **262, 266 and 201 runes**, totalling **729 = 27²**. Arranging the unaltered rune tape as a row-major 27×27 square is a previously proposed, unauthenticated reading. The original numeric pp49–51 form a 32×8 table, with **80, 104 and 72** printed cells on each successive page. A square ring at inward depth `d`, counted from zero at the outside, has exactly `8(13−d)` rune cells. Thus the physical 80/104/72 table page groups select **three distinct, disjoint complete rings** in that 27×27 square:

| Source numeric page | Printed table entries | Candidate 27×27 ring depth | Ring width |
| --- | ---: | ---: | ---: |
| p49 | 80 | **3** | 21×21 |
| p50 | 104 | **0** | 27×27 |
| p51 | 72 | **4** | 19×19 |

Together these select 256 distinct, unchanged, original p0–2 ciphertext cells. This exact length identity is a *possible* originally human-noticeable cross-artifact operation. Crucially it is **not an independent proof of an author-selected relationship**: the source table is eight columns wide and any one of its page blocks of eight rows has the length of a square ring of appropriate odd width. The specific separated depths [3,0,4], ring traversal, GP29 key rule, and p0–2 ciphertext recipient are all proposed interpretations.

## Complete direct inverse, 1,024 original readings

Freeze the conventional source-preserved base60-byte decoding of the 256 printed tokens in `resources/liber-primus/lp2-grid-256.json`, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Compare the table's three physical page blocks **in unmodified printed order** to the source rune values of the three selected rings. Grant each ring **any of four source corners and either winding direction**, 8³ possible independent orientation triples. For each, try both literal additive signs using the table byte modulo29:

```text
P[i] = (C[the i-th selected ring cell] ± gridByte[i]) mod 29
```

There are **1,024** complete, losslessly reversible original-cipher candidates. No secret keys, phases, language-model scoring or altered original bytes are used. The source ring cells remain unique under all candidates. The GP29 IoC is a bounded diagnostic rather than an exact plaintext impossibility proof.

| Original test | GP29 IoC |
| --- | ---: |
| Source 256 runes, natural top-left-clockwise rings | **0.0332720588** |
| Natural rings, subtract source byte mod29 | **0.0364276961** |
| Natural rings, add source byte mod29 | **0.0364583333** |
| **Best** of all 1,024 candidate inverses | **0.0378676471** |
| Lowest of all 1,024 | **0.0319240196** |
| Models achieving IoC ≥0.040 | **0/1,024** |

The best model reads p49's ring from corner4 counterclockwise, p50's from corner3 clockwise and p51's from corner2 clockwise, with **addition**. Its optimized orientation is neither historically selected nor persuasive language. Original GP rune output under both natural directions is nonlinguistic; in contrast, native source-spelled GP prose has a visibly nonuniform frequency distribution (the actual solved p57 page has IoC 0.06270997 for 95 runes). **No recovered unknown rune or key** follows from this 256-cell matching, and we do not infer that the original ciphertext was produced by this mechanism.

The independent positive control plants all 256 GP values from the cleartext p57 and applies exactly the same 256-byte modular shifts: all **256/256** symbols recover under each sign. The CJS source original assertions and positive controls passed on [Windows Node 22 workflow run 43627425582](https://github.com/FlareZ123/liber-primus/actions/runs/43627425582). [Single-file original-input reproducer](../sims/lp2_p0_square_p50_page_ring_256_sft.cjs).

## Decision

A direct table-byte key for these three source-length-matched rings does **not** yield native-GP prose in any of the 1,024 obvious corner and direction combinations. This removes the straightforward direct-additive consumer of a fresh physical page-block ↔ square-ring crosswalk. The unproven grid shape and page-to-ring association do not justify a larger keyed search. A useful reopening would need a separate original ink, signed sentence, number or historical operation that selects **how** the 80/104/72 blocks address and decode the 256 first-chapter cells and predicts a withheld original plaintext interval.