# 27×27 three-rune proposal: pre-plaintext source-selector audit

**Decision: no independent original instruction was found that selects the proposal's first node, its first two transitions, and a withheld source offset.** The 27×27/three-rune construction remains a possible interpretation of LP2 pages 0–2, not a source-authenticated decryption route. This audit does not disprove the construction; it rejects the claim that the preserved historical instructions uniquely select its opening route.

## Scope and source discipline

The test was deliberately source-only. No unknown ciphertext was rescored, no plaintext blocks were used to choose a node, and no key/orientation variants were enumerated.

The inspected primary or source-derived materials were:

- Original LP2 page images: resources/liber-primus/17.jpg, 18.jpg, and 19.jpg (pages 0–2; 729 runes in total).
- The 2013 0_wisdom transcription and its original table: resources/external/2013-0-wisdom-source.md and resources/external/2013-0-wisdom.txt.
- The signed 2013 TCP-server challenge: resources/external/2013-tcp-server-signed-source.md.
- Original 2014 stage03/stage04 HTML: resources/external/2014-stage03-index.html and resources/external/2014-stage04-index.html.
- The preserved 2014 magic-square source: resources/cicada2014-openpuff-magic-squares.txt.
- The historical 2014 stage walkthroughs in the archived neuroretransmit/cicada repository, including its third through seventh onion stages.
- The published external 27×27 proposal and its opening method: https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
- Existing local audits: im-results/original-visual-clue-operation-map.md, im-results/external-27-square-block39-complete-audit.md, im-results/lp2-27x27-published-nextblock-branching.md, and im-results/onion7-html-red331-source-inversion.md.

A targeted search of the archived historical corpus for Möbius, Mobius, totient, phi, 27x27, three rune, and 3-rune found no earlier instruction defining a 27×27 fill, a three-rune key node, or a transition grammar. The only relevant MOBIUS hit is the ordinary word in the 2013 0_wisdom table; the relevant explicit totient statements are in that source and the solved LP2 page-56 method.

## What the sources actually select

### 2013 0_wisdom

The source explicitly calls primes and the totient function sacred and includes MOBIUS as a word in its 5×5 mixed table. The table's word-to-GP-prime-sum operation is independently reproduced in the 2014 stage04 magic square (25/25 cells).

This is genuine historical support for prime/totient arithmetic and for treating the word MOBIUS as a potentially meaningful clue. It does not specify the number-theoretic Möbius function μ, a Möbius transformation, a Möbius-strip wrap, a 27×27 matrix, or three-rune nodes. The word alone does not distinguish those different meanings.

The signed 2013 TCP-server challenge documents BASE29, DH, and client-supplied NEXT; it supplies no 27×27 or three-rune instruction.

### 2014 pre-LP2 stages

The preserved 2014 solve path uses recognizable, explicitly selected operations: a Vigenère key and interrupter, Atbash/ROT3, columnar transposition, magic squares/OpenPuff, and a book-code whose source is explicitly identified. The stage03/stage04 HTML comments and the magic-square constants provide numerical clues (including 1033 and 3301), but no instruction to arrange 729 runes as 27×27 or to use collinear triples as keys.

This matters for the human solve path: the earlier book-code stage names its source before coordinates are applied. No comparable source selection exists for the 27×27 proposal's node and continuation rules.

### Solved LP2 pages

Page 56 demonstrates a totient-based shift on Gematria prime values. The external proposal instead applies φ to a rune index at a key-node centre, then uses μ(φ(k_i)) to derive a three-state rotation. These are not the same operation or input domain. Page 56 establishes that totients occur in LP2; it does not instruct a solver to transform the centre of an arbitrary three-rune node, apply μ, rotate left by a phase, or subtract a repeated key modulo 29 on pages 0–2.

## What the original opening images show

The three original scans do contain suggestive repeated geometry:

- Page 0 has a 13-rune red heading and a 13-dot red mark.
- Pages 0–2 repeat opposed vertical marginal staves with three horizontal projections.
- The same infinity-shaped ornament appears above and below the text on all three pages.
- Page 2 has a terminal 13-dot red mark and a moth illustration.

These are real visual observations. They make a three-part or cyclic interpretation reasonable to consider, but they do not uniquely specify an executable map:

| Visible cue | Supported observation | Missing selector |
|---|---|---|
| 729 runes across pp0–2 | 729 is 27², so a 27×27 reshaping is possible | No instruction fixes row-major versus column-major/other fill, coordinate origin, or whether all red material belongs in the matrix |
| 13-rune red heading and 13 dots | The count 13 is repeated | No instruction assigns 13 to a row rather than a column, or fixes the companion coordinate |
| Three projections on each stave | A count of three is visible | No instruction says these are three-rune key nodes, or selects horizontal, vertical, or diagonal orientation |
| Repeated infinity ornaments and the 2013 word MOBIUS | A cyclic or twisted topology is plausible | No seam, handedness, entry edge, exit edge, or distinction between Möbius strip/function/transformation is marked |
| First black line has seven runes; there are two staves | Counts 7 and 2 are visible | No instruction says to use a seven-rune ciphertext block or derive an offset of 2×7 |

The external proposal's opening node AE–J–EA at row 13, columns 11–13 is compatible with selecting 13 from the heading and 12 from φ(13). But the source does not prescribe the row/column assignment, the horizontal axis, or the node anchor. The first-line length and paired staves likewise do not independently prescribe the seven-rune block and 14-cell offset. These are possible readings of the page, not a unique instruction.

The repeated infinity marks are especially weak as a transition selector: the existing original-image audit finds the seven marks on pp0–2 and p15 share the same orientation and crossing/gap pattern. No unique entry, exit, seam, or handedness is marked.

### Competing stave interpretation now under test (Issue #194)

A separate historical hypothesis has since been raised for the same artwork: Younger Futhark cipher-rune/twig-rune notation. The cited Menota Handbook describes a rune-row number and a position within that row, represented by branches on either side of a stave; a specific Orkney 6:5:5 convention (Barnes, 2003) maps 3|3 to thorn (Þ/TH). The measured p0 branch counts are 3|3, and the first black GP rune immediately after p0's red span is TH. This is a more specific competing interpretation than treating the projections as a three-rune key node.

It does not change this audit's decision: 3|3 → TH is a candidate rune-value/crib selector, not a rule for constructing the external proposal's AE–J–EA key node or predicting its first two block transitions. The cited Orkney ordering is one historical variant, and p1/p2 do not begin with TH. Issue #194 is actively testing the branch-rune reading and its withheld controls; this audit does not duplicate or decide that work. Do not count the same three projections as independent evidence for both branch-rune notation and three-rune key-node size.

## Why the published 38 blocks cannot supply the missing selector

The external proposal's own method defines several fitted transition filters and reports a 38-block reading. That reading cannot serve as an independent source instruction for choosing its own first node or first transitions. The existing block-39 audit leaves 21,818 admissible next-block assignments, with no unique continuation. This is supporting evidence of underdetermination, not the basis of the source-only decision above.

## Conclusion and next action

No inspected original source fixes all of the following before plaintext is consulted:

1. the 27×27 matrix's exact fill and coordinate convention;
2. the first three-rune node and its axis;
3. the first ciphertext block's length and reading direction;
4. the rule that selects the next node and next ciphertext block; and
5. a held-out source offset predicted by those same rules.

The historical material supports primes, totients, and a possible Möbius association in general. It does not select the external proposal's exact φ/μ composition or its first two transitions. Close this source-selector task as **not established**. Do not continue ciphertext scoring or broaden the proposal's transition search unless a new, independent original clue fixes the missing coordinate and continuation contract.
