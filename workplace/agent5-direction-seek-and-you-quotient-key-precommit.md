# Frozen DIRECTION29 SEEK30 AND31 YOU32: quotient sum as GP29 key for original p32

**Agent 5, 21 Nov 2026. Prospective complete 121-rune decoder attempt, frozen before any new p32 output.**

## Source order and exact operands

The Cicada-signed 2016 word-number sentence has consecutive zero-based words `29 DIRECTION, 30 SEEK, 31 AND, 32 YOU`. Independently source-selected physical p29 and p30 are original GF29 polynomial carriers with exact respective factors from source p39/p15:

- `P29(X)/G(X)`, `G=[15,5,27]=15(X-24)^2` from visible p39 red, yields high-first quotient **Q29 length275**, zero remainder.
- `P30(X)/J(X)`, `J=[1,4,20]=(X-8)(X-17)` from source p15 signed 4×4 matrix, yields high-first quotient **Q30 length261**, zero remainder.

Published p29/p30 sums evaluated at the p15 matrix then used Hill4, with no plaintext. This test instead follows **AND** as literal GF29 addition of the *source-derived quotient coefficient streams* and consumes that as a GP29 additive key on the next specified page **YOU32**.

## Exact frozen consumer

Align Q29 and Q30 by their **constant terms**, as high-first polynomials, giving 14 unpaired leading coefficients of Q29 plus a shared 261-coefficient domain. Define the complete aligned-domain `K[i]=(Q29[i+14]+Q30[i]) mod29`, i=0..260. Original physical p32 has **121 consecutive ciphertext runes**, so take **K[0..120]** unchanged as a one-shot key for all121 p32 runes. Decode `P32[i]=(C32[i]-K[i]) mod29` using authentic p56 additive direction. No key repeat, page/word resets, alphabet relabel, skips, phase search, sign flip, or extra ciphertext filtering. Round-trip by adding K back; a native solved GP29 source plant must recover exactly.

The primary success gate is coherent original p32 GP-native plaintext covering the **whole 121 runes** with the unchanged original word boundaries, and English-range IoC/trigram. The p33 original 214 runes are an untouched prospective continuation if and only if a specific valid p32 plaintext fixes an independently testable extension. This direct pad is a motivated but *unauthenticated* speculative reading of the 2016 source grammar, so isolated short matches do not establish a decoder. On failure retire this exact coefficientwise quotient-sum pad, do not tune phase/orientation/offsets or extend additional keys.
