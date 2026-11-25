# Ciphertext-addressed GP-prime clock: exhaustive p15–22 origin gate

**Agent16, 25 November 2026. Bounded negative.** No unknown LP2 plaintext, authentic key, complete inverse, or intended destination recovered.

## Frozen equation and source register

Tested exactly the issue's all-consuming receiver:

\[
C_i=P_i+(p_{j_i}-1)\pmod{29},\qquad j_{i+1}=j_i+g(C_i),
\]

where \(p_j\) is the zero-based ordinary prime sequence (\(p_0=2\)) and \(g(C)\) is the canonical Gematria Primus chart prime value for ciphertext rune \(C\). The initial prime ordinal was exhaustively enumerated over **all 3,302 values 0–3301**. There are no plaintext-F holds, collision-rejected draws, page resets, coefficient choices, or alternate step functions.

The source register is the physical p15–p22 chapter. The canonical corpus contains 1,903 rune values; p15 has two independently annotated red spans at offsets 0–8 and 9–19 (9 and 11 runes). Those red spans are excluded as the distinct red rubric/opening register, leaving **1,883 black-body runes**. The cursor is continuous across p15–p22. Prefix selection uses p15–p21 (**1,752 runes**); p22 (**131 runes**) is the frozen continuation. No word boundaries are used in the rune-level score.

## Original result

The highest prefix-ranked origin is **j₀=1806**:

| Measure | Result |
|---|---:|
| Prefix mean GP29 trigram log likelihood | −5.969113 nats/rune |
| Withheld p22 mean likelihood | −5.822976 nats/rune |
| Untouched ciphertext prefix mean | −6.251628 nats/rune |
| Exact forward replay | Yes (tautological for a fixed bijective origin) |

The selected plaintext begins:

`UBFISIRJEJHTHDMIAADOENGTTHOEDEAJTHCJYERIAAEMWLL...`

The withheld page begins:

`IAXUISABBTEWNOEOAEXPYPPHBLWEAEANGCYUIJBNEMDYO...`

Neither is coherent English. The 0-based origins corresponding to the six starts in the earlier source-start prime-walk study (0, 14, 21, 52, 77, 78) rank 1,190th, 1,768th, 2,042nd, 203rd, 2,315th, and 2,307th respectively. The leading origin is not independently selected by the p15 number table or another first-party instruction.

## Matched shuffled-address null

For each of 100 deterministic trials (xorshift seed `0x27c10c)), shuffled the exact sequence \(g(C_i)\) by Fisher–Yates. This preserves the increment multiset while breaking its position-wise alignment with ciphertext. Each null trial re-ran the full 3,302-origin prefix selection and scored the frozen p22 continuation.

- **Prefix:** 99/100 shuffled-address maxima meet or exceed the observed score; upper-tail estimate **0.9901**. Null median −5.931447, range −5.973939 to −5.854725. The real ciphertext-addressed clock is not an exceptional prefix fit; its score is worse than the null median.
- **Holdout:** 7/100 null winners meet or exceed the observed p22 score; upper-tail estimate **0.0792**. This is not significant at 5%, and the 131-rune continuation is nonprose.

The small prefix improvement over raw ciphertext is therefore not evidence for this clock. The matched null is deliberately conditioned on the same increment histogram and the same origin-search multiplicity.

## Native positive controls

Synthetic ciphertexts were generated from independently solved GP29 plaintext source sections using the exact frozen equation, with no F hold or skips. The same 3,302-origin search recovered the planted origin first and reproduced every rune:

| Native plaintext donor | Runes | Planted / selected origin | Rank | Exact |
|---|---:|---:|---:|---:|
| LP1 WELCOME | 515 | 73 / 73 | 1 | 515/515 |
| LP1 KOAN 1 | 780 | 168 / 168 | 1 | 780/780 |
| LP1 LOSS OF DIVINITY | 755 | 3301 / 3301 | 1 | 755/755 |
| Solved GP29 `jpg107-167` | 319 | 22 / 22 | 1 | 319/319 |
| Concatenated solved-native corpus (synthetic continuous plant) | 2,979 | 2401 / 2401 | 1 | 2,979/2,979 |

These are positive controls for the inverse and origin-selection procedure, not evidence that Cicada used this cipher.

## Prior-art overlap and decision

`sims/ciphertext_prime_walk_inversion.cjs` already included the same GP-prime ciphertext increment as one option, with both additive signs, six source starts, and optional collision-rejected draws. The present test is the bounded extension to the exact positive-sign, all-consuming equation, every origin 0–3301, and the full p15–p22 black-body tape with p22 held out. Nearby cumulative ciphertext-word-prime, GP-prime-minus-one/totient, and period-13 clocks are different equations and were not conflated with this result.

**Retire this precise all-consuming ciphertext-GP-prime address clock on p15–p22.** The exhaustive origin winner is nonprose, fails the matched prefix null, and does not establish a predictive continuation. Do not expand origins, add F holds/rejected draws, or alter the increment without a new source selector. The source supplies prime values and p56 supplies prime-minus-one shifts, but no first-party evidence selects this composition or its arbitrary origin.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_ciphertext_addressed_prime_clock_all_origins_sft.cjs
```

The script reads the canonical corpus, ink annotations, target-excluded Shakespeare training text, and the solved-native GP29 control corpus. Raw output is in [the JSON result](lp2-ciphertext-addressed-prime-clock-all-origins-output.json). This is an intermediate negative, not an established decryption; `results/README.md` remains unchanged.
