# Red-ten-dot terminal markers: p49/p55 original shared-pad inverse is negative

**Agent28, 15 November 2026.** Original-source cryptanalytic decision, with fully tested native-GP English positive controls. **No unknown LP2 plaintext, author key, decipherment operation, or final destination was recovered.** The hypothesis is conditional on a source-selected pair of pages and a shared additive GP29 pad.

## A source-visible human-puzzle route

The original physical LP2 p49 (`66.jpg`) and p55 (`72.jpg`) each end their original rune text at a conspicuous **red ten-dot terminator** in a matching floral page frame. P49 contains **66** GP29 ciphertext runes and immediately introduces the 32×8 numerical table; p55 contains **76** GP29 ciphertext runes next to the visible tree and moth, immediately before the two solved pages. The printed device could signal reuse of a cryptographic register, or simply be a repeated book design. **There is no surviving first-party instruction choosing pad reuse or a word clock.**

The real complete pre-table sentence ends on p49 and contains **138 runes**: the last **72** of p48 plus all **66** of p49. This detail matters, since concatenating all 271 p48 runes with p49 falsely treats a 337-rune span as a sentence. The corrected exact original source is fixed in the reproducer.

## Key-cancelled cryptanalytic test

Under the proposed shared arbitrary additive GP29 key K at a fixed alignment, both C_A[i]=P_A[i]+K[i] and C_B[i]=P_B[i]+K[i] (mod29). Their original ciphertext difference C_A[i]-C_B[i] therefore equals P_A[i]-P_B[i], **regardless of all secret pad bytes**. This tests a real recoverable property without fitting K to candidate plaintext.

The score freezes a source-native GP29 English-difference distribution q[d]=sum_x f[x]f[(x-d) mod29] using the first 100,000 GP-normalized Shakespeare runes, with independently established single-rune ING and IO spelling. LLR=sum_i ln(29 q[(C_A[i]-C_B[i]) mod29]) favors native GP29 English-pair differences when positive, uniform differences when negative. The common-key hypothesis also requires the printed red-mark alignment to be distinguished from arbitrary rotations of p55.

| Original alignment | N | Original pair LLR (nats) | Equal GP29 positions | Rank among all 76 p55 cyclic shifts |
| --- | ---: | ---: | ---: | ---: |
| p49 all 66 against p55 first 66 | 66 | **-1.93409** | 3 | **44/76** |
| p49 all 66 against p55 last 66 (red-end aligned) | 66 | **-1.30430** | 1 | **33/76** |
| Full 138-rune pretable sentence first 76 against p55 all 76 | 76 | **-2.07144** | 2 | **47/76** |
| Full 138-rune pretable sentence last 76 against p55 all 76 | 76 | **-1.62551** | 1 | **35/76** |

All four original differences score negatively. The strongest source-aligned red-end hypothesis ranks only 33rd out of the 76 possible original p55 rotations. No key-invariant evidence distinguishes the visually meaningful register alignment.

### Independent complete-pair positive plants

For each frozen original length, take **250** held-out window pairs from each of GP-normalized Shakespeare, Gibran and Emerson. Encrypt both passages with *the same* arbitrary 29-residue additive pad. The program asserts exact equality of the encrypted-pair difference likelihood and its known native-English plaintext-pair likelihood at every sample. The numbers of source-native planted pairs scoring at or below the original ciphertext score were:

| Frozen original alignment | Shakespeare (of 250) | Gibran (of 250) | Emerson (of 250) |
| --- | ---: | ---: | ---: |
| p49 / p55 first66 | 14 | 8 | 7 |
| p49 / p55 red-end66 | 21 | 21 | 13 |
| Pretable first76 / p55 | 16 | 9 | 9 |
| Pretable last76 / p55 | 26 | 17 | 13 |

These are conditional finite-language controls, not an unconditional probability of authorship or a universal exclusion of a shared key. Native GP English was independently normalized using the solved LP1 register; the original unsolved pages could contain a separate language or a cipher intermediate. The windows overlap; their counts are not independent hypothesis probabilities.

## Decision and reproducibility

**Retire the natural same-phase p49-to-p55 two-time additive GP29 pad interpretation** for two ordinary GP29 English passages. The repeated ten-dot red mark does not supply a privileged shared-key register, original unknown plaintext, or a recovered key. Alternative fixed source-directed operations, non-English registers, and stateful ciphers remain untested. Do not optimize cyclic offsets after this negative unless an original clue selects one.

The [standalone Node22 CommonJS SFT](../sims/lp2_p49_p55_sharedred10_twotime_sft.cjs) fixes all source page lengths, all four scores, every 76-way cyclic rank, and 4×3×250 exactly key-cancelled native-English positive pairs. **It passed on original repository inputs on Windows in [Actions run 43774640354](https://github.com/FlareZ123/liber-primus/actions/runs/43774640354).** Earlier [red119 chapter-pointer shared-key tests](lp2-red119-sourcepointed-two-timepad-original-gate.md) are separate experiments on p3→p33 and p39→p40; they do not cover this marked p49/p55 pair.