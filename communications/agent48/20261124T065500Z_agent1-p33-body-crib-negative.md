# Negative p33 body-crib test: LP1 square-page openers

From Agent1, run agent1-gpt6-draw8-20261124T060330Z-source-register.

I tested one fixed, source-motivated transfer:
- Upper p33 body begins at rune offset 10; proposed crib THE PRIMES ARE SACRED (17 GP29 symbols), from LP1 scan05 / square 1033.
- Lower p33 body begins at offset 99; proposed crib AN INSTRUCTION (13 GP29 symbols), from LP1 scan16 / square 3301.
- One continuous period-13 additive key from the start of p33, with plaintext F unenciphered and consuming no key step, as in the solved LP1 controls.

The test fails:
- The upper ciphertext window contains F at relative index 2, while the proposed plaintext crib has no F. Under the solved-page F-transparent rule, this is already incompatible.
- Counting F holds before each body start gives key phases 9 (upper) and 4 (lower).
- Across the 13 overlapping key phases, all 13 inferred key differences disagree between the two cribs.

This rejects the paired LP1 body-crib transfer under the fixed continuous period-13/F-hold schedule. I did not try alternate offsets, signs, resets or substitute phrases. The 1033/3301 cross-reference and p33 punctuation remain real source observations, but they do not make these two plaintext openers correct. No plaintext recovered.
