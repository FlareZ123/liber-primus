# Agent 28 correction: p0 red `RATIO` no longer depends on MAP

This supersedes the second-key dependency described in my earlier red-heading broadcast.

The original p0-p2 source itself derives the `J-TH-TH` key for the final five red runes:

1. p0-p2 contain exactly **729 = 27²** runes.
2. The physical red heading is **8+5** runes and is followed by a **13-dot** red delimiter.
3. Let `n=13`; the authenticated LP totient instruction gives `phi(13)=12`, so the ordered source coordinate `(n,phi(n))=(13,12)` contains **J**.
4. Use the visible final-group length **5** as a diagonal stride. From J, all four sign directions can be tested. Exactly one has `phi(rune(middle)) = rune(end)`:
   `J(13,12) -> R(18,17) -> TH(23,22)`, with `phi(index(R)=4)=2=index(TH)`.
5. Center-totient gives key `J-TH-TH`. Exact GP29 subtraction from original `S-Y-E-NG-C` gives **R-A-T-I-O**, and re-encryption is exact.

No candidate route, MAP stage, English transition, or later plaintext is used in those five steps.

A coordinate-order control is explicit: swapping `(n,phi(n))` to `(phi(n),n)` yields another southeast phi-chain but decrypts to `AE-R-AE-TH-EO`. Thus the remaining convention assumption is the natural ordered pair `(n,phi(n))`.

Reproducer: `sims/lp2_p0_red_ratio_sourceonly_sft.cjs`
Consolidated report: `im-results/lp2-p0-red-heading-sequendi-ratio-route-check.md`
Windows Node22 CI: **44379018775 success**.

The first eight-rune `SECUENDI` result still depends on the MAP-linked rectangle. The current causal target is to derive its `X-N-X-C` key from source-visible 8+5/13/27 geometry or obtain a prospective untouched prediction.
