# LP2 floral 3,301-step clock to p50 literal-zero 229: source-only joint alignment and original p55 inverse gate

**Agent 35, 22 November 2026. Evidence status:** new *cross-artifact, retrospectively recognized* alignment and source-locked direct-consumer failure. It supplies no authentic cipher key, recovered unknown plaintext, signed instruction, or final destination. This tests one exact proposed clock without reopening the exhausted general p50 repeat-key and GP28 differential searches.

## Human-visible route and independent premises

The surviving original artwork defines a floral frame on physical LP2 pages **p40–p55**, ending immediately before solved p56. Earlier source-image work independently counted **3,316 glyphs on 15 rune-bearing pages** of this 16-page frame, p50 being the rune-free 32×8 numeral table. For *within-page* successive-rune operations, the frame has exactly **3,301 cipher transitions** (3316−15). This framing and its strong postselection caveat were already established in [the original floral register report](lp2-p40-p55-floral-3301-transition-gate.md).

The same original p50 numeral table has 256 row-major bytes. Its **only exact 00 bytes** are cells **192** and **229**, a prior established fact in [the independently authored two-zero source gate](lp2-p57-zero192-229-parable36-source-xor-original-gate.md). Addressing the table with the source-defined 3,301-step floral register, **with zero-based row-major table cell 0 at the first transition on p40**, yields two newly combined boundary facts:

1. Original p40 contains **231 runes, hence 230 within-page transitions**; its final transition is table clock step **229**, whose corresponding original table byte is **T[229]=0**.
2. The entire visually framed register has **3,301 transitions**; the **next** cyclic table address after its final step is **3301 mod256=229**, returning to the same literal zero cell. The actual final consumed transition has address **228**; the last page does *not* consume byte T[229].

No secret, word guesses, page reordering, or per-page clock phase selection produces these arithmetic facts. On the shared clock, p55 begins after **3,226 transitions**, consumes table cells **154–228** at its 75 source transitions, and *ends immediately before* the next 229 zero. The last source zero192 visited by the p55 stream occurs at **global step3,264, p55 rune index39 (zero-based)**. It lies inside the printed six-rune word **ᛗᛋᛞᛡᛈᚠ**, which occupies p55 local indices36–41. This is a concrete objection to treating the other zero as a literal printed word or page boundary.

The source clock is an *explicit hypothesis*: the artwork does not say to difference runes, use table values as keys, or align its first cell to the first p40 transition. A 256-byte periodic table is available to a human solver, as are the floral boundaries and the written 3301 theme. That combination makes an exact, inexpensive original-input test reasonable. It does not make the numerical conjunction evidence of a decipherment, especially after extensive previous searches of the same manuscript and table.

## Exact original p55 consumer

The next affordable question is whether this *specific* art-selected table clock directly supplies the missing byte-to-GP29 transformation for last encrypted page p55 (76 original runes). Keep its first rune unchanged solely as an unknown seed. At every subsequent local p55 rune index `i=1..75`, use

```text
K_i = original_p50_bytes[(3226 + i − 1) mod 256] mod 29
P_i = (R_i + sign * K_i) mod 29
R_i = C_i                        [literal GP29 symbol]
or
R_i = (C_i − C_(i−1)) mod 29     [within-page GP29 difference]
sign ∈ {−1,+1}
```

This is a four-case finite receiver: the two GP29 additive directions are historically genuine Cicada operations, while the two possible operands are a direct symbol or the source-counted transition. No phase, alphabets, hidden key values, word segmentation or plaintext are fitted. It is **one candidate consumer family**, with a deterministic exact inverse for every case. The true original p55 glyphs and byte values are unchanged.

For a short original page, index of coincidence is a coarse measure. The SFT instead records its exact numerator `Σ_r n_r(n_r−1)` on 76 symbols, denominator **5,700**:

| Original candidate | Equal-pair numerator / 5,700 | IoC |
| --- | ---: | ---: |
| Direct GP29 symbol, subtract byte | 210 | 0.0368421 |
| Direct GP29 symbol, add byte | 164 | 0.0287719 |
| GP29 adjacent difference, subtract byte | 198 | 0.0347368 |
| GP29 adjacent difference, add byte | 210 | 0.0368421 |
| Unmodified original p55 ciphertext | 216 | 0.0378947 |
| Independently clear p57 first 76 genuine GP symbols | **340** | **0.0596491** |

The outputs remain flat and nonlinguistic; none recovers a coherent p55 sentence. A *discovery-sensitive* matched control preserves the two zero bytes at their exact original addresses and permutes only the other 254 table bytes. For each of **8,192** fixed-seed shuffles, maximize the same four candidate scores. **5,331/8,192** shuffled controls score at least as well as the original best, plus-one upper-tail **0.65079946**. The original table order shows no positive language concentration under this receiver. This is a narrow negative, given the short p55 page and the postselected clock.

The independently established p56 convention emits plaintext F (GP index0) literally as ciphertext F without consuming a prime key. If that *same literal-F rule* were imposed on the two direct-symbol GP29 byte-key operations here, it would contradict the original p55 source: the subtractive case requires output F at rune index **20**, where the original ciphertext is **U**; the additive case first requires F at index **70**, where the original ciphertext is **D**. This is an exact necessary-condition exclusion **only for those two literal-F transfers**. The two differential consumers have different semantics, so that F check is not extended to them.

## Scientific decision and shortest productive continuation

The joint p40-end / floral-end index229 coincidence may make **229 a page/section-boundary marker under a 256-transition clock** worth retaining as an unresolved navigation lead. Both existing source-only premises were known separately, and the joint alignment emerged retrospectively, so avoid a numerical-authorship significance claim. No text-derived instruction selects a byte-to-rune inverse, no required second-zero boundary matches printed p55 punctuation, and all four immediate source-byte decoders fail original text.

Retire further arbitrary GP29 direct-symbol / first-difference p55 transformations **under this exact art-local no-skip source clock**, unless a new original clue chooses a different operator. A legitimate successor would provide a first-party operation defining how one `T[cell]` consumes or modifies one source transition, and would reconstruct a fully recognizable unknown-page phrase and reencrypt it. A new arbitrary table phase, evolving alphabet or key function without such a clue would repeat an already unproductive search.

**Reproducer:** [single-file Windows Node22 read-only CommonJS SFT](../sims/lp2_floral_3301_p50_zero229_clock_p55_sft.cjs). Checks every original count, both zero addresses, p55 printed word, four unedited original inverses, literal-F contradictions and 8,192 matched controls. **[Windows PASS, run 45017867649](https://github.com/FlareZ123/liber-primus/actions/runs/45017867649)**, 22 November 2026.
