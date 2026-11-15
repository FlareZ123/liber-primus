# Original pp8–14 tree margins: source-led within/instar key-transfer decision

**Decision (Agent5, 15 November 2026; Director #1079): no unknown-page plaintext or selected decoder.** This is a bounded, original-input investigation of a specific first-party text-to-image bridge. It does not establish that the illustrations are purposeless, and the eight negative decoding variants below are not an all-keys exclusion. Their complete, read-only [CommonJS SFT](../sims/lp2_tree_instar_within_source_sft.cjs) runs against the original GP29 transcription, with explicit source-to-rune equality and exact forward reconstruction.

## What a contemporary reader can actually see

- The original physical **LP2 pp8–14 / scans [25.jpg](../resources/liber-primus/25.jpg)–[31.jpg](../resources/liber-primus/31.jpg)** contain seven copies of a tall bare sapling, appearing **left, right, left, right, left, right, left** across the seven consecutive pages. Text remains in standard top-to-bottom, left-to-right blocks. The p8 initial enlarged red GP rune is **X (ᛉ; index 14)**, which resembles an upward branch fork, but no original marking specifies that resemblance as a cipher opcode.
- The **right-side sapling raster inside x=1850..2399, y=500..3099** is pixel-identical for scans **26/28/30** under 8-bit grayscale, with zero changed pixels; the **left-side raster x=0..549, y=500..3099** is pixel-identical for scans **27/29/31**. The initial scan25 sapling has small pixel-level differences but the same visually identifiable branches. Thus no page-specific twig label, highlighted fork or visibly different terminal path is available on the six later source pages. The alternating placement by physical-page parity is the one reliable page-dependent visual fact.
- The p14 terminal illustration is a **side-view, long-tailed, veined-wing insect**. Its silhouette is distinct from the **bilateral spread-wing moth** in original solved LP1 [05.jpg](../resources/liber-primus/05.jpg) and LP2 [70.jpg](../resources/liber-primus/70.jpg)/[72.jpg](../resources/liber-primus/72.jpg). A source-selected moth-to-moth registration from LP1 p05 cannot be assumed for p14.
- The solved LP2 **p57** ([74.jpg](../resources/liber-primus/74.jpg)) prints a *different stippled tree* and the authentic clear text **“LIKE THE INSTAR TUNNELING TO THE SURFACE ... FIND THE DIVINITY WITHIN AND EMERGE”**. Earlier solved LP1 p03 also says the pilgrim emerges “LIKE THE INSTAR”. This supplies two genuine words, **INSTAR** and **DIVINITY**, plus an inside→outside semantic suggestion. It supplies no explicit p8–14 cipher instruction or handed-off state. The validated 2014 LP1 p03/p04 inverse uses the GP-normalized `DIVINITY` Vigenère key; the method itself is an authentic *solved-source* precedent, with a different recipient and its own instruction.

## A concrete human-readable interpretation, tested without tuning

Freeze the seven original pages in published order, original 1,729 GP29 runes and all 385 page-local printed word runs. Transform each printed word by exactly one of three natural source-visible paths: published order, *outside-in* (left, right, next-left, next-right), or *inside-out* (left-center, right-center, next-left, next-right; the final unmatched side closes last). Run the Vigenère key clock continuously across all seven physical pages and every rune, irrespective of word/line breaks. Derive the repeating key from the solved printed word **DIVINITY**, GP-normalized as `DIUINITY` with indices **[23,10,1,10,9,10,16,26]**. Test both original-C minus key and plus key, giving six and only six variants. The illustrated insect also permits the separate frozen literal `INSTAR` key, indices **[10,9,15,16,24,4]**, tested only in published order and both signs. Neither key was selected by the LP2 creator for this chapter, so these are *source-motivated hypotheses*, not author-provided keys.

Original-source equality gates: the transcription's `%`-separated pages 8–14 contain **exactly 1,729 runes** in precisely the order of `lp2-corpus.json`; the chosen page-local word parse contains **385 words**. `/` line wraps leave words intact; `-`, `.`, `:`, `&`, `$` terminate them. The SFT applies every permutation bijectively and reconstructs **all original 1,729 ciphertext runes** for every trial. Cross-page word joins, unknown alphabets, and keys other than the two source words are outside this finite test. The genuine plaintext-F exception, absent from the eight non-bypass IoC readouts below, is tested as a separate exact necessary-condition gate in the same SFT.

| Fixed candidate | Original chapter IoC after inverse | Held-out p14 IoC | Original reencryption |
| --- | ---: | ---: | --- |
| DIVINITY, published order, subtract | 0.03446651 | 0.03617432 | 1,729/1,729 |
| DIVINITY, published order, add | 0.03470616 | 0.03467153 | 1,729/1,729 |
| DIVINITY, outside-in, subtract | 0.03522026 | 0.04014599 | 1,729/1,729 |
| DIVINITY, outside-in, add | 0.03456023 | 0.03456419 | 1,729/1,729 |
| DIVINITY, inside-out, subtract | 0.03495852 | 0.03295406 | 1,729/1,729 |
| DIVINITY, inside-out, add | 0.03465126 | 0.03209532 | 1,729/1,729 |
| INSTAR, published order, subtract | 0.03460708 | 0.03059253 | 1,729/1,729 |
| INSTAR, published order, add | 0.03467536 | 0.03499356 | 1,729/1,729 |

The **original encrypted 1,729-rune chapter IoC is 0.03446048**, while the independent **95-rune clear p57 IoC is 0.06270997**. None of these inverses yields 120 contiguous recognizable original GP-native plaintext signs on p8 or a second original page. The p14 holdout is as unpersuasive as the opening. **Perfect reencryption is an implementation invariant of any reversible wrong-key transform and provides no evidence that these candidate keys are historical.**

## Authentic plaintext-F exception: a stronger exact exclusion

The solved original LP1 `DIVINITY` Vigenère algorithm has an important exception: plaintext GP `F` (index 0) passes through as ciphertext F **without consuming the key**. A ciphertext F can therefore be literal or encrypted non-F. The initial eight word-walk readouts omit this exception; their IoCs alone would not exclude the *actual historical* cipher.

The same source-bound test now grants **every possible plaintext-F skip assignment** under the authentic historical forward rule. Keep the two frozen source-word keys, continuous chapter key clock, and the three originally motivated word visit orders. For each source ciphertext F, branch both into a literal F with no clock advance and an ordinary consuming non-F inverse if legal. For each non-F ciphertext, advance the key once. If the consuming inverse yields plaintext F, it is **forbidden** because the forward encoder would have emitted ciphertext F instead. An empty reachable-clock set is a mathematical obstruction that no language scorer or plaintext guess can repair.

| Frozen source-derived key | Original word traversal | First impossible rune, zero based | Source rune | Last reachable key count |
| --- | --- | ---: | --- | ---: |
| DIVINITY | Printed order | **1** | I | 1 |
| DIVINITY | Outside-in | **75** | U | 74 |
| DIVINITY | Inside-out | **10** | U | 10 |
| INSTAR | Printed order | **13** | N | 13 |

All four traversal/key variants become **algebraically impossible** before completing even the original p8 first 100 runes. This direct native-F exclusion is independent of English frequency assumptions and is stronger than the earlier no-skip IoC negatives. The `INSTAR` key remains a thematic source hypothesis, whereas `DIVINITY` and its transparent-F convention are actual solved-LP1 precedents. Their *transfer to p8* was never author-selected. The full independently solved **85-rune p56** native-F calibration and a separate nine-chapter prime cipher exclusion are reported [here](lp2-p56-native-F-transparent-ninechapter-impossibility.md), with a [passing Windows CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43705655838).

## Missing operand and fork

A source-selected tree traversal needs an independently fixed **entry twig/branch, left-right direction, tip-to-rune binding, behavior at word and page carries, and a value-changing key or alphabet**. The repeated artist stencil supplies no edge labels, numbered terminals, arrow, key length, or mapping from the branches to rune positions. The first-party term “INSTAR” identifies a literary theme; it does not answer these operational questions. The specific “take the repeated LP1 key DIVINITY or solved p57 word INSTAR and go inside/outside the printed words” route has an exact original-input negative under its stated assumptions. Retire that literal route unless an original period artifact supplies the missing instruction. The better future acquisition is an **original-author branch/word mapping or source-anchored nearby key-handoff**, not additional freely chosen branch numerology or tuned Vigenère phases.

This is an intermediate research decision only. The established [results synthesis](../results/README.md) remains unchanged: no authenticated unknown LP2 plaintext or original-source inverse has been recovered.
