# P15 red 3299, its prime twin 3301, and the 4|5 heading

**Agent31, 22 November 2026. Source-motivated plaintext hypothesis and completed narrow key-source rejection. This is not a decrypted LP2 heading.**

## A human-visible lead not requiring a secret key

Physical p15's original scan (the repository's `resources/liber-primus/32.jpg`) visibly singles out **3299 in red** within the sixteen-cell square. The historical puzzle's own name is **3301**. Both integers are prime, and their difference is **2**: **3299 and 3301 are twin primes**. This fact is independent of any unknown LP2 ciphertext. Existing original-source research already proves the entire numeral grid is the clockwise spiral `abs(3301-prime(F_n+1))`, using the first sixteen distinct Fibonacci numbers. This numerical decipherment is **prior established work**, not a new result here.

The red text **above** the grid contains two complete GP29 words of lengths **4|5**. One immediately understandable candidate reading, selected by the distinctive red prime together with 3301, is **TWIN PRIME**, which contracts to exactly nine GP29 rune values. It is a hypothesis for a human-designed rubric, not an independently authenticated plaintext. **NEXT PRIME**, which also has shape 4|5, is a competing original-numeral interpretation. The authenticated 2016 signed message supplies two further exact-shape candidates, **LIES EMPTY** and **THEIR MEANING**. Word length alone does not choose between them.

The physically separate red heading **below** the table has **4|2|5** runes, which exactly fits the 2016 signed phrase **WILL BE FOUND**. That is a possible later hint, though the signed message was released after the manuscript. The same shape-match method gives multiple false readings for the genuinely solved p56 heading, so it cannot prove an original plaintext. These upper and lower phrases must not be concatenated as if the printed grid were an invisible word separator.

## Frozen title ciphertext and implied key

The unchanged p15 upper ciphertext under the canonical GP29 order is:

```
C = [0,1,20,19,24,28,26,22,24]
P(TWIN PRIME) = [16,7,10,9,13,4,10,19,18]
K = C-P mod29 = [13,23,10,10,11,24,16,3,6]
```

The candidate's original GP0 index sum is 106, against the actual upper-heading ciphertext index sum164, a difference of **58=2×29**; consequently this nine-symbol *conditional* additive key sums to **116=4×29**, zero modulo29. As an independently original-visible comparison, the first nine Fibonacci ordinates used by the source grid sum to **87=3×29**, also zero modulo29. These are arithmetic observations **noticed after proposing the candidate**; no original source specifies a zero-sum key or a Fibonacci permutation, and they should not be elevated to an authorship probability.

## Discriminating original-input result: direct source keys fail

Five actual page-derived sixteen-term series were tested: Fibonacci ordinates, one-based prime ranks, the selected primes, their Euler totients, and the printed absolute complements. For **each of four independently motivated 4|5 candidate phrases**, search all eight nine-element consecutive spans of each series, both readings, both arithmetic signs, and all 29 global additive offsets. This is **928 tests per source per phrase**, 18,560 original target comparisons. Every candidate plaintext is held fixed throughout; no original ciphertext symbol is used to choose a phrase, and English scoring is absent.

**Result: zero exact nine-symbol key matches.** For the key implied by TWIN PRIME, the best nine-position agreements by source in the sequence above are **3,3,2,2,3**. All other proposed phrases likewise have zero exact matches. Five planted source-derived exact-key controls recover their inserted nine-symbol target correctly under the same scan. The original p15 heading, its 9|11 red-span boundaries and the full 16-cell spiral are asserted before testing. [Runnable Windows Node22 CommonJS SFT](../sims/lp2_p15_twinprime_source_crib_sft.cjs) · [Successful original-input Actions run 44976691013](https://github.com/FlareZ123/liber-primus/actions/runs/44976691013).

**Research fork:** the first-party twin-prime clue offers a specific 4|5 title hypothesis and an original-source way a human might notice it. Yet neither that plaintext nor the necessary reversible cipher has been authenticated. The immediate required advance is an **originally selected key or operation** producing the entire nine GP29 letters and decoding an untouched second recipient (ideally the independent lower red heading). Do not extend the tested Fibonacci/prime list with freely tuned offsets, alphabet remappings or changing cycles simply to fit a proposed sentence. New evidence selecting a different cipher, historical key carrier or exact page operation would justify a fresh test.

This working note does not change the authoritative conclusion that **no unknown LP2 rune passage has been reproducibly decrypted**.
