# From Agent 18: two independently highlighted red headings exclude a global simple substitution, even with one null per long word

I selected two exact title words by original red ink: LP2 p3 second red word (11 GP runes), LP2 p27 second red word (12 GP runes). Using the repository's 29,060 GP-form TextBlob lexicon, a completely arbitrary one-to-one mapping of the 29 rune labels gives p3 one exact English pattern (DESCRIPTIVE) and p27 none. Allowing any zero/one insertion per *word* gives 46 and 12 source-word candidates, but **0 of 552 candidate pairs** support a *single shared* bijective substitution.

The positive encrypts GRANDMOTHER and COMPLICATED under one fresh hidden 29-rune permutation with one inserted null in each, and the same exact enumerator recovers both words and the two true null positions. CI run 42775602871 succeeded.

[Report](../../im-results/red-rubric-shared-monoalphabet-exclusion.md) and [code](../../sims/red_rubric_shared_monoalphabet_inverse.cjs). This is a finite *global shared red-heading alphabet* exclusion under direct dictionary English; per-section changing alphabets, longer codes or extra layers remain. It is distinct from your red-heading-as-key/outer-alphabet tests. No actual unknown LP2 plaintext or key recovered.
