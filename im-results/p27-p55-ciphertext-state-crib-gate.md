# p27/p55 exact two-word repeat: bounded state crib and reused-key obstruction

**Status (12 November 2026, Agent17; Director #562):** The terminal two-word ciphertext collision remains a source-visible cryptanalytic clue. It does **not** identify a key, authenticate a repeated plaintext phrase, or recover any unsolved LP2 text. Two reversible/source-native candidate consumers are concretely obstructed: a 34-rune repeated additive pad and a stationary short ciphertext-feedback continuation through known-solved p56.

## Original clue and its independent calibration

On physical p27, original `44.jpg`, rune offsets 28–33 contain the complete GP words `ᛞᛄᚢ-ᛒᛖᛁ` (**D J U / B E I**), six indices **[23,11,1,17,18,10]**. On terminal physical p55, `72.jpg`, precisely the same two whole words occupy offsets **70–75**, immediately before the final full stop and original terminal marks. Both words occur exactly twice in the entire unsolved manuscript, and only as this ordered pair. The p27 occurrence follows the two-rune word `ᛒᚠ`, and is followed by the two-rune word `ᚫᚠ`; the p55 occurrence follows `ᚳᛉ` and ends its 76-rune page. Original p27 contains a single wing illustration while p55 contains a complete cicada; this may be thematic but selects no key.

**Prior art:** This repeat and its imagery were reported before the present work in [Cicada Notebook session 04](https://cicadanotebook.com/sessions/4.html), and [the repository source-echo calibration](lp2-terminal-bigram-source-echo.md) already enumerated all complete original word pairs. That prior 30,000-trial whole-word-shuffle control, preserving the exact original words and all printed word lengths, found **5/30,000** samples with *any* repeated 3+3 pair, and **0/30,000** with the final pair echoed earlier. This null measures a specific conditional hypothesis; the duplicate itself was discovered by a broader search. Under an iid29 model, matching *one predetermined* six-symbol string would be unlikely; whole-book scans and observed short-word repetitions prevent interpreting that raw probability as proof of intention. No word-collision search was repeated here.

A seventh ciphertext symbol coincides only when joining the terminal p55 ciphertext to the **first rune of independently solved p56**: p55's six final runes + p56's first GP rune `ᚫ` exactly equal the first seven ciphertext runes beginning at p27 offset28. The eighth differs: p27 offset35 is `ᚠ`, p56 offset1 is `ᛄ`. The seventh match crosses a printed final stop and chapter change, so it is not a single printed seven-rune phrase. The known p56 heading decrypts to **AN END**, its first two original ciphertext indices being **[25,11]** and plaintext indices **[24,9]**.

## Test A: additive key reused backward over the overlapping 34-rune contexts

The six-rune pair alone cannot fix how far a repeated keystream might extend. The maximal available alignment ending at p55's final rune is **p27 [0,34)** against **p55 [42,76)**, preserving each book's physical rune order and all original word boundaries. Under a repeated additive pad in GP29, \(C_{27,i}=P_{27,i}+K_i\) and \(C_{55,42+i}=P_{55,42+i}+K_i\), for 34 consecutive positions. The key cancels, forcing the plaintext rune difference to equal the original ciphertext difference at **every** aligned position.

A particularly restrictive, *preexisting printed-word* overlap is p27's 12-rune red-title word at offsets **3–14** and p55's complete seven-rune black word at offsets **48–54**. Their overlapping seven positions require

\[
(P_{27,\mathrm{long}}[3{:}10]-P_{55,\mathrm{seven}})\bmod29
=\mathbf{[25,7,27,14,4,6,24]}.
\]

The pinned English [TextBlob frequency lexicon](../resources/control/english_wordfreq_textblob.txt) contains **29,157** alphabetic entries. In a deliberately *permissive* rune-orthography control, generate **every** legal GP29 single-rune/digraph segmentation, both expanded and contracted `ING`, and the established V→U, K/Q→C, Z→S and QU→CW replacements. This yields **1,328 distinct 12-rune** forms and **7,211 distinct seven-rune** forms. An exact hash-join across all **9,576,208** possible word-form pairs finds **zero** matches to the seven-rune difference. A planted source-native pair encrypted with a shared additive key is recovered exactly.

**Scope:** This defeats an entire **34-symbol constant/reused additive keystream** interpretation *provided both physical printed words are native-GP spellings of entries in that broad English lexicon*. It does not exclude nonlexical plaintext, non-English source text, word-boundary changes, a shared key for fewer than 34 positions, or another kind of cipher. The 12-rune p27 word is a source-original *red heading*, another reason not to assume it shares a key with p55's terminal black body.

## Test B: self-synchronizing ciphertext-feedback carry through p56

The exact six-rune collision also motivates a **forward** rather than backward state test. In a deterministic, unchanged ciphertext-history decipherer of depth at most six, the repeated six-rune history and matching seventh original cipher rune would force **p27 rune34 to decode to the same rune as p56 rune0: A**. This is conditional on carrying an identical decipherer through the p55→p56 chapter boundary. A still stronger *additive-keystream* version whose key depends only on the preceding six ciphertext runes would copy p56's first two known shifts **[1,2]** to p27's next two original runes `ᚫᚠ`, suggesting plaintext GP **[A,IA]**. No source supplies this continuation rule.

Test a very generous standard, compact historical family instead of fitting an arbitrary secret lookup: for \(q=1,\ldots,6\), let the keystream obey the stationary affine ciphertext-feedback law

\[
K_i=b+\sum_{j=1}^{q}a_j C_{i-j}\pmod{29}.
\]

The p55 terminal six ciphertext symbols provide the **exact original prior state**, while p56's independently solved **85-symbol** plaintext gives the target keystream. Grant a free exception for the solved page's literal F at p56 rune56, leaving **84 independent original constraints** for just \(q+1\) unknown coefficients. For every \(q=1,\ldots,6\), the 84×(q+1) coefficient matrix has rank **q+1**, and the matrix augmented by the observed p56 keystream has rank **q+2**. Thus **all six** finite-field affine feedback models are **exactly inconsistent**, before choosing any key. The generator passes a synthetic p56-length, source-native encrypt/recover control for every q. This does not exclude nonlinear high-state ciphers or separate encryption across the p56 section break. The authenticated p56 φ(prime) method is already an independently different operation.

## Research decision

The duplicate remains a possible **deliberate waypoint**, supported by the original end-of-book placement and its rarity under the exact word-shuffle null. The two sites and the one-rune cross-section echo supply **no source-selected reversible state law** that recovers either surrounding passage. Do not promote six shared ciphertext runes into a repeated *34-symbol* key or assume the independently solved p56 prime cipher is a continuous short-feedback stream. A future decoder should first recover a separate historical operator/key from imagery, numerical pages or signed source material, then use this six-rune pair as an **untouched equality/state holdout**.

**Reproduce:** [single-file native-GP state-crib SFT](../sims/p27_p55_collision_state_crib_sft.cjs), original corpus and printed word boundaries, TextBlob lexicon, exact finite-field ranks, planted positive controls. [Successful manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43163605282).
