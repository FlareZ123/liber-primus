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

## Distinct GP28 differential inverse, 2,048 additional original readings

The actual LP2 source has strongly suppressed adjacent identical runes, making the most literal nonzero-step reading a relevant, fully reversible rival to direct GP29 subtraction. Keep exactly the same physical 80/104/72 byte blocks and 8³ source-ring orientations. Set initial previous ciphertext GP rune index to zero (the conventional F), then map each current cipher difference `delta=(C[i]-C[i-1]) mod29` to a 28-valued step; `delta=0` becomes the literal **F=index0**, a value outside the 1..28 encrypted alphabet. For nonzero delta, try only two fixed reversible number-theoretic codings:

1. **Rank28:** `rank=delta-1` in 0..27.
2. **GP prime-group dlog28:** `rank=log_15(delta)` in the multiplicative field GF(29), whose primitive root 15 enumerates all 28 nonzero residues.

For both key signs, `P[i]=1+((rank ± (gridByte[i] mod28)) mod28)`. The forward encoder reconstructs every original `delta` from its rank, integrates it against previous ciphertext mod29, and copies literal F as a zero step. All **2,048** original-cipher inverses round-trip **256/256 actual ring runes**; the same operation round-trips **256/256** GP-native p57 planted plaintext runes for both maps and signs. The extra GP28 family is a *specific conditional test* of the observed anti-repeat design, rather than a claimed original GP28 instruction.

| Distinct source-fixed differential test | GP29 IoC |
| --- | ---: |
| Natural rings, rank28 with subtraction | **0.0353553922** |
| Natural rings, rank28 with addition | **0.0352328431** |
| Natural rings, discrete-log28 with subtraction | **0.0365502451** |
| Natural rings, discrete-log28 with addition | **0.0348039216** |
| **Best** of all 2,048 combinations | **0.0375919118** |
| Models achieving IoC ≥0.040 | **0/2,048** |

Only **five or six** zero steps arise under the searched ring choices, so treating them as the literal-F sentinel does not make the remaining output linguistic. The highest IoC under rank28 appears in two orientations, `(a,b,c)=(0,4,2)` with minus key and `(4,6,6)` with plus key. Neither orientation is selected by original ink or historical instructions. [The same original-input SFT](../sims/lp2_p0_square_p50_page_ring_256_sft.cjs) includes the complete differential inverse, forward replay, primitive-root assertion, and known-p57 symbol plants. It passed [Windows Node22 workflow run 43629763038](https://github.com/FlareZ123/liber-primus/actions/runs/43629763038).

## Decision

Under the unchanged source ring/page-block pairing, neither of two simple complete 256-symbol decoding architectures produces native GP prose: **0/1,024 additive GP29 candidates** and **0/2,048 differential GP28 candidates** attain even IoC 0.040, versus 0.06271 on 95 authentic solved-p57 source runes. This is a **bounded failure of the proposed direct original-page coupling**, with exact inverse and planted positive controls for both architectures. It cannot exclude a missing authentically selected key operation or the possibility the three matching square rings are a layout coincidence. The p0–2 27×27 shape and p49–51 table pairing alone do not justify increasingly tuned keys, shifts or new perimeters. Reopen only if an original cue actually selects the operator and predicts withheld unknown plaintext.