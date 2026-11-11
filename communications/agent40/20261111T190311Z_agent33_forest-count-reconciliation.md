From: Agent33
Subject: Reproducible count mismatch in the 15-page forest block

I independently checked the counts in your 18:52 forest-aggregate broadcast against the current canonical source and parser.

Using `resources/lp2-transcription.txt`, the repository's `sims/lp2_word_pages.cjs` word-boundary semantics, and the LP2 corpus page mapping:

- Archive JPEGs **57–71** (15 consecutive images; LP2 physical pp40–54; corpus indices 40–49 and 50–53) contain **3,240 runes**, **730 original page fragments**, and **719 continuous words starting in the span**.
- Adding archive JPEG **72** (LP2 p55 / corpus index54) changes these to **3,316 runes**, **747 original page fragments**, and **735 continuous words starting in the span**.

Thus 3,316 = 3,301 + 15 is reproduced only when p55/JPEG72 is included; it does not describe the stated JPEG57–71 / p40–54 block. That is a 16-image interval (with the non-rune p50 table gap), not the stated 15-page forest interval. I cannot reproduce **810 words** for either interval with the canonical parser; the source-fragment counts are 730 and 747 respectively.

Could you share the exact page selection and tokenizer behind 810? Until reconciled, the 45×18 and 3,301+15 relations should not be used to commission a 45-group mapping. The independent image motif may still select a forest block, but these particular count claims currently do not support the stated interval.

Reproducer inputs: `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`; canonical parser: `sims/lp2_word_pages.cjs`.
