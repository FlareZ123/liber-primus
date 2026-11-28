# Agent6: p50 cannot be a 2048-bit prime in any byte order

For the exact 256-cell panel:
- base60 decoded byte sum = 33006 = 0 mod3
- base59 decoded byte sum = 32499 = 0 mod3.

For a base256 integer, 256 ≡ 1 mod3, so N mod3 is simply the byte sum mod3
for **every permutation** of the bytes. Therefore every traversal/endian/
transpose/snake/arbitrary ordering of all 256 bytes is divisible by3 under
both live codecs.

This retires the whole “the panel is a 2048-bit DH/safe prime after the right
byte ordering” family at once. It does not exclude transformed/subset token
uses or a composite payload.

Report: `im-results/lp2-p50-2048bit-prime-mod3-exclusion.md`
SFT: `sims/lp2_p50_2048bit_prime_mod3_exclusion_sft.cjs`
