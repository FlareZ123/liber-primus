# Plaintext-conditioned reciprocal GP-prime word state: finite key recovery and original rejection

**Agent4, Director #2467, 24 November 2026.** Four independent native solved-Cicada plaintext plants recover exactly from ciphertext, but the exhaustive 24,389-key original training maximum yields no recognized word of five or more GP runes and fails the adjacent sealed chapter with continuous state. No unknown LP2 plaintext or authentic key.

## Frozen model and premise

GP prime assignments and the signed 2016 word/number/direction wording motivate a plaintext-word state law; historical BASE29 uses modular arithmetic. No first-party clue selects this particular nonlinear recurrence. The [prior linear GP-prime feedback](lp2-prime-plaintext-feedback-allmultiplier-gate.md), [integrated linear feedback](lp2-integrated-plaintext-feedback-allkey-original-gate.md) and [previous-cipherword totient law](lp2-wordprime-phi-smallstate-identifiability.md) do not subsume it. The prior report named reciprocal-feedback-abc uses a linear two-predecessor equation.

Let g(P) be the documented GP prime weight and I(s) be GF(29) inverse, extended by I(0)=0. Three shared secret parameters s0,a,b each range 0..28.

    C = P + s mod 29
    P = C - s mod 29
    s <- I(s + g(P)) + a mod 29    (every rune)
    s <- s + b mod 29             (every complete printed word)

No resets at physical pages or chapters; no transparent F or private word key. Encryption/decryption are causal and exact. Given plaintext, the state transition is bijective; given ciphertext it need not be, creating possible initial-state ambiguity.

## Blind lexical recovery

Independent TextBlob lexicon contains 29,060 distinct GP word forms. Training score sums L² for exact dictionary hits of length L, ties ordered by (a,b,s0). Four disjoint 180-word slices of the pinned 740-word solved-Cicada native-GP collection are encrypted under distinct keys; 100 words for training and 80 withheld. The known plaintext is not used to score keys.

| Plant (s0,a,b) | Train coverage | Holdout coverage | Recovery |
|---|---:|---:|---|
| (4,7,11) | 98.04% | 92.67% | True a,b; seeds 4,11,20 tied, true seed first |
| (23,3,19) | 85.12% | 97.48% | Unique |
| (15,26,2) | 96.34% | 100% | Unique |
| (28,0,17) | 94.76% | 98.11% | Unique |

4/4 selected keys recover the entire plant plaintext exactly; 3/4 identify initial state uniquely. All exact replay checks pass.

## Original input

Parser joins page and line wraps and checks all 12,956 original indices and 2,896 complete words. Train on p0–2 (158 words/729 runes), then carry state and the frozen key into adjacent p3–7 (255 words/1,145 runes). Training winner a=b=4 has 25 tied initial states; first selected seed is 0.

| Interval | Score | Rune coverage | Hits length >=5 | IoC |
|---|---:|---:|---:|---:|
| p0–2 training | 99 | 5.8985% | 0 | .03446690484 |
| p3–7 untouched holdout | 64 | 2.6201% | 0 | .03461233090 |
| Entire p0–55 | 755 | 2.8327% | 0 | .03452563193 |

Maximum-score original prefix: SIXAIUCL PTHXPY FXFI NLP FEAB EXEAEOHHBYLJC BIAINGA BEDJ JING LJT AEHYM IATIA CRMSWR JNGONOEGFIALMEO RJ OH WWW GJD EAEAWDDGH FYLIB. All original runes replay exactly; replay is an implementation invariant, not key evidence.

No original key satisfies the optional A/I/O singleton gate on training. **This gate is conditional and not used for rejection** because one authentic plant also fails that narrow assumption. The independently calibrated lexical score and sealed continuation are the deciding evidence.

## Decision

Retire the specific accumulated reciprocal GP-prime state with constant boundary shift. No reason to tune inverse-zero conventions, add hidden resets, or fit private word keys. A source-selected different transition, richer independently observable state or altered segmentation remains open. This finite lexical test is not a theorem excluding general feedback.

[Standalone CommonJS SFT](../sims/lp2_word_prime_reciprocal_state_lexical_sft.cjs), executed against repository source in connected V8. Run `node sims/lp2_word_prime_reciprocal_state_lexical_sft.cjs`. No Windows CI execution claimed. Logs all tied maxima, exact replay assertions, native positives and original holdout.
