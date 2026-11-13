# Conditional p55 direction-word crib at its unique fifth-rune doublet

**Classification: exploratory source-constrained hypothesis, no recovered plaintext or key.** The proposed GP28/root-15 transparent-EA cipher is not an authenticated LP2 mechanism. The separate p32 318-degree southeast interpretation is a non-authenticated route rejected as a standalone continuation in Director #662. This note only preserves an inexpensive original-input discriminator unavailable in the earlier route reports.

## Original-source constraint

Physical p55 has 76 GP29 runes and 17 original whole printed words, of lengths [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]. The second seven-rune word (index13, p55 rune offsets55–61) is E/S/EO/TH/TH/E/S, GP-index [18,15,12,2,2,18,15]. Its fourth and fifth GP runes match.

Across the complete 12,956 unsolved original GP runes, there are 2,896 words, including 216 seven-rune whole words. **This p55 word is the only seven-rune word whose fifth rune matches its fourth.** Manuscript punctuation, page order and slash-continuations are preserved when computing these counts. This uniqueness is expected to occur about once in a corpus of this size under a low-doublet-rate null and is not independent proof of plaintext.

Under the separately proposed 28-nonzero-step GP29 cipher where zero ciphertext difference denotes transparent plaintext rune EA, any seven-rune word containing one zero step in that position must have EA at its fifth GP rune. Two possible direction words from GP spellings are SOUTHEAST = S/O/U/TH/EA/S/T and NORTHEAST = N/O/R/TH/EA/S/T. The inferred p32 318-degree path would prefer the former, but the original historical text specifies neither this cipher nor that path, so neither is plaintext recovery.

## Frozen original-source key test

Read original 32×8 numerical-table bytes in printed row-major order, modulo28, as a cyclic GP28 key. Assume the hypothesized primitive-root15 cipher continues across the p55 word boundary. From the unchanged original p55 ciphertext, the required six key residues for SOUTHEAST at offsets55–61 are [8,6,8,17,null,9,21], and those for NORTHEAST are [14,6,5,17,null,9,21]; null means a repeated ciphertext zero-step (EA) that leaves the pad unconstrained.

Check all 256 source-table starting phases and both policies for whether zero-steps advance the key clock. This exhaustively checks 512 literal-table patterns per fixed word without fitting a byte or source rune. No pattern satisfies all six constrained residues. For SOUTHEAST, the best source alignment satisfies 2/6 at cyclic source phase134; 427/512 satisfy none, 80 satisfy one, and 5 satisfy two. For NORTHEAST, best is 3/6 at phase145; exact match histogram for 0..6 is [415,87,9,1,0,0,0]. Physical fixed-offset55 in printed row-major and 76-cell clockwise outer-ring order both yield 0/6 for the southeast candidate.

**Decision:** Neither directional crib can arise under this specific original literal-table cyclic GP28/root15 key, irrespective of source phase or whether the EA zero-step consumes a key. The word-shape alignment is a conditional clue only; searching other invented pads, cipher modes or words is not justified without new source evidence.