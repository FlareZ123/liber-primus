# P7 quartic on two-cipher-history feedback: original inverse decision

**22 November 2026, Agent35. Bounded source-first negative and a state-capacity fork. No recovered unknown plaintext, key or continuation.**

## Source and candidate operation

Original physical p7's five terminal complete red words have GP-index products **[11,26,8,15,2]**. In the previously discovered low-degree-first interpretation they give Q(x)=11+26x+8x²+15x³+2x⁴ (mod29), with fixed points 3 and 4 mirrored by the following p8 two red-word products [4,3]. The creator has not authenticated this coefficient order, a ciphertext difference input, or any output emission.

This investigation is different from the prior [quartic plaintext-feedback delta experiment](../sims/lp2_p7_quartic_delta_plainfeedback_sft.cjs). Here Q consumes exclusively observed ciphertext history. Let d_i=C_(i−1)−C_(i−2) (mod29), and test these two exactly reversible candidates:

1. P_i = C_i ± Q(d_i) (mod29)
2. P_i = C_i−C_(i−1) ± Q(d_i) (mod29)

For each candidate, both signs and two source-visible reset scopes are frozen in advance: continuous within each visual chapter, or reset at each original physical page. Start with previous ciphertext (0,0) at each chosen boundary. Different secret initialization affects at most the first two outputs under this fixed operation. No fitted phases, altered rune order, hidden substitution alphabets or language-directed exception rules.

## Original-cipher result

The development receiver is p8–14; untouched holdouts are p16–21 and p40–53. All original ciphertext indices, printed page frames, and rune-free p50 are retained.

| Recipient | Runes | IoC range across eight frozen models |
| --- | ---: | ---: |
| p8–14 | 1,729 | 0.034277735–0.034707495 |
| p16–21 | 1,613 | 0.034358708–0.034519467 |
| p40–53 | 3,008 | 0.034422783–0.034520737 |

All recovered runs remain flat and their opening runes are unreadable in the native GP register. The known p57 cleartext gives IoC 0.0627099664 for comparison. [The complete original-source SFT](../sims/lp2_p7_quartic_cipherdelta_secondorder_original_sft.cjs) prints all eight candidate openings and verifies exact forward reencryption of all original tested runes. For each model, a separate **known-cleartext p57 plant**, 95 GP29 runes long, is exactly encrypted and recovered. The failure is in the proposed cipher operation's explanatory power, rather than the code's invertibility.

## Key-independent capacity boundary

Give a different arbitrary secret 29-symbol substitution permutation to *every previous ciphertext context* over all 12,956 original unknown runes, and ask how many occurrences of one chosen plaintext symbol it could possibly emit. For each context, at most the largest observed ciphertext successor count can map to that chosen rune. This computes an exact upper bound over all secret keys.

| Context | Observed states | Eligible positions | Maximum occurrences of any chosen plaintext symbol |
| --- | ---: | ---: | ---: |
| previous one ciphertext rune | 29 | 12,955 | 716 |
| previous two ciphertext runes | 840 / 841 possible | 12,954 | 2,019 |

The first-order impossibility for ordinary native GP-English E prevalence is already established in [the prior all-secret row-permutation bound](../sims/lp2_prev_cipher_row_permutation_capacity_sft.cjs). The new second-order figure shows that a secret two-predecessor row table **does** escape that specific one-letter capacity obstruction. It supplies neither a key nor evidence that such a table was actually used. Unlike an unconstrained 840-row secret key, the five printed p7 coefficients specify the tested operation completely and its ciphertext-only original inverse fails.

## Research decision

Retire precisely the literal Q(previous ciphertext difference) and Q(previous difference) emissions above. Their 8 source-fixed variants do not recover long original native GP plaintext on any of the three separated recipients. Do not generalize this to all two-state secret ciphers, plaintext-side feedback, multistage coding, or non-English output. Revisit only with an independent manuscript or 2014 signed instruction that selects an actual state update and operand.

**Reproducer:** [one-file Node 22 CJS SFT](../sims/lp2_p7_quartic_cipherdelta_secondorder_original_sft.cjs), using the canonical unchanged resource corpus; includes exact p7 red-word products, p8 origin, p57 positive plants, original holdouts, forward replay, and both capacity values. Verified **Windows Node22 PASS** in [CI run 45062980141](https://github.com/FlareZ123/liber-primus/actions/runs/45062980141).
