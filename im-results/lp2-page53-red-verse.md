# LP2 scan 70: fifty-runic red stanza and a bounded key-inversion attempt

**Classification:** original-image-derived source observation plus exact bounded negative. Agent 32, 2026-11-10. **No plaintext, cryptographic key or destination recovered.**

## Why this matters

The canonical rune-only corpus omits ink colour. Direct visual inspection of the original `resources/liber-primus/70.jpg` (SHA-256 `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`) reveals an unusual marked interval:

- LP2 **page 53**, 179 runes overall, contains **three consecutive red-text lines** at the bottom, immediately following six black-text lines. A separately printed **red upward arrow** appears between those regions.
- The red passage occupies **page-local rune positions [129,179)**, exactly **50 runes**; line lengths are **24, 22 and 4** runes. Its 12 word lengths in printed order are **[4,4,4,11,2,3,2,6,5,5,2,2]**, with slash line-wraps properly joined.
- The fourth word is 11 runes: **ᚱᛡᛞᛡᚦᚪᛁᛇᚫᛉᛚ**. This independent word-length anchor makes an otherwise large class of periodic keys completely enumerable.
- The 50 runes have **zero adjacent duplicates**, GP frequency IoC **0.03020408**, and include 26 distinct GP rune types. At these lengths, the statistics are insufficient to distinguish encryption modes. Their color and the arrow **do not establish a distinct cipher**. The exact visual-to-corpus indices and original rune sequence are preserved in [the derived source annotation](../resources/liber-primus/lp2-page53-red-span.json).

In the 12,956-rune unresolved corpus, the red stanza begins at global rune offset **12,598**. Within the manuscript's final eight-way section, it begins at offset **2,958**. It is an independent candidate reset or embedded instruction boundary which the existing text-only section representation does not record.

## Full-search inversion path

A repeating GP mod-29 additive or atbash-carrier encryption with key period 1–11 can be determined exactly from a proposed plaintext word of 11 GP runes: use the fourth ciphertext word to derive the entire key, checking its repeated residues, then decode every other word without any refitting. The input visual evidence constrains the target before English scoring.

The script [`sims/red_verse_dictionary_anchor.cjs`](../sims/red_verse_dictionary_anchor.cjs) performs this enumeration. Its English GP dictionary comprises 29,060 distinct rune-spelled entries from the [fixed TextBlob/Norvig frequency lexicon](../resources/control/english_wordfreq_textblob.txt), 1,611 of which are 11-rune anchors. Both affine carrier orientations (`C` or `28-C`), both policies for treating a literal F as a key-consuming or non-consuming plaintext F, and every period 1–11 are covered. Additive sign is not a separate mode when the hidden key is unconstrained, because its negation is itself an allowed key.

**Successful [Actions run 42757625006](https://github.com/FlareZ123/liber-primus/actions/runs/42757625006)** evaluated **6,718 internally consistent complete key hypotheses** on the original red stanza. The highest apparent decode (period 11, atbash carrier, no F-skip) fixed the fourth word to `importantly`, yielding:

> `rwcng deeao eoreag importantly the nga ou meajgoex uudngf pethun to by`

It matches four **other** dictionary words, but **zero words of three or more GP runes outside the forced 11-rune anchor**. Its aggregate word-frequency score is 0.3591. Consequently the displayed candidate has no sustainable plaintext interpretation; the matched short words are incidental.

An 80-replicate full-family null shuffled the **original 50 rune identities**, with **all 12 original word lengths** and the observed **zero-doublet constraint** held fixed. The best null scores had mean **−5.4506**, median **−5.8319**, maximum **9.0913**; **empirical upper-tail p = 0.0988** for the original optimum. The score does not meet a corrected discovery threshold.

**Positive inversion control:** a separate English-dictionary passage with the same 12 GP word lengths was encrypted using one hidden repeating key of length **7**, retaining a zero-doublet output. The *identical* anchor-derived search recovered all 50 original GP letters, the exact seven-rune key **[18,5,13,21,23,4,12]**, the period, and all eleven non-anchor dictionary words. Seven non-anchor words of three or more runes were correctly recovered. This proves the tested dictionary/period inversion works for its declared model; the planted ciphertext does not model the unknown real anti-repeat mechanism and is not evidence that LP2 uses this cipher.

## Consequence and next use

This test disfavors a short, conventional word-length-preserving repeating GP additive or atbash cipher on **this marked red paragraph** when its 11-rune plaintext word is in the fixed English lexicon. It cannot exclude a hidden long one-time pad, homophonic/bijective output alphabet, sparse corruption, nonlinear key evolution, transformed word order implied by the arrow, or an OOV 11-rune word.

The **actionable new input** is the 50-rune coloured unit and arrow, available as a stable, reproducible span independent of prior text segmentation. New attacks should explicitly predict the role of this visual marker and seek recovered letters or key positions, rather than repeat unconstrained red-word anagram searches.

Reproduction: original scan `resources/liber-primus/70.jpg`, canonical `resources/lp2-transcription.txt`, image-derived span annotation, 29-symbol `lp2-corpus.json`, committed dictionary and [the single-file runnable script](../sims/red_verse_dictionary_anchor.cjs). The associated [manual workflow](../.github/workflows/red-verse-dictionary-anchor.yml) is opt-in and does not run on ordinary commits.
