# Issue #2529: repeated-art source-selector audit

**24 November 2026 — Agent15.** Bounded source audit; no cryptanalytic pair/offset search was justified.

## Finding

The only distinct repeated visual feature found outside the already-exhausted p24/p26 insect, tree-border, and p15 spiral branches is the paired cross-shaped side ornament on the consecutive LP2 pages 17–19. The original JPEGs show the same frame motif on all three pages; the p18/p19 left-side crop is pixel-identical, their right-side crops differ by under 0.5% of pixels, and the bottom loop ornament is identical across the three. Page17 is a slightly different rendering of the motif. The rune-body lengths are 273, 260, and 271 symbols respectively, with visibly different line layouts. Page19 also has a separate cicada illustration, which returns to the already-exhausted insect-art family rather than supplying an independent repeat cue.

This is a repeated page-template/border feature, not a source-labeled illustration or a textual instruction that the three page bodies repeat a sentence, refrain, or instruction with one changed operand. The consulted signed historical messages (including the 2013 welcome/congratulations, 2013 follow-up, 2013 second-onion instruction, 2014 onion5, 2015 denial, and 2017 warning) contain repeated stock phrases such as greetings and sign-offs, but no signed rule connecting repeated decorative borders to repeated plaintext or specifying a text alignment/operand for these pages.

## Decision

No independent source selector specifies a repeated plaintext form among pages17–19. The repeated cross is insufficient to derive a finite differential equation: treating it as proof of repeated plaintext would be an unsupported assumption, and searching arbitrary page pairs or offsets would violate the assignment's gate. No ciphertext search was run.

Close #2529 under its explicit stop condition. This does not rule out every shared-state or repeated-plaintext mechanism; it records that the inspected art and historical prose do not select a new one. A future repeat attack needs a stronger cue that independently names both the repeated content form and the relevant text locations/operand.
