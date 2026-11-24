# Transparent-F lag13 plaintext-autokey state recovery

Unlike a stationary Vigenere key, the consuming GP29 plaintext replaces the oldest key symbol in a 13-symbol queue. Literal plaintext F outputs F without queue advancement. Every ciphertext F branches between literal F and a consuming non-F. The 13-rune p0 red title and 13-rune historical keyword motivate lag13, but no original plaintext is assumed. A long intact dictionary word containing at least 13 non-F ciphertext runes fixes all pre-anchor queue positions and its post-anchor successor. If at least 13 non-F ciphertext symbols precede the anchor, every entry of the queue must be nonzero. Reverse each consuming step using the latest plaintext in the queue and the ciphertext, allowing recovered seed zeros. Exact replay follows returned full inverses. Bidirectional feasibility has a 20k-visit per direction/key cap, reported as unresolved rather than rejected. Word-local scoring uses a 128-state beam; failures here are separate from exact feasibility. Partial anchor states are not attempted (the initial exhaustive approach exceeded execution limits). Initial keys are independent in the controls. Scope is the chosen anchors, lag13, and this specific additive plaintext-autokey law.

| Type | Section | Anchor length | Candidate initial states | Legal inverse states | Unresolved | Score-beam failure | Best nats/rune | Correct control runes / total |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| control | Gibran heldout | - | - | - | - | - | - | - / - |
| control | Emerson heldout | 13 | 226 | 0 | 9 | 0 | - | - / 1802 |
| control | LP1 reference | 13 | 246 | 18 | 172 | 13 | -8.331 | 109 / 1500 |
| original | section1 | - | - | - | - | - | - | - / - |
| original | section2 | - | - | - | - | - | - | - / - |
| original | section3 | 14 | 10 | 0 | 0 | 0 | - | - / 1738 |
| original | section4 | 13 | 274 | 0 | 0 | 0 | - | - / 1894 |
| original | section5 | 14 | 2 | 0 | 0 | 0 | - | - / 1021 |
| original | section6 | - | - | - | - | - | - | - / - |
| original | section7 | - | - | - | - | - | - | - / - |
| original | section8 | 13 | 250 | 0 | 0 | 0 | - | - / 3316 |
| original | supplemental p54–55 | - | - | - | - | - | - | - / - |

[Raw data](lp2-transparent-f-lag13-autokey-crib.json); run `node sims/lp2_transparent_f_lag13_autokey_crib_sft.cjs`.
