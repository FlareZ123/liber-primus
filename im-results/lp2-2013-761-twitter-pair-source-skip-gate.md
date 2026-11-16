# Original 2013 761.MP3/Twitter/Gematria sources as skip-aware GP29 keys — corrected p0 alignment

**16 November 2026, Agent41 revision.** The prior 72-screen report overstated its valid ciphertext coverage. The source annotation identifies the first 13 runes of p0 as red heading, not ciphertext. The previous p0 target was p0[0:90], so its 36 screens included those 13 non-ciphertext runes and are not valid evidence about an LP2 key. The other 36 screens on p54+p55 remain a valid finite negative for their explicitly independent key reset. A corrected p0 black-body screen is now reproducible in the new SFT and manual workflow linked below; its result is pending.

## Historical source relation

The original 2013 Twitter puzzle reconstructs a 64,167-byte file twitter.bin from addressed records. XORing it with the initial, ID3-inclusive 64,167 bytes of the original 4,010,732-byte 761.MP3 produces gematria.jpg, the source-era Gematria Primus reference table. This is an authentic period operation and three concrete source streams with independently fixed byte origin. The missing link is an instruction transferring any of these bytes to LP2 as a running key.

Original bytes are obtained from the pinned [2013 MP3 archive](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) and [2013 Twitter reconstruction](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter), with byte-length and SHA256 assertions before decoding:

| File | Original bytes | SHA256 |
| --- | ---: | --- |
| 761.MP3 | 4,010,732 | 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460 |
| twitter.bin | 64,167 | defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776 |
| gematria.jpg | 64,167 | d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d |

The full byte relation gematria.jpg == twitter.bin XOR 761.MP3[0:64167] passed in the original workflow.

## Correction to the earlier screen

The earlier successful run is [CI run 43795836572](https://github.com/FlareZ123/liber-primus/actions/runs/43795836572), using the pinned Campaign XVIII skip-aware decoder at upstream commit f63501d8f2d835b80c30230eb89a1110fb9197d2.

The source annotation file resources/liber-primus/lp2-ink-annotations.json states that p0 has 262 runes and a red span at zero-based rune offset 0 of length 13, with the exact sequence ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ. Therefore the first black rune is at p0 offset 13 and the black body contains 249 runes.

The old script used p0[0:90] as a ciphertext screen. Reclassify those 36 p0 rows as **invalid ciphertext tests**. Do not count them toward a 0/72 negative. The 36 p54+p55 rows are unaffected: they tested the first 90 runes of that endpoint under the explicitly declared independent reset at original source byte offset zero. All 36 remained below the preset −6.0 screen threshold. The best valid endpoint candidate was gematria.jpg/mod29/p54+p55/sign −1/Atbash, score −6.8309565787435815; the next was −6.833654402293992. Both previews were nonlinguistic.

The old experiment's planted controls recovered the 240-rune Shakespeare plant exactly for 761.MP3 and twitter.bin, and 229/240 for gematria.jpg. The latter is a calibration imperfection, not an exact positive. The pinned upstream positive/negative decoder gate also passed.

## Corrected p0 black-body test

The new reproducer is sims/lp2_2013_761_twitter_pair_p0_body_skip_sft.py and the manual workflow is .github/workflows/lp2-2013-761-twitter-p0-body-skip.yml.

It asserts the 13-rune red span from the canonical ink annotation, removes it, and screens the first 90 black-body runes. It keeps the three original source streams, their original byte offset zero, the three fixed byte-to-GP29 projections (mod29, scaled29, bits5-reject), both additive signs, and direct/Atbash carrier readings. It tests only two key-symbol offsets:

- 0: the key starts at the first black ciphertext rune.
- 13: the 13-rune red heading may have consumed the first 13 key symbols.

This is 3 source files × 3 projections × 2 key-symbol offsets × 2 signs × 2 carrier readings = 72 bounded screens. Any screen above the existing −6.0 threshold triggers a full 249-rune p0 black-body decode and independent re-encipher verification. The script reuses the same source-pinned Campaign XVIII decoder and exact original source-byte hashes. It does not search arbitrary byte offsets or fit phases.

**Corrected p0-body result: pending manual workflow run.** Until that result is available, the source-key hypothesis is not retired.

## Scope and decision

The existing evidence retires only the tested p54+p55 independent-reset screens at byte offset zero and their fixed projections. It does not test a continuous key clock across all 12,956 ciphertext runes. The previous p0-full screen is invalid as ciphertext evidence because it included the red heading. The corrected p0-body screen is the next decisive test.

Even a negative English score would not mathematically exclude every unusual plaintext language or a different cipher. The current test addresses one historically motivated transfer: the 2013 761/Twitter/Gematria source bytes as additive GP29 key material under the published key-skip model. Do not widen offsets or add cipher layers unless an original LP2 clue selects them.
