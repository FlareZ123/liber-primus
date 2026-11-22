# Eight original p50 256-bit column keys: AES-256-CTR / ChaCha20 GP29 original-input test

**Agent7, 22 November 2026. Classification: bounded source-shaped candidate key and cipher test, negative. No unknown LP2 plaintext, authentic algorithm/IV, or decrypted page.**

## Motivated key hypothesis

The original LP2 number-table spread, physically p49–p51, has exactly **32 printed rows × 8 columns** of two-character base60 cells. Its decoded cell values are bytes. Reading each **vertical column** top-to-bottom yields exactly **32 bytes = 256 bits**, a conventional key size for AES-256 and ChaCha20. This is a new and independently source-visible way to obtain a small, fixed set of substantial keys; it demands no high-entropy free-text guess and is historically plausible for a technically literate 2014 cipher designer. There are eight long original unknown sections p0–53, plus one short terminal section p54–55. **No source text confirms that these columns are cryptographic keys, names either primitive, or gives the required nonce/IV.** The test therefore fixes a single non-tunable 16-byte zero IV and treats this as an explicitly speculative architecture.

The exact [read-only Node.js22 original-source program](../sims/lp2_p50_8x32_native_stream_keys_sft.cjs) does the following:

1. Decode only the authentic table's 256 cells using the repository's pinned `base60-grid.json` and take eight raw **32-byte column keys**, never replacing any with synthetic entropy.
2. Use Node/OpenSSL `aes-256-ctr` and `chacha20` `createCipheriv` on zero-filled input to generate key streams, with **16-byte all-zero IV** and no salts or password stretching. Both primitives are available on the actual Windows Node22 runner.
3. For each original source's exact contiguous 29-rune ciphertext, calculate `P_i=(C_i ±(stream[i] mod29)) mod29` (direct additive mode), and `P_i=(C_i−C_(i−1) ±(stream[i] mod29)) mod29` (ciphertext-predecessor-relative mode, reset first predecessor to0 per section).
4. Do **not** assume the eight source columns necessarily correspond to the eight long sections in numerical order. Each column is tried independently against **each of the nine original LP2 sections**, removing only column-to-section assignment uncertainty; there are **9 × 8 × 2 × 2 × 2 = 576** original tests. **No additional IV, AES mode, hash-derived column, source mutation, dynamic key phase, block rotation, or cipher-family selection** is tuned.
5. Reassemble all words with the canonical original printed 2,896 GP-rune-word boundaries, including **32** words spanning physical page seams, with full exact data equality assertions; score the outputs using the pre-existing source-native original-GP Gibran dictionary of **2,482** distinct words and the 29-symbol index of coincidence. The sample English oracle's GP spellings and multi-rune letters are preserved exactly.

## Exact original results

**No original output shows English/Gematria word continuity.** Best individual outcomes are dominated by one- and two-rune accidental word hits. The table gives the **best of all 64 key/algorithm/mode/sign variants per original section**, meaning a weaker source-ordered assignment cannot rescue the hypothesis.

| Original section | Source runes | Highest native-GP dictionary runes / total | Native-GP ≥4-rune words in best result | Best candidate IoC |
| --- | ---: | ---: | ---: | ---: |
| p0–2 | 729 | 17/729 (**2.33%**) | 0 | 0.03445 |
| p3–7 | 1,145 | 22/1,145 (**1.92%**) | 0 | 0.03428 |
| p8–14 | 1,729 | 24/1,729 (**1.39%**) | 0 | 0.03470 |
| p15–22 | 1,903 | 26/1,903 (**1.37%**) | 0 | 0.03443 |
| p23–26 | 1,021 | 16/1,021 (**1.57%**) | 0 | 0.03419 |
| p27–32 | 1,433 | 21/1,433 (**1.47%**) | 1 | 0.03423 |
| p33–39 | 1,680 | 27/1,680 (**1.61%**) | 0 | 0.03431 |
| p40–53 | 3,008 | 45/3,008 (**1.50%**) | 1 | 0.03444 |
| p54–55 | 308 | 7/308 (**2.27%**) | 0 | 0.03517 |

The IoCs in the last column correspond to each section's *best lexical candidate*, and are **not** maximum IoCs over the tested family. A separate exhaustive IoC ranking peaks at **0.03625365** on short 308-rune p54–55, consistent with near-uniform GP29 output. For perspective the original printed English GP runes on clear p57 have **IoC=0.06270997** (95 source runes), while the original p0 ciphertext has **IoC=0.03430727** (262 source runes). This contrast is descriptive, not a language-proof bound. A counterexample with exotic encoding or deep nested encryption remains possible.

**Positive cryptographic control:** The known **95 source runes of the authentic clear p57**, encrypted under each true original 32-byte column key, each named standard cipher, and both modes/signs, are always completely recovered and re-enciphered byte-for-byte. Thus **64/64 planted inverse/re-encryption controls pass** without using unknown ciphertext as a planted positive.

**Native Windows Node.js22 PASS:** [Actions run 44970614711](https://github.com/FlareZ123/liber-primus/actions/runs/44970614711), original exact-input assertions, 576 real-section candidates and 64 original-cleartext controls. The original 256-byte source table stays unchanged.

## Decision and mechanism boundaries

**Retire exactly the two named zero-IV AES-256-CTR/ChaCha20 source-column-key models with straightforward GP29 direct-additive and previous-ciphertext-differential readout.** With no long source-native words and no linguistic IoC, there is no evidence that any of the eight original 32-byte columns is a directly usable raw encryption key under these frozen operations. The absence of a historical nonce and of a source-selected GP29 symbol conversion is a real missing ingredient, so this does **not** eliminate encryption by those primitives with other IVs, byte conversion, key derivation or a separate anti-repeat layer. Do not expand into arbitrary 256-bit key/nonce hunts without a fresh original clue that fixes such a choice.

Source extraction and decryption program: [`sims/lp2_p50_8x32_native_stream_keys_sft.cjs`](../sims/lp2_p50_8x32_native_stream_keys_sft.cjs); manual-only [Windows workflow](../.github/workflows/agent7-p50-eight-column-stream-key-sft.yml). The stronger unsolved-runic fingerprint and p50 digit-zero conditional collision results remain independent; neither has been explained by this frozen key architecture. **No unknown plaintext has been recovered.**
