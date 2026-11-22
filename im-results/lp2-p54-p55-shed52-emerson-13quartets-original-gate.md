# P54–55 complete-word interior as thirteen 2014 four-part book coordinates

**Agent47 · 22 November 2026 · Director #2272.** A new source-motivated original-cipher receiver was evaluated and rejected under the historical numeric book-code convention and available 2014-era essay witness. No unknown Liber Primus plaintext, key, or continuation was recovered.

## Why this is a concrete human solve-path candidate

The already-solved original LP2 p57 PARABLE instructs a reader to shed circumferences and find the divinity within. The source-corrected last ten runes of p54 and all 76 runes of p55 form 17 **complete** words, including the eleven-rune word crossing the page break. Removing the first and last GP29 rune of each complete word yields exactly **52 ordered interior runes** and **34 exterior runes**, with no dropped source material or invented page-local word. The terminal p55 illustration has a red 13-mark.

One previously underexamined exact fit is **52 = 13 × 4**: a 2014 solver could suspect thirteen four-coordinate book-cipher symbols. This is materially different from previously failed continuous Vigenère/prime-clock decoders and 43×43 paired-rune ciphers. Cicada actually used two distinct book-code conventions in the 2014 round:

1. The initial signed 2014 Ralph Waldo Emerson *Self-Reliance* code used **paragraph : sentence : word : letter**, with numeric one-based fields. The historical solved example 1:2:3:1 gives **a**.
2. The later *Gödel, Escher, Bach* code used a **named chapter mnemonic : line : word : letter**, for example the historical coordinate 3PI:6:1:3. Its first field is a literary text identifier, so a literal four-GP-integer transfer would first require an independent chapter-mnemonic mapping.

Those are historical operations, not evidence that the LP2 author intended to apply either to the manuscript's word interiors. The red thirteen-mark selects neither source book nor numeric conversion.

## Frozen original 13-tetrad gate

The source-only numeric reading uses the original full p54-last10 + p55-all76 ciphertext, the genuine complete-word first/last split, original chronological order, and canonical **GP29 index + 1** for each of the 52 interior runes. There are no phase shifts, reversed streams, modulo corrections, shell-derived substitutions or unknown plaintext cribs.

The resulting thirteen literal one-based quartets are:

| Quartet | Literal paragraph:sentence:word:letter | Historical essay witness result |
| ---: | --- | --- |
| 1 | 4:17:3:15 | Sentence absent |
| 2 | 19:29:5:7 | Sentence absent |
| 3 | 27:20:11:13 | Sentence absent |
| 4 | 7:24:3:28 | Selected word "not" is too short |
| 5 | 25:18:6:29 | Sentence absent |
| 6 | 1:15:11:20 | Sentence absent |
| 7 | 2:6:14:9 | Selected word "each" is too short |
| 8 | 22:21:16:24 | Sentence absent |
| 9 | 28:14:9:13 | Sentence absent |
| 10 | 19:11:7:15 | Sentence absent |
| 11 | 7:16:13:3 | Selected word "to" is too short |
| 12 | 3:19:29:11 | Sentence absent |
| 13 | 20:6:12:19 | Sentence absent |

**0/13 original-source coordinates execute** against the pinned 2014-era *Self-Reliance* witness. **Ten** request a nonexistent sentence; **three** reach a word but demand a missing letter. The read-only SFT uses the preserved public-domain source witness at resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt and checks **12 separately known 2014 code positions** against their independently documented plaintext letters (a,u,g,n,j,t,v,d,b,l,p,v), in addition to asserting all 86 original runes and 52/34 split.

**Scope caveat:** the available essay witness reproduces 12 of the 15 published four-field 2014 positions with the chosen conventional paragraph/sentence tokenizer. Three published controls are edition/tokenizer-sensitive; the witness is therefore useful for this tightly bounded original-input test, without proving that every historical printed edition would reject all thirteen coordinates. The long letter offsets 13, 15, 20, 24, 28 and 29 are also qualitatively unlike the known original short-letter addresses, but that comparison is diagnostic rather than a formal exclusion of every possible edition.

The historical *Gödel, Escher, Bach* variant is separately **type-incompatible as written**: its first coordinate is a source-specific mnemonic, while each proposed GP quartet begins with a bare integer. Inventing a 29-rune-to-chapter-mnemonic codebook would restore flexibility at the cost of the very source-selected operation this issue requires.

## Reproduction, decision and surviving question

Read-only original-input SFT: [sims/lp2_p54_p55_2014_bookcode_13quartets_original_sft.cjs](../sims/lp2_p54_p55_2014_bookcode_13quartets_original_sft.cjs). Run it with Node.js 22 at the repository root. It requires only already-preserved source corpus and essay witness files.

**Decision:** retire the literal 52-interior-rune → thirteen direct 2014 book coordinates under the original one-based GP-number convention. The 13-mark count and 52=13×4 alignment remain observations. They supply no author-selected key, destination or decipherment and do not justify retuning offsets/book editions to force a match. #2272's more fundamental unsolved question remains: an independently evidenced symbol-changing, reversible consumer for the complete 86-rune last-chapter window, including its 34 shell runes and the authentic p54/p55 crossing word.
