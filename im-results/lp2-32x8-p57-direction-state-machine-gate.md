# The 32×8 p50 table as a p57 direction map: bounded negatives

**14 November 2026, Agent 34. Classification: exploratory, source-motivated negatives.** No unknown plaintext, key, or destination is recovered.

## Source structure and human-solve-path hypothesis

The original materials expose an unusual alignment:

- the p50 numerical object is exactly **32 rows × 8 columns**, or 256 bytes;
- the LP2 ink annotations contain **31 thirteen-dot events**; the black event is on p7 at rune offset 194 and is chronological event ordinal **8** under physical page/offset order (red before black at the co-located coordinate);
- the solved p57 PARABLE has 20 words; removing the first and last rune of every word leaves **55 interior runes**. Their GP-prime totients provide 55 values that can be reduced modulo 8.

The maintainer's human-puzzle framing and the historical “numbers are direction” clue make an eight-direction reading worth a bounded test. The table's 32×8 dimensions could describe a 256-cell, eight-way map or a 32-state, eight-input transition table. These are hypotheses, not established meanings of the table.

The p56 prime–totient cipher is used only as a downstream, independently solved decoder. Its exact transparent-F rule is established: plaintext F is copied and does not consume a key symbol. The reproducer first verifies the known p56 plaintext against the original ciphertext **85/85**.

## Reading A: 256-cell direction-mask map

Interpret each row-major table byte as an 8-bit mask of exits from one of the 256 cells. Use the black marker's local rune offset, **194**, as the starting cell. Directions are the conventional clockwise compass order N, NE, E, SE, S, SW, W, NW; p57 supplies \(d_i=\phi(p_i)\bmod8\).

The first two p57 directions are **0, 2**. At cell 194 (row 24, column 2), the table byte is **159**. Its bit 0 is set, so if 1 means “open,” the first move goes north to cell 186 (row 23, column 2). At cell 186 the table byte is **19**; bit 2 is clear, so the next eastward move is blocked. If 0 means “open,” the route fails immediately at cell 194 because bit 0 is set.

Thus the fixed direct maze interpretation fails at step 1 for 1=open and step 0 for 0=open. Wrapping is irrelevant: both tested moves are interior to the 32×8 grid.

## Reading B: 32×8 grid walk, with destination bytes as page keys

A simpler “map / road / direction” reading is to start at a marked coordinate, follow each p57 direction one cell on the 32×8 grid, and read the destination cell's byte as the next page's prime-start ordinal. The 55 outputs are assigned to the 55 pages in the p57 Josephus elimination order.

Two source-grounded starting-cell mappings were tested:

- **Flat offset 194:** use the black marker's local rune offset directly as the row-major cell index.
- **Page/offset coordinate 58:** map the black marker's page 7 to grid row 7 and its local offset 194 modulo the 8-column width to column 2, giving \(7\cdot8+2=58\).

The p57 direction prefix is:

~~~text
0 2 0 4 0 6 4 4 4 2 0 2 ...
~~~

Without wrapping, both mappings leave the 32×8 grid before all 55 moves are consumed: forward at step 18 and reversed steps at step 15. Allowing toroidal wrap gives a complete path, but each path visits only 33 distinct cells and its output bytes fail the p56 transparent-F inverse on the first page:

| Start cell | Direction order | First page | First key-start byte | First impossible rune | Cipher / key contradiction |
|---:|---|---:|---:|---:|---|
| 194 | Forward | p39 | 19 | 13 | L / 20; \(\phi(137)=136\equiv20\) |
| 194 | Reversed | p15 | 19 | 4 | A / 24; \(\phi(83)=82\equiv24\) |
| 58 | Forward | p39 | 47 | 85 | B / 17; \(\phi(743)=742\equiv17\) |
| 58 | Reversed | p15 | 47 | 48 | C / 5; \(\phi(499)=498\equiv5\) |

Each equality forces plaintext F from a non-F ciphertext. All literal-F branches are retained. The p56 known-answer control passes independently.

## Reading C: 32-state / 8-direction transducer

The 31 thirteen-dot events suggest a finite set of marked states; the black event's chronological ordinal 8 supplies the primary initial state. For state \(s\in[0,31]\) and direction \(d\in[0,7]\), read

\[
b=T[8s+d].
\]

Set the next state to \(s'=b\bmod32\), and use the full byte \(b\) as the zero-based prime ordinal starting the p56 key stream for the next page. The 55 output bytes are assigned to the 55 pages in p57's Josephus elimination order. The p57 input is \(d_i=\phi(p_i)\bmod8\).

The black marker's page number 7 is the obvious coordinate alternative to its event ordinal 8, so it is tested as a fixed control. The zero-state start is already covered by the [table-byte page-start gate](lp2-parable55-josephus-p56-clock-gate.md).

### Results for start state 8

The first ten output bytes are:

~~~text
122 6 253 238 73 46 54 144 169 205
~~~

The forward Josephus order begins at p39, so p39 starts its p56 key stream at prime ordinal 122. Exhaustive transparent-F state tracking fails at zero-based rune 67:

- ciphertext Y has GP index 26;
- only the state that has consumed 66 key symbols remains;
- the next key ordinal is 122+66=188, prime 1129;
- \(\phi(1129)=1128\equiv26\pmod{29}\);
- the inverse therefore forces plaintext F from a non-F ciphertext.

Ciphertext F positions 43 and 49 are both branched as literal-F and consume alternatives. Only the state with 66 consumed symbols survives to the contradiction.

Under reversed p57 step order, the first page is p15 and also starts at prime ordinal 122. The inverse fails at zero-based rune 79:

- ciphertext R has GP index 4;
- only the state that has consumed 77 key symbols remains;
- the next key ordinal is 122+77=199, prime 1223;
- \(\phi(1223)=1222\equiv4\pmod{29}\);
- the inverse again forces plaintext F from a non-F ciphertext.

The initial ciphertext F and later F symbols at positions 18, 27, and 66 are all branched both ways before the state set empties.

### Page-number start control

Using the black marker's page number 7 instead of event ordinal 8 also fails: forward p39 at rune 25 (cipher EO=12, key \(\phi(1811)=1810\equiv12\)); reversed p15 at rune 116 (cipher H=8, key \(\phi(2503)=2502\equiv8\)). The initial-state ambiguity does not rescue this fixed construction.

As a simpler output interpretation, reducing the 55 primary-state output bytes modulo 56 visits only **23 distinct pages**, not a 55-page permutation.

## Decision and scope

The 32×8 dimensions, 31 marked events, and p57 direction sequence are real source structures. The three fixed readings tested here do not yield a route or a valid p56-style page key:

- the direct 256-cell exit-mask map from cell 194 fails on its first two moves under either bit polarity;
- the destination-byte grid walk either leaves the grid before 55 steps (no wrap) or fails the p56 inverse on its first page (toroidal wrap), for both source-grounded starts and both directions;
- the 32-state / 8-direction transducer fails the transparent-F p56 inverse on its first page in both Josephus directions, for both source-anchored start states 8 and 7.

Do not search arbitrary compass rotations, start cells, start states, table orientations, bit splits, output reductions, or F-skip masks. That would turn a source-motivated experiment into unconstrained model selection. The p50 table may still have another role, and p57 may still be a navigation clue.

This differs from the existing 256-event LFSR study, which uses 225 red runes and 31 thirteen-dot events as a recurrence seed, and from the 13-dot partition study, which tests event segmentation. Here the table is interpreted as an eight-direction map or transition table, with p57 providing the direction inputs.

**Reproduction:** node sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs (Node.js 22, no dependencies). It reads the canonical LP2 corpus, transcription, p50 table, and ink annotations; verifies p56 known-answer encryption; derives p57 directions and both page orders; and asserts the maze, grid-walk, and transparent-F contradictions.