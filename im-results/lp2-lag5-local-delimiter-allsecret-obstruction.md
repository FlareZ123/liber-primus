# Original LP2 word breaks cannot be recovered by a local five-back-echo lookup, even with secret page-specific rules

**Agent15, 15 November 2026; Director #1038. Exact original-ciphertext necessary-condition negative.** This establishes a finite, reproducible reason that the unusually frequent within-word five-back echoes cannot themselves operate as a complete local word-boundary code. The 56 unknown physical LP2 pages remain undeciphered; no key or author-selected delimiter algorithm was recovered. The manuscript may have an entirely different, nonlocal state-dependent boundary mechanism.

## Causal hypothesis and competing explanation

Original unknown LP2 has **12,956 GP29 ciphertext runes** and **2,896 semantically complete printed rune words**, including **32 words spanning physical page turns**. The 2014 artifact carries repeated five-circle motifs, and previous original-source experiments established that ciphertext symbols equal their five-step predecessors **104/2,105 times within printed words**, with a pronounced boundary-conditioned enrichment. A human solver might attempt to convert runs of five-back echoes into explicit delimiter positions without first recovering a conventional GP29 key. The rival is that the word breaks were printed for other reasons and the five-back echoes only reveal a limited word-local cipher effect.

The most generous direct interpretation of a local five-dot boundary signal is that, for each possible gap before source rune `g`, a binary window of five comparisons `E(i) = [C(i)=C(i−5)]` chooses `BREAK` or `CONTINUE`. We grant a completely arbitrary, **secret** Boolean lookup for every observed five-bit mask, allowing all `2^32` possible mappings without enumerating them. The lookup can be global or **a different arbitrary lookup on each of 55 physical rune-bearing pages**. We also grant a wider **ten-bit** local window, with `2^1024` possible global mappings and a completely independent such mapping per page, allowing more context than the five-dot cue suggests.

Three concrete window definitions are independently frozen from the position `g`: forward five `E(g…g+4)`, centered five `E(g−2…g+2)`, and the more permissive ten `E(g−4…g+5)`. For each, evaluate echoes with either a continuous source clock or a reset on physical page turns. For page-dependent rules, the governing page may belong to the rune just before or just after the gap. The 2016 signed-message **words-as-map** clue and the p57 **shed-circumferences** metaphor do not specify any such Boolean lookup. The experiment deliberately gives these rules their *best possible* original-data selection to determine whether further key searches in this family could ever work.

## Exact all-secret obstruction on original positions

At each of **12,955 potential gaps** between the **12,956 untouched runes**, the correct `BREAK/CONTINUE` label is read from the original printed manuscript. There are **2,895 true breaks** and **10,060 nonbreak gaps**. The algorithm groups all positions having the same observable mask (or same page and mask). Within each group, any deterministic lookup must assign the same label to all positions. The exact minimum classification errors, across **every possible secret lookup**, is therefore

`sum_over_groups min(number_of_true_breaks, number_of_true_nonbreaks)`.

This is an exhaustive algebraic minimum over all rules in the stated class. It does not assume a language scorer, plaintext, chosen key or prospective human interpretation.

| Source echo clock | Observed mask | Exact minimum errors, one global rule | Secret rule **per physical page**, best of preceding/following page |
| --- | --- | ---: | ---: |
| Book continuous | five forward flags | **2,895** | **2,838** |
| Book continuous | five centered flags | **2,895** | **2,841** |
| Book continuous | **ten** neighboring flags | **2,886** | **2,717** |
| Reset at each physical page | five forward flags | **2,895** | **2,835** |
| Reset at each physical page | five centered flags | **2,895** | **2,844** |
| Reset at each physical page | **ten** neighboring flags | **2,888** | **2,722** |

The **best available outcome still makes at least 2,717 errors** over the 12,955 unchanged source gaps even when granted completely independent secret mapping tables on every page. For the best ten-bit continuous, next-page table, the optimal majority lookup finds **224 true breaks**, produces **46 false breaks**, and misses **2,671** of the **2,895** genuine breaks (recall 7.74%). This is a mathematically exact in-sample oracle: a contemporary solver with no secret table can only do worse under the same local input contract.

One transparent obstruction is that the ten-bit all-zero mask alone occurs at **2,006 true breaks and 6,965 nonbreaks** under the continuous clock. They are indistinguishable to *any* mapping keyed solely by that local pattern. For the five-forward mask, the analogous counts are **2,427 breaks and 8,340 nonbreaks**. The five-bit oracle's optimal global rule is simply **never break**, agreeing with 10,060 nonbreak sites while missing every true delimiter. Its zero-mask conflict is independent of numerical key guesses.

## Exact controls and model limits

The [read-only Node.js CommonJS reproducer](../sims/lp2_lag5_local_delimiter_allsecret_sft.cjs), [**successfully executed on Windows Node22 in Actions run 43674320563**](https://github.com/FlareZ123/liber-primus/actions/runs/43674320563), reads the canonical rune corpus and original transcription, asserts that both supply the same **12,956 rune identities**, checks **2,896 words** and all **55** page identities, and reproduces all six original-source rows above with every page-rule orientation. As a nontrivial positive test, for each window and clock, synthetic delimiters are placed by the known deterministic rule “break exactly when the first echo flag is true.” The identical exhaustive solver obtains **zero errors** for each planted rule, without modifying any ciphertext rune, and independently verifies that concatenating all resulting synthetic-word segments reconstructs the complete original 12,956-rune stream. This establishes the ability to identify a genuine rule in this precisely bounded model.

The test excludes only **local, stationary echo-pattern-to-break lookups**, including unrestricted per-physical-page tables; it does **not** exclude nonlocal running state, keys recovered from external clues, original word-index dependence, direct GP rune-value-dependent rules, variable-length coding, transposition, semantic plaintext segmentation, or an authentic cipher that uses the echoes as auxiliary synchronization rather than the delimiter channel. A static five-step mask may carry partial information even though it is incapable of specifying all boundaries.

## Consequential decision for #1038

**Do not invest in another five-back-echo-only delimiter lookup or a fitted list of local Boolean patterns.** Even the all-secret ten-bit/page-specific superfamily fails a necessary condition on thousands of original sites. To make boundary recovery a real cryptanalytic route, the manuscript must supply a **genuinely nonlocal state update or separate key/input** that distinguishes gaps sharing identical local echo signatures, plus a reversible rune operation that produces independently confirmed plaintext. The original five-circle motif, its echo counts and the 2016 words-as-map sentence presently provide no such decoder.

The result is a source-exact exclusion within an identified cipher architecture. It does not justify generalizing that LP2 deliberately randomizes spaces, or claiming any previously unknown text has been recovered.
