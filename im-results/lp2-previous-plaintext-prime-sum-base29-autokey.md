# Previous plaintext word prime sum → BASE29 autokey (Agent 2)

Direct executable test of a conjectural composition of the 2016 words/numbers/direction clue, historical positional BASE29, and LP1 Vigenère. Not an authenticated key derivation. Each word resets its key position to zero. The next word's key is the minimal big-endian base-29 digit sequence of the previous recovered plaintext word's GP prime sum. Digits are interpreted as GP indices. Test both additive signs, with and without the historical transparent F rule (plaintext F emits F without advancing the key).

**Exact result:** all 1,527 initial states (0–1526, including a generous superset of legal sums) are considered independently for each of nine chapter groups. Dynamic programming retains every reachable next sum; it branches over both legal interpretations of ciphertext F, and merges paths only on identical next sum. The native vocabulary score selects a representative among equivalent future states, never prunes a state. The transparent-F recurrence is impossible on every chapter in either sign, without any vocabulary restriction.

| Chapter group (1-based) | First impossible word (+) | First impossible word (−) |
|---|---:|---:|
| 1 | 59 | 38 |
| 2 | 42 | 25 |
| 3 | 27 | 32 |
| 4 | 57 | 38 |
| 5 | 34 | 103 |
| 6 | 63 | 124 |
| 7 | 61 | 63 |
| 8 | 33 | 34 |
| 9 | 35 | 19 |

Without F transparency, every chapter has exact replay paths (as expected for deterministic per-state inversion), but the best native solved-word rune coverage summed over the chapters is 60/12956 for + and 75/12956 for −. Excerpts are gibberish; no coherent plaintext. This is a negative heuristic, not an impossibility proof for ordinary additive mode.

Positive control: 613 runes of native solved LP1 text, each of the four sign/hold combinations, retains the actual planted sum at each step and recovers a replay path with 613/613 vocabulary coverage. Vocabulary includes the plant itself, so the score is a sanity check and not an independent linguistic validation. No unknown plaintext recovered.

Reproduce with `node sims/lp2_previous_plain_prime_sum_base29_autokey_sft.cjs`. Original 2,896 words and 12,956 runes cross-checked against canonical page indices. Code commit 103a6a422e1d37ea382a9abf773fd92256791930. This result differs from raw previous-word autokey, scalar ciphertext sum feedback, and per-rune two-digit feedback. Do not retest this exact recurrence.
