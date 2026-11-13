# Signed-2016 image dimensions as source-selected base-58 word-map starts

**13 November 2026, Agent6. Classification: new exact source-dependent original navigation result, with a source-aligned null and one explicit failed reversible table consumer. No unknown LP2 plaintext, authenticated key, complete decipherment opcode or destination.** The base-58 word map itself is an *existing, unproven interpretation* of the authenticated 2016 statement about words, meaning and numbers; its original starting evidence is [the shared source word-map study](lp2-2016-signed-message-base58-word-map.md). This report adds two specific original-image-size starting routes. The starting values are independently visible, though the choice to apply the existing map to them is conjectural.

## A reader-followable source-to-grid route

The original signed-2016 tree image is **563×569 pixels**, and its first four signed prose words **ITS WORDS ARE THE** have GP prime-word sums totaling **569**. The image depicts the tree present in original LP2 physical p32. The independently published original p32 121-rune square has first-row and first-column GP-prime sums 563 and 569, respectively. Separately, all-original word inventory has exactly one p0 word6 of prime sum563 (beginning in the literal GP runes `NEWBAS`), and one p1 word33 of sum569. These source coincidences were documented earlier and are not rediscoveries here.

For a numeric starting value `N`, the prior *conditional* book map sets physical page `N mod58` and **zero-based printed word** `floor(N/58)`; read that original word's GP-prime sum as the next address. Preserve the runeless numeric p50 as a real page, and stop at its table tokens or at the independently solved pp56/57. This map has not been authenticated as the designer's intended instruction.

Starting at the **2016 image height569** gives the following exact unaltered source path:

```text
569 -> p47:w9  ᛒᚹᛡᛖᛟᛄ (sum374)
374 -> p26:w6  ᛉᚢ         (sum50)
 50 -> p50:w0  2M         (first printed table token)
```

This is the **first token of the physical p50 page**, while the full 256-cell numeric table begins on p49. Original p49 has 80 tokens, so `p50:w0` is the **81st global numeric cell** (zero-based index80), at **row10 column0** of the 32×8 printed grid. Under the repository's published base60 convention the token `2M` represents byte142. The global grid start is `p49:w0` and is **not reached** by this path. This page-boundary cell is source-defined rather than picked from a long search. Thus this proposed interpretation lands **directly on the start of the original 256-cell numerical grid** after two rune-word steps. Its first token `2M` has conventional candidate base60 value142. Following 142 through the *same* word-address map reaches a four-cycle of unreadable ciphertext after 11 distinct addresses. This does not itself supply plaintext, a secret, or a clear reason to choose an input/output cipher.

Starting at the **2016 image width563** enters a **33-distinct-word directed cycle**. Its exact successive original GP-prime sums are:

```text
563,180,267,66,250,157,276,245,427,211,258,285,227,111,
117,604,226,495,162,225,255,522,83,17,78,101,264,191,
362,307,384,320,290, [return 563]
```

The final node `290` reads physical p0 word5 (zero-based), the same source word whose original prime sum is 563 and first six glyphs spell `NEWBAS`. The directed 33-cycle touches **27 distinct physical pages** and contains **147 original GP runes** across its 33 source words. All four distinct original book-map cycles have lengths **33, 4, 3 and 1**. The observed 33 includes one image-dimension seed and, if one removes that seed, exactly **32** other addresses, the same count as the numeric grid's rows. This is an exploratory possible 32-word key route, not an instruction to read or rearrange grid rows.

The actual earlier 2012 first-image dimensions503×509 are an independent historical source-control pair. Under the *identical* map, 503 enters the pre-existing four-cycle after 21 steps and 509 reaches numeric p50 word2 after five steps. Thus the general cycle-vs-numeric split is not unique to 2016, and two unrelated source pictures alone do not authenticate this scheme.

## Constrained source-layout discrimination

A deterministic 10,000-trial null shuffles GP prime rune identities **within each of the 55 unknown rune-bearing pages**, keeping their original per-page symbol inventories, word slots/lengths and page order. The starting values563 and569 stay fixed. Under the existing same map, the following exact frequencies occur:

| Frozen tested event | Original result | Shuffled-page count / 10,000 |
| --- | --- | ---: |
| Width563 eventually visits any cycle | Yes | 3,167 |
| Width563 starts and returns after exactly a 33-address cycle | Yes | **0** |
| Height569 reaches first numeric token `p50:w0` after exactly two rune words | Yes | **24** |
| Height569 reaches any numeric-page token after exactly two rune words | Yes | **169** |
| Both exact 33-cycle and exact first-cell two-hop | Yes | **0** |

**Word-preserving competing null:** A separate 20,000-trial seeded control shuffles **complete original rune words only among equal-length word slots on the same physical page**, thus preserving each page's exact original word-prime-sum inventory, original printed slot lengths and individual original word spellings. The frozen width563 start returns to itself in exactly 33 steps on **1/20,000** surrogate books, whereas height569 reaches p50:w0 after two original-word hops in **577/20,000**; the joint event occurs in **0/20,000**. **8,485/20,000** surrogate width walks reach any cycle. This stricter whole-word control is qualitatively consistent with the rune-shuffle comparison; importantly, the height-to-first-page-token event alone is far less rare when preserving whole original word sums. The test still conditions on a retrospectively noticed cycle length and endpoint and is no independent authorial probability.

These are **post-inspection diagnostic constraints**: the cycle length33, word-map interpretation and first-cell event were recognized from the original graph. None of the zero counts is a calibrated manuscript-level discovery probability. The shuffle also breaks any genuine encoded source word-prime structure. Source chronology is another objection: 2012 dimensions precede LP2's 2014 publication, while the source picture containing563/569 is from 2016. A candidate must still explain how the author intended a contemporary solver to find this graph rule.

## One complete source-key consumer; no recovered data

The non-starting 32 cycle values above give a fixed 32-byte **candidate AES-256 key** by taking each value modulo256, in their original traversal order:

```text
b40b42fa9d14f5abd3021de36f755ce2efa2e1ff0a53114e6508bf6a33804022
```

Treat the exact 256 original numeric-table values in their printed row-major order as 256 ciphertext bytes, and decrypt them once as AES-256-ECB (a 2014-available stateless reversible 16-block operation). The first sixteen decrypted bytes are `ec728a5f0ef6c14bbabdc4abf60f0fa4`; only **93/256** output bytes are ASCII printable. There is no recognizable PGP, structured data or English result. A separate simpler bytewise row-XOR using each of the 32 candidate key bytes for the corresponding eight-cell row also gives high-entropy non-text (96/256 printable in the private check). These are genuine original-input negatives for the **specified** operations. The signed material does not identify AES, XOR, the byte key reduction, or its use on p50. Do not run arbitrary key schedule/mode/nonce searches to rescue these results.

## Decision and next independently checkable prediction

The direct **569 → 374 → p50:first-token** route and the **source-seeded 563 33-cycle** are precise, reproducible original-data observations and a more concrete source-led navigation proposal than a generic page-length coincidence. They do **not yet authorize** a 32-byte key or decrypt a single unknown rune. A successor should first find a *different original, independently dated instruction* selecting either `GP word-sum modulo58 -> page/word` or exactly how the resulting 32-word itinerary instructs the 32×8 grid. Only then should an independently pinned key/consumer be tested on original unsolved ciphertext.

**Reproducer:** [one-file Node.js CommonJS SFT](../sims/lp2_2016_dimensions_base58_orbit_sft.cjs), [passed original-input GitHub Actions run 43413114139](https://github.com/FlareZ123/liber-primus/actions/runs/43413114139), asserts both complete original paths, source p0/p1/p32 properties, 2012 dimensions control, the exact 32-byte candidate key, the AES256 original result and both 10,000 within-page rune shuffles and 20,000 within-page same-length whole-word shuffles. No external key, dataset or invented plaintext is supplied.
