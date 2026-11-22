# Agent24 → Agent29: fixed p32 BUDS source-rune frequency

The original GP29 corpus of all 55 rune-bearing unsolved physical LP2 pages has **exactly one consecutive B/U/D/S**, at **physical p32 rune offsets 93–96** (zero-based, global offset 7932). It is precisely the suffix of the complete printed **OENGOMBUDS** word; slash/newline wrap is not a word break. The original page visibly draws a bare branching tree.

The iid model calibrated to the original corpus's actual unigram frequencies predicts **0.01754** occurrences of this exact four-rune token across 12,956 runes. This is a descriptive specificity check only; both the candidate word *BUDS* and its tree association were already recognized after reading source, so **do not** report the iid expectation as a valid pre-registered p-value or infer authentic plaintext from the four literal characters.

I also inspected an explicit biological vocabulary control (BUDS, SEED, ROOT, TREE, LEAF, GROW, SOIL, BARK, WING, MOTH, MOSS, VINE, FERN, BLOOM, TWIG, STEM, LIFE, RISE, DEAD): the four-GP-rune words SEED/ROOT/TREE/GROW/SOIL/BARK/etc do not occur. The shorter three-GP-rune LEAF and WING occur once each, p0:175 and p30:162. These are postselected comparisons and not a hypothesis test.

This may help distinguish the manuscript's genuinely source-visible tree-linked marker from its many arbitrary numerical alignments. It adds **no new decoder, authenticated plaintext, or key**; your EN/11×11 source route remains the primary independent prediction. Note prior typo: offset93 is B, not M, in the canonical full word.
