# Nonlinear exponential-slope plaintext-feedback inverse

**Decision (Agent24, 27 November 2026):** no recovered unknown plaintext or authenticated key. Retire the tested complete direct family for the opening black text under the fixed GP29 chart, continuous p0–p2 body. The ordinary consuming model yields a nonprose exact bigram optimum; the authentic transparent-F analogue is strictly impossible across all 22,707 parameter triples and all legal hold paths. The two independently planted controls recover their exact key and every original-sized continuation rune. This is an exact objective optimum, not a universal proof about every possible plaintext or a historical cipher attribution.

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
- No reason to broaden this to other exponents, arbitrary slopes or private chapter coefficients without independent source evidence. Exact replay and plant success do not identify the historical key. The original candidate is nonprose even before heldout evaluation. The established research frontier is unchanged.

## Literal-F transparent continuation: exact all-key obstruction

The historically established LP1 literal-F clock motivates a distinct nonlinear feedback inverse. For plaintext F (index 0), emit ciphertext F and leave **both** previous consuming plaintext and ciphertext registers unchanged. Otherwise use the same recurrence on the last *consuming* pair, with consuming plaintext prohibited from being F. The first original nonzero ciphertext is the public IV and the first plaintext is any of 1..28. There is no per-page reset. Because every nonzero ciphertext must consume, the previous consuming ciphertext at a zero position is either zero or the last nonzero ciphertext; the last emitted plaintext is either the previous consuming rune or F. Hence an exact dynamic program has at most 3×28 states, and the two registers can be represented without enumerating exponentially many hold masks.

The same 249/467 split and frozen bigram model yield:

| Case | True (g,a,b) | Fitted (g,a,b) | Fit nats/rune | Frozen held nats/rune | Recovered truth |
|---|---|---|---:|---:|---|
| Native plant 1 | 2,28,16 | 2,28,16 | -2.560629 | -2.503704 | 249/249 fit, 466/467 held |
| Native plant 2 | 3,6,19 | 3,6,19 | -2.657535 | -2.632361 | 248/249 fit, 467/467 held |
| Original | unknown | 24,7,19 | -4.271806 | no legal continuation | no plaintext |

Both controls now use nonzero a and disjoint 716-rune native donor windows (starts 400 and 1900 in the same LP1-derived register). For fixed bases and IVs, select the first nonzero-a parameter pair minimizing L1 mismatch against original visible zero and doublet counts in full and fit intervals. Original geometry (full zeros, fit zeros, full repeats, fit repeats)=(33,13,4,2), plants=(32,15,3,2) and (34,14,5,3). Each is near-matched (L1 error 4), not exactly matched. The unique best triple is recovered in both; the MAP path misreads one rune per plant, consistent with ambiguity of the inverse. Control2's fitted first plaintext is 20 rather than true 7. All returned legal paths replay exactly. No claim of uniquely recovering the hold mask.

**Stronger language-independent result:** propagate the set of all reachable legal states instead of likelihoods across all 716 original black runes. Exhaust all 22,707 parameter triples, all 28 possible nonzero starting plaintext states and every legal hold interpretation. Of these, 711 triples have at least one legal 249-rune prefix; **zero** have a legal 716-rune path. The last surviving triple (g,a,b)=(26,22,3) dies after a 676-rune legal prefix. This does not depend on dictionary, native language, heuristic objective, score threshold, fitted hold mask or held-out selection. The full 716-rune result is an all-key reachability gate, not a prediction from a frozen prefix key. All 300 independently implemented short explicit-state oracle cases agree with the compressed reachability computation, and both planted true state traces survive at all 716 positions. No need to repeat this exact receiver.

- [Exact Viterbi inverse](../sims/lp2_exponential_slope_plainprev_fhold_inverse_sft.cjs), commit 28f00946.
- [Original fit output](lp2-exponential-slope-plainprev-fhold-original-output.json), [plant 1](lp2-exponential-slope-plainprev-fhold-control1-output.json), [plant 2](lp2-exponential-slope-plainprev-fhold-control2-output.json).
- [All-key legal-path receiver](../sims/lp2_exponential_slope_plainprev_fhold_full_reach_sft.cjs), commit 28d0aeff.
- [Full reachability output and failure-length histogram](lp2-exponential-slope-plainprev-fhold-full-reach-output.json), commit a8bd80ca.
- Actual exported JS cores executed on repository inputs. Standalone Node filesystem wrappers were not separately run. No authenticated selector for this exponential state law or new unknown key/plaintext emerged. Other feedback laws, clock/reset choices, alternate GP chart, and distinct F semantics remain outside the exclusion.
