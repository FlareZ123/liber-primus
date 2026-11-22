# p50 byte-as-prime-ordinal totient receiver: bounded original negative

**Agent50 · 18 November 2026 · independent source-constrained experiment.**

## Hypothesis and why it was worth one test

The original p50 numeric page is a 32×8 table of 256 byte-valued cells. The solved p56 cipher uses the key `φ(p_i) mod 29`, and p57 says “shed our own circumferences. Find the divinity within and emerge.” The p50 rectangle has a 76-cell perimeter and 180-cell interior; p55 has 76 runes, while p56+p57 have 180. A natural, low-parameter interpretation is that a table byte selects a prime ordinal and the known p56 totient operation converts that selected prime into a GP29 key:

[
K(b)=arphi(p_b)mod29=(p_b-1)mod29,
]

where `p_0=2` is the first prime, matching p56's zero-based prime cursor. All p50 byte values are 0–255, so every value selects one of the first 256 primes (ending at 1619), all within the 2013 prime list's 464-prime range.

The natural table order is row-major for the 30×6 interior and clockwise from the top-left corner for the 76-cell perimeter. Apply the p56 subtractive inverse and its literal-plaintext-F transparent/non-advancing rule. No fitted offsets, key resets, alternative prime starts, or extra transforms.

## Exact source and targets

- Original p50 image: `resources/liber-primus/67.jpg`, SHA-256 `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776`.
- Numeric table: `resources/liber-primus/lp2-grid-256.json`; its 256-byte row-major stream SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- The 76-cell clockwise ring was paired with the 76 original runes of p55.
- The 180-cell row-major interior was tested against one alternative 180-rune unknown receiver, p53's 179 runes followed by p54's enlarged first rune. This is a source-visible page-boundary slice, but not the same target as the stronger length match p56+p57. The existing `im-results/lp2-p50-inner180-p56-phi-allsecret-keylookup.md` already rejects a stationary byte→key-shift lookup against p56+p57; that known-plaintext branch was not rerun here.

## Results

The p56 F-transparent inverse preserves all legal literal-F and consumed-key branches. A branch that would produce plaintext F from non-F ciphertext is invalid, because plaintext F must have been transmitted literally without consuming a key.

| Target | Sign | Result |
|---|---:|---|
| p53 + first p54 rune (180) | subtract | No valid inverse after 15 symbols. At zero-based offset 15, ciphertext GP index 6, selected byte 150 → prime 877 → φ(877) mod29 = 6, forcing plaintext F from non-F ciphertext. |
| p53 + first p54 rune (180) | add control | No valid inverse after 3 symbols. At offset 3, byte 247 → prime 1571 → φ(1571) mod29 = 4; ciphertext GP index 25 would become plaintext F. |
| p55 (76) | subtract | One valid path, with literal F skips at offsets 25 and 41 and 74 consumed key cells. Output is non-linguistic: `LBNAENTHCLOEDIDEOMMJOIAEOOEAWPEOTFAIAWOELLEUBTHSIAPSDFGAIMRNEOEOEOAECNXBHIAUDXXMGIMDAAAXDBCTM`. |
| p55 (76) | add control | No valid inverse after 2 symbols. At offset 2, byte 167 → prime 997 → φ(997) mod29 = 10; ciphertext GP index 19 would become plaintext F. |

The 180-target failures are exact F-rule contradictions, not low language scores. The p55 subtractive path is unique under the frozen rule and produces no recognizable plaintext. The table-byte→prime-ordinal→totient key therefore does not recover the matched original targets.

## Decision and scope

Retire this direct, continuous **p50 cell value → zero-based prime ordinal → Euler totient → GP29 additive key** receiver under the printed row-major/clockwise orders and p56 F-transparent rule. This is distinct from the prior p50 test that applied φ directly to the byte value, and from the word-reset prime-ordinal experiments; neither should be conflated with this result.

This negative does not exclude stateful/nonstationary uses of the p50 table, another source-authored receiver, or an independent role for the 2013 prime list. It does not recover any unknown plaintext or key.
