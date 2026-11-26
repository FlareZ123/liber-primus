# Five numbered pp36–38 passages: original parallel word and line reassemblies

**Agent33, 22 November 2026. Bounded pure-read-order negative under Director #2182.** The five explicitly numbered source passages 1–5, physically printed across p36–38, contain **553 original GP29 runes**. Two finite, original-typography-defined parallel reassemblies, complete printed **word** alternation and physical **line** alternation in printed order 1→5, both preserve and exactly reconstruct all 553 glyphs. Each produces uniform-like ciphertext and fails the source-native English/GP29 language control. Neither yields 150 consecutive plausible runes of authentic unknown plaintext. No standalone ordering key is recovered.

## Source and constrained original read

Source: source JPEGs 53.jpg–55.jpg (LP2 physical pp36,37,38), transcribed in [the original page corpus](../resources/liber-primus/lp2-transcription.txt), with GP index mapping [here](../resources/liber-primus/lp2-corpus.json). The five red digits **1, 2, 3, 4, 5** are literal independent printed labels, separate from the runic text. The first passage begins partway through p36. The fourth passage crosses the real p37→p38 page break and remains a single unit. P36's text before digit1 and p38's text following passage5 are outside this receiver and were never mixed into the test.

| Source unit | Original GP29 runes | Printed words | Physically printed lines |
| --- | ---: | ---: | ---: |
| 1 | 139 | 30 | 6 |
| 2 | 91 | 20 | 4 |
| 3 | 98 | 25 | 5 |
| 4 | 96 | 19 | 5 |
| 5 | 129 | 28 | 6 |
| **Total** | **553** | **122** | **26** |

The source read has no hidden phase, scored permutation or freely selected length. **Word reading:** visit the first complete printed word of passage1, then passage2,3,4,5, then each second word in the same order, and so on. A completed lane drops out without truncating its companions; the last word of passage1 (its 30th) is preserved at the end of the visit order. The slash-plus-newline is a typographic wrap, and only original hyphen/full stop delimits printed words. **Line reading:** apply the same fixed five-lane alternation to the 26 physical printed lines, preserving true line breaks as unit boundaries and the genuine p37→p38 seam in passage4. Once each line/word fragment length is recorded, both read orders are reversible: the exact inverse disperses the 553 interwoven runes to the five original units **553/553**, with all 122 words and all26 line lengths maintained.

## Decisive original language gate and positive controls

The original serial five passages, the printed-word interleave, and the printed-line interleave have precisely the **same 29-symbol histogram** and hence the exact same source IoC **0.0342335613**. No pure rune permutation can improve unigram IoC. As an independent language diagnostic, build the native GP29 bigram model from actual solved LP1 source-text runes, excluding the first553 GP symbols used as the planted positive. Give each bigram a fixed pseudocount0.5, then score log probability over a uniform 29-symbol null. Report a whole553 score and the best contiguous original150 rune window, accounting for all possible windows **without** fitting the layout order.

| Text | GP29 runes | Whole-stream IoC | GP29 bigram log ratio (nats/rune) | Best 150-rune score |
| --- | ---: | ---: | ---: | ---: |
| Original serial numbered 1→5 | 553 | 0.034234 | −0.571113 | −0.505291 |
| 122 printed words interleaved | 553 | 0.034234 | **−0.557547** | **−0.466498** |
| 26 physical lines interleaved | 553 | 0.034234 | −0.589774 | −0.487935 |
| Independent solved LP1 native GP plant | 553 | **0.060946** | **+0.600105** | **+0.753658** |
| Original encrypted p56, wrong-key-like control | 85 | 0.032493 | −0.861732 | n/a |
| Actually clear p57 PARABLE | 95 | **0.062710** | **+0.717489** | n/a |

The original whole-word interleave begins `LTHEOOE NYEX DUP NGJSJMRM HAEXTHBOE AAEEA NUXI WNEA...` in source GP transliteration; the original line interleave begins `LTHEOOEAAEEAMXHCXATTH... NYEXNUXINGTPW...`. Both visibly lack coherent running prose and perform radically below the withheld native solved LP1 sample. The source-original p56 cipher demonstrates the scope of the diagnostic: its **ciphertext**, before application of the known p56 prime-totient inverse, also receives a low score. These scores do not prove a future non-English language cannot be present; they specifically reject **a plain reading-order recovery of the original runes as native solved-style GP English**.

**Positive exact coverage:** take 553 genuine, uninterrupted GP29 plaintext symbols from solved LP1 (first sample), run each inverse dispersal through the original 122-word or 26-line source fragment-length template, then weave the resulting five synthetic lanes by the source-prescribed 1→5 rule. Both recover the true withheld planted 553 GP symbols exactly. No source ciphertext symbol, punctuation, numeric label or page-boundary instruction is changed to force an original output.

**Reproduce:** [read-only single-file original-input CJS](../sims/lp2_five_numbered_passages_parallel_read_original_sft.cjs), Node.js 22, Windows GitHub Actions [run 44996727248](https://github.com/FlareZ123/liber-primus/actions/runs/44996727248), all source assertions and positive plants passed.

## Decision and realistic missing input

The five printed units are independently identifiable source objects, and a human reader could literally choose these two parallel traversals. A **pure printed-word or printed-line interleave** fails as an unknown-language plaintext recovery while maintaining every original symbol and exact reversibility. The result excludes neither an **additional** source-selected cipher nor a specific instruction to treat the five numbered statements as keys. Nothing in the numbered source glyphs fixes a Vigenère pad, a hash, GP29 state update, or a nonlocal rune permutation. Stop these two finite raw reads rather than retrying hundreds of interleave phases or column orders with English score as the source selector. A successor needs a *historically real operator* and a full original 150+ rune cleartext with forward replay; these experiments supply none.

## Native rhetorical alignment decision (Director #3025, 26 November)

The distinct rhetorical hypothesis asks whether the original numbered units encode repeated questions/answers or parallel utterances that independently fix exact plaintext positions. Direct inspection of original JPEGs 53–55 shows the same two cuneiform header rows, red Arabic item labels 1–5 and black prose with ordinary word/sentence punctuation. Unit 4 crosses the p37→p38 boundary. There is no quotation delimiter or per-item alternating role rubric. Original LP1 JPEGs 06–09 and 14 visibly mark speech with double strokes; LP1 scan10 instead uses red numbers for ordinary enumerated errors in the solved LOSS OF DIVINITY text. Numbering alone therefore does not identify speakers. The derived [quote inventory](../resources/liber-primus/lp2-quote-punctuation-spans.json) contains no span intersecting pp36–38; the original scans were checked directly rather than assuming the inventory complete.

Use native solved rune strings from [the frozen nine-section reference](../resources/external/relikd-solved-gp29-native-v1.json), avoiding normalized Latin spelling and treating an apostrophe as internal morphology. The first quoted question of KOAN1 (WHO ARE YOU WHO WISHES TO STUDY HERE) is exactly eight native words, shape [3,3,3,3,6,2,5,4], 29 runes. It appears verbatim five times at zero-based whole-section word offsets 20,51,86,117,155. KOAN2 also has visible speech marks but not the identical repeated question. The p57 PARABLE has three clauses (7/6/6 words) and no common literal opening or closing word across all three: its parallel themes alone do not fix a lexical crib. The native WISDOM pair “YOU ARE A … UNTO YOURSELF” is an independent example of an explicitly repeated three-word opening and two-word ending; the LOSS OF DIVINITY consumption/preservation pair repeats the five-word opening “MOST THINGS ARE NOT WORTH”. Its ordinary two-item red-number list shares only a one-word opening, WE, followed by DO/HAVE.

Without fitting rune identities, the exact original five units contain seven full-stop-bounded sentences:

| Unit.sentence | Words | First three word lengths | Last three word lengths |
|---|---:|---|---|
| 1.1 | 30 | 4,3,8 | 3,4,5 |
| 2.1 | 20 | 4,4,6 | 9,3,2 |
| 3.1 | 25 | 3,4,4 | 8,4,3 |
| 4.1 | 13 | 7,9,7 | 2,4,10 |
| 4.2 | 6 | 3,4,3 | 11,5,3 |
| 5.1 | 23 | 6,4,7 | 8,3,3 |
| 5.2 | 5 | 2,5,3 | 3,5,2 |

The native repeated-question shape has **zero occurrences anywhere** in the five complete units (even allowing a window to cross a sentence stop), and zero within the seven sentences. No two numbered units share even a two-word opening or closing length signature; this excludes any identical two-or-more-word item-opening/item-closing refrain under preserved printed word boundaries and native spelling. Of 21 sentence pairs, only 3.1/4.2 share a two-word opening shape [3,4]; none share a two-word ending or a three-word opening. The latter isolated shape is not an exact lexical equality or a role indicator. The two actual koan references contain quote strokes; the ordinary numbered list and p57 do not. Consequently the source cannot select a dialogue-role alignment or a native repeated-phrase receiver. A hypothetical unmarked dialogue, variable segmentation, a different refrain, or a cipher altering lengths remains outside this exclusion.

**Decision:** close #3025 at its explicit source-gate fork. No key was selected, no original plaintext guessed, and no withheld decryption is warranted. The two native rhetorical exemplars are calibrations of exact length constraints, not universal genre classifiers. No existing parallel-interleave or formal-command tests were rerun. Reopen only if a separate source identifies a particular paired boundary or a concrete lexical operand. [Read-only CommonJS reproducer](../sims/lp2_numbered_koan_role_alignment_sft.cjs) · [executed output](lp2-numbered-koan-role-alignment.json). The computation was executed in connected JavaScript on fetched repository inputs; the standalone Node wrapper has not been run separately. The source images were inspected locally from the supplied original archive.
