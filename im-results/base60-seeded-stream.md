# LP2 base-60 table as stream-cipher key material: three controlled screens

**Classification:** bounded cryptanalytic negative on 2026-11-10 (Agent 12, extended by Agent 1). No LP2 plaintext, recovered key, or confirmed cipher mechanism. All three screens run on the original 12,956-rune unsolved corpus.

## Rationale and shared input

The base-60 grid spanning LP2 pages 49–51 contains **256 bytes**. It could serve as a 2048-bit RC4 key, a source for 256-bit AES/ChaCha keys, or another cryptographic artifact. The grid's natural 32×8 layout also gives eight 32-byte columns and eight contiguous 32-byte row-major slices. These candidate key interpretations are concrete enough for direct automated tests.

Scripts read the 256 grid tokens from `resources/transcriptions/liber_primus_master.txt`, decoding base 60 with the alphabet `0–9 A–Z a–x`. The corrected 256 bytes have SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. Rune ciphertext comes from `resources/liber-primus/lp2-corpus.json`: 55 rune-bearing pages with 12,956 symbols, and manuscript page 50 left empty because it contains the numeric grid.

Both experiments score decoded rune index of coincidence `Σ n_r(n_r−1)/(N(N−1))` across the complete 12,956-rune corpus. Natural GP-English plaintext would give a strongly nonuniform symbol distribution and an IoC well above the random-rune benchmark **1/29 = 0.034482759**. This scoring requirement is restricted to a plaintext register resembling the control.

## 1. Natural 32-byte row/column keys

Source: [`sims/base60_seeded_stream.cjs`](../sims/base60_seeded_stream.cjs). [Successful manual CI run 42742817792](https://github.com/FlareZ123/liber-primus/actions/runs/42742817792).

- 32 keys: 8 rows, 8 columns, forward/reversed bytes.
- AES-256-CTR, ChaCha20, RC4; zero and page-index 128-bit IV conventions for block-based streams; page-reset stream for every page.
- Drops 0/256 (and RC4 3072); byte-to-rune mapping `byte % 29` or `floor(29*byte/256)`; additive/subtractive mod 29.
- **2,432 configurations**.

| Measurement | Value |
| --- | ---: |
| Original LP2 IoC | 0.034478398 |
| Highest decoded IoC | **0.034568719** |
| Winning candidate | reversed column 4, AES-256-CTR, page-last-LE IV, drop 0, modulo mapping, subtraction |
| Highest local page IoC among pages >=200 runes | 0.041039052 (p39) |

Positive control: fresh GP-like English-frequency plaintext at real page lengths encrypted with column 3, AES-256-CTR zero IV, drop 0, modulo map and addition, with a fixed-seed 81% correction of would-be identical consecutive ciphertext runes. The exact matching decryption ranks **first/2,432** at **IoC 0.065291199**; runner-up **0.034889539**. This is a single planted scenario, not a statistical power curve.

## 2. Whole-grid RC4 and hash-derived 256-bit keys, including continuous streams

Source: [`sims/base60_fullkey_stream.cjs`](../sims/base60_fullkey_stream.cjs). [Successful manual CI run 42744001873](https://github.com/FlareZ123/liber-primus/actions/runs/42744001873).

- Full 256-byte table and its reverse as RC4 keys; 32-byte SHA-256 of the table, reverse, and column-major ordering; left/right SHA-512 half-digests; first/last 32 bytes.
- RC4, AES-256-CTR, ChaCha20, with page reset or **globally continuous** key stream.
- Zero or page-number IV, forward/reverse arithmetic, drop 0/256/3072 where appropriate.
- Three byte-to-rune conventions: modulo, scale, and **unbiased rejection sampling of bytes 232–255**.
- **1,164 configurations**, separate from the prior screen (a small number of raw 32-byte configurations are conceptually shared).

| Measurement | Value |
| --- | ---: |
| Highest decoded IoC | **0.034552550** |
| Winning candidate | SHA-256(reversed grid), ChaCha20, page-reset zero IV, drop 0, scaled mapping, addition |

Positive control: encrypt 55 GP-English-frequency pages with **RC4 directly keyed by all 256 corrected grid bytes**, drop 256, one continuous stream, rejection-sampled bytes modulo 29 and addition. Inject a seeded **81% adjacent-repeat repair** (375 replacements). The exact matching inverse is **first/1,164** at IoC **0.064898229**; the next candidate scores **0.034566551**. This single artificial example validates model recovery under that configuration.

## 3. Author-native prime-clause discriminator on the complete source-key family

Source: [`sims/base60_source_prime_clause.cjs`](../sims/base60_source_prime_clause.cjs). [Successful manual CI run 42847588177](https://github.com/FlareZ123/liber-primus/actions/runs/42847588177), Agent 1, 10 November 2026.

This third test probes a **different plaintext fingerprint** from global rune frequency. Historical solved-Cicada *Parable*, *Some Wisdom*, and *An Instruction* yield 13 prime-valued GP clause sums among 16 deliberately selected original full-stop clauses; this is an author-specific discriminator with strong selection caveats ([original source and controlled scorer](author-native-prime-clause-discriminator.md)). It is useful when a plausible source-derived key decrypts into an unusual GP register, but whether unsolved LP2 uses the same punctuation convention is unknown.

Rescore the source-grid 256-byte RC4 and digest-derived AES-CTR/ChaCha20 streams from screen 2 under **3,492 reversible configurations**. Include both additive GP29 rune decoding and a 28-step predecessor-exclusion decoder that reserves immediate repeats for GP-EA, each with the stated page/continuous predecessor clock. Preserve all **175 actual printed LP2 full-stop clause locations**; select by prime-sum count on the **first 88 clauses**, then report the unfit **last 87**. Each model's transformation and byte-to-rune mapping is deterministic from the original numeric table. No language model, historical private key or unknown cipher state is fitted.

| Test | Prime-valued source clauses | Interpretation |
| --- | ---: | --- |
| Best original first-88 key: SHA256(reversed grid), ChaCha20 global, zero IV, drop0, modulo byte conversion, negative additive GP29 | **24/88 train** | Selected from 3,492 models |
| Same unchanged original key on last 87 clauses | **11/87 heldout** | No corroborating author-clause enrichment |
| Maximum over all keys on the entire 175-clause original (postselected) | **38/175** | Distinct from trained winner's 35/175 |
| Correct concealed source-grid/RC4/GP28-step key on a controlled native-GP plant | **87/88 train, 85/87 heldout; 172/175 total** | Recovered as unique trained winner and exactly decrypted **12,956/12,956** runes |

The plant constructs independently sourced GP-English ciphertext-shaped text and changes exactly **155 of its 175 clauses at one rune each** to make their sum prime; hence it is a deliberately high-signal power calibration, **not evidence that ordinary unknown LP2 authoring has a 172/175 signature**. Its exact round trip validates software invertibility; in any bijective family an incorrect key also roundtrips the original.

**Decision:** the original grid-source direct GP29/GP28 stream families fail to gain an independently discriminating prime-clause continuation despite a strong planted recovery. This is a finite original negative and does not exclude alternate punctuation registers, external key derivation, encrypted table payloads or unrelated ciphers. Further key guesses require an independent source rule that selects them.

## Conclusions and experimental limits

Neither of the two IoC screens finds a whole-corpus IoC appreciably beyond flat-rune noise; across the two rune-frequency bounded families the top score is 0.034568719. The first two planted controls recover their exact parameterizations at rank one despite deliberate anti-doublet repair. This disfavors direct reuse of the 256-byte table under the specified key extraction, stream cipher, page/continuity convention and encoding.

No candidate passes whole-manuscript plaintext verification because the results contain no language-like rune distribution. The finite search does **not** exclude arbitrary key derivation, unknown nonce/salt, drift induced by ciphertext collisions, byte-level transposition, keyed outer alphabets, mixed enciphering layers, or the possibility that the 256 bytes form an encrypted payload rather than a seed. No Monte Carlo family-wise p-value is claimed; the gap between positive and real scores is the principal calibration.

Prior authors have already investigated directly repeating the table as a rune key and other simple interpretations. Only the bounded standard-stream-cipher-key hypothesis tested here is the contribution of these two screens. Further testing should start from a new constraint on actual key generation, rather than extending permutations and ciphers indefinitely.
