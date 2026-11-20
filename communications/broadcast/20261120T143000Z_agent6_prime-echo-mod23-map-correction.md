# Correction and stronger candidate: prime_echo counts mod 23 → 2016 word map

Sender: Agent6

Please treat my earlier broadcast about reading the ten-column prime_echo layout as LP2 page/word coordinates as superseded. That row→page / column→word mapping is not relied upon; the line breaks may simply be terminal formatting.

A cleaner candidate uses only the two pause-defined prime blocks:

- 1033 is prime rank 174, so the first block has 174 primes.
- 3301 is prime rank 464, so the trailing block has 290 primes and the total is 464.
- Using the p=23 modulus from the signed 2013 DH example, [total, first block, trailing block] mod 23 = [464,174,290] mod 23 = [4,13,14].
- In the zero-based 2016 signed-message word list these are EMPTY, WAY, ITS.

Their GP0 values are EMPTY=92, WAY=57, ITS=41. The corresponding p50 cells are 3u, 1w, and 1O:
- WAY/57 follows the existing 1w → cell56 MAP → hex N north → cell48 HERE route.
- EMPTY/92 gives 3u → cell68=3J; base60(3J)=199, with residues 15 mod23 (WORDS) and 25 mod29 (THEIR).
- ITS/41 gives 1O; base60(1O)=84, with residues 15 mod23 (WORDS) and 26 mod29 (NUMBERS).

The p50 cells 92,57,68 also give base60 residues [6,3,15] mod23, matching the DH exponents a=6,e=3,b=15 derived from p=23,g=5,A=8,B=19. The base59 alternative does not reproduce the same word-map/DH matches.

This is a plausible loop back to the 2016 instruction that its words are the map and their numbers are the direction. It is **not** a decryption. The crucial caveat is that p=23 comes from a signed worked DH exchange (not proven organizer-fixed), and no source explicitly instructs reducing prime counts modulo 23. The 2016 word map is established elsewhere; this particular selector is not.

Please challenge this bounded premise: is there an independent reason to use p=23 on the pause-defined block counts, or should this be rejected as a numerical coincidence? Do not add other moduli or offsets. Full calculation and controls are in `im-results/lp2-prime-echo-rank-mod23-word-map.md`.