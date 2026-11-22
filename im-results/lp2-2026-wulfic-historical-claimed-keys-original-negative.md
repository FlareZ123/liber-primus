# Pre-rebuild 2026 alleged LP2 solutions: exact original source falsification

**Decision (15 November 2026):** Two purported recovered LP2 plaintexts and fixed GP29 Vigenère keys from an indexed **April 2026** snapshot of Wulfic/Cicada3301-Liber_Primus are incompatible with the authentic 2014 LP2 ciphertext at the **first original rune**. Reproducing their entire stated fixed keys on the canonical original p1/p2 produces nonlinguistic text with near-uniform coincidence. Neither proposed key is an independently reproducible unknown-page decipherment. **The external project's live 14 November 2026 tracker itself disavows its pre-29 September 2026 page assignments as corrupted and old discoveries as artifacts.** Do not repeat their obsolete decryptions or present them as alternative confirmed solves.

## What was actually claimed and the source ambiguity

The externally indexed, older [MASTER_TRACKER.md snapshot](https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) reported as of April 2026 that scan P18 had a confirmed 53-rune repeating subtractive GP29 key and source text beginning `BEING OF ALL I WILL ASK ...`, while P19 allegedly had a confirmed 47-rune repeating **additive** key and plaintext `REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR`. That snapshot even described corresponding text extents of **260** and **271** runes.

As of 15 November 2026, the [living repository's current MASTER_TRACKER.md](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) explicitly records a September 2026 data rebuild and warns that older page files did not match their scans. The current [scan19 README](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_19/README.md) labels the page **UNSOLVED**. This report is therefore a **historical false-positive audit**, not a claim that this other researcher currently maintains the disproved plaintext as genuine. Both exact key arrays are retained in the SFT, rather than reproducing the old speculative text here.

## Exact original GP29 contradiction

The archived printed keys specify the first key values and algebra. No guessed initial phase, plaintext segmentation or unknown state is needed to test the **stated** direct rules:

| Actual 2014 image | Actual LP2 physical page | Original ciphertext rune count | Original first GP index/rune | Reported first key, sign | Calculated first plaintext | Historical claimed first plaintext |
| --- | ---: | ---: | --- | --- | --- | --- |
| `18.jpg` | p1 | **266** | 24 / A | 11, subtract | 13 / **P** | 17 / **B** |
| `19.jpg` | p2 | **201** | 22 / OE | 24, add | 17 / **B** | 4 / **R** |

Thus on p1, `(24−11) mod29=13`, not17. On p2, `(22+24) mod29=17`, not4. Already the very first original printed letters disprove the frozen claimed key/plaintext pairs. The complete 266- and 201-rune original arrays have GP29 IoC **0.03472833025961129** and **0.03437810945273632** after applying the 53-/47-rune keys, respectively. They remain nonprose; there is no coherent prefix or authentic original key.

We fetched the *external project's own updated* `pages/page_18/runes.txt` and `pages/page_19/runes.txt`. Their **entire exact modern rune sequences match** the shared original 2014 `resources/liber-primus/lp2-corpus.json` for both pages (266/266 and 201/201). Git blobs `f2045b87bb5ec9824ab762cea38974714ac1f064` and `6dbdbd20b62495b706353fc4ec1a0445e45faa21`. The historical claim's old 260-/271-rune extents were therefore inconsistent with corrected data; no competing original glyph reading explains the fixed-key first-character mismatch.

**Key-independent scope:** this rejects these *specific reported keys under their specified signs and zero phases* on exact original source. It does not exclude an unrelated correct key, different cipher, or authentic unknown plaintext elsewhere in Liber Primus.

## Reproduction and decision

The [source-exact CJS SFT](../sims/lp2_wulfic_2026_p18p19_claimed_keys_original_sft.cjs) asserts original page lengths/first glyphs, retains both full externally published key arrays, calculates full decoded streams and first-glyph contradictions, requires exact reverse-encryption, and includes a complete solved-p57 GP positive cipher plant. It passed [Windows Node22 CI 43708452229](https://github.com/FlareZ123/liber-primus/actions/runs/43708452229) on 15 November 2026.

**Research decision:** Do not use the obsolete claimed `BEING` or `REARRANGING` text as a crib for p49, p55 or the other 54 unknown pages. Treat the external project's own data-correction history as dispositive against its earlier `CONFIRMED` labels. An independently sourced original plaintext island remains the crucial missing operand.
