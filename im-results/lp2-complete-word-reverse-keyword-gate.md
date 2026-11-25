# Complete printed-word reversal outside a continuous native keyword cipher

**Decision (#2652): retire the frozen q8/q13 hypothesis within the stated finite literary and lexical registers.** No unknown plaintext or key recovered. The p6/p7 reversed red-word checksums remain a structural observation; they do not uniquely imply reversal of runes within words.

## Frozen mechanism

Forward: for plaintext rune index P, if P=0 output 0 and hold the consuming clock j; otherwise output C=(P+K[j mod q]) mod 29 and advance j. Then reverse each complete printed ciphertext group. Inverse: reverse each complete group first (including groups spanning physical pages), and recover the continuous chapter clock without word or page resets. Test q=8,13, chapter start j=0. Ordinary orientation is a fixed comparator. No mixed directions or selected word permutations.

The original transcription reproduces the full 12,956-rune tape and 2,896 complete groups exactly. p3–7 comprises 1,145 runes, 255 groups, 26 visible zeros and four page-crossing groups; p54–55 comprises 308 runes, 66 groups, six visible zeros and one page-crossing group. Prior #894 tested a distinct fixed five-column within-word permutation alone; #2616 tested a distinct p8–14 plaintext-side five-column composition; #2056 established the limited red-checksum cue. None is the exact current composition.

## Exact key-independent rejection against finite prose

Remove exactly the plaintext literal-F positions from both plaintext and ciphertext. At any lag d divisible by q, active ciphertext equality is equivalent to active plaintext equality. The same is true for equality of the two-symbol pairs ending at these positions. Every possible held F is a visible ciphertext 0; generated ciphertext zeros may instead consume. A dynamic program tracks the last 3q+1 active runes and independent extrema of total rune and bigram equality counts over lags q,2q,3q, branching only at visible zeros. It grants every subset of visible zeros as holds; it does not need a secret key. Independent minima/maxima are a conservative relaxation. For each chapter length the reference is 32 evenly spaced GP-native-rendered windows from each of the existing Shakespeare, Emerson and Gibran files (96 windows); only an unaltered reference with hold count <= visible ciphertext zero count can pass.

| Chapter | Reversed | q | Rune range | Bigram range | Native minima (r,b) | Collision-only pass /96 | With hold-count pass /96 |
|---|---|---:|---|---|---|---:|---:|
| p3–7 | yes | 8 | 87–124 | 1–6 | 176,8 | 0 | 0 |
| p3–7 | yes | 13 | 92–150 | 1–8 | 160,11 | 0 | 0 |
| p3–7 | no | 8 | 106–139 | 5–7 | 176,8 | 0 | 0 |
| p3–7 | no | 13 | 92–141 | 4–9 | 160,11 | 0 | 0 |
| p54–55 | yes | 8 | 31–37 | 0–0 | 35,0 | 0 | 0 |
| p54–55 | yes | 13 | 22–28 | 1–2 | 30,0 | 0 | 0 |
| p54–55 | no | 8 | 32–42 | 1–1 | 35,0 | 0 | 0 |
| p54–55 | no | 13 | 22–35 | 2–4 | 30,0 | 2 | 0 |

The bounds hold for any fixed bijection per consuming phase, not just additive offsets. A pure finite-window result does not establish an all-language theorem.

## Independent exact lexical pair gate

Select the two longest zero-free ciphertext words (tie: earlier offset), with no plaintext fit. A zero-free ciphertext group cannot contain a literal plaintext F. For each of the 32,097 distinct GP forms derived from the existing dictionary, three literary files and authentic solved native corpus, enumerate equal-length F-free words. For each possible preceding hold count modulo q, derive the partial key K[phase]=C-P; reject internal contradictory slots. Then intersect each pair of partial maps on their common assigned key coordinates. Preceding hold counts are granted independently, an intentionally permissive relaxation; absence of a compatible pair therefore excludes any shared key if both selected words are in the register. No key or phase cap.

| Chapter | Reversed | q | Anchor offsets / lengths | Distinct partial maps | Compatible pairs |
|---|---|---:|---|---|---:|
| p3–7 | yes | 8 | 988/12,1116/12 | 0,0 | 0 |
| p3–7 | yes | 13 | same | 9711,9711 | 0 |
| p3–7 | no | 8 | same | 0,0 | 0 |
| p3–7 | no | 13 | same | 9711,9711 | 0 |
| p54–55 | yes | 8 | 222/11,210/10 | 0,4 | 0 |
| p54–55 | yes | 13 | same | 5592,9420 | 0 |
| p54–55 | no | 8 | same | 0,8 | 0 |
| p54–55 | no | 13 | same | 5592,9420 | 0 |

The q13 reversed p3–7 pair overlaps >=11 key slots in all 169 mask pairs; the terminal pair overlaps >=8 slots across 16 mask pairs. In q8 the scroll requires both selected 12-rune forms to be OOV, and the terminal requires at least the 11-rune form to be OOV. In q13 at least one of each selected pair must be OOV. These are conditional necessary lexical constraints, not assertions that unusual words cannot occur.

## Controls and reproducibility

64 deterministic toy tapes (1,047 explicit hold masks) agree exactly with the dynamic-program extrema. Eight independent hidden-key plants use authentic solved WELCOME, KOAN, Loss of Divinity and jpg107–167 rune groups (each q8 and q13). Each has a simulated physical-page separator inside a complete word, plus both actual literal holds and generated consuming zeros (7–37 consuming zeros). All eight restore the exact intermediate tape, retain the true collision counts in the bounds, and have compatible partial keys containing the true key even after excluding the donor's own section from the lexicon. The known true hold mask and key recover all 4,738 planted runes; blind unique full-key recovery was not claimed. The lexical control deliberately permits repeated cyclic rotations and partial-key ambiguity.

Reproducer: [sims/lp2_complete_word_reverse_keyword_gate_sft.cjs](../sims/lp2_complete_word_reverse_keyword_gate_sft.cjs). Executed in connected JavaScript using the seven exact repository blobs; the CLI wrapper reads these same files. Source blob SHAs are emitted by the runner. The local shell has no GitHub DNS access; no GitHub Actions run is claimed.

**Next decision:** the observed checksum reversal does not rescue either tested continuous native keyword architecture. Do not tune per-word directions or length-dependent reversals without independent source support. A distinct source-selected receiver or value-changing mechanism is needed.
