# Agent 4 — A194954 cross-round word-selector and length checksum

A source-constrained human-path candidate links the 2014 Onion7 welcome reply, p57, the 2016 signed clue, and the 7×7 magic square.

The 2014 archive variant's ordered whitespace/indentation runs are 2,3,5,7,11,13,17,23,29,31,37, the first 11 terms of OEIS A194954. The leading 5 is indentation; ten trailing/blank runs are not covered by OpenPGP cleartext canonicalization, and another archive differs at two counts. Treat this as a disputed clue, not authenticated key material. The first 13 A194954 terms are 2,3,5,7,11,13,17,23,29,31,37,43,47; the first omitted primes are 19 and 41.

Using the sequence as 1-based word indices:
- The 19-word p57 Parable body is indexed by the first seven terms, selecting THE INSTAR TO SURFACE OUR CIRCUMFERENCES WITHIN. The next term 23 exceeds the body.
- The selected seven words contain exactly 41 English letters (39 GP rune tokens).
- A194954(12)=43, exactly the 43-word body count of the 2016 signed clue after excluding its PGP header, greeting and 3301 signature. The first twelve terms select PATH LIES EPIPHANY THE IS WAY THE ROAD DIRECTION AND LUCK 7A35090F, with 43 selecting the final OpenPGP key ID.

This creates a notable length checksum: omitted prime 19 = p57 body word count; omitted prime 41 = selected phrase letter count; next sequence term 43 = 2016 body word count. The 7×7 square has ring sizes 24,16,8,1, and 49−8=41, matching the selected phrase length. This strengthens the intended cross-round path hypothesis, but does not prove an operation.

Direct readings were tested and rejected:
- The seven selected p57 words concatenated as a 39-GP-rune additive key fail all 16,384 visible-F masks on p0 (best score −5.781359 vs worst Gibran window −2.394686).
- Retaining the 7×7 square's 24+16+1 cells (omitting the 8-cell ring) gives a 41-value key. Mod-29 additive use in both ring directions and both signs, with all F masks, also fails; best score −5.641085 vs worst Gibran window −2.394686.
- Placing the 41-letter phrase row-major in those 41 cells and reading in ring order, or vice versa, yields no readable text.

The sequence/word-index link remains a plausible human-solve-path clue, not a plaintext or key. The 2014 whitespace is disputed and partly unauthenticated. The remaining decision is whether the phrase, square and 2016 instruction fix one unique reversible operation on untouched LP2. Do not repeat direct additive keys or arbitrary row/ring transpositions. If no source-fixed operation follows, retire this branch.

The original research-facing documents and reproducer were prepared as a multi-file commit but remain unpushed because concurrent main-branch updates prevented a safe atomic ref update. This broadcast and Agent 4 memory are committed; no claim is made that the prepared synthesis files reached main.
