# Chapter-start red headings as possible GP-prime → p50 → page pointers

**21 November 2026, Agent19. Classification: original-source, reversible arithmetic and candidate human navigation, not an authenticated decoding rule. No unknown plaintext or source-confirmed key.**

## Source-selection and exact lookup

The original chapter opening rubrics form one visually identifiable population: **nine** chapter-start red title inscriptions at physical LP2 pages **0, 3, 8, 15, 23, 27, 33, 40 and 54**. The original p15 rubric has two immediately adjacent red spans (9+11 GP29 runes) with a 13-dot punctuation break. Treat the combined 20-rune title as one member. No original page or heading is omitted because it fails the proposed lookup.

A simple available mathematical convention comes from authentic solved Cicada: associate the canonical first-29-primes GP weights to the source-runic heading, **sum the prime weights**, reduce modulo **256** (the exact size of the physical p50 32×8 token array), then read the indicated original table cell in **base60**. Source-selected alternative **base59** removes lowercase `f` from the table alphabet as in the separate solved-p57 SHED punctuation bridge; both radices are tested **without selecting whichever outputs a more attractive page**.

| Red chapter heading | Rune count | GP-prime sum | p50 cell index | Literal token | Base60 value | Base59 value |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| p0 | 13 | 662 | 150 | `2X` | 153 | 151 |
| p3 | 16 | 742 | 230 | `1v` | 117 | 115 |
| p8 | 12 | 446 | 190 | `2o` | 170 | 167 |
| p15 | 20 | 1068 | 44 | `3o` | 230 | 226 |
| **p23** | **16** | **786** | **18** | **`0F`** | **15** | **15** |
| **p27** | **19** | **1109** | **85** | **`0S`** | **28** | **28** |
| **p33** | **10** | **379** | **123** | **`0s`** | **54** | **53** |
| p40 | 8 | 435 | 179 | `2t` | 175 | 172 |
| **p54** | **9** | **597** | **85** | **`0S`** | **28** | **28** |

Four of the nine source rubrics produce a **valid physical LP2 page number below58** in either base, with **three links invariant under the source radix question**:

- **p23 → p15** in both bases. The p23 red heading contains exactly **16** source GP29 runes; its candidate destination p15 visibly prints exactly **16 numbers in a 4×4 prime/Fibonacci square**. A prior direct pairing of these 16-item operands lacked a page-selection reason. This arithmetic suggests such a reason while leaving the cipher operation unresolved.
- **p27 → p28** in both bases. This is the **only** direct next-physical-page hit among all nine starting headings. The original p28 has the independently recognized DH23 line6, and p27's opening red heading length **19** matches the DH peer-public number in that route. These independent local clues provide a candidate human route; they do not authenticate that GP-prime sums are page pointers.
- **p54 → p28** in both bases. Independently of p27, the red p54 heading's prime-weight sum lands at the same p50 cell85 `0S`; the two full prime sums differ by **512**. The p54 chapter encloses p55, the 76-rune ending/tree page. A *hypothesis* is that the common destination suggests carrying p28's state into the terminal chapter; neither the recipient nor the key use is specified.
- **p33 → p54 (base60) / p53 (base59)**. Both candidates fall in the floral terminal cluster, but the page index is **not determined without a radix choice**. The original solved p57 punctuation bridge independently favors base59 for one different table consumer, whereas the base60 functional graph has separate numeric structure; treating these different consumers as one global radix would be unjustified.

These candidate arrows should be interpreted as **page locations, not plaintext**, and never as proof that any page has been decrypted.

## Independent receiver tests and strongest objections

1. The previously completed [p15/p23 16-item ciphertext-feedback inverse](lp2-p15-p23-word-feedback-source-gate.md) used the 16-value numerical square and the 16-rune red heading but **failed original 1,005-rune native-prose recovery**. The lookup p23→p15 improves selection of those source operands; it does **not** rescue that rejected cipher, supply an inverse, or warrant arbitrary new key mixing.
2. The p28 DH23 tuple, including shared value2, is independently reproducible via original source. The direct p6/p7 body consumers have already failed, as documented in [p6/p7 DH and red-boundary analysis](lp2-p6-p7-reversed-red-boundary-gate.md). Neither p27→p28 nor p54→p28 chooses a new reusable LP2 decryption operation.
3. The proposed mapping **depends on freely choosing “sum of prime weights, mod256, table lookup”**. The original title and numeric table do not print that instruction; GP0 sums or different page/key conventions give different lookup graphs. The red headings, page boundaries, target features, and exact arithmetic are source-grounded, while their linkage remains post hoc. There are eight distinct source addresses among nine headings, and **5/9** yield byte values outside 58 pages; a universal page-pointer interpretation is therefore false. A clue-conditional navigation rule would need an author-visible criterion for when to follow an arrow versus interpret a byte as key/data.
4. The p33 radix fork is not a solved ambiguity. The p23/p27/p54 zero-leading tokens are invariant in both radices, so those three comparisons cannot by themselves choose the correct alphabet.
5. The exact source-selected same-address p27/p54 **shared-additive-pad** consumer was separately tested and is inconsistent with many complete native-GP English printed-word overlaps (13 title,10 body) despite a successful independent planted cipher: [original-cipher keyless report](lp2-p27-p54-red512-sharedpad-original-lexicon-gate.md). A page-pointer interpretation needs a **different** authentic receiver.

The best next research decision is to seek a historical, author-visible operation that both **licenses the prime256 table lookup** and specifies how to use the p15 or p28 output as a **key or instruction on an untouched ciphertext page**, with exact forward reencryption. Without that selector, preserve these relations as possible navigation, and avoid expanding the large retrospective choice family.

## Reproduction

[One-file Windows Node22 original-input SFT](../sims/lp2_red_headings_gpprime_p50_page_navigation_sft.cjs) reads the canonical original GP29 corpus, original red-ink span inventory and exact 256 printed table tokens. It asserts every red-heading start/span, all nine sums/cells/bytes, all four in-range page arrows, the p33 radix-dependent fork, and exact 512/85 coincidence. [Successful Windows Node22 run 44958693896](https://github.com/FlareZ123/liber-primus/actions/runs/44958693896). No source file was modified or ciphertext symbol reinterpreted.
