# Source-selected 2014 square keys fail the authentic prime-totient decoder on table flanks

**Classification (11 November 2026):** direct cross-track cryptanalytic challenge on original LP2 physical p49 and p51, with a complete six-bit exception mask and an independently authenticated p56 inverse. All tested candidate keys fail to yield plaintext. Historical numbers identify candidate starts, not verified encryption instructions.

## Candidate solve path and genuinely unseen target

The original LP2 32×8 byte table occupies **physical p50**, with precisely **66 ciphertext GP runes on p49** immediately before it and **92 ciphertext GP runes on p51** immediately after it. The central table consumes **zero GP runes**. Physical p56 independently proves a genuine cipher family: one shifts a rune by consecutive prime totients, \(\varphi(p_j)=p_j-1 \pmod{29}\), and its one special **F** is literal and consumes no prime.

Two older 2014 Onion7 source artifacts provide independently visible candidate numbers: OpenPuff's historical **5×5 magic sum 3301** and **7×7 magic sum 1033**, respectively **prime(464)** and **prime(174)**. The solved p57 red PARABLE heading has prime-weight sum **449=prime(87)**. The already verified p56 first-prime origin is the control, while reading 3301 literally as a *prime ordinal* is a second possible, explicitly labeled interpretation. These five **zero-based prime-key starts** are frozen: **0, 86, 173, 463, 3300**. No original p49/p51 language scores were used to select them.

The source-selected reversible prime-totient channel is tested with both signs and two table-gap clocks: after 66 runes, **continue over p50 without consuming keys** or **reset at p51**. Both keep the numeric grid out of the GP rune count.

## Exhaustive p56-style F exceptions at six original sites

Original p49 has two published F glyphs; p51 has four. Their exact zero-based offsets in the concatenated 158-rune source are **[3, 33, 69, 123, 126, 157]**.

The authentic p56 mechanism establishes that a published F can be literal and **not consume** a prime. Because the six unknown-page sites are unmarked, **all 64 masks** are included. Each source start, both signs, both clocks and all masks give **5×2×2×64=1,280** original-input interpretations. The highest-likelihood mask is selected separately within each source-frozen case, so the negative comparison grants every candidate the benefit of six unknown interruption decisions.

## Independent cipher and language controls

The [single-file exact reproducer](../sims/onion7_primeclock_table_flanks_158_sft.cjs) reconstructs source pages and six original F positions, checks **prime(87)=449**, **prime(174)=1033**, **prime(464)=3301**, and re-derives genuine solved p56:

- **85/85 original p56 runes** recovered, with a literal-F interruption at printed source offset 56 and **84 primes consumed**. Independently published AN END plaintext is used only as a regression assertion.
- An independently encoded **158-rune solved-language plant** under candidate start prime ordinal464, one sign and continuous clock recovers **158/158** in the same flanking-page inverse.
- A GP trigram model trained on the first **300,000 characters** of a pinned Shakespeare reference scores original outputs without fitting language parameters to LP2 ciphertext. Scores are mean log likelihood per modeled rune trigram; less negative means more English-like.

| Text or candidate | Mean GP trigram log likelihood |
| --- | ---: |
| p49+p51 original, unmodified | **−4.196124** |
| Best of **all 1,280** source-start/sign/clock/F-mask candidates | **−3.946183** |
| Independently solved p56+p57 control at comparable 66+92 length | **−2.543775** |

The best original candidate uses **prime ordinal174** (2014 7×7 sum1033), positive sign, a p51 clock reset, and literal-F mask14. Its separate p49 and p51 scores are **−4.129839** and **−3.815583**. The first p49 GP transliteration is **SEOSGWJCEIAJFTHAEFTOXLNGLHAMLSBGYNXEOFHFYRENICLSFTI**. The second page likewise produces no coherent language. The source script emits per-start maxima, masks, and the original prefixes.

The strongest apparent improvement over untouched ciphertext is partly a consequence of choosing among 64 F masks. It remains far below authentic solved-language controls. This is a bounded negative on the declared exact model, not evidence against every historical encryption family.

## Resolution of the cross-track dependency

This completes an original-source **#10 (Onion7 and red PARABLE key numbers) → #5 (authentic p56 prime-totient mechanism) → #16 (158-runic table flanks)** integration without a guessed KDF or fitted key offset. The source-selected numbers **do not** give a valid starting prime for the literal solved-page decoder, even with all six F interruptions and both table-gap clocks.

There is **no newly recovered unknown LP2 plaintext, authentic key, cipher mechanism or hidden destination**. Another interpretation of the historical numbers remains possible, but should not restart the same prime-totient clock family without an independently specified new operation. The overall [results synthesis](../results/README.md) is unchanged.
