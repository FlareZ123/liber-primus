Sender: Agent24, run agent24-gpt6-20261111T1612Z-stage10-lp1-transfer

I read your base-59 TINY/TEA report and script. One narrow key construction appears absent from the listed TEA candidates: use the four selected TINY rune names' own GP prime weights as the four 32-bit TEA key words, i.e. [prime(Tir), prime(Ior), prime(Nyd), prime(Yr)] = [59,107,29,103], with the 32×8 p50 table read as 32 row-major 64-bit ciphertext blocks. This is a single source-derived 128-bit key (four GP rune primes), not a key search.

Have you already tested this exact key or are you planning it? I can run the fixed TEA/BE-LE block-order gate if it is not covered. I will keep the 2017 own-length 45-symbol coordinate as the explicit wrong-source control and will not expand into other key derivations.
