# Source-count alignment: 213 original red runes + 43 signed words = the 256-cell p50 table

**Agent 1, 21 November 2026. Classification: new source-count coincidence, bounded original-input decipherment negative. No unknown plaintext or authentic key recovered.**

## Causal puzzle hypothesis and independent source data

Cicada's original LP2 p50 prints a **32×8 matrix of exactly 256** two-character numbers. The original LP2 p0–55 ink annotation registers contain **213** GP29 red-highlighted runes, across exactly **13** distinct pages: 0,3,6,7,8,15,23,27,33,39,40,53,54. The separately preserved first-party, GPG-verified January 2016 message contains exactly **43 alphabetic words** if one includes the greeting `Hello`, the 29-word main body and the 13-word coda, and excludes the numerical footer `3301` and PGP key ID `7A35090F`. Thus **213+43=256**, an exact count bridge from the author's red ink and later signed word instruction to the printed numeric table.

The 2016 hint calls the book's words the map and its numbers the direction. A hypothetical human solver might use the 43 words as an indexable supplemental lane beside 213 original red symbols to form exactly one table-sized key. **This is an exploratory alignment. No first-party text says to concatenate these inputs, choose a word-to-rune projection, or interpret the table as additive ciphertext.** The count can easily be a coincidence, particularly because the later signed clue was selected after inspecting both sources. The goal here is to test the simplest complete, independently identifiable consumers before creating further exceptions.

## Fixed test on all 256 original table bytes

Preserve the original row-major table values, conventional printed **base60** interpretation, and reduce each byte modulo29: `C[i]=byte[i] mod29`. Keep the original 213 red rune indices in physical page, span, and glyph order. Convert each of the 43 signed words into native GP29 with canonical longest-match spelling (including C for K and U for V). Extract exactly four single-symbol values for each word:

- `GP0(word) = sum of rune indices mod29`;
- `GPprime(word) = sum of GP prime weights mod29`;
- `first(word)`;
- `last(word)`.

For each, concatenate **red213 then words43** or **words43 then red213**, without rotating, sorting, truncating, cycling, or interpolating. Both possible additive signs are retained in the complete 256-rune inverse, `P[i]=(C[i]±K[i]) mod29`. This gives **4×2×2=16** frozen reversible candidates. The complete original 256 numbers and all source word tokens stay unchanged.

Results, exact GP29 IoC for each 256-rune candidate:

| Signed word projection | Red213 then words43, plus / minus | Words43 then red213, plus / minus |
|---|---:|---:|
| GP0 sum | 0.03590686 / 0.03492647 | 0.03483456 / 0.03465074 |
| GP-prime sum | 0.03609069 / 0.03553922 | 0.03452819 / 0.03468137 |
| First rune | **0.03691789** / 0.03486520 | 0.03455882 / 0.03321078 |
| Last rune | 0.03624387 / 0.03498775 | 0.03477328 / 0.03367034 |

The unmodified 256-byte table reduced modulo29 has IoC **0.03716299**. Independently clear LP2 p57 prose has IoC **0.06270997**. All sixteen extracted streams remain flat and contain no readable sustained GP29 language; the most favorable IoC is actually below the unmodified source's. This does not mathematically exclude a transformed, additionally encoded, non-English, or compressed table.

Every one of the 16 exact arithmetic consumers passes a separate native p57 forward-encryption/decryption plant, recovering its complete **95/95** known GP29 runes.

## Reproduction and decision

[Single-file original-source Node22 test](../sims/lp2_red213_signed43_grid256_direct_sft.cjs) reads `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, `base60-grid.json`, and the original first-party signed message `resources/historical/cicada2016-4gq25-outguess.asc`; it asserts 13 red pages, 213 runes, the signed-message word boundary, 43 words, 256 table cells, all 16 reversible models and known p57 positive. **Windows Node22 PASS** on [manual Actions run 44962934662](https://github.com/FlareZ123/liber-primus/actions/runs/44962934662).

**Decision:** retire this specific direct source-concatenation model. The 213+43=256 count is an interesting *original-artifact alignment*, but it currently supplies neither readable ciphertext inversion nor an independently specified historical opcode. Do not search arbitrary insertion positions, arbitrary words-to-numbers formulas or cipher phases merely to rescue the count. A new page-authored interleaving instruction or authenticated table consumer would justify reconsideration.
