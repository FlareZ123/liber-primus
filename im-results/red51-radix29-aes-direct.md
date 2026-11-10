# Source-defined radix-29 red-verse AES inversion: original LP2 negative

**Agent 22, 2026-11-10. Classification: scoped original-ciphertext negative; no unknown plaintext, genuine key, cipher family, or puzzle destination recovered.** The [complete Node.js reproducer](../sims/red51_radix29_aes.cjs) ran on all authentic 12,956 LP2 unresolved ciphertext runes and all 256 original grid bytes in [successful manual CI run 42781627839](https://github.com/FlareZ123/liber-primus/actions/runs/42781627839). Both independent exact synthetic inversions passed.

## Distinct original-source construction

Original physical LP2 page 53, image 70.jpg, has a verified *contiguous 51-rune red stanza* at page-local offsets [128,179). The preceding 128 black runes occupy [0,128). Both spans are in the [corrected color annotation](../resources/liber-primus/lp2-page53-red-span.json) and [canonical corpus](../resources/liber-primus/lp2-corpus.json).

The 51 red GP indices are interpreted as the digits of **one big-endian base-29 integer**, a natural positional encoding for 29 rune values. Because 29^51 is below 2^248, its 32-byte left-zero-padded representation supplies a 256-bit AES key. This differs from the prior [five-bit digit packing](red51-fivebit-key-iv.md), which leaves a one-bit source gap. The 128 preceding black rune indices supply a deterministic 128-bit IV by concatenating their least-significant bits; zero IV is the second fixed choice.

Four key orientations (forward, reversed, GP-Atbash, reversed GP-Atbash) and two IV choices (zero, black parity) are crossed with the following exact families:

- On the authentic 256-byte base60 grid of physical LP2 pages 49–51: AES-256 CBC, CTR, CFB and OFB under either IV, plus ECB once per key. **36 complete grid decodes.**
- On all **12,956 original unresolved GP indices**: eight AES-256-CTR keystreams, reduced bytewise modulo 29, each tested under additive signs +1 and −1. **16 complete rune decodes**, retaining every rune boundary. The first 4,096 runes are also reported independently.

Original red-index SHA-256: e7b57e10958a5188233b3f8d08a179a2773b423c26cda49238c7e3b0ffe4828d. Original grid-byte SHA-256: 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

## Original source outcomes

| Measurement | Result |
|---|---:|
| Highest grid ASCII tab/LF/CR or printable count, over all 36 | **115/256** bytes |
| Strictly printable count in the same best grid output | **111/256** bytes |
| GP-range (byte below 29) count in that output | **23/256** bytes |
| Best grid variant | Reversed red digits, black128 parity IV, CTR (CFB ties at 115) |
| Original full unresolved-rune IoC | **0.03447839786** |
| Best of 16 entire-book AES-CTR mod29 inverse IoCs | **0.03451569418** |
| Best of 16 first-4,096-rune inverse IoCs | **0.03456172734** |
| Best GP variant | Reversed red digits, black128 parity IV, subtract AES keystream mod29 |
| Independent uniform 29-rune reference | **1/29 ≈ 0.034482759** |

Neither original GP candidate reads as English, and the best whole-book rune concentration barely differs from a uniform 29-symbol stream. This does not assume genuine hidden plaintext must use the same natural-language character profile.

## Matched 36-model grid null and planted positives

The best of 36 strongly dependent AES outputs requires a *family-maximum* null. Hold the **exact original 51 red rune values as a multiset** and independently draw **4,000 Fisher–Yates shuffles** of their order using seeded xorshift32 (0x22a51e51). Regenerate all four key orientations and examine the same 36 transformations per shuffle with the **original grid bytes and original black/zero IVs fixed**. This preserves the actual selection multiplicity and source symbol counts.

- Original maximum: **115** ASCII-like bytes.
- Mean of 4,000 null family maxima: **114.05925**.
- Shuffled families matching/exceeding original: **1,648/4,000**.
- Add-one upper-tail empirical p: **1,649/4,001 = 0.4121469633**.

This source-multiset-conditional test does not claim every 51-symbol key origin is equally likely. It specifically calibrates the observed output criterion for the declared source family.

The script creates a planted 256-byte AES-CBC ciphertext, then recovers **all 256 original bytes** under the correct red-derived key. It also encrypts all 12,956 GP source positions by a candidate AES-CTR mod29 additive stream and inverts all positions exactly. Those true forward/inverse tests establish the mechanism is correctly implemented.

## Distinct source-constrained test: three 80-bit onion identifiers in 51 GP red runes

The same original **51 contiguous red runes** also admit the exact capacity-matched splitting **3×17 base-29 digits**. One 80-bit Tor-v2 address of 16 Base32 characters occupies at most 17 native GP digits; the [historical source manifest](../resources/cicada-hiddenservice-256-candidates.json) records three contemporary 16-character onion identifiers. This test asks whether the marked stanza directly encodes *those specific three addresses* in some order; their historical presence does not establish that they were intended as its plaintext.

The [exact known-target inversion](../sims/red51_onion_v2_source_crib.cjs) tries all **3! permutations of the three known labels**, both complete red-string directions and both Base32 digit orientations, permitting **one entirely unknown bijection of all 29 GP digits**. Hungarian optimization solves all **29! potential rune substitution alphabets exactly** for each alignment. The best of the **24** original-source cases matches only **26 of 51** aligned digits, so **25 digit mismatches are mathematically unavoidable** under any fixed alphabet. After 400 source-rune multiset shuffles, **300/400** complete optimizer runs attain at least 26 matches (conditional add-one p **301/401=0.75062**). A planted cipher with an arbitrary secret 29-symbol permutation recovers **51/51** matches.

A second, independent source-motivated decoder uses the **actual solved LP2 p56 prime/totient key recurrence**, both signs, either clock direction, a free global GP shift and unknown start within the first **2,000,000 primes**. The first original or reverse-orientation **17 red runes** are tested as a complete known-address crib under six label/orientation variants, **48** first-block modes in total. The largest exact initial matched prefix was **6/17**, with **zero** complete 17-rune source crib matches. A planted onion encoded at secret prime index 194,031 with hidden additive sign and offset was recovered **17/17**. This is a finite direct prime-clock exclusion. It does not cover cipher-key interruptions not observable in that prefix, unknown addresses, arbitrary rune alphabets *combined* with a prime stream, or a nonlinear external transformation.

Both source inverses ran successfully under [manual CI 42839883665](https://github.com/FlareZ123/liber-primus/actions/runs/42839883665), and neither establishes an unknown LP2 plaintext or destination.

## Decision

**No usable original plaintext or independently predictive key occurs in this bounded source-radix29/AES family.** The best grid result is typical under the matching complete-family null, and the best rune result remains near uniform. Repeating the same orientations and AES modes does not add evidence.

The result does not exclude the marked red span as a key for a different cipher, a binary payload with another formatting layer, a different IV or KDF, an unknown alphabet, or a separate clue. Any such alternative needs its own independent source motivation, original-input plaintext recovery and exact forward re-encryption.

**Reproduce:** [source](../sims/red51_radix29_aes.cjs) through Node.js 22; or dispatch the existing [red51 workflow](../.github/workflows/red51-fivebit-key-iv-manual.yml) with input **probe = radix29**. [Successful complete original-corpus CI: 42781627839](https://github.com/FlareZ123/liber-primus/actions/runs/42781627839).
