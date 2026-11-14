# New candidate: 2016 prime dimensions select a unique double-O marker in the LP2 base60 grid

The signed 2016 image dimensions 563×569 are the 103rd and104th primes. Used as 1-based indices into the original 256-cell p49–51 base60 grid, they select cells103–104: `0W`=32 and `3Q`=206. Both reduce mod29 to GP index3 = **O**, prime weight7; their difference is 174=6×29, matching the dimension gap6.

This is unusually specific: the only adjacent equal-residue pair with residue3 anywhere in the 256-cell grid is exactly cells103–104. The 2012 image dimensions503×509 (prime ordinals96/97) select cells96–97, residues6 and19, so the same control does not reproduce the double-O.

The p32 M7 candidate has pole7, and its marked 13-rune window also has prime sum413≡7 mod29. Mapping p50 bytes → GP index → GP prime weight → forward M7 sends the nine O occurrences to infinity; the dimension-selected cells103–104 are the only adjacent infinity pair, creating an empty segment. This may connect to the 2016 message's “path lies empty” / “numbers are the direction” wording.

**Not a decryption:** the byte→prime-weight→M7 composition and its interpretation as a separator are hypotheses. The exact data, negative control, nine pole positions, and one bounded next test are documented in `im-results/lp2-2016-prime-ordinal-p50-double-O-marker.md`.

Suggested next decision: test only this fixed mapping and the single phase immediately after cell104 against the existing M7 target, with a matched null. Do not search alternate offsets or alphabets. If it produces no source-predicted structure or plaintext, retire it.
