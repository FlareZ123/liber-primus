# The 32×8 p50 table as a p57 direction machine: bounded negative

**14 November 2026, Agent 34. Classification: exploratory, source-motivated negative.** No unknown plaintext, key, or destination is recovered.

## Why this construction was worth one test

The original sources expose three aligned structures:

- the p50 numeric object is exactly **32 rows × 8 columns** of bytes;
- the original LP2 ink annotation contains **31 thirteen-dot events**, with the black event on p7 at rune offset 194; under physical page/offset ordering with red before black at the co-located position, that black event is ordinal **8**;
- the p57 word-interior sequence contains **55 values**. Its full totients already define the tested 55-step Josephus page order; reducing those same values modulo 8 gives a 55-element sequence in the exact range of the table's eight columns.

This suggests a small, recognizable human operation: use the 55 numbers as directions through a 32-state, 8-direction table. The black marker supplies a natural initial state. It is not established that the table is an automaton; this is a hypothesis selected by the dimensions and marker structure, not an inherited fact.

To connect the table walk to plaintext, I tested one fixed output interpretation using the independently solved p56 cipher: each table cell byte is the prime ordinal at which that page's p56 key clock starts, while its low five bits give the next 32-state row. The 55 output bytes are assigned to the 55 pages in the p57-derived Josephus order.

## Frozen operation

For state \(s\in[0,31]\) and direction \(d\in[0,7]\), read the row-major cell

\[
b=T[8s+d].
\]

Set the next state to \(s'=b\bmod32\), and use the full byte \(b\) as the zero-based prime ordinal starting the p56 key stream for the next page. The direction sequence is

\[
d_i=\phi(p_{r_i})\bmod8,
\]

where \(r_i\) is the i-th p57 interior rune and \(p_{r_i}\) is its Gematria Primus prime. The first output is assigned to the first eliminated page. The p56 inverse uses the established transparent-F rule: plaintext F is copied and does not consume a key symbol.

The primary start state is the black marker's chronological ordinal 8. The obvious coordinate alternative, the marker's page number 7, is included as a fixed control. The zero state is already covered by the previous [table-byte page-start gate](lp2-parable55-josephus-p56-clock-gate.md).

## Positive control

Before testing the unknown pages, the script re-encodes the established p56 plaintext and reproduces its original ciphertext **85/85**, including its single transparent plaintext F at local rune 56. Exactly 84 key symbols are consumed. All page/segment associations, the p57 55-interior extraction, the 32×8 table shape, and the 31 marker-event ordering are asserted from the original repository inputs.

## Results

The p57 totient sequence gives a fixed forward Josephus order beginning p39 and a reversed-step order beginning p15; both leave p50. The 32×8 walker produces the following first ten page-start ordinals from the primary black-marker state 8:

~~~text
122 6 253 238 73 46 54 144 169 205
~~~

The forward first page is p39, starting at prime ordinal 122. Exhaustive transparent-F state tracking on that page fails at zero-based rune 67:

- ciphertext Y has GP index 26;
- the only remaining state has consumed 66 key symbols;
- the next key ordinal is 122+66=188, prime 1129;
- \(\phi(1129)=1128\equiv26\pmod{29}\);
- therefore the inverse forces plaintext F from a non-F ciphertext.

The prefix contains ciphertext F at positions 43 and 49; both literal-F/consume branches are tracked. Only the state with 66 consumed key symbols survives to the contradiction. There is no valid transparent-F path for the first page.

Under the reversed step order, the first page is p15 and also starts at prime ordinal 122. The inverse fails at zero-based rune 79:

- ciphertext R has GP index 4;
- the only remaining state has consumed 77 key symbols;
- the next key ordinal is 122+77=199, prime 1223;
- \(\phi(1223)=1222\equiv4\pmod{29}\);
- the inverse again forces plaintext F from a non-F ciphertext.

The initial ciphertext F and later F symbols at positions 18, 27, and 66 are all branched both ways before the state set empties.

Using the black marker's page number 7 instead of its chronological ordinal also fails: forward p39 at rune 25 (cipher EO=12, key \(\phi(1811)=1810\equiv12\)); reversed p15 at rune 116 (cipher H=8, key \(\phi(2503)=2502\equiv8\)). The initial-state ambiguity therefore does not rescue this frozen construction.

As a simpler page-output interpretation, reducing the 55 primary-state output bytes modulo 56 visits only **23 distinct pages**, not a 55-page permutation.

## Decision and scope

The 32×8 / 8-direction / 55-step alignment is a real source structure worth preserving, but this specific finite-state interpretation does not produce a valid p56-style key schedule. The test rejects:

- the black-marker-ordinal start state 8;
- the black-marker page-number start state 7;
- both p57 Josephus directions;
- the low-five-bit next-state rule with full-byte prime-start outputs;
- the p56 transparent-F cipher as the page decoder.

Do not search arbitrary start states, bit splits, table orientations, output reductions, or F-skip masks. That would turn a source-motivated experiment into unconstrained model selection. The p50 table could still have another role, and the p57 route may still be a navigation clue.

This differs from the existing 256-event LFSR study, which uses all 225 red runes and 31 thirteen-dot events as a 256-symbol recurrence seed, and from the 13-dot partition study, which tested event segmentation. Here the 32×8 table is treated as a state/direction transition map and p57 supplies the input sequence.

**Reproduction:** node sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs (Node.js 22, no dependencies). It reads the canonical LP2 corpus, transcription, p50 table, and ink annotations; checks the p56 known-answer encryption; derives both p57 page orders; explores every transparent-F branch on each first page; and asserts the contradictions above.