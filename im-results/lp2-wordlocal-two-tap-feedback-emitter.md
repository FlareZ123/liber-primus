# Word-local two-tap GP29 feedback emitter: bounded negative

**Agent21 · 16 November 2026 · Director Issue #1262**

## Decision

Retire this exact emitter. It is a compact, exactly reversible GP29 transformation, but its inverse does not recover plaintext. It produces random-like rune statistics, essentially no increase in English dictionary matches, and no readable run of meaningful length. Exact re-encryption is a consistency check, not a decipherment.

## Source-motivated hypothesis

The original images contain a repeated five-dot ornament on physical pages 7, 23 and 56 (repository images 24.jpg, 40.jpg and 73.jpg). The ornament is a visible clue, but no authenticated text says that it means a five-rune lag; the existing three-page motif study does not select a unique cipher operation. The observed LP2 anomalies independently motivate a one-step state and a word-local five-step dependency: only 86 of 12,901 page-local adjacent pairs are equal, while 104 of 2,105 within-word lag-five pairs are equal.

I froze one minimal two-tap difference rule, with no fitted coefficient, lookup table, key or page-specific parameter. Let \(C_i\) be the ciphertext rune at global position \(i\), and let \(j\) be its zero-based position in the current printed word:

\[
P_i = C_i - C_{i-1} + \begin{cases}
C_{i-5}, & j \ge 5\
0, & j < 5
\end{cases}
\pmod{29}.
\]

The exact forward encoder is:

\[
C_i = P_i + C_{i-1} - \begin{cases}
C_{i-5}, & j \ge 5\
0, & j < 5
\end{cases}
\pmod{29}.
\]

The global one-back state crosses word, stop and physical-page boundaries. The five-back tap resets at each printed word boundary. The first five runes of each word have no five-back tap. The initial previous-ciphertext state is F/index 0. All 29 runes, including literal F, are ordinary symbols; this candidate does not import p56's plaintext-F bypass.

This is an **exploratory alternative**, not an author-authenticated instruction. The five-dot ornament motivates the lag value only; the \((+1,-1)\) coefficients are the minimal reversible coupling selected to test the two observed effects.

## Source accounting

The original canonical corpus gives 12,956 runes in 2,896 printed words. Parsing the rune-bearing LP2 page chunks without splitting at physical page breaks reproduces all **32 carried words**. All 29 alphabet symbols remain in the transform, and no rune is dropped.

The 138 stops are the source-audited four-dot diamond marks (137 black, one red), not every period character in the transcription (175) or every derivative stop record (145). Their 138 unique offsets partition the 12,956-rune stream into 139 fields; the field lengths sum exactly to the full stream, begin with `[154, 121, 22, 53, 44, 40, 97, 494, 21, 21, 44, 183]`, and end with a 359-rune tail. The four nonphysical p15 row terminators, one ambiguous single dot, one absent event and one comma-form event are excluded according to the original-image audit.

For this candidate, the 138 confirmed stops are preserved as **non-consuming punctuation at their original rune offsets**; they do not reset either state. That is an explicit model choice, not a claim that the stops have no puzzle significance. The printed word delimiters (`-`, `.`, `&`, `$`, `§`) reset only the five-back tap. Page breaks and line wraps do not reset either clock.

## Original-input result

The frozen inverse was applied to the full original 12,956-rune sequence, including p0–2 and the held-out p40–53 pages. Re-encrypting the decoded words with the stated forward rule reproduces all 12,956 original runes exactly.

| Measurement | Original ciphertext | Candidate inverse |
|---|---:|---:|
| Index of coincidence | 0.0344784 | 0.0350405 |
| Page-local adjacent equals | 86 / 12,901 | 456 / 12,901 |
| Within-word lag-five equals | 104 / 2,105 | 69 / 2,105 |
| English dictionary word matches | 201 / 2,896 | 200 / 2,896 |
| Longest consecutive dictionary-word run | — | 2 |

The inverse moves in the wrong linguistic direction: adjacent equality rises from 0.67% to 3.53%, while lag-five equality falls from 4.94% to 3.28%. Its decoded dictionary-hit rate is indistinguishable from the raw ciphertext rate.

### Frozen sections

| Section | Runes | Words | IoC | Dictionary hits | Longest consecutive dictionary words |
|---|---:|---:|---:|---:|---:|
| p0–2 | 729 | 158 | 0.0351377 | 13 / 158 | 2 |
| p40–53 (holdout) | 3,008 | 669 | 0.0351113 | 43 / 669 | 2 |

The first decoded p0–2 words include SOEIXOEATL, SJNGOP, YNAM, RJJ, IGOE, WNEIWFAEYSGA and HTIRNG. The held-out p40–53 sample begins ENI, WNBTHEO, TEUEOJ, RTRS, IACW, NGMGSIA and MCIP. Neither section approaches the requirement of 200 contiguous readable GP-native runes.

## Held-out native-GP controls

The model was not tuned on unknown p0 output. It was applied unchanged to source-native clear LP1 pages 3, 8, 9, 10, 11 and 14 (1,001 runes, 230 words), and independently to clear LP2 p57 (95 runes, 20 words). Both controls re-encrypt and decrypt exactly.

| Control | Text | Model-emitted ciphertext |
|---|---:|---:|
| LP1 clear pages, adjacent equals | 28 / 1,000 | 16 / 1,000 |
| LP1 clear pages, within-word lag-five equals | 8 / 158 | 6 / 158 |
| LP1 clear pages, dictionary hits | 216 / 230 | — |
| LP2 p57, adjacent equals | 1 / 94 | 2 / 94 |
| LP2 p57, within-word lag-five etquals | 2 / 20 | 0 / 20 |
| LP2 p57, dictionary hits | 16 / 20 | — |

The LP1 plaintext-layout control has a 2.80% adjacent-repeat rate and 5.06% lag-five rate; the candidate emitter reduces those to 1.60% and 3.80%. The original LP2 target is 0.67% adjacent and 4.94% lag-five. Thus the proposed emitter does not reproduce the target joint statistic on held-out native GP prose. The p57 sample is smaller and is reported as an independent exact-text control, not as a precision estimate.

He dictionary is the repository's fixed TextBlob-derived English lexicon encoded with the source-calibrated GP spelling convention (including the established ING and IO spellings). It matches 93.9% of the clear LP1 control words and 80% of p57, but only 6.9% of the candidate inverse's 2,896 words.

## Interpretation and stopping rule

This one model is fully reversible and accounts explicitly for the 29-symbol alphabet, literal F, 138 confirmed stop positions, 2,896 printed words and 32 page-carrying words. It nevertheless fails the original plaintext test and the held-out joint-statistic control. The five-dot motif is not thereby disproved as a clue, and other word-sensitive emitters are not universally excluded. No sign, coefficient, reset, stop-clock or state-table sweep was performed after the negative result. In accordance with Issue #1262, stop this exact branch rather than expanding its state to fit the same anomalies.

## Reproduction

From the repository root:

~~~bash
node sims/lp2_wordlocal_two_tap_feedback_emitter_sft.cjs
~~~

The dependency-free Node 20+ SFT checks the canonical transcription against the page corpus, the 32 carried words, the 138 source-audited stop positions and 139 stop fields, exact forward re-encryption, the p0–2 and p40–53 sections, the source-native LP1/p57 controls, and the GP dictionary scores. Supporting source references: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-transcription.txt, resources/liber-primus/lp2-punctuation-identity.json, resources/transcriptions/lp1_wulfic_canonical.txt, resources/control/english_wordfreq_textblob.txt, and im-results/lp2-five-dot-three-page-art-and-phi-transfer.md.
