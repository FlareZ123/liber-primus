# LP1→LP2 coherent-passage length cribs: two seven-word matches, no literal p55 quotation

**Original-input finding (Agent 3, 13 November 2026).** Searching all **2,896** original unsolved LP2 words in printed order against coherent passages of the solved LP1 source, using *source-native GP29 rune lengths* (not Latin letter lengths), yields **two** seven-word matches and **no eight-word match**. One is the already-motivated LP1 p5 moth/p55 ending hypothesis. The other is a different LP1 passage at an earlier LP2 location. This is a useful inventory of source-shaped crib candidates, not a decipherment.

The source-aware boundary restriction matters: naively concatenating the editor-normalized reference text creates a misleading **eight-word** length match `TO DESTROY ALL THAT YOU OWN AN INSTRUCTION` at LP2 original word318. In the source, `BE PREPARED TO DESTROY ALL THAT YOU OWN` is the end of LP1 p13's SOME WISDOM paragraph, and `AN INSTRUCTION` starts a **separate** printed heading on that page. A continuous original plaintext crib cannot legitimately span this artificial heading stitch. The correct coherent-paragraph match maximum is seven.

## Reproducible exact-original comparison

- Original LP2 ciphertext: `resources/lp2-transcription.txt`, parsed with `sims/lp2_word_pages.cjs`; source word boundaries preserved across printed lines and page wraps, with numeric-only p50 excluded. There are exactly **12,956 runes in 2,896 original unsolved words**.
- Source LP1: `resources/liber-primus/lp1-plaintext-reference.txt`, which explicitly identifies itself as an *editor-normalized* Latin reference. Remove editor metadata lines, separate actual coherent blank-line passages, exclude matrix/table-containing numeric blocks, then GP29-normalize each source word by `encodeSourceNativeGP` from `sims/lp2_native_gp_source_orthography_sft.cjs`. There are **782 usable words in 31 coherent paragraphs** under this precisely stated source filter.
- Source-original punctuation check: `resources/transcriptions/lp1_wulfic_canonical.txt` and the literal p55 slice from `resources/lp2-transcription.txt`. The source record itself distinguishes `THINGS` followed by `SHOULD` and the full stop between `SACRED` and `ALL`.
- Matching criterion: compare every consecutive length-seven LP1 paragraph window with every consecutive length-seven original LP2 word window, extending any hit in source order until the first mismatch. There are no arbitrary keys, plaintext scoring, page shuffles, fitted alignments or unprinted word breaks.

| Seven-word source passage | Source native-GP word lengths | Original unsolved LP2 position | Interpretation |
| --- | --- | --- | --- |
| `BE TRUE TEST THE KNOWLEDGE FIND YOUR` (LP1 A WARNING) | Seven GP29 rune word lengths, asserted in SFT | Original LP2 word **1386** (0-based), physical **p25** | Unlinked length-only hit; no source-selected cipher |
| `THE TOTIENT FUNCTION IS SACRED ALL THINGS` (LP1 p5 SOME WISDOM) | **[2,7,7,2,6,3,3]**, totaling **30 runes** | Original LP2 word **2889** (0-based), the final seven complete words of physical p55 | Independently reused moth art makes this a motivated *candidate crib*; still unverified |

The second hit is already documented as a moth-linked coincidence in [the prior original source report](lp2-p55-moth-p5-terminal-sevenword-crib.md). This census supplies the broader source-coherence comparison and prevents the misleading eight-word header-stitch from being promoted as a stronger crib.

## Newly fixed punctuation obstruction

The original solved LP1 p5 prints `ᛋᚪᚳᚱᛖᛞ.ᚪᛚᛚ`: a full stop separates **SACRED. ALL**. It also prints `ᚦᛝᛋ-ᛋᚻᚩᚢᛚᛞ`: **THINGS SHOULD** continues, with no full stop at the end of THINGS. By contrast, the original p55 final three source words are `ᚳᛠᛁᛗᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.`, with an ordinary hyphen between the candidate SACRED/ALL positions and a full stop after the candidate THINGS position.

Therefore the seven-word p55 moth candidate **cannot be a literal, identically punctuated excerpt of the original LP1 p5 passage**, even if a yet-unidentified symbol-wise cipher could convert all thirty ciphertext runes into the proposed words. This is an exact conditional obstruction to any punctuation-preserving quotation/cipher hypothesis. It leaves open ciphertext formatter differences, altered prose, punctuation transformations, or entirely different plaintext. No source presently selects an operation that would move both original stops.

The separately established **arbitrary-secret word-local symbol-bijection** obstruction [minimum eight symbol-identity changes](lp2-p55-lp1wisdom-wordbijection-crib-gate.md) is independent of punctuation, and the failed original-source 5×5 Hill and prime-key tests in the prior report already narrow direct reuse. These findings together make the moth length profile a lead requiring *new external cryptographic instruction*, rather than standalone recovered plaintext.

## Independently moth-selected p5/p55 length-order rarity, with explicit selection caveat

One source-constrained positive observation deserves preservation despite the punctuation obstacle. The **identical original moth illustration** independently links solved LP1 p5 to unknown LP2 p53/p55, before interpreting any word lengths. Freeze **all 18 printed LP1 p5 prose/header words** and their **12 possible consecutive seven-word windows**; also freeze the **multiset of the 16 complete original p55 word lengths**, but uniformly permute the p55 **word order** as an explicit conditional null. No English frequency score, ciphertext symbol, unknown key or proposed plaintext is fitted.

Exactly **one** of the original **120** LP1-p5-window × LP2-p55-window combinations matches, namely original p55 body words **10–16** and source LP1 p5 words **7–13** (one-based). Under a random ordering of the *unchanged sixteen p55 lengths*, the exact probability that **any of the twelve** LP1 p5 seven-word windows equals p55's fixed terminal seven words is **0.00015956265956266** (0.01596%). Granting the analyst **any of ten** possible seven-word p55 body windows, the rigorous union-bound probability is **at most 0.0015956265956266** (0.15956%). For comparison, treating the exact observed phrase as preselected before data inspection gives **0.00000555000555001**, which is **not** an interpretable discovery p-value because that phrase was noticed after viewing the p55 suffix.

This calculation supports the view that the p5/p55 *length ordering* is noteworthy **under this narrow, independently artwork-motivated word-permutation model**. It does not account for the full research community's numerous post-hoc choices of source page, figure, page window, phrase length, punctuation and alphabet normalization. A solver cannot infer an original encryption procedure from low probability alone. In particular, the two **literal punctuation disagreements** above survive unchanged. The source-shaped candidate should remain available for a truly source-selected reversible mechanism, while work on freely tuned key schedules and fictitious plaintext formatting remains deprioritized.

The [same SFT](../sims/lp2_lp1_coherent_source_length_census_sft.cjs) now derives the eighteen p5 source word lengths directly from the canonical source **runes**, checks exactly which of the **120** original seven-window pairs matches, and calculates the terminal event and any-window upper bound analytically from the unchanged original sixteen-word length multiplicities.

## Decision and use

The authenticated source does **not** supply a longer coherent consecutive LP1 length crib beyond seven words in the full original unsolved LP2 word inventory. Continue to use the moth as a clue linking LP1 p5 to LP2 pp53/p55, with the original p55 phrase strictly provisional. Do not devote follow-on resources to shifting/altering the seven original words or moving the source punctuation to fit a wished-for sentence. A meaningful successor needs a directly sourced reversible decoder and a ≥40-rune held-out original ciphertext plaintext prediction.

**Standalone SFT:** [source-passage length and exact punctuation reproducer](../sims/lp2_lp1_coherent_source_length_census_sft.cjs), run with Node 22. It asserts the 2,896/12,956 original inputs, the 782-word coherent source filter, both seven-word matches at fixed positions, no longer matches, and the two original punctuation mismatches; a seven-word known-length source plant is included. Outputs the exact two passages and positions. No new original LP2 plaintext or key recovered.
