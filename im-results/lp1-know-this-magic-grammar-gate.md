# Typed KNOW THIS square grammar: exact operand recovery and original LP2 transfer obstruction

**Agent43, 26 November 2026, Director #2879.** A genuinely executable historical numerical grammar can recover 11 unknown lexical cell values and the total 1033 from the first LP1 mixed square without evaluating a single Gematria sum. The same rule predicts the second LP1 square's geometry. It cannot directly transfer to either original LP2 numeric panel. No unknown LP2 plaintext or key.

## Historical instruction and held-out decision

The signed [2013 TCP specification](../resources/external/2013-tcp-server-signed-source.md) separates an integer-to-digit conversion (BASE29), a participant-selected text output (QUINE/CODE/KOAN), a session exchange (DH), and a client-to-server text sink (NEXT). The participant [specification transcript](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/007-fourth-onion/README.md#the-e-mail) exposes the command wording in order. A retrospective leave-one-command-out test that learns argumentless request → server-produced text from QUINE/CODE/KOAN predicts the wrong direction on NEXT. NEXT is client-provided text; its name and arity cannot determine the data role. BASE29 explicitly names a radix; DH explicitly names its modulus type. Neither command syntax fixes an LP2 operand. The prior p33–39 and p36–38 negative typed handoff findings remain unchanged.

The stronger transferable clue is actual original repeated wording and geometry: LP1 physical 05.jpg and 16.jpg both print the identical red seven-rune, 4+3 rubric KNOW THIS. Page 5 uses 12 decimal cells and 13 rune-word cells (11 distinct types); page 16 uses 25 decimal cells. Source: [canonical LP1 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt), independently inspected original owner ZIP images 05.jpg and 16.jpg. Do not substitute normalized Latin spellings for source runes.

Freeze the following candidate grammar on the first square alone: every printed decimal cell is its literal integer; a rune-word cell has an unknown integer value shared by identical words; five rows, five columns, and two diagonals sum to the same unknown total T. Opposite printed cells are visibly paired by the 180-degree layout; take the middle-row word at flat index11 opposite literal 245 at index13 as one hypothesis equality. Do not use a GP table or known total. This is a retrospectively selected geometric grammar, not a blind discovery or an explicitly authored mathematical command.

Exact fraction-free integer elimination:
- 12 magic line equations over 11 word variables plus T: rank 11. With positive integer values there are exactly 78 solutions, T = 763, 769, …, 1225. Thus the magic condition alone does not determine the operation's numeric output, even before considering other arithmetic.
- Add only the index11/index13 opposite-cell equality: rank 12, unique T = 1033. It predicts all 11 other opposite pairs (some literal/trivial) without using their constraints. The 11 inferred values in original first-appearance order are 341, 366, 199, 130, 320, 245, 91, 226, 320, 199, 341. These equal the independently established mixed-square values in the [LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt); no known GP sums were recalculated.
- The same rule on the held-out second KNOW THIS square: the first row gives T=3301, predicts all remaining 11 line totals and all 12 opposite pairs exactly. This is a retrospective structural holdout using the same rubric and operand shape, not a prospective plaintext discovery.

This shows a concrete way to select a numerical interpretation from a source-shaped object: jointly constrain its operand, unknown values, and independently checkable equality. The visible words alone do not uniquely identify a mathematical operator; the grid is essential.

## LP2 receiver test: an exact no-completion theorem

Original LP2 p15 (32.jpg) has nine red runes, 4+5, above the 16 distinct decimal values and a marked clockwise spiral. Unlike the two LP1 controls, the red label is not the literal seven-rune KNOW THIS rubric, and the printed square is 4×4. A previous [red-nine / spiral-sixteen Hill5 receiver](lp2-p15-red9-spiral16-hill5-gate.md) uses their combined 25 slots but does not require the historical magic-square grammar. Here the rival is that the nine unknown values fill a 3×3 interior and the 16 numbers supply the 5×5 perimeter. This would be a powerful genuine operand-recovery mechanism if the line constraints were consistent.

It is impossible:
1. The direct 4×4 row sums are 12670, 12713, 12350, 8250; no direct magic square.
2. For any 5×5 centrosymmetric numerical square, there are at most 13 distinct values (12 opposite pairs plus center). The p15 16 distinct literal numbers exceed that bound, regardless of placement, even before considering the nine unknowns.
3. Even dropping centrosymmetry, any contiguous placement of the established p15 spiral on a 5×5 perimeter must have four equal five-cell border sums; interior values cannot change these sums. Exhaust all 16 cyclic origins and both directions, 0/32 valid. Representative side sums [16475,16198,13320,11549], minimum spread 4926; four distinct spreads 4926/5578/7370/6981. This rules out every interior assignment over the integers or reals for that ring order, independently of plaintext scoring.
4. Original pp49–51 (66–68.jpg) are a 32×8 rectangular panel, 256 tokens with 161 distinct literal tokens. A centrosymmetric 256-cell rectangle or 16×16 rearrangement can have at most 128 distinct values. Under any injective token interpretation and any permutation, it cannot satisfy the learned centrosymmetry grammar. This does not exclude a noninjective residue projection or a different rule, which require their own source selector.

The missing original cue is a matching rubric **and** a compatible operand/constraint shape, or an independently specified mapping that changes the literal value types. No new key, pad, or cipher search is justified by the generic word/numbers analogy. The bound is about the literal integer grammar, not modular magic squares, arbitrary noncentrosymmetric permutations, or other cipher families.

## Reproduction

[sims/lp1_know_this_magic_grammar_sft.cjs](../sims/lp1_know_this_magic_grammar_sft.cjs). Exact core integer elimination and all ring cases executed in connected V8 with the live canonical sources. Standalone Node wrapper not yet CI-run. No new workflow. No unknown LP2 plaintext recovered.


## Literal instruction syntax and inverse ambiguity — #3279 (Agent25, 28 November)

The original 05.jpg surrounding text is **SOME WISDOM / THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED**, terminal red mark, insect, then **KNOW THIS**. The original 16.jpg surrounding text is **AN INSTRUCTION / KWESTION ALL THINGS / DISCOVER TRUTH INSIDE YOURSELF / FOLLOW YOUR TRUTH / IMPOSE NOTHING ON OTHERS**, terminal red mark, insect, then the identical **KNOW THIS**. Both tables are attached to the separate literal imperative rubric, not by a sentence saying what to do with a decoded key. The first accepts lexical cells and literal integers and outputs integers under GP-prime summation; the second is already numeric and supplies no lexical decoding operand. The Stage10 signed form specifies the actual historical output type (numerical squares for submission), not a reverse lexical conversion.

The previous #2879 already supplies the complete numerical worked controls and original shape rejection. Rather than repeat the linear solve or #3180's square-to-quasigroup obstruction, quantify the precise lexical inverse ambiguity on the real mixed square. Three opposite-cell word pairs collide under the native GP-prime conversion:

| Zero-based flat coordinates | Printed words | Rune lengths | Shared value |
|---|---|---:|---:|
| 2,22 | SHADOWS / CABAL | 7,5 | 341 |
| 6,18 | BUFFERS / MOURNFUL | 7,8 | 199 |
| 8,16 | CARNAL / ANALOG | 6,6 | 320 |

Each independent swap preserves the complete numerical square, actual lexical multiset, literal-number positions and all magic/symmetry constraints. Exactly eight distinct arrangements in this explicit 3-swap family reproduce the 25 source values. Even granting the original rune length at every lexical position leaves two witnesses (CARNAL/ANALOG swap), so a hypothetical numeric-only recipient with all word lengths and the actual word inventory still has at least one bit of ambiguity. These are exact lower bounds, not an enumeration of every dictionary inversion. Computed directly from pinned canonical LP1 transcription blob 37c96b816495c5f93ca658a01c9918bf92598316 and GP map in lp2-corpus.json.

Original p15's red upper 4+5 rubric is the closest syntactic analogue but is not the 4+3 KNOW THIS rubric under a length-preserving reading. Its numeric object has a distinct solved generating rule; the immediately following infinity mark and separate lower red rubric do not supply an explicit transfer to a named rune key/clock. In p49–51 the preceding **black** rune line ends at a red terminal mark, not a separate red KNOW THIS-style heading; the 32×8 table spans three pages and black prose resumes underneath it. The minimum missing clause is an original instruction specifying which object is the operand, whether the result is a number, rune key, or address, its exact conversion and where to apply it. The existing square geometry and p15 spiral already determine their numeric outputs; neither derives such a clause. Thus #3279's literal grammar is covered by #2879/#2927 with this explicit native inverse ambiguity. No new LP2 inverse or cipher test licensed by the literal rubric. Do not rerun magic arithmetic or guess a heading to supply missing syntax.
