# Red-span 16-state GF(29) table-factor LFSR on original LP2

**Agent32, 18 November 2026. Classification: source-shaped conditional negative, not an LP2 decipherment.** The most direct continuous-book uses of the canonical **16 original unsolved red-span boundary glyphs** as the seed of the **degree-16 product of the original p50 numerical table's small GF29 polynomial factors** fail to recover native GP29 prose from the intact 12,956 original unknown runes. No authentic key, author-selected recurrence, unknown plaintext or destination was found.

## Independent starting evidence and proposed human operation

The original LP2 p0–55 source has exactly **16 continuous red-rune spans** in the physically derived annotated corpus. Their first GP29 rune indices, in printed span order, are the 16-byte sequence `0f140d18170e0014011317151b001018`; their last indices are `0516020c131118151a0d060c0f080913`. The separate 32×8 original numeric table converts under a provisional base60 read to the pinned 256-byte stream SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The exact source-original GF29 polynomial factorization in [the established supporting derivation](lp2-grid-complete-gf29-factorization.md) yields a degree-16 product of its four *small* factors (the repeated linear, quadratic, cubic and nonic):
```text
S16(x) = (x+5)^2 (x^2+18x+11) (x^3+14x^2+16x+24)
         (x^9+12x^8+20x^7+10x^6+5x^5+x^4+9x^3+15x+11)
       mod 29
ascending coefficients:
[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]
```
The 16-dimensional match allows an executable hypothesis: the 16 source-visible red initials or finals seed a linear-feedback sequence whose characteristic polynomial is this degree-16 source factor. The original source **does not identify** this product, an LFSR, a choice of seed or the cipher consumer. Factor cardinalities and the red count are post-hoc coincidences pending author evidence. A competing interpretation is that the table polynomial has ordinary small factors and red lengths are independent layout choices.

## Original-input fixed experiment

The self-contained read-only [Windows Node22 CommonJS test](../sims/lp2_red16_smallfactor_lfsr_original_sft.cjs) checks the exact 256 original decoded bytes, polynomial divisibility, 16 span objects against the canonical 58-page GP29 rune corpus, the seed vectors and all original 12,956 unknown runes. It tests **32** complete direct readouts without searching key starts, word boundaries, page offsets, punctuation clocks, or lexical fitness:

- First versus last glyph of each of the 16 original red spans.
- Source-order versus fully reversed seed order.
- The degree-16 product polynomial versus its correctly **monic normalized reciprocal**.
- Addition or subtraction of the generated GP29 key.
- Direct GP29 ciphertext as the payload versus the public predecessor-excluding successor difference `D[0]=C[0], D[i]=(C[i]-C[i-1]-1) mod29` as the payload.

Each proposed inverse exactly forwards to its own input (`C` or `D`); this is an implementation invariant rather than evidence of the historical cipher. The LFSR uses the seed as the initial sixteen states and generates later states from `s_(t+16)=-sum_(j=0..15) S16[j]*s_(t+j) mod29`, with no extra free tap values. The experiment tests one full-book continuous clock with no plaintext-dependent F skip or nonlinear recoding; those are outside its scope.

## Actual source outcome

| Measured original-source object | GP29 IoC |
| --- | ---: |
| Original all-unknown ciphertext, 12,956 runes | 0.03447839786450569 |
| Lowest of 32 hypothesized outputs | **0.03444081556684031** |
| Highest of 32 hypothesized outputs | **0.03452496464296996** |
| Independently clear p57, 95 source runes | 0.06270996640537514 |

The highest candidate is **last-red-span-glyph seed, reversed, forward source factor, negative additive sign**. Its first 40 ciphertext-derived GP rune transliteration symbols read `AEEAIBDPXODTHUTHOEFEUTHUPOWJGAEJAEHOTHMGIAANGCNGORPY` and its original p55 76-symbol local IoC is **0.03263157894736842**. The other outputs remain unrecognized non-prose, with global IoCs in the exceptionally tight near-uniform range above. For 12,956 original runes, this does not approach the native-English GP29 collision rates established across complete length-matched reference controls in [the authoritative research frontier](../results/README.md). Every fixed, global bijective rune-alphabet relabeling leaves these IoCs unchanged, so an additional *static single* output alphabet does not rescue this direct family.

**The source-exact Windows run is [PASS #44306059327](https://github.com/FlareZ123/liber-primus/actions/runs/44306059327)**. The preceding [failure #44305822714](https://github.com/FlareZ123/liber-primus/actions/runs/44305822714) correctly caught a transcription mistake in the investigator's nonic factor (a nonexistent `15x²`); the script was corrected against the published factor, rechecked by exact original-table divisibility, and rerun to PASS. The earlier failed script and its candidate outputs are not evidence. Re-run using existing manual `.github/workflows/manual-readonly-commonjs-sft.yml` with the above script, or Node22 locally.

## Causal decision

**Retire only this unbroken, continuously keyed, degree-16 small-factor LFSR with exact initial/final red-boundary seeds under either additive or predecessor-rank GP29 consumer.** It fails an intact original input at 12,956 symbols, and the source supplies no instruction to enlarge it with arbitrary offset/shift/seed mixing. Preserve the original factors and red spans as separate authentic source facts. Neither this coincidence nor its failed direct inverse justifies a follow-on key sweep. Concentrate on an independently recoverable cipher operation, key or historical clue that predicts coherent unknown-page plaintext before inspecting it.
