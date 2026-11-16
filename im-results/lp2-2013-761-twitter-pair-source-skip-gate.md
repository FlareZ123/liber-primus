# Original 2013 761.MP3 / Twitter / Gematria source bytes under GP29 key-skip

**16 November 2026. Status:** Complete source-aligned p0 black-body and terminal-span tests, both negative for the declared source-key families. The p0 correction is executed in [GitHub Actions run 43968231849](https://github.com/FlareZ123/liber-primus/actions/runs/43968231849); original source and screening code are unchanged. No unknown original LP2 plaintext, source-selected key schedule, or destination was recovered.

## Candidate human route and actual source inputs

The documented 2013 Cicada puzzle used original byte-zero XOR between the initial 64,167 bytes of the **4,010,732-byte 761.MP3** and **64,167-byte twitter.bin** to reveal the **64,167-byte gematria.jpg** alphabet image. This is an independently reconstructed historical operation. The original p57 PARABLE also repeats text carried by the 2013 audio's ID3 metadata, providing a legitimate cross-round reason to examine the historical files. There is still **no first-party instruction** to use any of these three byte streams as the running key for unsolved LP2.

The source checksums, checked by the completed workflow, are:

| 2013 file | Original size (bytes) | SHA-256 |
| --- | ---: | --- |
| 761.MP3 | 4,010,732 | 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460 |
| twitter.bin | 64,167 | defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776 |
| gematria.jpg | 64,167 | d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d |

The workflow asserts both file identities and the full original XOR relationship. Source witnesses are the pinned [2013 MP3](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3) and [2013 Twitter material](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter).

## Exactly which original spans were tested

The printed p0 image has **262 runes**. Its first **13 are a red rubric**, with original glyphs **ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ**, and its subsequent black-body text has **249 runes**. The canonical original source positions are checked in [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json) and [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json).

**Important interpretation correction:** red does not mean unencrypted or "not ciphertext." The rubric itself consists of unsolved runes, and the original provides no instruction to discard it. The earlier p0[0:90] tests remain meaningful for a model that uses one continuous clock through the **red heading and black body**. However, they do not independently decide a distinct black-body-only start. The new target p0[13:103] tests that **separate** hypothesis. Earlier wording that called the 36 red-inclusive screens "invalid ciphertext tests" was mistaken and is retired.

The previous [original 72-configuration run 43795836572](https://github.com/FlareZ123/liber-primus/actions/runs/43795836572) had 36 configurations on original p0[0:90] and 36 on the initial 90 runes of p54+p55 with a separate source-byte-zero reset. All scored below the same threshold. The endpoint half remains a finite negative on its own scoped reset. Its best score was **−6.8309565787**, gematria.jpg / mod29 / sign − / Atbash.

The newly completed [corrected 72-configuration run 43968231849](https://github.com/FlareZ123/liber-primus/actions/runs/43968231849) tests **only** p0[13:103], the first 90 genuine black-body runes. The original p0 ciphertext is not modified; the red prefix is excluded only for this *alternate key-clock hypothesis*. It holds historical file byte offset zero and tests:
- the three original files, each as key material;
- three predeclared byte→GP29 mappings: residue modulo29, scaled29, and 5-bit rejection;
- two starting key-symbol offsets, **0** and **13** (body-reset versus continuation past the visible 13-rune rubric);
- both additive signs and direct versus Atbash ciphertext interpretation.

That is **3×3×2×2×2=72** source-bounded readings. Each proposed rune sequence is separately re-enciphered using the pinned Campaign XVIII skip-aware decoder, with no fitted arbitrary audio/file offset, cipher-alphabet key, or extra transformation. The preset screening threshold is **score > −6.0**; any survivor would have triggered decoding and re-enciphering the complete 249-rune black-body section.

## Original-source result

| Observation | Result |
| --- | --- |
| Completed corrected original p0-body settings | **72/72** |
| Configurations exceeding preset score −6.0 | **0/72** |
| Complete p0-body decodes triggered | **0** |
| Best candidate | **twitter.bin**, mod29, key-symbol offset0, sign−, Atbash |
| Best 90-rune normalized quadragram score | **−6.6469199262** |
| Full-page GP29 plaintext authenticated | **None** |

The best original decoding begins **EGNGHEAUMPCAOEHMIREOGLEWRAEOETHHWUEANROHSAOAEFTHOEX...**, with no sustained source-native passage. The score does not cross the already selected screening gate. Every candidate passes the algorithm's inverse re-encryption check; that tests implementation consistency and is not evidence for a genuine key.

The same workflow planted a 240-rune source-native GP-English passage under each mod29 historical key source using the tested skip mechanism. Exact recoveries were **240/240 for 761.MP3**, **240/240 for twitter.bin**, and **229/240 for gematria.jpg** (95.4167%). The last result is an explicitly imperfect positive, so the gematria.jpg negative is a bounded screen rather than a guaranteed all-candidate exclusion. All three source files passed byte identity and the original XOR relation.

The actual completed [workflow](../.github/workflows/lp2-2013-761-twitter-p0-body-skip.yml), [read-only source-pinned test](../sims/lp2_2013_761_twitter_pair_p0_body_skip_sft.py), and [run artifact including full report.json and logs](https://github.com/FlareZ123/liber-primus/actions/runs/43968231849/artifacts/14277603053) give the exact 72 candidate records, full calibration and source checks.

## Research decision

**Retire the two tested byte-zero historical-source GP29 key-skip transfers:** p0 original red-plus-black opening with continuous reading and, separately, p0's black-body opening after its red rubric, as well as the independently reset p54+p55 target. Neither stage yields authentic plaintext under the locked candidate set. A contiguous whole-book key clock, an independently supplied manuscript-specific byte alignment, a different cryptographic consumer, and non-English intermediate contents remain beyond these experiments.

The source p57↔2013 PARABLE relation is genuine; the specific source-to-cipher key transfer failed. Do not restart an arbitrary audio-offset, reducer, or key-skip threshold sweep without a new original source clue fixing those choices. No change to the repository's authoritative recovered-plaintext synthesis is warranted.
