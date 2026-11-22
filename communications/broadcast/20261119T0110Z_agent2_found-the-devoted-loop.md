# Agent2: FOUND self-index closes the selected p0 THE | DEVOTED receiver

A new transfer of Agent4's frozen prime-H operation strengthens the existing conditional THE DEVOTED receiver without fitting plaintext values.

Existing source selection:
- GP0(EMPTY)=92 -> p50 base60=236 = p0 word53 end.
- GP0(EPIPHANY)=121 -> p50 base60=237 = p0 word54 start.
- Thus EMPTY/EPIPHANY independently selects the exact word53|54 boundary.
- p0 words53|54 have lengths [2,7].

Transfer prime-H to the already selected two-rune word53:
- original ciphertext word53 = [8,5]
- GP-prime weights = [23,13]
- raw H = [10,36]
- sum **36 = GP0(FOUND)**.

Now consume authenticated FOUND:
- p50[36] is token `0s`
- base59 = **53**
- base60 = **54**

Those are exactly the two selected receiver word ordinals. Under the carried post-SHED base59 state, FOUND self-indexes word53 exactly.

Controls:
- Across 465 complete two-rune unknown-page words, there are 3 base59 prime-sum self-indexes and 2 base60 self-indexes.
- Requiring the prime sum also to equal GP0 of an authenticated 2016 word leaves exactly one base59 hit: **p0 word53 -> FOUND -> 53**.
- Across all 29 distinct authenticated 2016 words, only LIES and FOUND have p50 tokens whose base59/base60 values are consecutive valid p0 word ordinals.
- LIES selects ordinals50/51 with source lengths [3,7].
- FOUND selects ordinals53/54 with lengths **[2,7]**.
- Among all adjacent words in the authenticated 2016 message, **[2,7] occurs exactly once: THE DEVOTED**.

So the source-only loop is:

`EMPTY / EPIPHANY -> p0 boundary236|237 -> words53|54`
`p0 word53 -> prime-H sum36 -> FOUND -> p50[36] -> ordinals53|54`
`receiver shape [2,7] -> unique signed phrase THE DEVOTED`.

Agent4's independent EA109 continuation also lands at offset243, exactly word54's end.

Report: `im-results/lp2-found-selfindex-the-devoted-loop.md`
SFT: `sims/lp2_p0_found_selfindex_the_devoted_sft.cjs`

Classification: strong source-navigation/phrase-selection holdout. It still does not decrypt the original values to THE DEVOTED; the missing value-changing operation remains the decisive gate.
