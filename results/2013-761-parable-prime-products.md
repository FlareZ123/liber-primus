# A first-party numerical operation: 2013 audio metadata and the later clear LP2 Parable

**Agent47, 21 November 2026. Established cross-artifact historical arithmetic; no unknown ciphertext recovered.** The archived Cicada OS 2013 audio artifact contains **two independent, exact Gematria Primus prime-weight calculations** that reappear in the clear 2014 book. These are stronger source evidence for a creator-designed numerical operation than postselected coincidences in unknown ciphertext. This is a reproducible author-era numerical clue, not a key or a decipherment for p0–55.

## Independent 2013 historical witness

The preserved 2013 Cicada OS ISO has an audio file **`audio/761.mp3`** (4,010,732 bytes in the surviving archived extraction). Its archived ID3 metadata reads:

- `Title: The Instar Emergence`
- `Artist: 3301`
- `User Defined Text: (Parable 1,595,277,641) Like the instar, tunneling to the surface / We must shed our own circumferences; / Find the divinity within and emerge.`

The text is quoted here only as short metadata-bearing identification; the original is preserved in the [independent Cicada-solvers ISO extraction README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/README.md). The original audio is preserved at [`2013/002-3301/3301-contents/audio/761.mp3`](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/3301-contents/audio/761.mp3), pinned by Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`; archived ExifTool output reports ID3 tag size206. The primary audio bytes were not independently downloaded in this invocation, so the metadata fields are grounded in that independent extraction, rather than a claim of our own raw ID3 parse. The independent [2026 external replication](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase46_todo_and_leads.md) independently identified the same source arithmetic.

## Calculations from the untouched original 2014 runic page

Use the exact 29-rune GP transliteration and **prime weights**, with TH and ING as their own runes. The original clear LP2 physical **p57** is 95 rune symbols: seven for its title `PARABLE` and three complete subsequent punctuation-delimited clauses of **30, 30, 28** runes. Their source-exact sums are:

| Source clause beginning | Original GP rune count | Sum of original GP prime values | Prime? |
| --- | ---: | ---: | --- |
| LIKE THE INSTAR… | 30 | **1,259** | Yes |
| WE MUST SHED… | 30 | **1,031** | Yes |
| FIND THE DIVINITY… | 28 | **1,229** | Yes |

**1,259 × 1,031 × 1,229 = 1,595,277,641**, precisely the numerically labeled 2013 ID3 Parable. This is the exact original pre-LP2 artifact-to-LP2 operation, with all 88 body runes consumed and no key/word fit.

The same source-author numerical language supplies an independent second calculation. Parse the 2013 track's Latin-letter title **THE INSTAR EMERGENCE** with the exact published GP digraphs (TH as one rune). Its Gematria prime sum is **761**, identical to the independently named `761.mp3` file; 761 is prime. The two independent matches share the same author-used rune/prime mapping: the title is a **sum**, and the Parable index is a **product of three clause sums**. There is no conflicting delimiter, index origin, or arbitrary parameter.

## Cryptanalytic implications and limit

- **Confirmed creator habit:** GP prime sums of meaningful text, including prose clauses and titles, and products of those sums, were deliberate numeric objects in the earlier Cicada path. This informs which operations are historically worth attempting when the original manuscript supplies a sentence/word selector.
- **Credible output oracle, with calibration needed:** A proposed unknown-page decryption that reproduces authentic clause boundaries and multiple prime-sum clauses gains independent corroboration if the decoder and source key were fixed first. This property is **not itself a cipher** and cannot choose among arbitrary outputs.
- **No automatic key handoff:** The printed 2013 number `1595277641`, the three primes, and 761 were available before the 2014 book. They are concrete source-selected values, but neither the 2013 metadata nor p57 specifies a target LP2 ciphertext page, per-rune cipher, transformation, or phase. They must not be silently promoted to a PRNG seed or p0 key.

The surviving issue is specific: discover a first-party clue connecting this **now authenticated numeric grammar** to one original unsolved ciphertext recipient and a reversible operation. Pure numerical matching alone remains insufficient.

**Reproduce without external packages:** [Node 22 CJS test of all original p57 runes and both metadata numbers](../sims/lp2_2013_761_parable_prime_product_sft.cjs); source data `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`. [Manual-only Windows workflow](../.github/workflows/agent47-2013-parable-primes-manual.yml). The test checks 95/95 original page indices, all three original clause boundaries, sums, primality, exact product, and the title 761 computation. ID3 transcription is a frozen external source input; test does not parse MP3 binary.
