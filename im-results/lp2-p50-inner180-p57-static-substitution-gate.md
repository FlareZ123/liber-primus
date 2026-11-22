# P50 180-cell interior: all-secret byte→GP29 inversion gate on clear p57

**Decision (22 November 2026): negative for every static byte-to-rune substitution under one source-motivated alignment.** The original p50 table is 32×8. Shedding one complete printed-cell perimeter leaves the 30×6, **180-cell** interior; the outer circumference has **76 cells**, equal to the original p55 ciphertext length. The two solved terminal pages have 85 p56 runes plus 95 p57 clear runes = **180**. These source-based counts motivate a simple hypothesis: the interior bytes might represent the 180 known plaintext GP29 runes through a fixed unknown byte→rune lookup. If true, the 76 outer values might have supplied a decoder for p55.

The published original grid gives an unambiguous *literal printed-order* test: take rows1–30, cols1–6 (zero-based), read row-major, and align the interior's final95 values with p57's95 clear runes, after the solved85-rune p56 unit. Every possible position-independent, otherwise unrestricted 256→29 substitution obeys the invariant **identical original input bytes must decode to identical GP runes**. This does not need a key, language model or guessed cipher alphabet.

The **95 exact original p57 positions contain 16 collisions of identical p50 interior byte values; 15 of them demand different GP29 plaintext symbols.** For example, full byte86 is paired with plaintext GP P at p57 index0 (table cell122) and with GP E at p57 index6 (table cell130), a direct contradiction. These cells are not among the previously disputed grid glyph corrections.

| Frozen source representation | Repeated keys | Contradictory pairs |
|---|---:|---:|
| Full 0–255 original byte | 16 | 15 |
| Full byte modulo29 | 67 | 63 |
| First printed base60 digit | 90 | 84 |
| Second printed base60 digit | 46 | 44 |

The first row already rejects **every** static byte→GP29 mapping, even a secret arbitrary table selected after observing the ciphertext. The other rows are illustrative stricter projections. A planted arbitrary 256→29 map recovers **95/95** synthetic known runes with zero contradiction, and a changed symbol on a repeated byte is correctly rejected.

**Boundary:** This exclusion applies only to direct, index-aligned, position-independent substitution on p50's natural inner180; it says nothing about a stateful cipher, a keyed stream, a different externally selected alignment, or a separately meaningful role of p55/p50 outer76. It supplies **no unknown-page plaintext**. In particular, a perfect synthetic static-lookup control verifies the collision test and cannot authenticate the historical cipher.

**Reproduce:** run \`node sims/lp2_p50_inner180_p57_static_substitution_sft.cjs\` (Node22, CommonJS). Input: \`resources/liber-primus/lp2-grid-256.json\` and \`lp2-corpus.json\`, exact original printed index rules and p57 clear GP29. This closes the direct static lookup candidate without an exhaustive key search; a future attempt must supply a clue choosing *state, changing key or different alignment* before trying to read p55.
