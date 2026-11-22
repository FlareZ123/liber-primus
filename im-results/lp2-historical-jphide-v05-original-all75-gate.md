# Historical JPHide/JPSeek v0.5: complete archived-JPEG original-carrier gate

**Classification (Agent 41, 13 November 2026): bounded negative on one password-dependent steganographic wire.** No unknown LP2 plaintext, cipher key, new instruction or continuation destination was recovered. This result does not prove the JPEG corpus contains no steganography.

## Independent source and decisive question

Cicada demonstrably used image steganography in earlier rounds, including the signed 2016 JPEG OutGuess payload. The original Liber Primus archive has 75 JPEGs, whose quantized compression coefficients could carry extra messages. Previous repository work checked JSteg/OutGuess variants but had no full-artifact JPHide/JPSeek v0.5 check. That is a historically available password-protected JPEG DCT format. The Liber Primus source itself does not instruct a reader to use JPHide. This is a bounded experiment into one genuinely distinct carrier extraction, with no cipher-score fitting.

The test reads **all 75 original archived images**, resources/liber-primus/00.jpg through 74.jpg, without changing their bytes. The first 17 are solved LP1 scans; the remaining 58 are LP2, including the numeral-only page. The JPHide v0.5/0.51 compatible decoder is the external GPL-3.0 project [rickschaves/stegostudio](https://github.com/rickschaves/stegostudio/tree/201689b5755c0f1267223cd881429e679230b835), exactly pinned at **201689b5755c0f1267223cd881429e679230b835**. The decoder implementation is modern, while the format is historical. Its code is imported as an external dependency at runtime, not vendored into this repository.

Nine artifact-literal ASCII passwords were fixed independently of decoded output: 3301; 7A35090F; FOLD; epiphany; THE PRIMES ARE SACRED; THE TOTIENT FUNCTION IS SACRED; Liber Primus is the way; LET THE TEXT GUIDE YOU; SOME WISDOM. Case is exact. They are from the Cicada identifier, LP1 solved wording, a visible LP2 word and the archived 2016 signed message. The sources do not assert any of them as a JPHide password, so a negative only concerns the bounded list.

## Historical positive control and original outcome

A genuine third-party JPHide v0.5 mode0 JPEG fixture, lightening_jars_btv.jpg, hides a GIF under password tyui. Before testing LP2, the upstream decoder recovered **11,067/11,067** GIF bytes, exact SHA-256 **3090490d03ebbd27d1f61cbd39061ed19168e1a95df7fa8cb6db138ff25be40e**; a wrong-password check returned null. This tests the actual original format and header verifier, rather than merely expecting random bytes to look nonlinguistic.

Across **75 × 9 = 675** exact original-JPEG/password checks, **zero JPHide v0.5 headers were verified** and no message was recovered. The source includes grayscale JPEGs, so this exclusion is conditional on the decoder's supported JPEG structures. No other passwords, bit positions, output alphabets or second-layer keys were fitted.

An initial 12-LP2-image, seven-key probe had independently passed (84 tests, zero headers), and the expanded whole-archive test supersedes its limited image coverage.

**Reproducer:** [sims/lp2_jphide_v05_original_carrier_gate.cjs](../sims/lp2_jphide_v05_original_carrier_gate.cjs), one CommonJS SFT running on Node22/Windows. The manual workflow [lp2-jphide-v05-original-manual.yml](../.github/workflows/lp2-jphide-v05-original-manual.yml) checks out the pinned upstream SHA and runs the source-exact test. [Successful original-input CI run 43404400677](https://github.com/FlareZ123/liber-primus/actions/runs/43404400677) prints the 75 original image statuses and final verifiedHeaders=0.

## Decision

Retire blind JPHide-v0.5 extraction with these nine source-literal passwords across the complete archived corpus. This does not exclude a different password, format version, yet-unidentified archival carrier, or the genuine 2016 OutGuess extraction.

Any successor needs independently sourced password or format instructions; expanding guessed-password space cannot currently reveal a causal route to plaintext.
