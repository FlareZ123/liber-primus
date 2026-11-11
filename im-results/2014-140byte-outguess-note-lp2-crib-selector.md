# The original 140-byte 2014 page-08 OutGuess note does not select an LP2 crib

**Agent 33, 11 November 2026. Evidence class:** exact independent historical-text identification and a bounded negative original-LP2 selector decision. **No unknown LP2 plaintext, source-selected key, new cipher operation, or continuation recovered.** Director [Issue #315](https://github.com/FlareZ123/liber-primus/issues/315).

## Exact historical source material

The authentic 2014 source image `08.jpg` is already a byte-extraction positive control in the repository: pinned OutGuess 0.4 extracted **140 bytes** on [successful run 42755426574](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574) ([extractor assessment](outguess-lp2-original.md)). The extracted text was located independently in two public historical/community copies:

- [Wulfic/Cicada3301-Liber_Primus, `data/outguess/page_08.txt`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/outguess/page_08.txt);
- [rtkd/iddqd, `lp_outguessed/08.txt`](https://github.com/rtkd/iddqd/blob/master/lp_outguessed/08.txt).

Both checked GitHub raw text files contain **exactly 140 ASCII bytes** and have identical **Git blob SHA-1 `b90936291c672a1ac80ad97b87c6dab9c6dce6ce`**. The byte-level details matter: the note begins with an empty line, includes blank lines between paragraphs, includes a space after the first cipher row's final `YR`, and ends with two line breaks following `3301`. These copies coincide with the original positive-control length and the historical on-screen text, although two copied archives are not separately author-signed artifacts.

The entire payload has only four functional elements: a `For those who have fallen behind` catch-up heading, a **56-character** uppercase alphanumeric cryptogram printed as two groups of fourteen two-character tokens, a `Good luck` closing, and the number 3301. The data contain **no page address, GP rune word, 2014 LP2 image number, offset, key identifier or cryptographic continuation instruction tied to LP2**.

## Existing original-era interpretation is complete

A [contemporaneous January 29, 2014 participant discussion](https://www.forums.unfiction.com/forums/viewtopic.php%40p%3D1028647.html) prints the same ciphertext and reports the successful **period-seven columnar transposition**, with key `1736254`. Applying it to the 56 alphanumeric characters yields the already known plaintext

`TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133`.

The decoded prose is a philosophical maxim and the following suffix names the next historical onion `q4utgdi2n4m4uim5.onion`; the terminal `9133` is not explained by that source. This was a contemporaneous **next-onion waypoint**, before the later LP2 release, and the historical decryption already accounts for why its character count is a multiple of seven. The reported key is a puzzle-specific transposition key for this 56-character string. It does not name any of the subsequent 56 unsolved LP2 pages or designate which of their symbols the maxim should occupy.

The tempting `56 cryptogram characters ↔ 56 unsolved LP2 physical pages` equality is insufficient as an address grammar. In particular, it selects neither (i) one page/interval for a GP-English crib, (ii) a rune-offset/word alignment, nor (iii) a ciphertext inverse and key clock. The number 7 is already accounted for by the solved transposition's width; transferring the seven-column permutation to LP2 is a separate unselected hypothesis.

## Director decision

**Close the 140-byte note as a source-selected LP2 crib candidate.** A player in January 2014 could use it to reach the next onion, but the complete note contains no instruction to place an English phrase onto later unknown LP2 ciphertext. The exact archival copies, a positive original OutGuess extraction, and the 2014 historical solve give a bounded source answer; no ciphertext crib fit, word scan, arbitrary offset search, or page-key tuning is warranted. This does not exclude an undiscovered authorially specified cross-stage reference elsewhere in the 2014–2016 record.

Related finite negative transfer of a different historical Vigenère key: [2014 text-guided LP2 gate](2014-text-guide-terminal-vigenere-gate.md). The note itself supplies no additional key-selection rule.
