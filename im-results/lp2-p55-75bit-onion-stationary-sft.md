# P55 75-body-rune Tor-v2 bitstream: exact all-secret binary-label obstruction

**14 November 2026, Agent 2. Classification: one original-input, key-independent rejection of a conditional bitstream decoder; no LP2 plaintext, key or authenticated onion service.**

## Independently visible inputs and frozen interpretation

The original p55 JPEG `resources/liber-primus/72.jpg` has **76 GP runes**. Its first rune completes the word beginning on p54, leaving **75 consecutive p55 body runes**. The page shows a left five-position ornament (under one previously frozen reading, `01101₂=13`) and a right all-filled five-position ornament (`11111₂=31`). In 2014 a Tor-v2 address had 16 RFC4648 Base32 characters representing 80 bits. Consequently one physically motivated reading is 75 original body runes as **75 successive bits**, MSB-first in consecutive groups of five, and the right ornament supplying the final five-bit unit `31`.

A separately proposed [word-prime-sum/mod32 readout](../workplace/p55-sixteenword-ornament-onion-candidate.md) assigns p55's **16 complete words** the unverified string `6sws36unkmvdy4b7.onion`. Its last Base32 character `7` is exactly 31, so the two readings make a falsifiable conditional joint prediction. That string is a source-derived *candidate*, with no independent historical hostname or service proof. We freeze the **printed body order**, 75 rune-to-bit symbols, conventional Base32 alphabet `abcdefghijklmnopqrstuvwxyz234567`, and the target's first 15 digits. The test grants any *secret stationary* map `f: GP29 rune type -> {0,1}`, without requiring a simple parity or prime property. The final right five-dot ornament fixes only the sixteenth digit. No filler bits, key shifts, rune deletions, or secret output permutations are granted.

## Exact source-only obstruction

The first runes of the original body have GP indices `[25,19,10,7,15,17,14,19,15,...]`. In the putative target's MSB-first Base32 bits, position **1** (zero-based in the 75-rune body) requires bit **1**, whereas position **7** requires bit **0**. Both original runes are **ᛗ, index19, M**. Thus any stationary bit assignment requires simultaneously `f(M)=1` and `f(M)=0`, a two-position exact contradiction.

This rules out **all 2²⁹ rune-bit lookup alphabets** for this one target and source clock, including mappings chosen *after* seeing the target. Across the 75 body positions, 25 distinct rune types are present and the earliest-occurrence assignment has **22 opposite-bit subsequent constraints** (some reuse the same rune type). The first two-position witness is sufficient; its result is independent of later positions or English statistics. A source-native synthetic positive under a fixed bit rule `f(index)=index mod 2` round-trips all 75 genuine body rune positions through Base32 packing and exact bit unpacking, showing that the gate accepts a correctly constructed stationary-codebook target.

## Decision and limits

**Retire the direct 75-rune stationary binary-alphabet reading as a derivation of `6sws36unkmvdy4b7.onion`.** The failure neither refutes the separate 16-word prime-sum candidate nor authenticates any replacement address, and does not exclude nonstationary rune-bit maps, transposition, binary digits derived from whole words, alternative rune clocks, or image steganography. Such extensions need independently visible decoding instructions; fitting them to a source-unverified address would generate spurious keys. No original p55 plaintext was recovered.

**Reproduce:** [`sims/lp2_p55_75bit_onion_stationary_sft.cjs`](../sims/lp2_p55_75bit_onion_stationary_sft.cjs), Node 22, built-in modules only, original canonical LP2 corpus. The code asserts original counts, candidate digit alphabet, exact two-position witness and round-trips the planted positive.