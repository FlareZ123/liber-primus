# LP1 p05 distinct-word key versus LP2 p49: 76→66/10 source-clue gate

**Research status (Agent 43, 15 November 2026; Director #1099):** A previously unindexed, exact **source-word selection** links the original 2014 mixed magic square to both the p49 pre-table line and the p55 terminal page. A direct, reproducible cryptographic inverse using those source words fails to produce plaintext. No creator-origin key, unknown LP2 plaintext, or deep-web destination has been established.

## Original observable clue and plausible player operation

The original LP1 physical p05 (original `05.jpg`) says **THE PRIMES ARE SACRED**, **THE TOTIENT FUNCTION IS SACRED** and **KNOW THIS**, then prints a mixed 5×5 square containing **13 written-out rune-word cells**. The `resources/transcriptions/lp1_wulfic_canonical.txt` transcript preserves the 2014 rune spelling **UOID**, rather than editorially replacing it with English VOID. Counting GP runes in original first-to-last printed row-major order:

| Source word | GP runes |
| --- | ---: |
| SHADOWS | 7 |
| AETHEREAL | 6 |
| BUFFERS | 7 |
| UOID | 4 |
| CARNAL | 6 |
| OBSCURA | 7 |
| FORM | 4 |
| MOBIUS | 6 |
| ANALOG | 6 |
| UOID (repeated) | 4 |
| MOURNFUL | 8 |
| AETHEREAL (repeated) | 6 |
| CABAL | 5 |

The **13 printed cells encode 76 GP runes**, as already established and tested for original p55 in [the previous p05→p55 analysis](../sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs). Keeping only the **first occurrence of each exact rune-word** (a reproducible normalization independent of the unknown LP2 text) produces **11 distinct words and 66 GP runes**. The two removed, later occurrences are UOID (four runes) and AETHEREAL (six), **10 GP runes** total.

Original LP2 p49 (`66.jpg`) has **66 runes** above the 32×8 numerical table and an immediately following **red ten-dot terminator**. Original p55 (`72.jpg`) has **76 runes** and a **red thirteen-dot terminator**. Both marks are recorded by source-image audit in [the original punctuation identity data](../resources/liber-primus/lp2-punctuation-identity.json). These original counts give one possible puzzle-designer route: the thirteen visible source word cells read into a 76-rune operand, while deduplicating repeated rune-words leaves a 66-rune operand, with ten removed runes matching the p49 stop's dot count.

A third arithmetical resemblance is that the entire pre-grid **sentence** begins at p48 local final72 and ends at p49 last66, making **138** GP runes, and 138 is one of the p05 square's printed numbers. This is weaker because lengths, starts and squares supply many possible post hoc matches. The actual p49 passage begins in a cross-page **word carry**, so its 66 runes are a physical-page fragment of that sentence, not an independent 66-rune complete sentence or a self-evident plaintext crib.

**Critical premise:** No original text instructs solvers to deduplicate the p05 square, apply its word-rune tape to p49, reset a cipher at p49, or interpret the ten dots as a key subtraction. The overlap is an **exploratory clue**, not an author-authenticated key selection. The stronger earlier p05 76/p55 76 match was already evaluated without producing plaintext. It does not gain validity automatically from another related count.

## Fixed original-input cryptographic test

The [standalone Node 22 CommonJS reproducer](../sims/lp2_p49_p05_unique66_original_gate_sft.cjs) reads both checked-in original transcriptions, independently derives all 13/11 word cells from the printed p05 square, asserts the 76/66/10 count, and reads untouched p49 ciphertext and both complete flanking sentences.

1. **The six direct local p49 key consumers** use the fixed 66-rune first-occurrence tape as GP index, prime or prime-totient per-rune offsets and both addition signs (all mod29). Every variant forward-reencrypts the original. The GP-ordinal subtraction candidate has IoC **0.0508158508** for 66 runes but outputs `EOITGBSANHOTHOEAIAAGAISATAGSTAIAWTHCHUOEADDJATGRAPPHUDDSETAEXIAIAODPAAETHWEODEO`; this is an isolated 66-rune frequency fluctuation, not recovered English. The other five are likewise nonlinguistic; prime-totient subtraction has IoC **0.0386946387**.
2. **The historically motivated plaintext-F control** transfers the exact *p56* key semantics: if plaintext is F, the encoder outputs a literal F without consuming the prime-totient key. Under the printed and mirrored source-key tapes, every interpretation of the two original p49 ciphertext F sites (local positions **3, 33**) is tested. Of **eight** original source-shaped masks, **seven** necessarily map at least one *keyed* original rune to plaintext F, which contradicts that particular encoder. Only **printed order, mask 2** survives the F rule; its output has IoC **0.0377622378** and no contiguous readable plaintext. A solved p57 rune plant proves that the candidate emitter can encode and decode genuinely known source-native text. This is a narrow original-input exclusion of the other seven masks, not proof of the remaining one.
3. **The intact passage transfer** applies the complete 76-rune printed-cell tape and the 66-rune distinct-word tape as cyclic direct additive keys across the unaltered **138-rune** pre-grid sentence and continuous **308-rune** pre/post-grid text, both GP ordinal and prime-totient offsets, each sign. All **eight** continuous-308 variants have GP IoC **0.0329963–0.0350269**, near the uniform 29-symbol baseline, and none gives a readable beginning. This prevents interpreting a page-local 66-rune frequency blip as demonstrated decryption of the original full sentence.

For every proposed additive pair, `E_k(D_k(C))=C` is a mere algebraic guarantee; only real source-selection and independently meaningful decoded prose would identify the correct key. The test therefore reports the six actual output tapes and surviving strict-F mask, rather than claiming any of them is authentic plaintext.

## Decision for #1099

**Keep the count relationship as an unconfirmed original-image clue, and retire the direct GP29 p05-word-tape shifts as a current p49 solution.** The source-to-plaintext bridge is still missing. A useful successor would identify an independently original instruction for treating the **ten duplicate-word runes** as positions, padding, omissions or an operation, and supply a decoder that correctly predicts an untested contiguous original span. Alternatively, an original-era authentic key/material may choose an unrelated route.

Do not extend this observation into a fitted long-key search or another round of arbitrary cipher-family permutations. There is no established plaintext, no source-selected full inverse, and nothing to promote to `results/README.md`.

**Primary inputs:** [original LP1 p05 rune text](../resources/transcriptions/lp1_wulfic_canonical.txt), [original LP2 GP29 indices](../resources/liber-primus/lp2-corpus.json), [original terminal punctuation marks](../resources/liber-primus/lp2-punctuation-identity.json), and [documented original p49/p55 image geometry](../im-results/lp2-p49-table-complete-flanking-sentences.md). [Source-shaped SFT](../sims/lp2_p49_p05_unique66_original_gate_sft.cjs).
