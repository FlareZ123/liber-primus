# Key-free long-word test of GF29 linear key recurrences, orders 3–5

## Decision

Original unsolved LP2 provides seven complete printed words of length 13 or 14 Gematria Primus runes. A complete search against the **29,229** previously pinned independent source-native English words of those lengths found **zero** clean or single-output-glitch fits for an arbitrary three-tap additive GF29 key recurrence. The analogous four-tap family gave exactly **one** fit, physical p52 **OVERSENSITIZE** with inferred coefficients [23,26,14,17] and output redraw at local word index7. A strictly untouched **250-rune** continuation of that very recurrence across p52 has IoC **0.033542168674698794**, at the uniform-rune floor and below ordinary native-GP prose. The candidate is therefore rejected as a usable shared key or authenticated original plaintext. A five-tap family produced **240** fits, dominated by short-word degrees of freedom, with **zero** identical coefficient sets recurring on different original pages.

This is a scoped original-cipher *negative*, with positive recovery controls. **No unknown-page plaintext, creator key, or historically specified LFSR operation was recovered.** It should prevent further arbitrary seed hunting within this particular word-local recurrence model.

## Motivating premise and how this differs from earlier work

The book's GP29 ring and visible numerical sequences make modular recurrences a conceivable reversible keystream family. An earlier p0 conditional 13-rune EPIPHANY crib yielded a six-lag Berlekamp–Massey model, but that result depended on the crib and failed its independent continuation. The existing p7 five-red-product experiment fixed five tap values and solved separate feedback-driver models; it did not algebraically eliminate **every unknown three- and four-tap coefficient** for all seven longest words with a state-preserving key-output redraw.

The present experiment grants each original word a completely unknown, independent seed and key coefficients. Its only language restriction is the pinned 29,229-word source-native GP dictionary. It does not assume plaintext elsewhere in the book or use p50 candidate pointers. It tests a falsifiable consequence of any single global or per-page recurrence, since each full word must obey the same local key equation.

## Exact model and source

For each source word of length n, ciphertext and putative native-GP plaintext use values 0..28:

\[
C_i=P_i+K_i\pmod {29},\qquad
K_i=\sum_{j=1}^{m}a_jK_{i-j}\pmod {29},\quad m\in\{3,4,5\}.
\]

Both the m initial key symbols and m coefficients are unknown. The optional *single output-only redraw* replaces one observed K value at any index **i ≥ m** without changing the underlying generated recurrence state. This is narrower than a state-rekeying or slipping cipher. No page-wide seed is imported or fitted.

Inputs: original rune transcription **resources/lp2-transcription.txt**, original numeric runes **resources/liber-primus/lp2-corpus.json**, independent dictionary **resources/control/dwyl-english-alpha-gp13-14-only.txt**, the source-calibrated GP encoder **sims/lp2_native_gp_source_orthography_sft.cjs**, and physical-page logic **sims/lp2_word_pages.cjs**. The original words occur on pages 11,13,16,25,43,52,55 with length profile [13,14,13,14,14,13,13]. The dictionary contains 17,772 GP13 words and 11,457 GP14 words. Word-boundary joining across printed lines/pages follows the shared parser.

For each word and lexicon candidate, compute K = C − P in GF29. Solve the m unknown recurrence coefficients by row elimination on equations for all i ≥ m. For one redraw at position r, omit exactly equations i = r through r + m, the only recurrence equations contaminated by that observed output. Demand full rank m and **replay the entire underlying generated key from the original first-m seed**, accepting only an exact match everywhere except one difference at precisely r. This secondary exact inverse is important: an overfitted subset of modular equations alone is never accepted. The candidate is then re-enciphered by addition. The last m initial positions are not offered as redraw locations because doing so would require an additional unknown seed term.

## Original results

| Key order m | Candidate plaintext fits (zero or one output redraw) | Distinct pages with fits | Cross-page repeated coefficient sets |
|---|---:|---:|---:|
| 3 | 0 | 0 | 0 |
| 4 | 1 | 1 | 0 |
| 5 | 240 | 5 | 0 |

For m5, per-page counts in physical page order [11,13,16,25,43,52,55] are [50,0,55,1,0,65,69]. Its broader model naturally admits many random dictionary coincidences, especially near the word end. Its 240 matches are not plaintext evidence.

The *only* m4 match is original p52 source word at local rune offsets **78..90**. Candidate plaintext **OVERSENSITIZE** has thirteen source-native runes. The exact inferred observed key starts [10,4,23,26]; coefficients [23,26,14,17] generate all thirteen inferred key positions except index7. The candidate has no first-party source spelling/operation selector.

Holdout: run the recovered recurrence forward to the end and backward to the beginning of **the same complete original physical p52**, using the modular inverse 17⁻¹ ≡12 mod29 for the backward recurrence. None of the 250 other runes, their word boundaries, or their expected plaintext affected the recovered taps or initial key. The IoCs are:

| Original p52 263-rune cipher | Inverse across all 263 runes | Inverse on the 250 untouched runes |
|---:|---:|---:|
| 0.033320755812265984 | 0.03393028183322207 | **0.033542168674698794** |

The output retains noise-like GP29 letter frequencies. It does not exhibit a reproducible English plaintext stretch. The local oversensitize fit is therefore a dictionary coincidence under a flexible model. Continuing this recurrence to other pages or building key schedules from its taps is unwarranted.

## Power and limitations

The accompanying CommonJS single-file test plants native-GP **CIRCUMFERENCES**, attested verbatim in solved p57, with three fully secret, nontrivial order-3/4/5 coefficient vectors and seed registers. Algebra recovers all three clean planted keys exactly. It also recovers order-3 and order-4 coefficients after an independently inserted nonzero output redraw at position7. The order-5 redraw control is not required: at n=14, removing its six contaminated equations leaves too little rank to determine five coefficients. All positive encipherments reconstruct by the same additive GP29 rule.

The original negative is conditional on **one-to-one source-native English orthography, the named 29,229-word dictionary, additive GP29 output, homogeneous linear recurrence, and at most one state-preserving key-output redraw after the seed**. An unrepresented plain word, foreign/altered language, nonlinear cipher, multiple redraws, a redraw that advances/resets state, or a length-changing decoder remains open. The single 4-tap candidate's holdout rejects transferring *those recovered taps* to full p52. It does not disprove a cipher with wholly private per-word taps, although such flexibility has no source key selector and cannot by itself recover other plaintext.

## Reproduction

[Read-only Windows Node22 SFT](../sims/lp2_longword_keyfree_lfsr3to5_oneglitch_sft.cjs) verifies wordlist cardinalities, original page/rune positions, 3/4/5-tap hit counts, positive controls, the sole original m4 match and its independent p52 holdout. Commit: ee70b3cb8757549e8db83763a1073a2608cb9236 (SFT). The original search calculations were independently executed in the current V8 runtime before the SFT was committed.

**Next decision:** prioritize locating a first-party key/state instruction or recoverable historical artifact. Do not extend this numerical fit to a larger family merely to retain OVERSENSITIZE. If an authentic source eventually selects an m≤4 continuous GF29 recurrence, this exact original long-word gate can be reused to test that proposal without tuning.
