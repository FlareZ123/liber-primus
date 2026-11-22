# Original p0 title crib: every GF29 homogeneous running key through order eight fails by p3

**22 November 2026, Agent6. Classification: exact conditional original-cipher exclusion; zero unknown plaintext, authenticated key, or destination recovered.**

## One human-facing hypothesis, with its weakest premise explicit

The native LP2 p0 JPEG prints a red **8+5** GP29 heading and a thirteen-dot mark before its black body. The later authenticated 2016 Cicada message includes **EPIPHANY SEEKS**, also 8+5 GP rune positions, written canonically as **EPIPHANY SEECS**. Independently, the original p15 4×4 grid contains a genuine Fibonacci-indexed prime spiral. Those are reasons to ask whether a short linear recurrence drives a running GP29 key. Neither original source instructs a solver to use EPIPHANY as p0 plaintext, a linear-feedback generator, an eight-rune state, or the solved-p56 transparent-F convention on unknown pages.

The exact unchanged p0 heading has GP29 indices:

```text
C title = 15 8 18 3 6 19 27 0 | 15 26 18 21 5
P guess = 18 13 10 13 8 24 9 26 | 15 18 18 5 15
K=C-P   = 26 24 8 19 27 24 18 3 | 0 8 0 16 19
```

The heading contains no presumed plaintext F, so every one of these 13 key digits is consumed even though the eighth ciphertext rune is F. The key is **crib-implied and unauthenticated**.

The proposed key schedule, after these immutable 13 digits, is the homogeneous order-`q` GF29 recurrence

```text
K[t] = (a1*K[t-1] + ... + aq*K[t-q]) mod 29;
q in 1..8; every coefficient aj in 0..28; no reset.
```

The first 13 known digits enforce all 13−q equations on the unknown coefficients. Exact modular Gaussian elimination enumerates **all consistent coefficient vectors**, without substituting an arbitrary dictionary key. For the main test, the reversible alphabet rule is the **actual solved p56** operation: a non-F plaintext letter is output as `(P+K) mod29` and consumes one key digit; plaintext F produces literal ciphertext F and consumes no key. At a ciphertext F, both legal interpretations are retained. At a non-F ciphertext equal to the active key digit, the state is impossible, because the implied plaintext F could only have emitted literal F.

## All-secret original-source outcomes

| Key order | Coefficient vectors fitting all 13 heading digits | Valid through untouched p0–p2, 729 runes | Latest first contradiction |
| ---: | ---: | ---: | --- |
| 1–5 | **0** at every order | 0 | Inconsistent with hypothesized heading |
| 6 | **1** | 0 | **p0 offset 20** |
| 7 | **29** | 0 | **p0 offset 20** |
| 8 | **24,389 = 29³** | **6** | Six remaining variants fail in p3 |

For q6 the unique recurrence coefficients, in descending-lag order, are **[20,16,6,7,12,6]**. This is the same order-six solution found by a GF29 Berlekamp–Massey recurrence for the 13 conjectured digits. Its original p0 inverse has no legal transparent-F explanation at rune offset20. All 29 q7 variants reach the same contradiction.

The six q8 vectors that remain feasible through the **entire, originally unaltered p0–p2** were carried forward with their exact inherited key state. Their unavoidable first failures occur at global source offsets **738, 755, 787, 809, 811, 831**, all on p3, at p3-local offsets **9, 26, 58, 80, 82, 102** respectively. No favorable F-bypass branching was suppressed, and no reset at the p2/p3 illustration change was silently inserted. All **24,419** title-compatible order-six/seven/eight coefficient vectors are therefore excluded for this *one continuous-key, F-transparent* mechanism by global offset831. The other orders cannot even reproduce the title key.

A separate control enciphers **729 authentic clear p57 GP29 plaintext runes** (cycling the genuine 95-rune PARABLE source) under each of the six original-surviving q8 recurrences. Literal plaintext F causes the genuine skip. The same exact inverse leaves a legal path for all **729 runes in each of six plants**. This checks that the contradiction comes from the original cipher and model rather than mistakenly forbidding transparent F.

## Plain GP29 addition, allowing encryption of F

If the special p56 bypass was unique to p56 and all p0 plaintext symbols instead consume one key, the strict impossibility above no longer applies. For this alternate complete cipher, independently enumerate the **same 24,389 q8 coefficients**, use the original 13-digit title-implied key, and decode the untouched **716 following original p0–p2 runes** as `P[t]=(C[t]-K[t]) mod29`. No F branch, phase, word or decoder parameter is fitted.

The **highest** full-716-rune GP29 index of coincidence across all keys is just **0.03684416142516701**, at q8 coefficients `[18,20,18,25,16,25,15,12]`; **0/24,389** outputs reach 0.05. The authentic clear p57 short passage has index of coincidence **0.062709966405**. Thus even when the solved-page skip is removed, this title-derived q8 key family produces near-uniform rune strings rather than a plausible direct English GP plaintext on the first complete chapter. This is a linguistic diagnostic and does not mathematically exclude unusual plaintext, compressed text, or added transformation layers.

## Decision and next real dependency

The first-party title phrase and p15 Fibonacci construction give a finite reason to test low-order recurrence, and the actual original p3 ciphertext supplies a decisive holdout. **Retire continuous GF29 additive homogeneous key recurrence of order at most eight seeded by EPIPHANY SEECS**, under the explicitly charged solved-p56 rule. Ordinary no-skip q8 also has a strongly negative direct native-register readout. The exact experiment **does not reject the EPIPHANY title itself**, a title-independent secret, page/chapter-specific resets, another GP29 cipher, or an external key.

The next productive route requires a **distinct original clue selecting a nonlinear operation or new key source**. Raising q to nine without such evidence introduces another two orders of magnitude of free coefficients and an unselected rescue of a failed mechanism.

**Original-input executable:** [sims/lp2_p0_epiphany_allsecret_lfsr8_ftransparent_sft.cjs](../sims/lp2_p0_epiphany_allsecret_lfsr8_ftransparent_sft.cjs) uses only the canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json), asserts the exact heading, enumerates the entire finite coefficient family, retains every legal F clock, checks the independent clear-p57 positive plants, and checks the ordinary-additive maximum. **Windows Node22 CI:** [first full exact original run 45004664804](https://github.com/FlareZ123/liber-primus/actions/runs/45004664804).
