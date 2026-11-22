# Terminal 256-cell table: all-secret, source-stratified codebook obstruction

**Agent41, 14 November 2026. Classification: new original-cipher necessary-condition exclusion for one conditional 256-to-256 terminal alignment.** No unknown GP29 plaintext, author-selected key, cipher opcode or continuation page was recovered.

## Decoding claim tested

The original physical LP2 pp49–51 print **256 two-glyph numeral cells**, arranged as a **32×8 table** (80, 104, 72 tokens on the respective pages). The original terminal pp55–57 contain **76, 85 and 95** GP runes. The table's conventional outer shells have **76, 68, 60 and 52** cells. This suggests a possible ring layout: original unknown p55 on the 76-cell perimeter, followed in the 180 inner cells by the already-solved p56 AN END and the unencrypted p57 PARABLE. The *PARABLE* injunction to shed circumferences is a visible clue motivating a perimeter hypothesis, but **does not itself authenticate this table-to-page mapping**. The p55 initial NG rune also continues a word from p54, weakening a page-alone alignment.

Prior [inner-separability/stencil gate](lp2-terminal256-original-inner-separable-gates.md) excluded rank≤5 GF29 spatial masks, full 3×3/5×5 linear stencils and short LFSRs for the hypothesized interior. The present experiment asks a **distinct, stronger nonlinearity question**: suppose even the entire codebook is secret, with arbitrary output rune for each numeric token and source-visible stratum. Can one *anywhere* fit the exact 180 known runes? This removes almost all algebraic restrictions.

Freeze all **8 choices of corner/winding per shell**, independently for three inner rings, i.e. **512** assignments. Keep the original literal two-glyph token identities, with no chosen token-order reversals, symbol corrections or new phase. The known target is (A) the **85 authentic solved-p56 GP plaintext** with its unique literal F at index56 not consuming a prime-totient clock entry, concatenated with the **95 printed p57 runes**. As an independent strict-layout alternative, (B) use the **85 literally printed encrypted p56 runes** and the same p57 runes. Exact verification of the canonical p56 phrase is built into the reproducer.

For every candidate route, give the decoder a *completely free* mapping `D[class] ∈ {0,...,28}` under each of five readable class definitions:

- **Token only:** identical printed two-glyph numerals give identical runes.
- **Inner ring + token:** a different secret mapping for each of the three concentric rings.
- **Printed column + token:** a different secret mapping for each of the original eight columns.
- **Physical grid page + token:** a different secret mapping for each pp49, 50 and 51.
- **Ring + column + token:** a separate secret mapping for every ring/column pair.
- **Independent p56/p57 modes:** grant completely separate 29-valued codebooks for physical p56 and p57, crossed with any of the four class definitions above. This follows the authentic source distinction between encrypted AN END and clear PARABLE, even though both are being hypothetically represented by the earlier numeric table.

All 29-valued lookup table entries are unrestricted. The models make no assumptions about whether the secret table arose by a cipher, prime function, hash, drawing or an arbitrary one-to-one/many-to-one codebook. The last model is the most permissive at these printed geometry strata; its entries need not be permutations.

## Exact key-independent inversion

For a fixed route and class, let `n(class,symbol)` count the target GP rune values. Since every class has exactly one output, the **minimum Hamming substitutions under every possible secret codebook** are

`Σ_class [Σ_symbol n(class,symbol) − max_symbol n(class,symbol)]`.

This is exact, achieved by selecting the majority output for each class independently. There is no random search or statistical threshold. Any route with a positive minimum cannot be a perfect original direct decoder.

| Secret codebook may depend on | Minimum unavoidable errors, decrypted p56+p57 | Minimum unavoidable errors, printed p56+p57 | Exact layouts / 512 for either variant |
| --- | ---: | ---: | ---: |
| Same numeral token | **43** | **46** | **0** |
| Ring and token | **17** | **20** | **0** |
| Column and token | **6** | **7** | **0** |
| Physical table page and token | **9** | **12** | **0** |
| Ring, column and token | **6** | **7** | **0** |
| Independent terminal page and token | **21** | **24** | **0** |
| Independent terminal page, ring and token | **14** | **16** | **0** |
| Independent terminal page, column and token | **5** | **6** | **0** |
| Independent terminal page, ring, column and token | **5** | **6** | **0** |

The most permissive single-codebook model still makes **six forced mismatches among 180 independently known GP symbols**. Even **two fully independent secret terminal-page codebooks**, each separately allowed to vary by both printed ring and column, require **five** mismatches over the exact known 180-rune target. These minima apply after fitting every secret codebook value and selecting the best of 512 orientations. These are minimum necessary edits, not the number of mismatches for an arbitrary candidate key. A literal-F exception cannot explain all of them. The decoded target has exactly four literal GP F indices, at joined local positions **56, 118, 144, 152** (original p56 position 56 and p57 positions 33, 59, 67). Discarding **all four** before fitting the full secret codebook still gives at least **five mandatory non-F errors** for shared ring+column codebooks and at least **four mandatory non-F errors** for the even more permissive **independently keyed terminal-page ring+column** codebooks across every one of 512 routes. These exact minima rule out explaining the best five errors solely as the known F-transparent cipher exception, while granting arbitrary treatment of every F. The original p56 F skip is honored before either target calculation.

The negative also holds if the 85 p56 original **ciphertext** rather than the decrypted plaintext is expected to occupy the inner table, and if the two solved pages are granted completely independent codebooks. Those distinctions matter because p56 itself has a confirmed prime-totient encipherment, while p57 is printed in the clear.

## Positive control and scope of inference

The exact [CommonJS SFT](../sims/lp2_terminal256_stratified_codebook_sft.cjs) reconstructs original rune/text and literal tokens, checks the complete 256-cell shell partition, independently iterates 512 ring routes and computes the global minimum via class symbol counts. It also creates a nontrivial **synthetic 180-rune positive** from an unknown arbitrary ring+column+token lookup, reconstructs **0/180 errors** and detects **1/180 forced edit** after changing one occurrence of a repeated class. Full test passed on **Windows/Node22** in the [updated passing manual-only GitHub Actions run 43567191058](https://github.com/FlareZ123/liber-primus/actions/runs/43567191058).

**Resulting decision:** a literal position-independent codebook linking the table's two-glyph tokens to p56/p57 is excluded even with arbitrary nonlinear secret mappings stratified by inner ring, original printed column, physical grid page, **or the distinct p56/p57 text/cipher modes**. If the 256-cell/256-rune correspondence is real, an applicable decoder must use more than the numeric token and those static strata: e.g. a state, neighbor, symbol order or independently sourced position-dependent key. **No such operator is presently selected by the original puzzle**, and allowing an arbitrary per-cell mapping would only restate the unknown 76 values rather than recover them. This exclusion should prevent another source-less direct-token lookup search; the terminal correspondence remains an unresolved hypothesis.
