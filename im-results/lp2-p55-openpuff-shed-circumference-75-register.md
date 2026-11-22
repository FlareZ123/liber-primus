# Original OpenPuff magic-square circumference to p55's 75-rune register

**Decision (15 November 2026).** The historically published three-square numerical payload and the already-solved parable yield a concrete, source-motivated **75-value candidate key** for original LP2 p55. Two frozen complete 75-rune inverses were run against the unmodified original ciphertext with exact reconstruction and native-GP controls. Both outputs remain nonlinguistic. This is a testable hypothesis, not an authenticated key or recovered plaintext.

## Independent starting objects and possible human solve path

1. The archived 745-byte **resources/cicada2014-openpuff-magic-squares.txt** contains three printed squares in order **5×5, 7×7, 5×5**, with respective row sums **3301, 1033, 1033**. The original 2014 stage requested magic squares of those orders/sums. The original extraction/authorship limits are in [#641](https://github.com/FlareZ123/liber-primus/issues/641); the numeric list is historically reported OpenPuff output and is not independently shown to instruct LP2 decryption.
2. The independently solved p57 PARABLE, also preserved in original 2013 761.MP3 metadata, says **“SHED OUR OWN CIRCUMFERENCES.”** Applied to the sole 7×7 square, shedding its one-cell outer ring removes 24 numbers and leaves the central **5×5**. The three original-order matrices then contain **25 + 25 + 25 = 75** entries.
3. Original physical p55 contains **76 GP29 runes**. Its first is the printed continuation of p54's final word. Remaining p55 local offsets **1..75** give exactly **75** rune positions as a candidate consumer. P55 also reuses the LP1 SOME WISDOM moth; that independently solved LP1 passage mentions prime/totient arithmetic, which the solved p56 method implements.

These are source-visible clues that motivate the experiment, while neither the parable nor the historical magic-square file explicitly orders this LP2 transfer. The 75-count correspondence might be accidental. The incoming first rune is a physical page carry, not a demonstrated cipher-control token.

## One frozen original-cipher construction

Retain all 25 entries from the first square, the center 5×5 of the 7×7 square (zero-based rows and columns 1..5), then all 25 entries from the last square. Flatten each in printed row-major order and concatenate to produce **S[0..74]**. Let **C[i]** be p55's original unchanged GP29 indices for physical offsets 0..75.

Test precisely the positions **i=0..74** of two source-motivated additive pad consumers, without skip, matrix permutation, clock change, extra rune, or fitted phase:

- **Numeric residue:** K[i] = S[i] mod 29; P[i+1] = (C[i+1] − K[i]) mod 29.
- **LP1 WISDOM totient:** K[i] = phi(S[i]) mod 29, where phi is Euler's totient; same GP29 subtraction. This is selected by the prior solved LP1/p56 use of totients.

Each is bijective on all 75 positions. The exact forward reconstruction is C[i+1] = (P[i+1] + K[i]) mod 29.

## Actual original-cipher outputs

| Input / candidate | GP29 IoC for 75 positions | Literal GP transliteration |
|---|---:|---|
| Ciphertext at p55 offsets 1..75 | 0.03855856 | Original, unmodified |
| Numeric residue | 0.03783784 | YPBMGTXPAEXEEOCXEOFCJCFIATAOEUDAEUIADPODGEEOGJEGGOIWCUSIRMANGPFEOYTBUFNGEENGCNGELECCSAAEEA |
| Euler totient | 0.03495495 | MIUXEOJYBGTPSGBWTHSSBARJHMDARTHEANGBXXAEMFUEOPDWOEUENEATJEOLDEAAEUPJBEOMEOMHHJORWSMMGTWOIA |

The strings contain canonical multi-character GP transliterations (TH, EO, NG, etc.); their character lengths are not rune lengths. Neither is a coherent contiguous unknown plaintext or complete instruction. Index of coincidence remains at roughly the original random floor. This rejects these **two exact inverses** as a readable original p55 plaintext route and cannot refute all possible source-selected nonlinear consumers.

**Executable evidence:** [single-file CommonJS SFT](../sims/lp2_p55_openpuff_shed_ring_sft.cjs) executed on original repo data in [successful Node 22 CI run 43761433959](https://github.com/FlareZ123/liber-primus/actions/runs/43761433959). Each 75/75-symbol native-GP p57 planted ciphertext roundtrips. Each original 75/75-symbol p55 ciphertext reencryption reproduces the unchanged original. The independent historical p56 first ten prime/totient symbols decrypt to **ANENDWITHIN** exactly. These are implementation controls, not independent evidence of p55 plaintext.

## What changes for subsequent research

The 2014 magic-square numbers, the parable's circumference operation and the p55 75-position page-carry geometry now have an **exact original-source GP29 consumer** and a **real original-output negative**. Do not improve the candidate by adjusting ring choice, square order, sign, or cipher clock after seeing this output. A next attempt requires an independently source-authenticated distinct operation or genuine held-out original plaintext prediction. The actual key arrays and all 75 original source positions are in the SFT and CI output. The repository's established-results synthesis remains unchanged because no plaintext or key has been recovered.
