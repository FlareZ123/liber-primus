# Signed 2016 thirty-two-word register / original p50 32×8 rows: fixed direct address probe

**Agent6, 21 November 2026. Frozen before inspecting selected numeric values.** Source is the exact signed 2016 4gq25 payload and original physical pp49–51 32×8 base60 table, unchanged.

The signed payload has 43 alphabetic words. Its clearly separate instructional/warning coda is `Seek and you will be found. Good luck. Beware false paths.` (6+2+3 = **11 words**). The remaining **32 words**, in original document order, are the greeting `Hello`, the uninterrupted 29-word argument from `The path...` through `...the direction`, and the explicit signed verification epilogue `Verify OpenPGP`. This proposal treats the 11-word coda as distinct because the source p50 successor map contains an independently observed 11-cycle; **the coda exclusion is a conjecture, and the author does not explicitly command it**.

The table prints exactly **32 rows by 8 columns**, so one literal 32-word to 32-row one-to-one association exists. For each row `i=0..31` read the corresponding original signed word `w_i` in source order. Calculate its standard Cicada GP29 ordinal sum `S_i` using longest-match rune transliteration, and select original table column `S_i mod8` (zero-based). Read the single printed base60 byte `b[i][S_i mod8]`, without any other phase, password or row permutations, into 32 source-order bytes. Also take the 32 residues `b mod29` as a direct GP29 rune channel. Only these two direct channels are considered: unmodified byte ASCII and unmodified GP29 text. **Success** requires an unmistakable contiguous human-authored instruction or source address, plus independent ciphertext validation; 32 random-looking bytes/runes is a negative. Do not fit the row mask, try other sums or recombine elsewhere to rescue failure.

The weakest premise is the noncontiguous exclusion of the coda. The original source says `Its words` refers to *Liber Primus*, not the 2016 message itself. A random 32-word subset and table dimensions will often agree, so a successful readout is required to justify treating this as an intended route.

## Source-locked original readout

Original 32-row scheme was frozen in commit `3af1c7c6f9efbba1bad1d97c1fa25740f0ff72f0` before the original table selection. The 32 retained words were exactly `Hello`, `The` through `direction`, `Verify`, `OpenPGP`; full source count43 and 11 excluded coda words confirmed. The source-ordered GP0 modular column numbers (zero-based) are:

`[5,4,7,7,4,1,7,4,6,5,6,1,4,1,1,4,6,4,0,2,7,1,4,6,0,2,3,6,4,2,3,3]`.

The selected original 32 bytes are, hexadecimal, **`edf757853654506aa9906fdc533f8f0d48f57d0ef8e490aa00d13d3390c4d6e6`**. Only **12/32** bytes represent directly printable ASCII (ASCII range32..126); unmodified ASCII starts `ED F7 57 85 36 54 50 6A`. Direct GP29 residues print:

`CSFBAEYOEMAEAABAECIAPXPNXTAEEAAEFGOOEEAOEJIA`.

Neither fixed readout is an intelligible instruction or destination. The first-party message does not select excluding eleven intervening coda words, so this dimension-fitting match alone is weak.

**Bounded decision: negative** for direct one-signed-word-per-p50-row GP0-mod8 column selection. Do not vary the coda exclusions, word-number measure, endian order, reading direction or add a decoder without a new independent instruction. This does not change the known true 29+11+2 source segmentation, nor any existing p50 successor-graph structural result.
