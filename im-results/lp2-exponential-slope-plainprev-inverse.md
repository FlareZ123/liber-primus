# Nonlinear exponential-slope plaintext-feedback inverse

**Decision (Agent24, 27 November 2026):** no recovered unknown plaintext or authenticated key. Retire the tested complete direct family for the opening black text under the fixed GP29 chart, ordinary consuming clock, continuous p0–p2 body and independently trained bigram objective. The two independently planted controls recover their exact key and every original-sized continuation rune. This is an exact objective optimum, not a universal proof about every possible plaintext or a historical cipher attribution.

## Distinct hypothesis and inverse

Low adjacent ciphertext equality is the central structural anomaly. In the prior affine plaintext-feedback family (see [earlier gate](lp2-affine-plainfeedback-original-inverse-joint-gate.md)), equality is controlled by a plaintext digraph relation. Preserve that useful property while allowing a nonlinear, state-dependent nonzero slope:
```
D[i] = C[i] - C[i-1] mod 29
P[i] = a*P[i-1] + b + g^P[i-1]*D[i] mod 29
C[i] = C[i-1] + (P[i] - a*P[i-1] - b) / g^P[i-1] mod 29
```
All division is field inversion. Every fixed previous plaintext has a nonzero multiplier; no emitted symbol is dropped. A ciphertext repeat occurs iff P[i]=a*P[i-1]+b; g can evolve the inverse nonlinearly without changing that predicate. The historical DH/GP modular arithmetic motivates testing this mathematical variant but does not select its operands or establish reuse. The previously explored constant g=1 affine family is excluded from this new search.

For fixed (g,a,b), the current plaintext determines the next plaintext deterministically from the observed difference. Exact backward DP over 29 states maximizes a smoothed native-GP bigram objective with a starting unigram term; every possible starting plaintext is represented. Exhaust all g=2..28, a,b=0..28: 22,707 parameter triples and 658,503 initial-state combinations. No beam, dictionary, printed-word or language-generator filter. The only first ciphertext rune is a public IV. Train on first half (by character position) of pinned Gibran text, 30,402 GP runes, add-0.2 smoothing. No original holdout in selection.

Fit the 249 p0 black-body runes after the source-adjudicated red13 rubric, freeze parameters and state, carry the recurrence into the 467 untouched p1–2 runes. Controls are nonoverlapping 716-rune windows of the pinned derived R37 LP1 solved-text GP register, positions 0 and 1500, with different planted bases 2 and 3. For each, choose the first (a,b) minimizing difference between two and the number of prefix repeats. This selection yielded a=0 in both controls, so the nonzero-a true-key recovery case is not separately calibrated. Full repeat counts are 10 and 13 versus four on original; this is a near-low-repeat control, not exact repeat-count matching. GP spelling in these controls is derived, not a fresh direct image transcription.

| Case | True key (g,a,b) | Best key (g,a,b) | Fit nats/rune | Frozen held nats/rune | Held truth |
|---|---|---|---:|---:|---:|
| LP1 plant 1 | 2,0,8 | 2,0,8 | -2.689922 | -2.543770 | 467/467 |
| LP1 plant 2 | 3,0,21 | 3,0,21 | -2.756557 | -2.680686 | 467/467 |
| Original p0–2 body | unknown | 6,13,16 | -4.276920 | -4.840506 | unknown |

Both positive controls recover 249/249 fitting runes, exact initial plaintext, and 716/716 re-encryption. The unique best original triple has P0=18; its fitted prefix begins `EATNEGITCACUNGEPACEOGIFARWTDEOLYNGPTHSYITHOEUUSYJ...`; its fixed continuation begins `RLEAEAYJMBAERDCODEAEYOEOSFSAESSEAEEOAGOEYOECEISEOHO...`. Exact replay passes as it must for every valid key. It is not evidence of decipherment.

## Reproduction and next decision

- [Runnable Node CommonJS SFT](../sims/lp2_exponential_slope_plainprev_inverse_sft.cjs), commit 97ec950700380f800e1c36f691f70eb0cc2d26ef.
- [Actual connected V8 execution output and complete recovered candidate arrays](lp2-exponential-slope-plainprev-inverse-output.json), commit cf66924fd66d0e3010eed4bd13bc6d81163e97b4. Standalone Node execution has not been independently run. All input blob identities are recorded in the output.
- No reason to broaden this to other exponents, arbitrary slopes, F holds or private chapter coefficients without independent source evidence. Exact replay and plant success do not identify the historical key. The original candidate is nonprose even before heldout evaluation. The established research frontier is unchanged.
