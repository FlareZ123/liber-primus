# LP2 word-length sequence: source-native syntax signal and fixed 2014 row operation

**Scope:** original unsolved LP2 printed-word order under source-attested GP word segmentation. This is a bounded mechanism-discrimination result; it recovers **no plaintext, authentic LP2 key or decryption**. It belongs in intermediate evidence.

## A decision with an original-cipher consequence

A meaningful word-order transform is one possible explanation for the cryptographically unusual unknown LP2 register. If the 2,896 printed rune-word lengths preserve original English prose in their natural order, their adjacent length pairs should often retain ordinary language syntax, independently of any reversible rune-letter substitution. A source-selected word permutation could recover that signal even when its letter cipher remains unknown.

This tests a source-blind observable, without guessing any decoded word: the original 55 rune-bearing physical pages contain **12,956 GP runes in 2,896 canonical words**, with 2,895 immediately neighboring word-length pairs. The source parser ignores only physical line/page wrapping, preserving the printed hyphen/period boundaries. Eight nonempty original text sections are delimited by the source manuscript's section marks. The p50 numerical page has no rune words.

The control converts independently preserved Shakespeare, Gibran and Emerson texts, plus editor-normalized solved Cicada LP1/LP2, to native GP29 word lengths. A seven-category word-length bigram model is trained on each source separately: 1, 2, 3, 4, 5–6, 7–8, 9+. The model measures per-pair log2 odds of source-trained adjacent lengths versus their source-trained independent frequencies, with Laplace smoothing. This guards against calling mere original unigram length differences a scrambled order. Each original test is calibrated against **600 full shuffles of the exact original word-length multiset**.

## Observation on the untouched original

| Training text | Original sequence log-odds, bits per pair | Original random-order comparison | Result |
| --- | ---: | --- | --- |
| Solved-Cicada LP1 reference | -0.054795 | Similar to original exact-multiset shuffles | No detected native syntax signal |
| Shakespeare | -0.025799 | Similar to original exact-multiset shuffles | No detected source syntax signal |
| Gibran | -0.077587 | Similar to original exact-multiset shuffles | No detected source syntax signal |
| Emerson | -0.057732 | Similar to original exact-multiset shuffles | No detected source syntax signal |

The fixed-seed exploratory 350-shuffle checks returned respective standardized values about **+0.04, -0.50, -1.36, -0.84**. These near-null results are striking against linguistic positive controls: the Gibran and Emerson GP-word sequences score more than **five shuffled standard deviations** above their own order-randomized controls under models trained on the separate solved-Cicada and Shakespeare sources. The native-reference model's own solved prose also has substantial internal word-order structure. The source models therefore detect real grammatical length ordering in previously unseen literary material.

Per-section source-native checks separately examine each of the **eight nonempty original printed sections**. Every section's standardized score stays within 2.5 shuffled standard deviations of its own word-length multiset under the solved-Cicada author model. The book-wide result is thus not simply driven by a single scrambled section. This says only that the tested language-source association is undetectable. A different language, unusual intended prose, source-specific vocabulary, changed word boundaries or local word-order operations all remain possible.

## One genuinely historical, frozen inverse trial

The authenticated original **2014 Stage5 OutGuess plaintext** supplies a real operation, rather than an invented word permutation. Its seven-column hint **1736254** was decoded by rearranging *each consecutive seven-symbol row* in source-defined order **[0,6,2,5,1,4,3]**. See [original Stage5 recovery](2014-stage5-avowy-archive-audit.md). This operation is historically real, although the source does not instruct transferring it to LP2 words.

Transfer its fixed row permutation, without key or phase optimization, to blocks of seven **whole printed LP2 word lengths** and examine the original order and opposite orientation under exactly three plausible fixed reset modes:

| Original source reset | Historical permutation, solved-Cicada model | Opposite permutation, solved-Cicada model |
| --- | ---: | ---: |
| One whole-book stream | -0.047537 | -0.052106 |
| At printed text-section marks | -0.054303 | -0.058428 |
| At rune-bearing physical page starts | -0.064399 | -0.068336 |

The unchanged original score is **-0.054795**. All six outputs remain nonlinguistic under the independently trained Shakespeare model too (scores below zero). A Gibran GP-native 2,896-word synthetic plant is *actually scrambled* by the inverse 2014 permutation, then exactly recovered by the historical permutation: **2,896/2,896 words** match and the source-trained syntax signal is restored. The planted positive verifies that the operation and detector would recognize the proposed kind of word-order scrambling.

The source's historical seven-position cipher is therefore **insufficient by itself** to restore native word-order evidence for original LP2, under the three original reset conventions and both fixed directions. Do not rescue this with arbitrary row offsets, permutations or new ciphers until an original instruction chooses them.

## Research use and limits

This is evidence against simply taking the **printed word order** as an intact register of ordinary source-native English prose. It is compatible with a word transposition, deliberately altered punctuation/word segmentation, an unusual plaintext language, binary transport with simulated breaks, or other mechanisms. The data do **not** prove that spaces are false; the distinctive vocabulary and style of original Cicada prose may depart from the training controls.

A productive follow-up requires a **source-selected reversible word order**, an authentic image or historical artifact that specifies it, and a held-out original segment showing restored syntax and eventually plaintext under exact re-encryption. Without that selector, the observed lack of a source-language length-order signal does not justify searching free permutations.

**Reproducer:** [single-file source-native GP controls and planted inverse](../sims/lp2_wordlength_order_native_control_sft.cjs). The method reuses the repository's canonical original corpus and pinned literary texts. It does not alter manuscript transcription.
