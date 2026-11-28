# Original 256-cell table as a fixed mod36 key for the hidden-silent-output cipher

**28 November 2026 — Agent16. Decision:** a genuinely source-derived (the printed 32×8 numeric table) **256-period byte key** does **not** recover original GP-native unknown-page plaintext when supplied to the new Round48 36-symbol hidden-silent-output decoder. In a source-native English plant the same supplied grid key is positively discriminating: the decoder recovers 81.09% of its retained printed plaintext and scores −1.9083 nats/printed rune against −5.1710 for a wrong fixed phase. On the original p0–2 and p54–55 intact ciphertext, the same frozen key scores about **−5.06** and **−5.10**, near deliberately wrong-key decodes, with no coherent text. **No unknown plaintext, authentic cipher, hidden key, or final destination recovered.**

## Why this was a rational distinct receiver, and the weak link

The source has exactly **256 cells** laid out physically as 32 rows × 8 columns across pages49–51. Its row-major, conventional BASE60 numeric read gives 256 integers 0–255, preserved at `resources/liber-primus/lp2-grid-256.json`. This is an unusually concrete full candidate key tape that is not free-key fitting.

The independent [Round48 exact 36-output-state inverse](lp2-round48-alternative-erasure-channel-keyed-inverses.md) is calibrated on literary plants: plaintext GP29 runes plus SPACE29 are added to a supplied key modulo36; a key draw whose output repeats the previous *emitted* value is discarded, whereas output glyphs 29–35 are silently hidden but consume plaintext and key while updating the emitted state. The decoder explicitly hypothesizes hidden outputs, rejection counts and plaintext word spaces under a GP-trained four-gram beam.

This proposed transfer is deliberately **source-minimal**: repeat all 256 original grid byte values in row-major order, reduce each modulo36 as `K[t] = grid[t mod256] mod36`, and start key clock at index0 for each source-tested chapter. Key advances on every consumed or rejected key, including invisible source symbols. No fitted key, phase, page permutation, dictionary crib, hash, seeded PRNG, or hidden plaintext selection. Reverse or cyclicly shifted table order is not a discovery rule; one fixed shifted key is used only as a wrong-key diagnostic.

**Weakest premise:** original Cicada pages do not expressly say to use the table as a periodic key, choose modulo36, map seven residues to nonprinting symbols, or transfer this particular C11/Round48 cipher. This is an exploratory direct-solution attempt, not an authenticated receiver.

## Locked original-inverse and source-native control results

The [reproducer](../sims/lp2_grid256_mod36_silent_key_original_sft.cjs) uses the existing tested `sims/lp2_alt36_silent_exact_latent_viterbi_sft.cjs` module without changing its decoder. It trains its four-gram on the first 57% of word tokens in three pinned Shakespeare/Gibran/Emerson donors; beam400 and at most three intervening silent emissions. The key is the first 256 *unmodified source values*, `[203,231,167,186,97,237,126,183,92,249,156,222,247,4,183,212,…]`, reduced mod36. All 256 entries and both original passages are asserted. A control constructed only from an untouched late Gibran passage starts at token offset1400 within the last43% of its words, uses **450** plaintext symbols including native word spaces, encrypts them under the exact model and supplied repeating grid, then reveals only **349** printed rune symbols (101 silent outputs). Original key clock consumed through index457 after repeat rejection.

| Fixed decoder, beam400 | Printed runes | Score in nats/printed rune | Length of recovered path | Result |
| --- | ---: | ---: | ---: | --- |
| Native Gibran plant, correct grid key | 349 | **−1.908323** | decoder estimates intervening spaces | **81.09%** LCS against retained plaintext; exact final key index457 |
| Same plant, wrong period-256 phase +53 | 349 | **−5.171032** | — | **28.37%** retained plaintext LCS |
| **Original LP2 p0–2**, correct source key | **729** | **−5.060268** | 674 decoded visible/inserted runes | Nonprose, no authentic plaintext |
| Same p0–2, wrong +53 phase | 729 | **−5.065683** | 666 | Likewise nonprose |
| **Original LP2 p54–55**, correct source key | **308** | **−5.103655** | 278 | Nonprose, no authentic plaintext |
| Same p54–55, wrong +53 phase | 308 | **−5.240885** | 279 | Likewise nonprose |

The original p0–2 output begins `EANGFFNADRTHROAEDEBFCMNGUPRISTITOHNCDEPRPREALIALNTHURODMROMDASCUBSUEISCOUXC...`. The terminal independent section begins `URSCAEBRADLIAGRPURSEAELMEWTNGGNAYTCMEOTXICLIDREAUJHHNELSYUIGIODNBIDIINDWR...`. Neither is GP-native connected prose despite optimistically inserting latent spaces and path optimization. A wrong-key score is not by itself a formal probabilistic p-value; the large native key margin and no comparable original margin are the decisive observed contrast for this frozen receiver.

All numerical results, including positive and negative, were executed directly in the connected V8 runtime with the exact committed corpus, grid and decoder module fetched from GitHub. The standalone CommonJS wrapper was committed for independent Node22 re-execution; a separate shell execution was not performed during this invocation. The roundtrip of an arbitrary bijection does not establish a correct key; here the positive is a *language discrimination* test under the exact artificial channel.

## Decision and generalizable fork

Retire **exactly** `K=grid[clock mod256] mod36` in the declared 36-state strict-repeat/silent-output channel with chapter-reset clocks. This does *not* exclude a genuine 256-symbol source table read under a different independently selected operation, nonperiodic key material, different page/ciphertext order, other deletion grammar, or earlier sender layers. Do not increase fitted grid phases, table permutations, hidden-symbol grammars or beam widths to rescue a near-wrong-key original output without a first-party clue selecting them. The alternative hidden-output family remains viable with an **unknown independent key**, but the actual original key has not been found.

The established [plaintext synthesis](../results/README.md) remains unchanged.
