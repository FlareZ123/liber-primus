# A lossless previous-plaintext-word GP-prime feedback candidate synchronizes on original LP2

**Agent13, 13 November 2026. Classification: bounded original-cipher negative, not a recovered key or plaintext.** Reproducer: [source-native one-file SFT](../sims/lp2_wordprime_plainfeedback_sft.cjs). This investigates a genuinely different recurrence from Director #739's previous-**ciphertext**-word φ(prime) shift and Agent13's former p32 source-word key tests.

## The simplest source-motivated route

The signed 2016 text instructs that the book's *words* are the map and their *numbers* the direction. Source-authenticated GP prime weights and additive rune arithmetic are available from the signed 2013 BASE29 material and solved LP1. A bounded candidate is that each **decoded plaintext word's GP-prime sum** supplies the modular shift for the *following* printed word. Its 29-symbol initial state may be secret. If so, the original ciphertext, its word breaks, and the known GP primes specify a reversible finite-state cipher with only **29 initial keys**, and once the state is known all following plaintext is forced.

For each complete original word \(w\), with ciphertext GP indices \(C_i\), state \(s\), plaintext indices \(P_i\), and GP-prime table \(\pi\):

\[
P_i=(C_i-s)\bmod29,\qquad
s_{\mathrm{next}}=\left(\sum_{i\in w}\pi(P_i)\right)\bmod29.
\]

The lossless forward inverse is \(C_i=(P_i+s)\bmod29\), using the same previous-plaintext-word state. No trial key period, random generator, output reordering, omitted rune or added opcode is involved. The exact signed instruction **does not specify this formula** or select a plaintext-feedback clock; this is an affordable motivated hypothesis, not an author-authenticated decoder.

## Exact original calculation

The published physical LP2 page corpus has 57 rune-bearing page segments because physical p50 is runeless. Concatenating the original p0–55 transcription *before* tokenizing, and joining broken lines, yields **2,896 complete printed words, including 32 words that cross original page boundaries, with 12,956 rune tokens**. Splitting each page first would incorrectly create 2,928 page-local segments. Page 56 and page 57 stay outside the unknown sample.

Under every one of the 29 possible initial states the state-update map is evaluated on each untouched original ciphertext word. The set of possible states shrinks from 29 to 21 after the first complete word, 16 after the second, 3 after word 25, 2 after word 50, and **one state after word 73**. Those first 73 words contain **331 runes**. Thus *all* 29 initial seed choices yield the **identical remaining 12,625 decoded runes**. The recovered deterministic candidate suffix is wholly independent of the unknown initial seed, so a secret initial key cannot rescue it.

A few source-position-locked decoded words immediately after synchronization, preserving their printed word boundaries, are:

\`DOEA BOLEA IPX EOBNG IAOEIAR THW X PA GM NGPC DIAEOEGO EORODNS ...\`

| Frozen measurement | Result |
| --- | ---: |
| Original unknown original runes | 12,956 |
| Continuous printed words | 2,896 |
| Different possible initial shift keys | 29 |
| First complete word with unique state for all seeds | 73 |
| Forced common plaintext suffix | 12,625 runes |
| Forced suffix GP29 index of coincidence | **0.0344919625** |
| Full decoded candidates: IoC over all 29 seeds | **0.0344820679–0.0344956995** |
| Original solved p57 native-GP IoC (95 runes) | **0.0627099664** |

All 29 outputs remain ciphertext-like, including the **12,625-rune seed-independent suffix**. This is a stringent original-input exclusion of the exact signed-2016-inspired recurrence, assuming ordinary source-native GP plaintext; it is not evidence that LP2 uses a one-time pad or that all word-feedback ciphers fail.

## Positive and inversion controls

The SFT reads actual solved p57's **95 GP symbols** and their original printed words, enciphers them with the defined previous-plaintext prime-sum recurrence and seed17, deciphers with seed17, and requires exact equality of all words. Seed18 fails the planted original text. On the original 12,956 cipher symbols, the decoder and forward encoder reproduce every source symbol under four independently selected seeds. Since an arbitrary seed gives an exact roundtrip by construction, the roundtrip **cannot authenticate** the candidate output; the 29-key synchronization and plaintext statistics supply the decisive original-language gate.

## Cryptanalytic consequence

The original ciphertext itself collapses the putative 29-state word-feedback register. If this exact compact mechanism were in force, a contemporary solver would require no initial key after word73, and the remaining text would be directly readable under the original GP alphabet. It is not. Retire this precise previous-plaintext-GP-prime-sum additive recurrence; seeking a different feedback operand, nonlinear transport, state reset or moduli solely to improve output scores would be a new unsourced model.

The manuscript's complete decoder, true key material, unknown-page plaintext and destination remain unresolved.