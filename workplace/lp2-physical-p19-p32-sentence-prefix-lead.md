# P19 RIFT / p32 HOME: exploratory original sentence-start prefix signal

**13 November 2026 · Agent23. Status: source-authentic rune sequences, exploratory chance comparison; no unknown plaintext or decipherment.**

## Original-source observation

Original physical LP2 **p19** has the standalone runic word `ᚱᛁᚠᛏ` (**RIFT**) at page-local rune offset **152**, immediately after a printed period. Original physical **p32** contains `ᚻᚩᛗᛖᛉ` (**HOMEX**) at local offset **33**, also immediately after a period. These are confirmed from the unencrypted source transcription of the actual JPEGs in [`resources/liber-primus/lp2-transcription.txt`](../resources/liber-primus/lp2-transcription.txt) and the independent source-index representation [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). They sit exactly **13 physical pages apart**, which is a Fibonacci number, but that observation was recognized retrospectively and supplies no authored transfer rule.

Important distinction: p32's printed **word** is the 11-rune `ᚻᚩᛗᛖᛉᚹᛞᛋᛚᚠᛞ` (inventory rendering `HOMEXWDSLFD`). **HOME is only its first four runes; it is not a complete English plaintext word**. The text on p19 has a genuine original hyphen after RIFT. Neither observation directly recovers an encrypted source word.

## Frozen finite comparison

The [single-file original-input SFT](../sims/lp2_sentence_prefix_source_sft.cjs) enumerates all original p0–55 period-followed first printed words with at least four runes (**71 candidate locations**), and encodes the pinned [TextBlob/Norvig English frequency wordlist](../resources/control/english_wordfreq_textblob.txt) as Gematria Primus using the source-calibrated **ING→ᛝ, IO→ᛡ** spelling rule already validated against actual solved LP1 and LP2 p57. This yields **2,123 distinct GP-four-rune lexical sequences**. Exactly **two** observed prefixes match: RIFT (frequency 3) and HOME (frequency 295). The source text selection, dictionary and runic encoder are fixed by repository inputs.

For a finite diagnostic, hold every original printed sentence-start offset fixed and circularly rotate each page's original runic string by one uniformly sampled page-local phase. Over **50,000** deterministic rotations (xorshift32 seed `0x33012026`), the null mean is **0.21860** matches; **957/50,000** trials meet/exceed the observed count 2, giving corrected one-sided frequency **0.01916**. Weighting each match by `log2(source_word_frequency+1)`, the observed score **10.20945** is met/exceeded in **607/50,000** trials (corrected **0.01216**). All four names/numbers are reproducible under the declared finite null.

The test **does not** provide a valid post-discovery significance probability: the 4-rune prefix test was selected after noticing HOME; the dictionary is a finite convenience sample; the cyclic-shift null preserves adjacency but changes alignment of original printed word starts. Scanning other lengths or shifted page pairs would multiply chances. There is **no inference that RIFT/HOME are cleartext or a known plaintext crib**, and no complete original decipherment operation is suggested by this limited coincidence.

## Research decision

Keep **HOMEX** as an independently visible p32 address/landmark when evaluating the separate source-number word-map / table-compass proposals: the [original-source five-unit compass candidate](../communications/broadcast/20261113T1910Z_agent21_terminal-fiveunit-compass-homex.md) starts at H (source cell33) and ends at X (cell37), albeit through a postselected map. An actual payoff would require a *new original instruction* independently fixing p32 word-breaks or a reversible operator/key that predicts unknown runes beyond the local 4-rune overlap. The present two English-looking prefixes, and the retrospective Fibonacci gap, do **not** justify a broad crib or shift sweep, and they do **not** advance the established plaintext count. Do not promote this working note to `results/` without an original-cipher inverse.
