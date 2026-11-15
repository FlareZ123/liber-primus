# LP2 p15 Fibonacci-prime evolving-repeat marker: original-source inverse decision

**Agent30, 15 November 2026; Director #993.** A complete, explicitly reversible 29-rune ciphertext-feedback model uses the original p15 Fibonacci-indexed prime spiral as a *time-varying marker* to explain rare adjacent equal ciphertext runes without treating one fixed GP symbol as the marker. The first-party **number sequence** is real; the proposed marker consumer, modulo29 projection, 16-step repetition, shift convention, and receiver are **not** source-authenticated. This bounded model recovers **no unknown LP2 plaintext or authentic key**. Do not extrapolate its finite negative to arbitrary evolving-marker ciphers.

## One original source selector, a reversible operation

Original physical p15 scan `resources/liber-primus/32.jpg` prints the established red-center sixteen-value square spiral:

```
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820 708 1206 4516
```

These are the absolute differences of 3301 and the original page's recovered Fibonacci-indexed primes, in corresponding order:

```
2 3 5 7 13 23 43 79 149 263 463 829 1481 2593 4507 7817
```

The manuscript does not say to apply a 16-phase cipher or to identify a plaintext marker from the primes; this is the **specific missing historical link**.

For an intact chapter rune stream `C[0..n-1]`, carry the immediately preceding *ciphertext* rune across physical pages; set the initial plaintext rune `P[0]=C[0]`. At each `i>=1` let `t=(i-1) mod16`; take marker `m=prime[t] mod29` (source-prime), or `m=(prime[t]-1) mod29` (historically authentic prime-totient variant). Let `d=(C[i]-C[i-1]) mod29` and `shift=printed[t] mod28`. Decode:

- if `d=0`, set `P[i]=m`;
- otherwise enumerate the 28 GP29 values other than `m` in original alphabetical order, and select the value at `(d-1+shift) mod28`.

This map is a 29-permutation at *every* time phase and prior ciphertext state. Its inverse emits the previous ciphertext for the time-varying marker, otherwise maps the complement alphabet to `1..28` successor differences and adds them to the preceding ciphertext mod29. Every original rune, including the observed repeat exceptions, is preserved. Unlike a lossy collision-repair proposal, the exception symbol is always reconstructible from public phase and predecessor. The chapter is one continuous stream, with **no page/word reset** and one public IV at its start. The choice of a rank and printed-number rotation makes the operation executable and invertible but remains conjectural.

## Necessary source-native repeat gate: original p16–22

On the entire **1,744-rune** source p16–22 chapter, including every physical page seam, exactly **10** adjacent equal ciphertext pairs occur across **1,743** eligible successor positions. In this proposed cipher, that means exactly 10 original plaintext symbols must equal the public 16-phase marker at their fixed positions **regardless of the arbitrary 28-way nonmarker alphabet permutation**. This supplies a key-independent event-count test before any language optimization.

The independent native-GP controls use the repository's original solved-source-conformant English encoder (special rune ING→NG and IO→IA), complete Shakespeare (217,106 GP runes) and Gibran (62,492 GP runes), matching the exact 1,744-rune target length in fixed stride-17 contiguous windows. Source text is never fitted to original ciphertext.

| Source marker | Original p16–22 repeats | Shakespeare 12,669 windows: marker count minimum / mean | Gibran 3,574 windows: minimum / mean | Matched windows with ≤10 markers |
|---|---:|---:|---:|---:|
| Fibonacci prime mod29 | **10** | **26 / 50.219** | **28 / 51.222** | **0 / 16,243** |
| Prime totient mod29 | **10** | **32 / 58.888** | **35 / 60.112** | **0 / 16,243** |

These are finite-source comparisons, not independence-adjusted p-values, and the marker sequence is a solver hypothesis. A different text, clock, marker-selection operation, or plaintext register can escape this comparison. The inability to match marker counts already rejects both specified native-English direct readers, **even if the remaining 28 outputs are arbitrarily permuted at each clock position**. Thus changing their rank convention or secretly permuting the residual alphabet cannot rescue this fixed marker schedule.

## Full original ciphertext inverse and positive controls

The exact original decode and deterministic forward reencryption succeed over all **1,744** p16–22 and disjoint **308** p54–55 original rune positions, for both marker definitions, with no dropped physical page seams. The resulting direct plaintext candidates are nonlinguistic:

| Original complete chapter | Marker | Input GP29 IoC | Recovered GP29 IoC | First decoded symbols |
|---|---|---:|---:|---|
| p16–22 | prime | 0.03450960 | **0.03462013** | `E EA D NG I EA IA F J TH G R AE T EA P TH C M E G T` |
| p16–22 | prime−1 | 0.03450960 | **0.03496621** | `E EA D NG I EA IA F J TH G R AE T EA P TH C M E W T` |
| p54–55 | prime | 0.03382123 | **0.03401159** | `A M A OE OE T P G I A J F S N X M O NG U E W` |
| p54–55 | prime−1 | 0.03382123 | **0.03348280** | `A M A OE OE T P G I A J F S N X M O NG U E G` |

All four real-text inversions roundtrip to the exact original ciphertext, as expected for any bijective key. A separate positive plant takes *the actually clear 95-rune p57 PARABLE source*, repeats it to the exact 1,744/308 rune lengths, encrypts under both prime variants, and decodes it back **exactly**. This verifies the full reversible implementation and marker event identity without representing synthetic plants as a discovery.

## Decision and next gate

The published 16-number mathematical clue does not supply the additional source-authored instruction necessary to choose **this** GP29 evolving-marker cipher or its chapter start. On original p16–22 the marker event count already lies below **every** native passage in two large independently encoded GP English controls, and the direct inverse is nowhere readable. Retire this exact Fibonacci-index marker scheme. The broader #993 problem remains fundamentally dependent on acquiring a *creator-typed, independently selected state update/exception definition*, especially since the previous-cipher stationary all-secret families are already rejected in `im-results/lp2-cipher-feedback-conditional-entropy-gate.md` and `im-results/conditional-permutation-ioc-invariant.md`. A different dynamic transducer must predict unseen original plaintext or provide a separately authenticated key; its ability to roundtrip by itself is irrelevant.

**Reproduce:** [Single-file read-only Node22 CommonJS SFT](../sims/lp2_fibprime_evolving_marker_original_sft.cjs), with original corpus and two independent native control files. The complete original-input and solved-native positive tests **passed [manually dispatched GitHub Actions run 43666022724](https://github.com/FlareZ123/liber-primus/actions/runs/43666022724)** under Node22 after commit `798e4a4f`; no automatic GitHub Actions trigger is used.
