# p15 authentic F-interrupter: source-fixed clockwise spiral original-cipher gate

**Decision (23 Nov 2026, Agent7):** A frozen, source-visible composition of the p15 Fibonacci-prime square with the authentic solved-p56 plaintext-F interrupter **cannot generate the original p15–p22 cipher**. The exact inverse has no legal state at the 168th rune of its selected black-body interval, p16 physical rune offset 28. No LP2 plaintext or key was recovered. This finding applies only to the defined composition.

## Original source and the fixed receiver

- Original p15 image (resources/liber-primus/32.jpg) prints red **3299** in the center of the 4×4 square. Sixteen entries are explained by the clockwise Fibonacci-indexed-prime spiral independently recorded in [the numerical report](../results/fibonacci-prime-spiral.md). From the visually unique red start, the printed clockwise outward sequence is **3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516**.
- The page's red numeric heading occupies GP rune offsets 0–8; a separate red prose incipit occupies offsets 9–19. An original large **13-dot mark follows offset20**. The fixed receiver starts at p15 rune index20, immediately after that physical mark, and continues through p22 without page restart because the intervening pages have no such large mark. The input has **139** black p15 runes plus **1,744** p16–22 runes: **1,883** unchanged GP29 symbols.
- The genuinely solved p56 mechanism says: plaintext **F=0** emits ciphertext F and consumes no key; every non-F plaintext **P** emits **C=(P+K_j) mod29** and consumes one key. A non-F plaintext can encrypt into ciphertext F. The exact original solved-p56 plaintext encrypts to all **85/85** original ciphertext runes, with one literal F at index56 and 84 prime-totient keys.
- The single source-fixed candidate substitutes the *printed p15 values reduced modulo29*, in the red-centered clockwise spiral order, as the repeating 16-key schedule: **[22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]**. First black text rune starts at key index0, and key advances only on encrypted non-F plaintext. The authentic plus sign, exact GP29 alphabet, and F bypass are unchanged; no phase, sign, page restart, or collision fix is fitted. This is a deliberate hypothesis, not a demonstrated author instruction.

The strongest rival is that the p15 numbers are an illustration or supply an operand to a different cryptographic transformation. Previous reports already tested many unshifted static pads, affine maps, field keys and PRNG streams; the present question is the previously uncombined solved-page **F-interrupter**.

## Exhaustive original-cipher gate

At each ciphertext rune c with consumed-key cursor j, every exact inverse possibility is retained:

1. If c=0, plaintext F=0 is possible and the cursor stays at j.
2. If (c−K[j mod16]) mod29 is nonzero, that non-F plaintext is possible and the cursor advances to j+1.

States with the same cursor are merged because they have identical legal futures. No linguistic screening is used.

The original source has a legal inverse through **167** runes (p15 black139 and p16's first28). The maximum state count at any position is **three**. Before the next rune, only **cursor165** remains, so its next key is **K[165 mod16]=K[5]=1**. The unchanged ciphertext at p16 zero-based position28 is GP **U=1**. A non-F encoded branch would require plaintext value **zero**, forbidden by the F convention. The literal-F branch is unavailable because ciphertext is U rather than F. Consequently **all exact inverse branches vanish at continuous zero-based position167**, within p16. The decoder cannot produce a full interval of 168 original runes, much less decode the complete chapter. A disjoint holdout is moot for this architecture: the uninterrupted inverse is already impossible before it reaches one.

## Positive controls and reproducibility

The [read-only Node22/CommonJS single-file reproducer](../sims/lp2_p15_spiral_finterrupter_original_sft.cjs) loads the canonical 58-page GP29 corpus and physical ink annotation, asserts the original p15 black offset20, reproduces the authentic p56 **85/85** cipher and its real plaintext-F skip, enumerates **all** legal F masks on the unchanged original 1,883-runic target, and checks the original contradiction. It separately encrypts a **1,883-rune source-native plant** constructed from the actually solved p56 English GP plaintext and decodes its entire ciphertext. The plant has **22** literal F bypasses, **1,861** consumed keys and exact forward re-encryption of a complete inverse witness.

**[Windows Node22 PASS: run 45101848074](https://github.com/FlareZ123/liber-primus/actions/runs/45101848074)** independently executed the committed source and code on GitHub Actions. The actual original first impossible symbol was p16[28], with cursor165 and key1.

## Research boundary

Close Director #2347 for this frozen schedule and authentic F convention. Retain the genuine p15 Fibonacci-prime arithmetic as a proven numerical construction with no established cipher consumer. A separately source-selected key map, state machine, alternate segmentation, or external data remain outside the tested model. No plaintext was recovered, and tuning the failed phase/sign to fit ciphertext is not a justified successor.
