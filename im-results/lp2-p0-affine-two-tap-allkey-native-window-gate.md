# Original p0 excludes every fixed two-tap affine GP29 feedback key in a literal native register

**Agent16, 23 November 2026. Classification: bounded, original-input negative; no new plaintext or creator-selected cipher.**

## Hypothesis and causal limit

The original LP2 opening p0 contains 262 GP29 ciphertext runes. The 2014 solved p56 demonstrates additive arithmetic modulo29 as an authentic historical technique; the unusual 86 adjacent-equal ciphertext events in the unresolved 12,956-rune book motivate an evolving two-tap feedback alternative. The *exploratory* full-alphabet bijective machine is

```text
C[0] := authentic first rune of p0
C[i] = (P[i] + a*C[i-1] + b*P[i-1] + d) mod 29,  i >= 1
P[i] = (C[i] - a*C[i-1] - b*P[i-1] - d) mod 29
```

Every triple `a,b,d` is secret in GF29, and the entire **initial plaintext rune P[0] is also unrestricted**. The operation is reversible: given the initial rune, ciphertext determines all later plaintext uniquely. It uses one fixed shared key over the page. It can implement plaintext feedback and ciphertext feedback simultaneously and hence is not the memory-one *ciphertext-output* table of the completed #2371 theorem. A source-selected operand is missing; this is an attempt to find a low-complexity viable whole-page inverse, not a claim about the author's choices.

## Exact whole-family result on untouched p0

Exhaustively scan all **29^4 = 707,281** distinct (`a,b,d,P[0]`) choices against the original **262** printed rune indices in the canonical `lp2-corpus.json`. At each inverse, measure the **unigram index of coincidence**, counting double ordered collisions over the entire recovered 262-rune sequence. This statistic is independent of guessed plaintext words, a dictionary, partial English cribs, and re-encryption implementation.

The exact **largest recovered collision count is 2,748 out of 262×261 = 68,382 ordered positions, giving IoC 0.04018601386329736**. No one of the 707,281 inverse plaintext candidates has IoC at least 0.05000. One maximizer is `(a,b,d,P[0])=(23,3,0,7)`; other parameterizations tie. Every candidate necessarily re-encrypts the original ciphertext, so this property cannot distinguish keys on its own.

For a **separate source-native positive register**, take all **1,325** physically contiguous 262-rune windows within each individually solved section long enough in `resources/external/relikd-solved-gp29-native-v1.json` (do not splice separate solved sections). Their minimum original GP29 IoC is **3,788/68,382 = 0.05539469451025124**, from `0_loss_of_divinity`. The first 262 solved `0_welcome` runes forward-encrypt and decode exactly with `(a,b,d)=(23,3,0)`, using their actual first plaintext rune and p0's actual first ciphertext rune. The original best possible output is substantially less English-like in this one necessary statistic than **all 1,325** continuous solved-source windows, even after charging the 707,281-key optimization.

## Decision

The complete fixed-two-tap affine GP29 family above **cannot reproduce the native unigram repetition of any tested length-matched solved-Cicada 262-rune window on exact original p0**, regardless of secret coefficients or initial plaintext state. This is a source-native/word-preserving *necessary-register objection*, not a mathematical impossibility for every conceivable text. It does not exclude keys varying by position, nonlinear/state-dependent coefficient updates, a second unobserved key stream, changed or inserted symbols, genuine resegmentation, or a short nonnative header. Any resuscitation needs an **independently visible state/key instruction**, not a tuned additional degree of freedom.

**Reproduction:** `node sims/lp2_affine_twotap_p0_allkey_sft.cjs` (single-file, read-only CommonJS for Windows Node22). The exhaustive original-input and planted-control assertions passed [Windows Node22 CI run 45119146508](https://github.com/FlareZ123/liber-primus/actions/runs/45119146508). It recomputes the exhaustive original maximum, the unspliced solved-source window floor, and a full genuine planted inverse. Compare #2273 / #2278 for fundamentally different space-moving and nonlinear encoders.