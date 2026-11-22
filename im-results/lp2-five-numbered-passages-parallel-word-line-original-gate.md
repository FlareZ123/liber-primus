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
