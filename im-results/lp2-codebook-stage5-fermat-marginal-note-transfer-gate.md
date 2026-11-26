# 1999 Code Book Stage 5: Fermat marginal-note book cipher and LP2 transfer gate

**Decision: the historical mechanism is real and materially distinct, but no source-selected LP2 transfer is currently justified.** The only obvious LP2 visual candidate examined here, the p15 numerical panel, fails literal character addressing into the historical 225-letter key text. No unknown LP2 plaintext, key, cipher, or destination is recovered.

## Historical solve path

The 1999 *Code Book* Cipher Challenge comprised ten stages. Simon Singh's official archive records that Stage 5 was a numeric message, compares it to the Beale ciphers, and explicitly says that its key-text was then unknown. The official leaderboard records Andrew Plater as the first Stage 5 solver on 7 December 1999. The published winning-team report by Almgren, Andersson, Granlund, Ivansson and Ulfberg gives the detailed solution their team found on 15 May 2000.

The source-derived human path reported by the winning team is:

1. **Visible input and cipher family.** Stage 5 consists of 54 numbers, ranging from 3 to 215; the value 119 occurs four times. Its numeric form and Singh's Beale-cipher comparison made a book cipher a reasonable initial hypothesis. The team first tried the conventional Beale-style rule (number → word → initial letter), plus variants such as counting backwards and taking every kth word. These failed.
2. **A key-text selector.** The winning team reports a hint to consider who constructed the cipher. They connected the constructor, Simon Singh, to his earlier book *Fermat's Last Theorem*, and also considered texts by Pierre de Fermat. During an Othello game, they proposed Fermat's famous marginal note as the key-text. This is a solver-reported hint; it is not stated in the archived 9 November 1999 public update.
3. **Why this text and this unit.** The marginal note was too short for the word-index interpretation, but had the right length for character counting. The team tried English and French renderings, then the Latin original. The displayed Latin transcription normalizes to 225 alphabetic characters. The 54 Stage 5 indices therefore fit within a compact, historically motivated text without inventing a long corpus or arbitrary key.
4. **The actual inverse.** Their program tested offsets in the source text, counted characters from either end, and tested four counting conventions: count all characters; count separators but not whitespace; count whitespace but not separators; or count neither. A dictionary/trie-based dynamic program scored possible segmentations, rewarding dictionary words of length greater than two by the square of their length. Candidates were emitted at score ≥ 3.2 times plaintext length.
5. **Recognition and independent confirmation.** The winning report records the raw 54-letter result as:

   `PLAIFAIRCIPHER ESELPROXIMONIVELLAPALABRASECRETAESILLIAD`

   The team formatted this as: “Playfair cipher es el proximo nivel. La palabra secreta es Illiad.” The raw spelling includes `PLAIFAIR` and `ILLIAD`; the latter is the Stage 5 codeword, not evidence that it was the key for Stage 6. The English-dictionary detector was not a Spanish-language model; the team explicitly notes that enough English words happened to make the Spanish plaintext pass its filter. The decisive recognition was the coherent cross-stage instruction: Stage 6 was independently identified and solved as a Playfair cipher on 12 October 1999, before the team's Stage 5 solution on 15 May 2000. This is much stronger than a dictionary score alone.

The winning report also documents why this was not merely a successful brute-force coincidence: they searched a large corpus and saw many false candidate fragments (including Bible-derived hits), but the Fermat note yielded a coherent sentence that names the next stage's already-established cipher family and provides the Stage 5 codeword. The author clue and the note's compact length explain why a human solver could select this text; the cross-stage plaintext explains why the candidate was accepted.

**Reproduction limitation:** the winning report gives the index range, repeated-index observation, normalized key-text, program conventions and complete recovered output, but does not print the full 54-number ciphertext sequence in its Stage 5 section. This note therefore reconstructs the documented solve path and reported result; it does not claim an independent byte-for-byte rerun of the original 54-index input. The original challenge's ciphertext page remains linked from Singh's site.

## What is new relative to LP2 book-code work

This is a different historical mechanism from Cicada's 2012 line/character book codes and from the later 2016 word/number-map instruction:

- Stage 5 is a **character-address book cipher** using a short, author-selected Latin source text.
- The 2012 Cicada examples use their own source texts and typed line/character or other coordinate conventions.
- The 2016 signed instruction speaks of words as a map and numbers as direction; it does not select a particular external book, character-index unit, offset, orientation, or receiver.

Relevant existing LP2 work already tests the 2012 Cicada books and several explicit book-coordinate transfers: `im-results/lp2-2012-bookcode-original-source-inverse.md`, `im-results/lp2-2012-books-tablefree-runningkey-original-gate.md`, `im-results/lp2-2016-wordnumber-linechar-self-bookcode-gate.md`, and `im-results/lp2-historical-books-source-selected-coordinate-gate.md`. This report does not reopen or supersede those results.

## Original LP2 candidate and decisive literal test

The most superficially suggestive visible candidate is original LP2 p15 (image `resources/liber-primus/32.jpg`): a 4×4 numerical panel, with a red 3299 and an infinity symbol. The uploaded original JPEG has SHA-256:

`5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`

The sixteen printed values, in reading order, are:

`3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838, 3288, 3294, 3296, 2472, 4516, 1206, 708, 1820`.

A literal Stage-5-style character-address transfer into the 225-letter Fermat note fails immediately: **all 16/16 printed values exceed 225** (minimum 708, maximum 4516). Counting from the end also gives no valid character positions, and no nonnegative text offset can bring these values into the 225-character source. The p15 panel also supplies 16 values, not the 54-index operand used by Stage 5.

The infinity symbol and prime-related numerical appearance are at most a thematic association with Fermat; they do not uniquely select Fermat's marginal note, the Latin version, character rather than word indexing, a counting convention, or a receiver. Subtracting the red 3299, applying a modulus, or searching arbitrary offsets/editions would add an unprovided operation. Those variants were deliberately not tested. The p50 256-cell numerical panel is likewise not a 54-index sequence and has no independent Fermat selector; existing source/coordinate studies already cover its more literal historical-book interpretations.

## Decision and reopen condition

**Close the Stage 5 analogy as a historical mechanism, not as an LP2 solve route.** It teaches a useful design principle: a short book-cipher key can be recoverable when the artifact supplies a human-visible author/key-text clue, the numeric operand fits the text under a simple counting rule, and the output contains an independently recognizable handoff. LP2 currently supplies none of those selectors for the Fermat note.

Reopen only if an independent original LP2 clue or authenticated historical handoff selects (i) Fermat or a specific work/edition, (ii) character-address rather than word-address semantics, (iii) counting direction/offset, and (iv) a definite numeric operand/receiver. A generic infinity symbol, prime table, or the fact that Stage 5 was a book cipher is not sufficient.

## Sources

- [Simon Singh, Cipher Challenge archive](https://simonsingh.net/cryptography/cipher-challenge/cipher-challenge-archive/) — 9 November 1999 Beale/key-text clue and 7 December 1999 Stage 5 solve update.
- [Simon Singh, Cipher Challenge leaderboard](https://simonsingh.net/cryptography/cipher-challenge/leader-board/) — first recorded Stage 5 solve by Andrew Plater, 7 December 1999.
- [Almgren et al., *How we Cracked the Code Book Ciphers* (11 October 2000), §2.5, pp. 15–18](https://www.simonsingh.net/wp-content/uploads/2025/02/codebook_solution.pdf) — detailed Stage 5 solve path, Latin note, output, and `cwizard` procedure.
- [Simon Singh, Cipher Challenge ciphertexts](https://simonsingh.net/cryptography/cipher-challenge/the-ciphertexts/) — official page linking the ten original challenge ciphertexts.
- [Existing LP2 historical-book selector gate](lp2-historical-books-source-selected-coordinate-gate.md) and [LP2 2016 self-book-code gate](lp2-2016-wordnumber-linechar-self-bookcode-gate.md).

## Reproduction

Run from the repository root:

```bash
node sims/lp2_codebook_stage5_fermat_transfer_gate.cjs
```

The script verifies the 225-letter key-text normalization, 54-letter reported output length, original p15 printed values, and the literal forward/reverse character-address range failure. It intentionally does not test unselected modular or origin-subtraction variants.
