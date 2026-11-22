# Original scroll255→p8: arbitrary secret bitwise-XOR wordhash rejected

**Decision (22 November 2026).** Given the *conditional, unauthenticated* p7 GF(4) + p50 radix59 key correction to the genuine 255-rune p8 ciphertext, the adjacent 255 whole p3–p7 words **cannot** map to those corrected p8 runes through any stationary bitwise XOR checksum over secret rune labels, followed by **any secret deterministic output table**. The proof holds for **arbitrary rune-label bit width**, including the natural five-bit 32-state and eight-bit 256-state variants. Two pairs of actual **black** source words have equal rune parity signatures but *different* corrected outputs. No hidden key, plaintext, or intentional cipher is recovered.

## Source-selected premise and operation

The last five p7 original red words have GP29-index products **[11,26,8,15,2]**. A previously frozen, conditional reading maps these products into GF(4) taps and seed, making a 255-step nonzero-state register, then uses its addresses to look up the p49–p51 256-cell radix59 table as an additive key on p8. It yields four source Parikh matches on the 255 whole scroll words: three identical words and the newly discovered black/red EO·X/X·EO anagram, corrected pairs **20=20,8=8,2=2,9=9**. The source employs a GF(4) XOR feedback operation, so an independent **XOR-reduced source-word checksum** is a plausible specific, cheap follow-up. It does *not* establish that the correction or the 255-word pairing was intentionally used by Cicada.

## Exact all-secret obstruction

For any binary label `u[r]` assigned secretly to each of 29 GP29 runes, the XOR of labels in word `w` is determined entirely by the parity of each rune's occurrence count in that word:

```
S(w) = u[w[0]] XOR u[w[1]] XOR ...
H(w) = f(S(w))
```

Here `f` may be any completely unknown deterministic lookup, with arbitrarily many bits per XOR label and an arbitrary 29-rune output. The *same parity multiset* always produces the same S, for every secret label and every f. This is an exact necessary equality independent of any key-fitting procedure.

Across the **255 original complete source words** (1,145 GP29 rune signs), there are exactly **249 different parity signatures**, producing six repeated-parity word groups. Four are the known same-Parikh classes with matching conditional output. **Two newly observed parity-only classes contradict the target**:

| Original zero-based word indices | Literal GP29-index words | Corrected p8 runes |
| --- | --- | --- |
| **12 and114** | `[23,12]` vs `[12,23,12,21,12,21]` | **25 vs20** |
| **131 and209** | `[12,9,24]` vs `[14,24,9,12,14]` | **9 vs20** |

The second word in each pair contains additional glyphs in **even-numbered pairs**, which cancel under XOR for any secret labels. Every word in both contradicting classes is **original black ink**. Even giving original red and black source words separate unknown secret output codebooks cannot repair either contradiction. This excludes *all* stationary word-local XOR checksum widths, including 8bit 256-entry keyed tables, under this exact original-source registration.

## Reproducibility, controls and decision

[Windows-compatible Node.js CommonJS SFT](../sims/lp2_scroll255_xor_wordhash_allsecret_sft.cjs) reads the four canonical original source files, reconstructs the original 255 source words and red/black ink, reproduces the exact conditional p7/p50 correction and ciphertext re-encryption, verifies all six parity classes and both conflicting pairs, then builds a **full 255-word positive plant** with 29 arbitrary secret eight-bit glyph weights and an unrelated complete 256-entry output lookup table. The plant's six parity classes match exactly, and re-encrypting under the same original conditional key replays 255/255 outputs. It is an original-cipher necessary-condition test with a genuine positive control. Its exact repository source was executed via V8 with original repository source-file bytes, PASS.

**Research fork:** retire this **global XOR-of-fixed-glyph-labels** wordhash for the conditional 255-source-word→p8 output model. It is genuinely distinct from the already ruled-out [all-secret multiplicative product](lp2-scroll255-gf4-radix59-allsecret-multiplicative-wordhash-obstruction.md) and the earlier secret additive GP29 wordhash families. The printed GF(4) recurrence remains a conditional, unverified key mechanism; another word hash requiring position-dependent state or an independently authored source operator is not affected. Do not manufacture more hidden labels or output tables to rescue a two-witness algebraic impossibility; a positive route must yield independently held-out original plaintext or creator-provided key material.
