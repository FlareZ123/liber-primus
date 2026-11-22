# LP2 original-source plaintext crib under all secret alphabets and reversal

**Agent36, 17 November 2026. Classification: expanded original-ciphertext source-crib test; no unknown plaintext, key, or cipher inverse recovered.**

## Hypothesis and test

A contiguous LP2 passage might reuse solved LP1/p57 prose or original Cicada-authored signed instructions under an unknown rune alphabet. Any fixed one-to-one alphabet over such a passage preserves its complete equality pattern: equal plaintext symbols remain equal ciphertext symbols, and distinct plaintext symbols remain distinct. This permits a key-free test over every 29-rune bijection, without guessing a shift, keyword, or frequency fit.

The test also scans each intact reference in exact reverse rune order, reflecting reversal operations used in earlier Cicada stages. A separate literal-F-transparent model permits a fixed secret mapping on the 28 non-F runes with one additional collision at ciphertext F, as required by the solved-page F behavior. Both models are scanned at every original and reference offset.

The unknown input is the original 12,956-rune LP2 pp0–55 stream in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json). It is joined in source order across printed words and physical-page seams. Each reference remains a separate contiguous source; no English tokenization is fitted.

## Source corpus

The 22 fixed references total **5,887 source-native GP29 runes**:

- Six clear LP1 pages p3, p8, p9, p10, p11, p14 from [the canonical transcription](../resources/transcriptions/lp1_wulfic_canonical.txt).
- The 95 clear LP2 p57 runes.
- Nine previously indexed Cicada PGP-clearsigned prose sources from 2012–2016.
- Six additional 2012–2013 signed prose sources: the 2012 *song-is-your-own-path* message (335 runes), the 2012 RSA-example instruction with its encrypted block and public-key serialization excluded (517), the 2013 *welcome-and-congratulations* message (997), *if-you-followed* (98), *no-more-testing* (130), and the already-stored *do-not-share-this-information* variant (1,684).

The five newly vendored signed messages are preserved byte-for-byte under [resources/historical](../resources/historical/); the DoNotShare variant was already present in [resources/external](../resources/external/2013-do-not-share-this-information-2.asc). The source messages are from the iBotPeaches corpus indexed in [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/tree/9087dc36b5aa64c1786428e32180261ab9420c29). Its [REPORT-A.md](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/corpus/A-primary-artifacts/REPORT-A.md) reports 20 valid Cicada PGP signatures against fingerprint 6D854CD7933322A601C3286D181F01E57A35090F; that is an external verification claim, not a new local GPG run. The five copied message blobs match these upstream Git blob IDs exactly: song d40ea4207b7db70be6f422865191451de05b63a1; RSA example 672184615cf25d19e5eb177875be83b4d83c1128; welcome 2a76372e671573028809260777169e3a4a0a6950; followed 2cac85317c8245dfe3bf6509807e7f8308b734ac; no-more-testing da51150df994f05b445b9c07338192aa95e2565f. The existing DoNotShare variant has blob 79784afcc6beced6ad1c7502007a6b3f53bde3e7. Nested PGP/RSA ciphertext, public-key serialization, email addresses, onion hostnames, and numeric signer ID 3301 are excluded from the natural-language crib stream; the signed prose itself is retained.

The other messages in that 20-signature corpus include coordinates, SSSS share strings, and encrypted payloads. They are not silently treated as natural-language plaintext cribs. The separate 2014 Onion5 signed-media payload is already covered by the local [direct-media gate](lp2-2014-onion5-signed-media-directpad-gate.md); it supplies no new LP2 key in this investigation.

## Complete original-input results

The scan tests **76,271,972** starting pairs per source direction, or **152,543,944** forward-plus-reverse pairs per alphabet model and **305,087,888** across the bijective and literal-F-transparent models.

| Known plaintext source | Reference runes | Forward bijective | Forward F-exception | Reverse bijective | Reverse F-exception |
| --- | ---: | ---: | ---: | ---: | ---: |
| Clear LP1 p3 | 157 | 16 | 16 | 16 | 16 |
| Clear LP1 p8 | 187 | 15 | 15 | 14 | 14 |
| Clear LP1 p9 | 207 | 15 | 15 | 16 | 16 |
| Clear LP1 p10 | 192 | 16 | 16 | 16 | 16 |
| Clear LP1 p11 | 169 | 16 | 16 | 15 | 15 |
| Clear LP1 p14 | 89 | 15 | 15 | 16 | 16 |
| Clear LP2 p57 | 95 | 15 | 14 | 16 | 14 |
| Cicada signed 2016 prose | 177 | 15 | 15 | 15 | 15 |
| Cicada signed 2014 Stage11 prose | 65 | 15 | 14 | 15 | 15 |
| Cicada signed 2012 countdown | 73 | 16 | 14 | 15 | 14 |
| Cicada signed 2012 MIDI instruction and Blake quotation | 335 | 16 | 16 | 15 | 15 |
| Cicada signed 2013 first onion | 43 | 15 | 14 | 15 | 15 |
| Cicada signed 2013 forest clue | 49 | 14 | 14 | 14 | 14 |
| Cicada signed 2013 second onion | 91 | 14 | 14 | 13 | 13 |
| Cicada signed 2013 ICMP echo clue | 30 | 12 | 12 | 12 | 12 |
| Cicada signed 2014 Stage09 file-upload instruction | 167 | 16 | 15 | 16 | 15 |
| Cicada signed 2012 song-is-your-own-path | 335 | 16 | 16 | 15 | 15 |
| Cicada signed 2012 RSA example prose | 517 | 15 | 15 | 15 | 15 |
| Cicada signed 2013 welcome-and-congratulations | 997 | 17 | 17 | 18 | 18 |
| Cicada signed 2013 if-you-followed | 98 | 15 | 15 | 14 | 14 |
| Cicada signed 2013 no-more-testing | 130 | 17 | 17 | 19 | 19 |
| Cicada signed 2013 do-not-share-this-information | 1,684 | 18 | 18 | 19 | 18 |

The maximum is **18 runes forward**, **19 reversed**, and **19** in the literal-F-transparent reversed model. No 20-rune or longer match occurs.

### Inspecting the near-matches

The new 17–19-rune matches are short fragments of generic recruitment prose, not a coherent recovered LP2 passage:

- *welcome-and-congratulations*: 17 forward at LP2 p0 offset 165 (“been pleased with your teamwork”) and 18 reversed at p14 offset 102 (“keep this ID number as you will”).
- *no-more-testing*: 17 forward at p22 offset 78 (“project and email us the”) and 19 reversed at p21 offset 230 (“the project and email us the”).
- *do-not-share-this-information*: 18 forward at p9 offset 116 (“have by completing this recruitment”) and 19 reversed at p24 offset 1 (“you on board to help with future”). The literal-F-transparent reverse match is 18 at p24 offset 2.

These are post-search phrase descriptions, not pre-registered cribs. Each local match admits its own unconstrained secret alphabet; the matches do not share a global mapping or extend to a longer coherent source passage.

### Frequency-preserving randomized control

A deterministic 1,000-trial control uses seed 0x6c696265. For each of the six added sources, it preserves the exact 29-symbol multiset, uniformly shuffles rune order, and tests both forward and reversed order against all original LP2 19-rune equality-pattern windows. **301/1,000** trials (30.1%) produce at least one match of 19 runes. Thus the observed 19-rune maximum is not unusual under this deliberately simple frequency-preserving null; it is not evidence that the source messages are plaintext cribs. This is a diagnostic null, not a proof that no more structured source-selection mechanism exists.

A parallel unknown-to-unknown all-secret search uses canonical first-occurrence signatures for windows entirely within physical pages. For lengths **15, 18, 20, 22**, repeated signature windows remain **2,519, 238, 17, 0**; cross-page-first repeats are **2,481, 234, 15, 0**. No two page-local 22-rune windows share an equality pattern under a fixed secret alphabet. The 17 length-20 repeats do not establish shared plaintext.

## Reproducibility and decision

- [Read-only Windows Node 22 SFT](../sims/lp2_parameterized_crib_original_sft.cjs) reads the original LP2 corpus, clear LP1/p57 references, and the exact checked-in signed messages; it performs all four original-input scans, four 60-rune positive controls, and the deterministic 1,000-trial null.
- Positive controls recover a planted 60-rune p57 excerpt under an unknown 29-rune permutation, under the literal-F-transparent model, and under exact reversed-source order. This confirms that the scanner detects the intended mechanism.
- The original 16-reference ceiling of 16 is superseded by this 22-reference result. The expanded scan's maximum 19 is a multiple-offset near-match, and the randomized control shows it is not a useful crib signal.

**Research decision:** Retire generic expansion of the signed-prose crib corpus. Reuse this scanner only when an independently authenticated source or a human-visible clue selects a particular contiguous plaintext and operation. The new historical sources add no plaintext, authentic key, or reversible mechanism for LP2.
