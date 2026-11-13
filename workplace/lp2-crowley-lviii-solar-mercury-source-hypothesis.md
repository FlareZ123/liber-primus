# PARABLE-666 and Agrippa's planetary squares: a bounded original-cipher decision

**Agent 38, 13 November 2026. Status: exploratory historical operation lead, directly tested and not plaintext-bearing.** No creator-selected key, recovered LP2 plaintext, or continuation destination is established here. The full-book authoritative position remains [results/README.md](../results/README.md).

## Why a 2014-era solver might consider the source

Cicada's 2013 path used Aleister Crowley's *Book of the Law*. Crowley's pre-2014 *Liber LVIII / An Essay upon Number* prints the traditional planetary-square values **Sol 6,36,111,666** and **Mercury 8,64,260,2080** together. This supplies an independently published historical convention translating **666** to the **total of a 6×6 Sun magic square**, and **64** to the **number of cells in an 8×8 Mercury magic square**. Its source is [Liber LVIII](https://hermetic.com/crowley/libers/lib58); the full Mercury square is independently reproduced from Agrippa's [Book II, chapter 22](https://esotericarchives.com/agrippa/op2.htm) at [this numerical transcription](https://esotericnotebook.com/planetary-magic/planets/mercury).

Previously established **original-solved** LP2 p57 PARABLE units have GP-prime sums **449,1259,1031,1229**, with one-based ordinary prime ordinals **87,205,173,201** summing to **666** ([original-source SFT](../sims/lp2_p57_primeordinal666_source_sft.cjs)). The solved p56 heading GP-prime sum **311** is the 64th ordinary prime and its displayed 128-hex SHA-style target is 64 bytes. The 2014 release has 58 physical pages; comparing 58 to *Liber LVIII* is only an additional speculative mnemonic, not an authenticated reference. No original LP2 source commands a planetary-square step.

A prior **conjectural** p57 modulo449-to-page/line grammar selects untouched p36 line1 + p13 line3 + p33 line1, exactly **23+23+18=64** original runes, whose GP-prime sum **1020+1229+920=3169** is ordinary prime number449 ([source report](../im-results/lp2-onion7-133-331-p13-line3-primesum.md)). This 64-rune string makes the Mercury 8×8 square a determinate, original-cipher operand under that *unproven* addressing premise. The 64-glyph register was selected retrospectively and its coincidence with Mercury's 64 cells is **not** independent source authentication.

## One original-cipher consumer, fixed without fitting plaintext

Use Agrippa's historical row-major Mercury square, normalised 1..64 to zero-based offsets:

\`\`\`text
 8 58 59  5  4 62 63  1
49 15 14 52 53 11 10 56
41 23 22 44 45 19 18 48
32 34 35 29 28 38 39 25
40 26 27 37 36 30 31 33
17 47 46 20 21 43 42 24
 9 55 54 12 13 51 50 16
64  2  3 61 60  6  7 57
\`\`\`

For the source-ordered 64-rune sequence, apply its square as a permutation of source positions (and its inverse), including only the eight physically natural dihedral symmetries of the square. Eight resulting keys are distinct. Repeat each transformed key over the **unmodified original 76 p55 runes** as an additive GP29 keystream, both arithmetic directions. These are 16 directly reversible candidates with a 95/95 solved-p57 *synthetic plant* check; such a plant does **not** certify any key as authentic.

**Original-input result:** the 16 p55 IoCs range from **0.029473684211 to 0.037894736842**, against **0.037894736842** on untouched original p55. The best is the original IoC itself, and its candidate starts \`EISPOEEANGNEOAYEOHAERNIANLTHIAXJ...\`, with no source-authenticated or recognizable plaintext. The straightforward eight magic-square-only source64 re-orderings also do not read as coherent GP prose. There is no key recovery.

The original p49–51 table really is **32×8 = four 8×8 grids**, an independent physical format that could invite the same historical Mercury square. However, interpreting the canonical base60-derived 256 bytes modulo64 produces **36,40,40,40 unique residues per successive 8×8 block**, respectively, instead of 64 unique values in any block. Thus the literal four untransformed Mercury-square interpretation fails; no claim is made about transformed bytes or hidden permutations.

Full read-only, [original-source Node.js single-file reproducer](../sims/lp2_agrippa_mercury64_parable_original_sft.cjs). It asserts canonical source inputs, the historical square's row/column sum260, the original 64-rune addresses, all 16 exact source inverses, all positive plants, and the original table residues. The key derivation and decoder are fully enumerated, with no fitted phases, cribs, or arbitrary word search.

## Research decision

The source literature genuinely gives a *human-recognizable possible operation* for 666 and 64, but the original puzzle has not selected that literature or instructed how to read a planetary square. The original p55 direct-key test is negative under this precise consumer, and no new plaintext was recovered. Do **not** enlarge this into planetary-alphabet/KDF/phase sweeps on the strength of the numeral overlap. Reopen only if a newly recovered Cicada-authenticated clue points to Sol/Mercury, their classical magic squares, or a determinate use of the 64 selected GP symbols. A successful next route must recover authentic unknown plaintext with a reversible decoder, not merely more numerical correspondences.
