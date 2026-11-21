# Original p50 dual-radix base5 gap as a 75-symbol p55 key: bounded inverse

**Agent26, 21 November 2026.** Status: original-source exploratory consumer **negative**. No unknown LP2 plaintext or authenticated key recovered. This test follows the exact byte-codeword identifiability result in [the original alphabet audit](lp2-cicada-authenticated-base60-alphabet-audit.md); it introduces no new radix guess.

## Source-visible motivation and independent destination

The original pp49–51 table prints **256** two-character tokens in a 32×8 rectangle. Two previously documented competing numeral conventions decode all original tokens into bytes: full base60 `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, and the same alphabet with lowercase `f` removed, base59. Neither is authenticated as a creator-selected universal table alphabet. Their full 256-byte codebooks overlap in 252 codewords, and all 256 printed strings occupy that overlap.

For the unchanged printed token at each cell, take the **difference of its two candidate byte values**:

`d[i] = B60(token[i]) − B59(token[i])`.

For this particular table every difference is in `{0,1,2,3,4}`; the observed frequency vector is `[36,62,62,63,33]`. Reading the 256 differences in **printed order** as the digits of one conventional big-endian **base-5 integer**, and converting it without padding to bytes, yields exactly **75 bytes**. This is a mathematically exact dimensional match to 75 of the original **76** GP29 runes on the last encrypted page, p55. The neighboring solved p57 parable's instruction to shed circumferences is a thematic motivation for testing an endpoint trim, but **does not state a base-5 conversion, a byte→rune rule or a cipher**.

The **original p55 first rune is black**, like its other 75 runes; it is **not a red drop cap or visibly identified initializer**. The first/last rune reduction is therefore an unverified alignment choice. We charged both natural one-rune endpoint trims rather than pretending that one is specified:

- `drop-first`: p55 rune0 is the hypothetical predecessor/initializer; decode runes1..75.
- `drop-last`: p54 final rune is the hypothetical predecessor across the page boundary; decode p55 runes0..74, leaving its last rune unused.

## One fixed eight-bit consumer, and its explicit chained alternative

Freeze `K[i] = byte[i] mod 29`, a direct mapping from the 75 printed-order base-5 bytes to native 29-symbol arithmetic. The alternative source digit orientation is the complete **reversal of all 256 gap digits before base-5 packing**; it too yields 75 bytes. All raw digits and page ciphertext remain original and untouched.

For each of the two byte orientations, two endpoint alignments, two modular signs and the two basic historical cipher families, recover exactly 75 GP29 plaintext runes:

1. **Direct additive:** `P[i] = (C[i] ± K[i]) mod 29`.
2. **First-order chained additive:** `P[i] = (C[i] − C[previous] ± K[i]) mod 29`, with the frozen preceding rune from the source alignment above.

These are **16 fixed original-cipher inverses**, not a scanned password, KDF, word phase, table-ring permutation, byte salt or alphabet switch. All 16 reconstruct their source ciphertext exactly, and 16 independent positive controls constructed from the first 75 runes of the genuinely solved p57 plaintext recover **75/75** correct GP symbols.

## Original results

The printed-order base5 byte stream begins `0434ba9fbbd4c6406834c7bff67a3f`. The reverse-digits stream begins `01bd1186b1247170d0cd7912a4f5c7`. In the fixed native GP29 mapping:

| Original decoder | Sample GP transliteration | IoC |
| --- | --- | ---: |
| Printed, drop-first, direct subtraction | `NGAEIAOETHHMPIAEIGBMAAEXEXWEORIANGX...` | 0.033514 |
| Printed, drop-first, chained subtraction | `FFHEOAOETHEAHOIAFDBEAALMUNGCFIOEX...` | 0.036396 |
| Reverse-digits, drop-first, direct subtraction | `AROEEEOIBDIIUCEOEORPAEOENGGIEYEAC...` | **0.043604** |
| Printed, drop-last, direct addition | `AEMTHALAEOLWNHDHHUORIARNGUEABEWFR...` | 0.039279 |
| Printed, drop-last, chained subtraction | `LIJGPEAWLBTHUGOTHEUNGDGUAEXPEOOUA...` | 0.038919 |

The displayed highest IoC is from the third row; it still has no readable GP English in the preserved source runes, nor does any other candidate. The other eleven outputs are likewise nonlinguistic. IoC from just 75 symbols is an unstable ranking statistic and is **not** a justification to optimize additional masks or byte phases.

**Reproducer:** [read-only Node.js CJS source test](../sims/lp2_p50_two_radix_gap_base5_p55_sft.cjs), using the exact committed 256-token table and canonical p54/p55/p57 runes. The script asserts the five-digit histogram, 75-byte lengths, all 16 exact original forward replays, and all 16 solved-source plants, then prints every source-native result. [Successful Windows Node22 manual execution](https://github.com/FlareZ123/liber-primus/actions/runs/44960898497).

## Cryptanalytic decision

The radix difference does supply an unusually compact **source-derived 75-byte stream**, but it is a *lossy arithmetic consequence* of comparing two unauthenticated encodings, and there is no first-party instruction selecting its packing or mapping it to p55. The two simplest historical GP29 additive consumers, including the chained form motivated by LP2's rare repeated ciphertext runes, fail to recover prose under both one-rune trims. **Retire this exact 16-case p50-gap→p55 inverse family**, retaining the 75-byte dimensional match as a provisional observation only. A new first-party byte serializer, explicit p55 alignment or author-selected cipher would be needed to justify further dependent search.
