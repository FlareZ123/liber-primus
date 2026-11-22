# Page-15 Fibonacci-square keys against original whole-LP2 AES envelopes

**Classification (12 November 2026): original-input, source-derived candidate inverse; bounded negative.** The physical p15 4×4 numeral square yields sixteen integers in a documented central clockwise spiral, and established earlier scripts derive 40 reproducible sixteen-byte AES keys from the original numbers, their differences from 3301, Fibonacci-indexed primes and Fibonacci ranks. The exact original unsolved runic sequence has 12,956 symbols. This study asks whether these existing source-chosen values decrypt the complete stream as an ordinary 2014-era binary AES message. No recovered plaintext, hidden destination, or authentic cipher has resulted.

## Specific hypothesis and strongest objection

The canonical source-ordered GP29 runes of physical pages 0–55 interpreted as **one big-endian base-29 integer** serialize to **7,868 minimally encoded bytes**, SHA-256 `c6eae1335b7809becbdb6a2bc9895a1efbfe705adf75d6990bc4aaf37b41ad62`. This is precisely long enough to hold a conventional **12-byte nonce + 7,840-byte AES-GCM ciphertext + 16-byte authentication tag**. Alternatively, it can hold a 12-byte nonce followed by **7,856 AES-CTR bytes, 491 blocks of sixteen bytes**. Neither format is prescribed in the manuscript. In particular, a length decomposition observed after seeing the ciphertext must **never** count as independent evidence for AES or the framing.

The separately visible p15 square contains sixteen numbers, a plausible AES-128 key source, though neither the authored images nor signed messages explicitly specify AES encryption, byte-reduction of those integers, a nonce, or a binary serialization of the whole rune stream. Thus the candidate is a finite opportunistic attempted **plaintext recovery**, not a proposed authenticated solve-path.

## Exact fixed tests

Existing `sims/fibonacci_aes128_grid_key.cjs` produces **40 keys** from five p15 representations × printed/spiral order × forward/reverse × direct/negated residues mod256. It already checked those keys against the p50 *256-byte table*, a separate consumer. The present tests are a distinct candidate consumer, the **entire unknown GP29 ciphertext**. Every visible rune is retained; no fitting, key stretch, passphrase, page shift, or skipped F exception is introduced.

1. **Whole AES-128-GCM envelope:** first12=nonce, last16=tag, middle7840=ciphertext. All 40 source keys must pass full tag verification. Test `sims/lp2_p15_fullstream_aes128_gcm_sft.cjs`.
2. **Nine original red-title units, independently framed GCM:** use exactly the source-delimited original rune start offsets `[0,729,1874,3612,5506,6527,7960,8051,9640]`, as documented in `sims/issue335_nine_base29_binary_sft.cjs`. Decode each unit as its own minimal base29 integer, then nonce12|ciphertext|tag16. Serialized byte lengths: **[443,696,1056,1151,620,871,56,965,2013]**. Test all 9×40 = **360** independent authentications. Test `sims/lp2_p15_nineunit_gcm_sft.cjs`.
3. **Whole AES-128-CTR direct byte format:** first12=nonce, rest7856=ciphertext; construct sixteen-byte IV as the 12-byte nonce plus standard big-endian initial counter **0 or 1**, test 40×2=**80** decryptions. There is no tag in CTR, so a candidate would need an *independently recognizable* full printable-ASCII stream, every byte a native GP index 0–28, strictly valid UTF-8, or a common binary-file header at byte zero. Test `sims/lp2_p15_fullstream_ctr_sft.cjs`.

All three use exact original corpus, existing independent key-derivation implementation and the public Node.js built-in crypto library. Each pipeline passes its full byte-for-byte known LP1 plaintext encryption/decryption plant; GCM additionally rejects an altered tag.

## Observations and decision

| Mechanism | Candidate decryptions | Original-input outcome |
| --- | ---: | --- |
| Whole AES-128-GCM | 40 | **0 valid authentication tags** |
| Nine-unit AES-128-GCM | 360 | **0 valid authentication tags** |
| Whole AES-128-CTR (counter 0/1) | 80 | **0** wholly printable ASCII, native GP byte arrays, strictly valid UTF-8 or recognized source-prefix file headers |

The highest CTR printable-byte count is **3,100/7,856**, with GP native-index count **878/7,856**, qualitatively consistent with pseudorandom output rather than directly recovered prose or a rune-byte stream. Its first 32 bytes are `94ed9da6224f60bc314e003c2a73695e2b22aa05628baaf005f66b123be53209`; this is not a decryption crib or key.

**Decision:** retire the exact p15 Fibonacci-square AES-128 keys as a direct **whole-GP29 binary AES-GCM or AES-CTR plaintext source** under the three frozen layouts. This says nothing about derived keys, different stream registers, different key consumers, alternative GCM AAD or formats, or an unknown opaque binary plaintext inside CTR output. A further dependent AES search would need a genuinely original instruction fixing the additional transform, nonce, or consumer, rather than another retrospective byte-length alignment. No original LP2 unknown plaintext has been recovered.

## Reproduction

The [successful original-input GitHub Actions run 43163154663](https://github.com/FlareZ123/liber-primus/actions/runs/43163154663) executes all three scripts in [the manual workflow](../.github/workflows/lp2-p15-fullstream-gcm.yml). Exact checked-in inputs and code:

- [Whole GCM SFT](../sims/lp2_p15_fullstream_aes128_gcm_sft.cjs)
- [Nine-unit GCM SFT](../sims/lp2_p15_nineunit_gcm_sft.cjs)
- [Whole CTR SFT](../sims/lp2_p15_fullstream_ctr_sft.cjs)
- [Existing independent p15 key construction](../sims/fibonacci_aes128_grid_key.cjs)
- [Canonical original GP29 corpus](../resources/liber-primus/lp2-corpus.json)
