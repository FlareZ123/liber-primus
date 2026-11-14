# A five-numbered-passage book code for the 256-cell numerical table

**Agent 45, 14 November 2026. Classification: original-input direct decipherment attempt, negative for the specified source-coordinate mechanism.** This test recovers **no unknown LP2 plaintext, authentic creator key or destination**. All original 12,956 GP29 ciphertext runes remain unsolved.

## Plausible intended solve path

The original pp33–39 cuneiform headings give sexagesimal **1033** and **3301**. Five explicitly printed red numbers 1–5 introduce these source-verified rune passages:

| Numeral | Original source | Rune length |
| --- | --- | ---: |
| 1 | p36 [99,238) | 139 |
| 2 | p37 [0,91) | 91 |
| 3 | p37 [91,189) | 98 |
| 4 | p37 [189,228) + p38 [0,57) | 96 |
| 5 | p38 [57,186) | 129 |

The later pp49–51 table prints 256 two-character entries using the conventional radix-60 alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx. In all 256 authentic cells, the first character represents 0–4, the second 0–59. Both ranges fit a literal **passage index × rune-position** book code into these five numbered passages. They all contain at least 91 runes, making the lookup complete without out-of-range exceptions.

Let original token i have radix-60 digit values x and y. Let S_x be original numbered passage x. Define source key rune K_i=S_x[y]. This gives a completely reproducible 256-symbol GP29 candidate key. The **unsupported premise** is treating the printed digits as a coordinate rather than as the base60 numeral itself. Since every original byte is 0–255, high digits 0–4 follow automatically from ordinary base60 encoding, and their range match to five passages is not independent evidence of intended author design.

## Original-input readouts

All 256 original tokens yield valid coordinates; the five passage selection counts are **[60, 58, 65, 56, 17]**. The table contains 161 distinct byte values, the coordinate-selected source key uses 28 distinct GP runes, and its IoC is **0.0393995098**. The key's first 32 GP transliterations are:

    D S W M H I A J E J R EO OE A J A U H AE I R F I T A H O OE P X D NG ...

To test whether the **table itself encodes text** using the lookup, take the authentic source byte B_i=60x+y, reduce it modulo29 as a GP cipher rune, and compute both historical Vigenère directions:

    Dminus[i] = (B_i - K_i) mod 29
    Dplus[i]  = (B_i + K_i) mod 29

The minus relation is equivalent to (2x+y-S_x[y]) mod29 because 60 mod29=2. Neither model fits the original table or target phrases by adjusting a parameter.

| Original 256-symbol register | GP29 IoC |
| --- | ---: |
| Table byte residues | **0.0371629902** |
| Selected source-rune key | **0.0393995098** |
| Table minus selected rune | **0.0382046569** |
| Table plus selected rune | **0.0374080882** |

Neither original decoded output is readable GP29-native prose. For one direct key-transfer check, reuse this 256-rune lookup as a periodic additive mask on four source-nominated recipients, with phase zero and unchanged original positions. All original outputs remain nonlinguistic.

| Original receiver | Runes | Minus-key GP IoC | Plus-key GP IoC |
| --- | ---: | ---: | ---: |
| p55, final unknown page | 76 | 0.0308771930 | 0.0371929825 |
| p54–55, final visual chapter | 308 | 0.0349634079 | 0.0345403782 |
| p0–2, first visual chapter | 729 | 0.0339996081 | 0.0345988031 |
| p32, native 11×11 runic square | 121 | 0.0389807163 | 0.0342975207 |

Short-page scores have significant sample variance; they cannot exclude other operations or non-English targets. The same exact original-input decoder forward-reencodes every GP rune. A positive plant using independently clear, known p57 GP text and the actual 256-coordinate lookup recovers **256/256 original-format symbols**, verifying the inverse can successfully recover a language signal when this mechanism genuinely produces one.

## Conclusion and limits

The 256-cell numeric table and five red-numbered passages admit a **complete, finite, source-only codebook lookup** that a human solver could reasonably attempt. A literal recovered-text reading of that lookup, its table-residue Vigenère differences, and its simple direct page recipients are **negative**. No surviving signed instruction explicitly selects this book-code interpretation, a consumer, a key schedule or a second cipher layer. The verified GF29 H/G factors of the numeric table are unaffected. An independently supplied target/consumer or an authentic instruction to use passage coordinates would materially change this decision.

**Reproduce:** The standalone [Windows/Node CommonJS original-source SFT](../sims/lp2_fivepassage_base60_bookcode_original_sft.cjs) uses the canonical LP2 corpus and printed 256-byte table, pins the canonical byte SHA256, all original passage boundaries, coordinate and symbol populations, six direct source reconstructions, and a 256/256 native solved-page positive plant. The original ciphertext and resources were not modified.