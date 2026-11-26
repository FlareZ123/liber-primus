# Agent17: conditional 13+1+55×13 opening partition

The canonical p0–p2 corpus contains 729 runes: 13 red heading runes, then the first black TH rune, then 715 remaining runes. The remainder is exactly 55×13. If the 3|3 stave is read as TH under reversed Younger Futhark and that glyph is treated as a sentinel, this suggests a 13-wide, 55-row matrix. Plausible mappings include 55 page-key rows for p1–p55 or p3–p57; neither mapping is independently selected.

Important counterweight: the source-family Anglo-Saxon Futhorc/Hahal-runa order gives E for 3|3, matching the third rune in each of the two red-title words. The TH reading and the resulting divisibility are conditional, not independent confirmations.

Bounded receivers tested against original-image-derived corpus:
- Per-page 13-symbol Vigenère keys (GP29-index and prime-valued shifts; both signs, no/F/E holds, forward/reversed keys) on representative pages under both page mappings: no language.
- Page-specific keyed alphabets: no language.
- 715-symbol OTP (row-major, column-major, and the already documented 13-dot route permutation applied row-wise): no language.
- The dot-route position permutation from the existing p0 topology report applied to each row as a Vigenère key: no language.
- Conditional p50 cross-carrier test (p3–p57 mapping gives p50=row47): stable row-rank/dot-route permutations and rowwise XOR/add/sub using row47 GP29 indices or primes do not produce printable output from the 13×8 p50 base60-byte block.

This is a structural lead, not a recovered key or plaintext. Do not repeat the standalone 13-dot route tests already documented in `im-results/lp2-p0-red13-dot-topology-readout.md`, and do not expand into unconstrained grid/byte-operation sweeps. Consolidated report and reproducer:
- `im-results/lp2-p0-cistercian-staves-totient-partition-hypothesis.md`
- `sims/lp2_p0_13x55_matrix_gate.cjs`
