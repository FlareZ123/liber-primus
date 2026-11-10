# Historical Cicada source material under original-LP2 reversible stream-key inversions

**Evidence class:** finite source-selected candidate-key families with planted decryption and original-page holdout. Agent 13, 10 November 2026. **No unknown LP2 plaintext, authentic key, cipher mechanism, or intended destination recovered.**

Two independently documented pieces of historical Cicada cryptographic data have now been challenged under precisely declared AES-256-CTR/ChaCha20 stream systems. Both sources fail on original LP2. The common method handles up to one collision-rejected keystream draw per plaintext symbol through the same exact constrained inverse; source-heldout GP-English controls show the approach can discriminate a correct key.

| Source-derived candidate family | Fixed model count | True-key language-ranked plant | Original train-selected model, frozen heldout |
| --- | ---: | ---: | ---: |
| 2013 onion cookie values 167/761, including bounded derived keys | 112 keyskip; 168 direct-stream | 1,260/1,260 GP runes recovered under known key | −5.722980 nats/rune (keyskip); direct-stream heldout IoC 0.03448625 |
| 2014 factored RSA-432 private/public integers p,q,n,d | 192 keyskip | 1,258/1,260 blindly; 1,260/1,260 with planted exact skip witness | **−6.032611** nats/rune; postselected best heldout −5.578974 |

The language-ranked positive plant's heldout score is −2.540183 for the 2013-cookie family and −2.703607 for the 2014-RSA family. These are diagnostic source-model scores, not universal p-values. Source-specific tested derivations and modes are given below.

## 2013 onion-cookie source keys

## Independent historical key hypothesis

A preserved [2013 Cicada hints archive](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) reports two 64-hexadecimal-digit cookie values from the old `p7amjopgric7dfdi.onion` server under the labels `167` and `761`. Each value is exactly **32 bytes**; the labels are decimal digit reversals. The original intended role of the cookies is unknown. Their 256-bit length motivates a narrow test as native AES-256/ChaCha20 keys, without treating a session cookie as authenticated LP2 key material.

Seven source-controlled keys are tested: each cookie as written, each byte-reversed, their bytewise XOR, and SHA-256 of their concatenation in each order. The full test crosses **seven sources × two stream ciphers (AES-256-CTR, ChaCha20) × three clocks × two byte reductions × two directions = 168 models**:

- The clocks are continuous zero-IV across all unsolved pages, zero-IV reset at each page, and page-number-in-IV reset at each page.
- Byte-to-rune mapping is raw byte modulo 29 or `floor(byte * 29 / 256)`.
- Both additive inverse directions operate on the actual 29 Gematria Primus indices.

The actual ciphertext input consists of **all 12,956 runes of the 55 rune-bearing unsolved LP2 pages**, from the canonical original-page data. The training set is even physical pages; odd physical pages are untouched holdout. Language screening measures the pooled 29-way index of coincidence of the inverse-decrypted symbols.

## Completed original-ciphertext result

[Successful GitHub Actions run 42789169226](https://github.com/FlareZ123/liber-primus/actions/runs/42789169226) executed the entire fixed model family and the same-family planted control under Node.js 22.23.4.

| Result | Training IoC | Held-out IoC |
| --- | ---: | ---: |
| Original ciphertext, winner selected on training | **0.0346325095** | **0.0344862496** |
| Original ciphertext, *postselected* best held-out candidate | 0.0344402676 | 0.0346191118 |
| Exact synthetic GP-English encrypted with source cookie 167 as AES-256-CTR, page-index IV, byte-mod29 | **0.0553368377** | **0.0559267837** |
| Uniform 29-rune reference | **0.0344827586** | **0.0344827586** |

The fixed original-training winner is **cookie 167, ChaCha20, zero-IV page reset, byte-mod29, positive encryption sign**. The original held-out score is effectively uniform; it does not recover recognizable LP2 English.

The positive control uses a disjoint Shakespeare-derived GP-English passage, the authentic page lengths, an actual chosen 2013 cookie, and **342 deliberately injected adjacent-repeat alterations** at an 81% collision rewrite probability. The exact true key and transformation ranked **first of all 168 models**, retained GP-English concentration on both manuscript halves, and produced a substantial separation from all incorrect models. The visible synthetic forward transform is directly invertible before the optional deliberate overwrite. This demonstrates the test would detect the specified key architecture despite several hundred mutations.

## Collision-aware exact keyed inverse on original LP2

The direct-position test would miss a source-correct key if cipher-output collisions consume discarded keystream bytes. We therefore reused the repository's existing [exact collision-conditioned Viterbi inverse](../sims/grid_stream_collision_viterbi.cjs), without fitting any new original ciphertext-dependent key bytes.

The model generates a sequence of possible encrypted runes from a fixed AES/ChaCha20 source key. A keystream draw can be rejected only when it would output the immediately preceding published ciphertext rune. Viterbi allows zero or one such rejected draw per symbol (at most 34 over the examined prefix) and uses independently trained Shakespeare GP trigram probabilities to rank possible paths. Seven fixed source keys, two stream ciphers, zero-IV/page-index-IV, two byte-to-rune reductions, and both additive signs yield **112** complete settings.

The six independently chosen red-heading pages **0, 3, 8, 23, 27 and 40** contribute their original first 130 rune symbols for key/mode selection. The following **80 genuine original symbols per page** form a frozen original-source holdout. Each page's key state starts independently, and the inferred rejected-draw count is carried into its holdout stream position. No unknown LP2 plaintext is used as a training label.

[Successful CI run 42790708438](https://github.com/FlareZ123/liber-primus/actions/runs/42790708438) ran all 112 exact inversions and a source-correct planted English ciphertext with the identical page layout. [Final assert-backed run 42792747159](https://github.com/FlareZ123/liber-primus/actions/runs/42792747159) confirmed that decoding the entire 210-rune planted interval on each of the six pages under the true source key recovered **1,260/1,260 true GP-English runes exactly**, including the positions following actual discarded keystream draws. The runnable now asserts this exact recovery on every future invocation. The positive generator rejected an actual draw with 81% probability when its output would repeat the predecessor, then reapplied the same rule to the remaining draws. The exact native-cookie167 AES-256-CTR key, page-index IV, byte-mod29, positive sign ranked **1/112** on independent planted data.

| Inverse test | Training GP-trigram nats/rune | Held-out nats/rune |
| --- | ---: | ---: |
| Source-correct collision-keyskip English plant | **−2.543416** | **−2.540183** |
| Best model fitted on original LP2 | **−5.665458** | **−5.722980** |
| Original best heldout score after inspecting all models, descriptive only | −5.758676 | −5.662090 |

The highest training-ranked source model on actual LP2 emits gibberish under all six page-specific inversions. Its heldout language score is greatly worse than the correctly keyed planted control. No original plaintext, key, or inferred authentic rejection sites have been recovered. This extends the negative conclusion to **the declared exact collision-rejected stream model**, which is a stronger attack than direct fixed-position subtraction. The result does not exclude an unrelated stateful transducer or hidden-source key derivation.

Reproducer: [`sims/onion_cookie_keyskip_inverse.cjs`](../sims/onion_cookie_keyskip_inverse.cjs), invoked in the same manual workflow as the direct test.

## Factored 2014 RSA-432 material: a separate historical key source

Cicada's original 2014 RSA-432 factoring challenge was solved publicly, providing the exact two factors
`p = 97513779050322159297664671238670850085661086043266591739338007321` and
`q = 77506098606928780021829964781695212837195959082370473820509360759`, with exponent `e=65537`. The [historical solver account](https://connortumbleson.com/2021/02/15/the-cicada-3301-mystery-puzzle-3-part1/) records both factors, independent of our cipher hypotheses. The [runnable source-key test](../sims/rsa2014_factored_key_inverse.cjs) computes their product `n`, Euler totient, and modular-inverse private exponent `d` exactly, checking that the public modulus is the expected 432-bit number.

For a bounded key-derivation family, SHA-256 is applied to unsigned minimal big-endian `p`, `q`, `n`, `d`, and concatenated `p||q` and `q||p`; SHA-256 of the decimal `n` and `d` strings is also tested. The leading and trailing 32 bytes of unsigned big-endian `n` and `d` give four direct 256-bit truncation candidates. This fixes **12** candidate keys without using any LP2 ciphertext values to build them. Crossing **two ciphers × two IV clocks (all-zero versus physical-page index) × two byte-to-GP reductions × two signs** yields **192** original-input models.

Original selection uses the first 130 runes of six authentic red-heading physical LP2 pages **0, 3, 8, 23, 27, 40**. Their next 80 runes per page form unchanged continuation holdouts, with each page's inferred rejected-draw offset carried forward. The common Viterbi language model trains on an independent 210,000-character Shakespeare reference interval. The fixed stream model allows zero or one collision-rejected pad draw per plaintext symbol, up to 34 extra draws in the original 130-rune prefix. Source bytes and IVs are frozen before training, and original text influences only the ranking among complete source-fixed models.

The [completed manual CI run 42799084155](https://github.com/FlareZ123/liber-primus/actions/runs/42799084155) reports:

| Measured candidate | Mean train GP-trigram score | Frozen original heldout |
| --- | ---: | ---: |
| Source-true synthetic GP-English plant, RSA-derived `SHA256(p||q)`, AES-256-CTR, page-index IV, modulo-29, positive sign | −2.512006 | −2.703607 |
| Original training winner, `SHA256(n)`, ChaCha20, page-index IV, scaled-29, positive sign | **−5.680608** | **−6.032611** |
| Descriptive postselected original heldout winner, `SHA256(p)`, AES-256-CTR, zero IV, modulo-29, negative sign | −5.848564 | −5.578974 |

The planted source-correct key/mode ranks **1/192**. The blind language-model inverse correctly assigns **1,258/1,260** known GP-English runes; a separately retained exact synthetic skip-state witness proves **1,260/1,260** correct known-key plaintext recovery and forward re-encryption. The two language-ranked errors are explicit and should not be described as perfect blind recovery. The manuscript candidates are random-looking rune strings with much worse scores than the source-true positive. There is no genuine unknown LP2 plaintext, private key relation to LP2, or decoded destination.

This experiment excludes only these SHA-256/truncation key derivations in the declared cipher and clock families. The RSA factors themselves are independently valid historical solver material; their proposed use as LP2 AES/ChaCha keys is unsupported, and the negative original result closes that specific reuse of the clue. A source-authenticated instruction would be needed to justify expanding the RSA derivation family.

## Interpretation and reproducibility

The 2013 cookie source and 2014 RSA-factor source fail to explain original LP2 under the exact source-byte derivations and AES/ChaCha20 collision-keyskip architectures above. An independently demonstrated original-source inverse remains the decisive requirement. The finite results leave open intermediate KDFs, word-local transformations, alternative state machines, independently unknown IVs, non-English source registers, or unrelated archived key material.

Reproducer: [`sims/onion_cookie_key_probe.cjs`](../sims/onion_cookie_key_probe.cjs) reads the original LP2 corpus, generates every byte stream using built-in Node.js cryptography, checks the planted-key rank, and prints all original-training leaders plus the holdout decision. The [manual-only runner](../.github/workflows/onion-cookie-key-manual.yml) invokes both reproducible tests without adding per-commit CI. Neither historical source should be promoted to established LP2 key material without an independently demonstrated inverse on original ciphertext.