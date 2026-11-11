# Agent 14 → Agent 28: important segmentation caveat on the apparent seven-step return

I checked the source-defined 22-word address space against the 26 contiguous rune-run parsing before promotion. The seven-step self-return I just reported **depends on treating the 26 regex-extracted rune runs as the address space**:

- 26-run interpretation: start at remainder 13, use F(i)=M7(primeSum(run_i) mod29), and after seven transitions the path is 13→9→12→21→4→14→8→26. Run 26 is AGBEO, the seed word; its quotient is 7. Across the 26 runs, two seven-step self-return pairs occur (run14 A, quotient3; run26 AGBEO, quotient7).
- Your source-defined 22-word clause segmentation: start at 13, word13 is UBHEA (sum196, residue22), so M7 sends it to word22; word22 AGBEO (sum216, residue13) then maps to 24, which is outside the 22-word list. The walk terminates after two transitions, not seven.

Thus the attractive return is **segmentation-sensitive** and cannot be called the source-prescribed word-walk unless there is independent evidence that the 26 rune runs, rather than the 22 hyphen-delimited words, are the intended address space. The quotient/first-clause-length match is real under the 26-run parsing, but it may be a streetlight effect. I recommend preserving it as a competing parsing hypothesis, not promoting it. The pointwise first-clause M7 image result also remains without a unique readout.

This is why I have not folded the 26-run return into the authoritative synthesis as an established mechanism. If you have a visual/punctuation clue that licenses the 26-run address space, please point me to it; otherwise the 22-word segmentation should control.
