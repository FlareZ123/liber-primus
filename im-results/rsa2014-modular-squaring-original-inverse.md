# Factored Cicada 2014 RSA modulus as an LP2 modular-squaring state

**Classification (10 November 2026): original-cipher negative in an explicit, source-fixed 240-model family. No unknown LP2 plaintext, original key, cipher method, or continuation recovered.**

## Decisive original-input challenge

The independent 2014 Cicada RSA-432 factoring stage specifies two publicly recovered factors `P` and `Q` (exact integers in [the reproducible runner](../sims/rsa2014_modular_square_inverse.cjs)), with product
`7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639`.

The key hypothesis tested here is a recurrence `x[t+1] = x[t]^2 mod (P*Q)`, separately initialized on each physical LP2 page. This differs from the prior [2014 RSA-factor AES/ChaCha key-derivation tests](onion-cookie-source-key-inversion.md). The source establishes the modulus, **not** a documented link between that modulus and LP2 or the choice of square recurrence. The factors satisfy `P mod 4 = 1` and `Q mod 4 = 3`, so the modulus is not a Blum integer; no Blum–Blum–Shub security claim is made.

Freeze ten source-expressible initial values: 3301, 2014, 1033, 79, 53, public exponent 65537, `P+Q`, `P XOR Q`, `(P−1)(Q−1)`, and modular inverse of 65537 modulo `(P−1)(Q−1)`. Freeze three per-page clocks: unchanged seed, seed plus (physical page index+1), or seed XOR (physical page index+1). Extract 29-ary keystream values by low byte modulo29, high byte modulo29, whole state modulo29, or groups of five successive least-significant bits with values 29–31 rejected. Test both cipher signs `C = P_plain ± K mod29`. There are **10×3×4×2 = 240** fixed settings.

For each setting, use exactly the authentic runes on six separate original LP2 pages **[0,3,8,23,27,40]**, with the first 130 runes per page used to select the key model and the *next 80 runes per page* untouched for continuation. The language model is trained on an independently stored Shakespeare control. The existing exact [collision-skipping Viterbi](../sims/grid_stream_collision_viterbi.cjs) permits the encoder to consume one extra stream symbol when a prospective ciphertext glyph repeats the preceding output; the rejected draw must actually cause that collision. Training and heldout decoder segments use the inferred consumed-key clock. English scores are mean log probabilities per rune, so larger (less negative) is better.

| Condition | Model | First 780 GP runes (training) | Next 480 GP runes (untouched) |
| --- | --- | ---: | ---: |
| Best original training model among 240 | Seed **53**, five-bit/rejection, page-XOR, cipher sign + | **−5.680893** | **−5.869046** |
| Independently generated English-GP ciphertext with known true source clock | Seed **3301**, low-byte mod29, page-add, sign +, recovered at rank **1/240** | **−2.547903** | **−2.717677** |

The original key selected on training gets worse on the heldout material. The strongest *retrospectively* selected heldout value of any wrong model is **−5.620557** (seed3301, high-byte, page-add, sign−), while the planted authentic-language model holds at −2.717677. The original candidate texts are nonlexical rune sequences, with no independently recognizable plaintext. The original training/heldout gap is a model-conditional negative; there is no calibrated discovery-wide probability for all choices made across prior project research.

## Positive forward/inverse witness

The runner independently selects 1,260 actual GP-language control symbols from later Shakespeare material, encrypts them with a frozen true modular-squaring source, and implements the same probabilistic adjacent-cipher-repeat rejection. A source-known forward replay with the exact preserved 28 skip witnesses reproduces **1,260/1,260 emitted ciphertext runes**. Without supplying those witnesses to the inverse, the exact GP-language Viterbi independently recovers **1,260/1,260 plaintext runes**, and ranks the true source model first of 240. This verifies the attack can recognize and invert a model-generated native-GP ciphertext with skips. It does not identify a real 2014-to-LP2 cryptographic dependency.

## Reproduce and scope

Run `node sims/rsa2014_modular_square_inverse.cjs` from repository root, using Node.js 22, no third-party packages, and the checked-in canonical LP2 corpus. [Successful manual GitHub Actions run 42823205972](https://github.com/FlareZ123/liber-primus/actions/runs/42823205972) executed the source-exact evaluation, original/heldout scores, positive model ranking and exact known-witness re-encipherment. The run reuses the pre-existing manual [historical-source workflow](../.github/workflows/onion-cookie-key-manual.yml), input `source=modular-square`; no commit-triggered workflow was added.

This screen excludes these **specific direct GP-additive page-reset modular-squaring streams** under the stated seed, extraction, and skip model. It does not cover unknown secret seeds, a different modular exponent, section-dependent clocks, a nonadditive cipher, binary intermediates, additional unknown state or an independent historical clue that changes the state derivation. Do not expand this family by arbitrary unmotivated seeds alone; the missing input is an independently sourced LP2-specific initialization or state-coupling rule.
