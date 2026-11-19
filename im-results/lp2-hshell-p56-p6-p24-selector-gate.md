# p56 → p6 → p24 H-shell original-selector gate

**Decision: conditional positive for a navigation layer; no LP2 plaintext, key, or cipher recovered.** The original-image selectors support the proposed p56→p6→p24→p23 route under a fixed, top-anchored line grouping. The evidence is not strong enough to authenticate H-shell as an authorial cipher or to claim that it decrypts any rune.

## Frozen operation and source motivation

Use the p28-derived pair map H(x,y)=(x−y,x+y) mod 29. For an odd-width row, pair entries outside-in and leave the middle entry unchanged. The operands are counts of original printed rune lines, not ciphertext rune values.

The human motivation is plausible: the authenticated 2016 message says that words are the map and numbers are the direction; the p28 DH clue supplies H; the original pages visibly contain line counts, dot marks, and artwork that can select line groups. But no first-party instruction explicitly says to H-transform printed-line lengths or specifies the outside-in odd-width extension. Treat this as a source-constrained navigation hypothesis, not an authenticated operation.

The coordinate types remain distinct. A H-shell center is first a zero-based index into the signed 2016 word sequence. Interpreting that same integer as a physical LP2 page label is a separate map conversion, not an arithmetic identity supplied by H.

## Original-image selector audit

The image names below are original scan numbers: physical p56 is scan 73, p6 is scan 23, and p24 is scan 41. The canonical transcription and corpus provide the rune-line counts; the ink annotations provide p6's exact punctuation offsets.

### p56: five-dot emblem selects its sole width-5 row

The original scan 73 has five printed rune lines and a five-dot black emblem beneath the text. The only width-5 row is therefore fixed before calculating its output.

Line lengths: [20, 19, 6, 22, 18].

H-shell: **[2, 9, 26, 12, 6]**. The unchanged center 6 indexes “seeks” in the authenticated 2016 message; the proposed typed map then points to physical p6.

The exact output occurs once among all seven width-5 rows in the 57-page corpus.

### p6: the red 13-dot pair fixes row 1 under the inherited width-5 partition

Original scan 23 has ten printed rune lines:

[20, 24, 24, 3, 18, 19, 20, 24, 22, 22].

The ink annotation records red 13-dot punctuation at rune offsets **71** and **82**, bracketing an 11-rune red span beginning at offset 71. The first mark is exactly at the start of printed line 5: the preceding four line lengths sum to 71. Under the already carried, top-anchored width-5 grouping, line 5 is the final line of row 1, and both marks lie in row 1. Row 2 contains neither mark. This is more specific than a mark merely occurring somewhere on p6.

Row 1 H-shell: **[2, 9, 21, 27, 24]**. Its exact vector occurs once among the seven compatible width-5 rows. Center 24 indexes “and”, giving the proposed typed handoff to physical p24.

Important limitation: p6 row 2 is **[26, 12, 27, 13, 24]** and has the same center 24. Thus the marker does select row 1 under the frozen grouping, and the full row vector is unique, but the p6→p24 page handoff is not discriminating by center alone. The first marker also sits at the visible break after a four-line upper section and before a six-line lower section; treating the full page as two top-anchored five-line rows is a motivated carry-over, not a layout rule printed on p6.

### p24: the two dragonflies select a six-line band, then AND supplies width 3

Original scan 41 has twelve printed rune lines:

[22, 24, 21, 24, 23, 21, 22, 23, 23, 22, 22, 23].

The two mirrored dragonflies flank the central text band, approximately printed lines 4–9 (on the 2400×3600 scan, their visible vertical span is about y=1,280–2,300 px; the six line-ink bands occupy y=1,238–2,293 px). They select the six-line band as a pair, not either row individually. The preceding signed-source word “and” has three letters, which supplies the proposed width-3 grouping. Together these cues fix the two consecutive rows 2 and 3 before their H outputs are considered.

- Row 2, lines 4–6: **[3, 16, 23]**
- Row 3, lines 7–9: **[28, 16, 23]**

Both unchanged centers are 23, indexing “road” and proposing physical p23 as the next destination.

The exact ordered two-row packet occurs once among **112** consecutive width-3 row pairs across the compatible corpus. This pair-level result is more selective than either component: [3,16,23] occurs in five rows, [28,16,23] occurs in two rows, and center 23 occurs in **55 of 153** compatible width-3 rows. The two dragonflies therefore matter as a paired-band selector; the repeated center alone is not evidence of a unique destination.

## Reproducible corpus controls

The CommonJS reproducer checks the original transcription against the canonical per-page rune totals, reconstructs every line-length row, applies the frozen H-shell once, and compares outputs against all compatible rows/pairs.

- Width-5 family: 7 rows. The p56 vector and p6 row-1 vector each occur once.
- Width-3 family: 153 rows and 112 consecutive row pairs. The p24 component rows occur 5 and 2 times respectively; their ordered pair occurs once.
- p6 has two width-5 rows and both centers equal 24.
- The exact p24 pair is a navigation packet, not plaintext. No rune values are transformed by this test.

Reproducer: sims/lp2_hshell_p56_p6_p24_selector_gate_sft.cjs.

## Decision and next boundary

The marker/layout evidence supports a conditional navigation chain **p56 → p6 → p24 → p23**. It does not establish a reversible unknown-page receiver, authentic key, or decryption. The p24→p23 handoff is the only further page consequence authorized by this branch; p23/p26 row selection is already isolated in Director task #1939 and should be assessed there rather than duplicated here.

The next cryptanalytic requirement is a source-selected, reversible operation that consumes original ciphertext values on the reached page and predicts an untouched span with exact forward reconstruction. Do not continue expanding the H-shell graph, interpret its indices as plaintext, or use synthetic round trips as evidence of the historical cipher.
