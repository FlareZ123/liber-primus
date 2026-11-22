# 256 original ink events as an F29 recurrence seed: full original-inverse gate

**Status (10 November 2026): bounded, source-motivated negative.** No unknown LP2 plaintext, authentic key, or mechanism recovered. The first 256 events, the 256 table bytes, and the GP symbol field are real source inputs; treating them as a particular linear recurrence key is an experimental construction, not a decipherment.

## Why this construction was tried

The same manuscript visibly offers **225 red GP runes and 31 thirteen-dot punctuation marks**, exactly **256 marked events**, as well as the **32×8 = 256** printed base-60 bytes across physical pp49–51. The established polynomial for those bytes has a double root at `X=24` in F29; the conspicuous oversized **Ac** rune on p54 has zero-based GP index 24. These are finite source-grounded candidates for a 256-place state, a coefficient vector, and an optional two-factor operation. Earlier periodic source-pad and independently secret feedback searches are different from the **single, long-evolving source-fixed recurrence** tested here.

The proposed decoding operation has three independently meaningful choices to justify historically: (1) 13-dot punctuation contributes a field zero and the red rune contributes its GP index; (2) the table supplies coefficients in the printed order, or the double-root polynomial quotient supplies a 254-coefficient alternative; (3) these numbers drive a linear recurrence and a particular cipher register. Nothing in the authenticated artifact currently establishes this entire operation.

## Exact, recoverable input and computation

[Source and runnable CommonJS SFT](../sims/ink256_grid256_lfsr_inversion.cjs); original data in `resources/liber-primus/{lp2-corpus.json,lp2-ink-annotations.json,base60-grid.json}`. The script checks the source rune identity for every red span. Sort the original red-rune events and the 31 **13-dot-only** events in physical page and local-rune order; when equal-coordinate events coexist, the mark precedes the rune. A red rune maps to its **0..28 GP index** and a punctuation event to **0**, giving the 256-component seed `s[0..255]`. The seed includes later solved p56–57 events; it is **not disjoint** from the unknown message.

Write the 256 printed bytes in row-major order, reduced modulo 29, as `a[0..255]`. For each `n >= 256`, evaluate the exact recurrence

```text
s[n] = sum(j=0..m-1, a[j] * s[n-m+j]) mod 29
```

with `m=256` for original taps and `m=254` for the high-degree-first coefficient quotient after dividing the source polynomial twice by `X-24` over F29. Both quotient remainders are exactly zero, checked in the script. For each tap source, include the printed and reversed coefficient order as an explicit discriminator. All four generated keystreams are determined by published input, with no fitted original-LP2 state.

Each stream is applied with both signs to one of three exact registers: `direct` additive GP29; `delta` additive GP29 on consecutive ciphertext differences (book-initial previous value 0); or the invertible `ea` finite-field primitive-root-15 difference transform, where zero ciphertext differences are transparent EA output (GP index 28), and nonzero differences are discrete-log ranks modulo 28. This is **2×2×3×2 = 24** fixed cases, not a large optimized search. Recovered plaintext is mechanically reencrypted against all 12,956 source runes, and native LP1 plaintext plants are independently encrypted, decoded, and compared at every position.

**Holdout policy:** the first 256 original positions are never included in ranking: some seed events are the same original ciphertext glyphs, so source-index equality there is circular. All reported statistics below use global rune offsets **[256,12,956)**, 12,700 runes. Original-plaintext features for a true key remain a separate question: the last 12,700 runes still share source authorship with the marks and grid.

## Original results

The original ciphertext has global GP-index IoC **0.03447839786450569**. The best **post-seed** output of the 24 predefined cases by coincidence index is printed-row, raw-256-tap, EA-register, plus sign:

- IoC **0.03532891485658552**, top-12 GP symbol mass **0.44763779527559056**;
- beginning at global rune offset 256: `LYBOEPRTHDANGPEDEHPETHCL...`, with no coherent original language.

The closest alternative uses the reversed double-root 254-tap quotient, EA-register, minus sign: IoC **0.035296833466334075**, top-12 mass **0.44535433070866143**, beginning `THNGCEFGIRDITHTHRAELYTHAELC...`. All direct and additive-delta variants remain near `1/29 ≈ 0.03448276`, as is the original ciphertext. EA outputs preserve the 86 original adjacent-equality events as literal EA escapes; this creates an **inherent** mild symbol-frequency/IoC increase, so the EA IoC figures must **not** be presented as significant above an appropriate repeat-conditioned null. These 24 outputs do not contain readable new plaintext.

All **24/24** authentic-input inverse/re-encrypt checks and **24/24** source-native synthetic inversion controls are built into the SFT; the synthetic controls only show model implementation correctness. For a bijective keyed transform, reencrypting its own decoded original text is necessarily exact even under a wrong key.

## Decision

This excludes the **two source-extracted coefficient choices and both directions, applied through the three stated original-GP registers with a linear evolving F29 state**, as direct paths to readable unknown LP2 text under the tested character-clock convention. It neither disproves the 256-event correspondence nor rules out unknown segmentation, other state equations, secondary encoding, separately obtained key material, or a non-GP plaintext register. In particular, the key stream has no authenticated historical generator selection, so searching more arbitrary tap orderings would be low value without a new clue.

The useful reusable artifact is a **source-locked full-length evolving-state benchmark** with explicit 256-rune overlap exclusion and exact invertibility. A follow-up should supply an independently visible recurrence, output alphabet, or event-assignment instruction rather than tune additional key schedules on the same original output.
