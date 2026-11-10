# Authentic solved Liber Primus decryption regression (Agent 10, 2026-11-10)

**Status: independently implemented genuine-ciphertext positive control.** The regression reproduces documented historical solved text. It does not decrypt any of LP2 pages 0–55. This closes the concrete testing-infrastructure gap identified by the Critic on 2026-11-10 at 02:38 UTC.

## Exact inputs and method

Use the canonical source transcription in resources/transcriptions/lp1_wulfic_canonical.txt for LP1 and resources/transcriptions/liber_primus_master.txt for LP2 page 56. Obtain the fixed 29-rune indexing from resources/liber-primus/lp2-corpus.json. Five expected English passages appear as literal test fixtures in sims/authentic_decryption_regression.cjs, independently of the cipher implementations. These are previously published solutions, as documented in Wulfic/Cicada3301-Liber_Primus, tools/lpcore/solved.py and data/canonical/liber_primus_translation.txt.

The GP transliteration maps the three-letter ING sound to one rune (index 21), preserves actual punctuation word boundaries but ignores physical line/page wrapping, normalizes QU to CW and V to U, and skips ciphertext F interrupters without advancing a Vigenere or totient keystream. All transformations are genuine historical decryptions; a deliberately wrong transform/key is rejected in each case.

| Original section | Decryption | Matched word count | Matched GP runes | Literal F skips |
|---|---|---:|---:|---:|
| LP1 A WARNING, segment 0, whole section | p = 28 - c (mod29) | 45 | 184 | n/a |
| LP1 WELCOME, segment 1, prefix | p = c - repeated DIVINITY key (mod29) | 32 | 116 | 3 |
| LP1 A KOAN, segment 3, prefix | p = 28 - c + 3 (mod29) | 31 | 104 | n/a |
| LP1 A KOAN, segment 5, prefix | p = c - repeated FIRFUMFERENFE key (mod29) | 30 | 110 | 2 |
| LP2 AN END, page 56, prefix | p = c - phi(prime_n) (mod29) | 13 | 45 | 0 |

**559 out of 559** authentic ciphertext GP runes exactly recover the expected GP-encoded English text. This includes entire A WARNING and selected well-defined prefixes of the other four solved regions. The page56 material is already solved and is not part of the 56 unsolved LP2 pages 0–55.

The true ciphertext SHA-256 values, exact parameters, key positions and match counts are printed by the executable and verified on the shared inputs. For the first 45-word warning the result is the known passage beginning “A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE.”

## Reproduction and reuse

Program: sims/authentic_decryption_regression.cjs (CommonJS, no external packages). Opt-in CI: .github/workflows/authentic-decryptions.yml. Successful [GitHub Actions run 42746198223](https://github.com/FlareZ123/liber-primus/actions/runs/42746198223) on Node 22.

Exports: ciphertextWords, plaintextWords, primeTotient, decipher and run. Future LP2 attacks can reuse these to pin GP orientation, reset policy, interrupter behavior and transform signs to real historical evidence before attempting unsolved material.

Evidence class: authentic previously solved cryptography reproduced, engineering validation, with no novel LP2 plaintext or key recovered. The authoritative results/README.md needs no new decipherment claim.
