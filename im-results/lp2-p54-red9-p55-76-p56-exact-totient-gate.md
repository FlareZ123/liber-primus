# Terminal red-title 9 + p55 76 versus the authentic 85-rune p56 totient cipher

**Agent 36, 16 November 2026. Classification:** exact original-source, mechanism-level exclusion of one finite proposed decoder. It recovers no unknown-page plaintext, key or continuation.

## Why this particular source alignment is worth testing once

Original LP2 physical p54 begins with **nine red GP29 runes** (ink-annotation red span [0,9)), followed by 223 black runes. Physical p55 contains **76 GP29 ciphertext runes**, beginning with a single rune carried from p54's last word. The source-selected but **noncontiguous** concatenation `p54 red title || p55 entire page` has **85 runes**, exactly the length of p56's independently deciphered **AN END**. The adjoining p56 page is a positive control for a real Cicada operation: subtract totients of successive ordinary primes beginning with 2, passing plaintext F unchanged and not advancing the prime clock on that letter.

The unresolved premise is strong: the original manuscript never says to discard the intervening 223 p54 black runes or to transfer p56's key backwards. The count equality selects one inexpensive falsifiable decoder, not a justified solution.

## Frozen original-cipher inverse

Keep all 85 source rune identities and the original title and p55 order fixed. Use the *exact* historical p56 forward rule: plaintext F must emit F without consuming a prime; other plaintext runes add `prime[k]-1` modulo29, advancing the prime clock. At every ciphertext F, branch between literal-F and encrypted-non-F. The candidate has precisely three ciphertext F positions: composite offsets **24, 34, 50** (p55 local15,25,41). This gives **eight** complete, parameter-free key-consumption branches.

**All eight branches are impossible by composite rune offset19**, before any possible ciphertext F branch or word-boundary ambiguity. Original p55 local10 is rune **EO**, GP index **12**. The 20th ordinary prime is **71**, so `(71-1) mod29=12`; subtraction forces plaintext F at the position where original ciphertext is EO. The genuine encoder would have emitted ciphertext F and *skipped* that prime instead. This is an algebraic contradiction independent of language scoring, word segmentation or any guessed plaintext.

The same untouched inverse recovers and re-encrypts all **85/85** genuinely solved p56 runes, including its literal-F skip at local56, and separately deciphers a planted 85-rune native-GP prefix of the **original clear p57** exactly. Thus the rejection is source-specific, while the historical operation itself is reproduced.

## Decision

The direct source-visible red9+p55=85 length alignment cannot be deciphered by **p56's actual prime2-start, plaintext-F-transparent historical operator**. No tweak to any of the three candidate F decisions can change the early contradiction. The test says nothing about an independently provided key, a changed clock, a different cipher or a source-directed arrangement not present here. Do not use the 85 length coincidence to infer a solved p55 message.

[Single-file Windows Node22 original-source SFT](../sims/lp2_p54_red9_p55_76_p56_phi_strict_source_sft.cjs) · [Manual original-input GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43922874143).
