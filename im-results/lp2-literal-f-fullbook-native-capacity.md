# Corrected literal-F capacity: the original F-count exclusion is withdrawn

**Corrected 13 November 2026 (Agent1). Evidence class: exact original-source cipher-direction correction to a finite-corpus necessary-condition test.** The previous version of this report incorrectly inferred that **every ciphertext F is an unchanged plaintext F**, and used that premise to exclude 562,060 native-English windows as unknown LP2 plaintext. This was a substantive mistake about the historical cipher, directly refuted by already-solved Cicada ciphertext. **The count-based exclusion has been retracted.** No unknown LP2 plaintext, source-selected key or destination was recovered by this correction.

## Authentic direction: plaintext F forces ciphertext F

The solved LP1 WELCOME/DIVINITY (515 native GP runes) and LP2 p56 AN END (85 runes) use a **plaintext-F bypass** in their known keyed ciphers:

- If the **plaintext** GP rune is **ᚠ = F = 0**, the encoder outputs ciphertext F **and consumes no key symbol**.
- A non-F plaintext rune consumes a key symbol and is normally encrypted by addition modulo29. Depending on the key shift, an ordinary non-F plaintext rune can produce **ciphertext F**.

Consequently the valid necessary implication is

```text
P[i] = F  =>  C[i] = F.
```

The converse **C[i] = F ⇒ P[i] = F** is false on verified solved originals. For LP2 p56, the exact original ciphertext Fs at page-local positions **35, 47, 51, 56, 74** correspond to native-GP plaintext **A, I, D, F, C**. Thus only index56 is a bypass and **four of five original ciphertext Fs are ordinary encrypted non-F letters**. Independently, solved LP1 WELCOME has **25 ciphertext Fs** but only **11 plaintext-F bypasses**, with 14 ordinary encrypted non-Fs resulting in F. These are exact source evidence, not a guess about unsolved-page encryption.

The [authentic p56 32-mask certificate](../sims/lp2_p56_plaintext_fehu_ambiguity_sft.cjs) uses the actual known prime-totient stream to show that **22 different F-clock masks** can each encode strictly forward to exactly the same 85 genuine p56 ciphertext runes. The [independent known-key lexical decoder](lp2-ftransparent-word-lexical-viterbi.md) resolves all actual bypasses on **710/710** solved runes across three historical keys, without accepting ciphertext F as necessarily literal.

## What the original unknown-page F counts really imply

Original LP2 unsolved physical pp0–55 contain **12,956** runes with **458 ciphertext Fs**. The original visual chapter **pp40–53** has **3,008** runes with **125 ciphertext Fs**. Under the **same plaintext-F transparent encoder**, the only full-book count condition is

```text
plaintext_F_count <= 458,
and (for the independently keyed pp40–53 chapter)
plaintext_F_count_in_pp40_to_53 <= 125.
```

Both inequalities follow by inclusion of plaintext-F positions among the ciphertext-F positions. A correct count-only exclusion would need an independently fixed plaintext containing **more** than 458 Fs (or more than 125 Fs in the chapter), not fewer.

The repository's original source-calibrated 29-rune GP English encoder, with single-rune ING/IO, produces these unchanged **maximum** F counts over **every possible contiguous original-length window**:

| Independently sourced native-GP prose | Whole-length 12,956-rune windows | Maximum native plaintext F count | Section-length 3,008-rune windows | Maximum native F count |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, first 300k characters | 204,151 | 321 | 214,099 | 96 |
| Gibran, *The Prophet* | 49,537 | 390 | 59,485 | 109 |
| Emerson, *Essays* | 308,372 | 432 | 318,320 | 119 |
| **Total** | **562,060** | **all satisfy the actual ≤458 bound** | **591,904** | **all satisfy the actual ≤125 bound** |

**Correct result:** every one of the 562,060 reference windows satisfies the *correct necessary whole-book F count* and every one of the 591,904 reference windows satisfies the *correct necessary section F count*. This means only that **counts do not exclude them**. Their actual positional F masks, word shapes or other encryption properties might still reject specific plaintext windows, and no source tells us that any source passage is an LP2 original plaintext.

The former interpretation took `max(reference plaintext F) < observed ciphertext F` as a contradiction. Under the original validated encoder it is perfectly possible, because ordinary encrypted non-F symbols can contribute the additional ciphertext F occurrences. Indeed, the previous synthetic F-positive generated a **stricter artificial F-exclusive output code** by forcing every non-F to encrypt to a non-F, thereby making `P_F = C_F`. That positive control validated the artificial stricter model only; it did not justify attributing the stricter invariant to Cicada's known cipher.

## Reproducible correction and operational decision

The [corrected CommonJS source SFT](../sims/lp2_literal_f_fullbook_native_capacity_sft.cjs) reads the exact original 12,956 LP2 cipher indices and their 3,008-rune chapter, recomputes all three native prose F-count maxima, asserts **the corrected inequality direction** for every window, and includes both the exact p56 F-position witness and a native-GP positive plant in which plaintext F remains literal while some non-F letters also encrypt to F. This is a narrow **source-based correction**, not a new cipher-search sweep. The exact F counts and window maxima from the earlier report remain usable descriptive observations after the inference is corrected.

**Decision:** withdraw the blanket all-secret unknown-LP2 English exclusion that was based on ciphertext-F-as-literal-F. Reopen the broader **plaintext-F transparent** cipher possibility only when a separate original clue selects its key and stream clock; do not infer that LP2 actually uses it. For any future proposed true plaintext, use the correct **positional necessary condition** `{i : P[i] = F} ⊆ {i : C[i] = F}`, then the known-key lexical clock decoder and exact forward encoding. The restriction on plaintext F positions can be useful on an independently supplied real crib, while the F **count alone** gives no contradiction for the control corpora.
