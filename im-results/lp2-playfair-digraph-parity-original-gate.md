# Source-native fixed-digraph Playfair exclusion at original repeated-runic sites

**Agent14, 15 November 2026. Result: exact key-independent incompatibility for the standard fixed two-rune output-pair architecture.** No LP2 unknown plaintext, cipher key, intended decoding operation or Cicada destination recovered. Original physical LP2 pp0–55 contain **12,956 GP29 ciphertext runes** and **86 same-rune adjacent transitions**. Fourteen original pages place same-rune transitions at both possible second-rune parities; one *literal printed line* does too. This contradicts every fixed-boundary Playfair 5×6 encoder, whatever the 30-cell keyed alphabet, page/line initialization, cipher direction or source-language text.

## Source question and exact all-key invariant

A human solving a 2014 puzzle might try a familiar classical digraph cipher, such as **Playfair**, particularly given the deliberate scarcity of consecutive equal runes and the 29-symbol GP alphabet. A 5×6 rectangle has room for the 29 distinct GP runes plus one conventional filler cell. This is an exploratory historic-period possibility; **the manuscript and signed messages do not explicitly tell a solver to use Playfair or fix a square**. The strongest competing explanation is a more general stateful or variable-width system with an independent escape/insert clock.

For *any* keyed 5×6 table with unique symbols, standard Playfair takes two **distinct** plaintext-cell symbols `(a,b)` at a time, having inserted a filler if the plaintext would otherwise present a duplicate pair. The same-row rule shifts both one step, the same-column rule shifts both one step, and the rectangle rule exchanges the two columns. In every branch the emitted ciphertext pair `(u,v)` satisfies **`u != v`**. The proof needs neither a guess at any of the `30!` keyed boards nor statistics about English. Reversing row/column shifts and changing the board have exactly the same invariant.

For a ciphertext stream with a frozen binary pair clock, let the start offset be `r ∈ {0,1}`. All pairs `(C[r+2k],C[r+2k+1])` must have unequal output symbols. Thus every occurrence of `C[i-1] == C[i]` must be on **one** of the two possible *pair-boundary* parities; repeat events with both parities in a single clock unit make this architecture impossible. This necessary condition extends to any keyed digraph transform that always emits two distinct symbols and never changes the pair phase within its declared reset scope. It does **not** apply to ordinary Caesar/Vigenère, variable-length encoders, intra-line framing/resets, transparent passthrough markers or ciphers whose encrypted digraphs can contain two identical symbols.

## Direct original-page contradiction

The unchanged canonical LP2 source has **86** adjacent-equal second-rune sites among 12,901 same-page successors: **51 at even zero-based second-rune offsets and 35 at odd offsets**. Forty-two of 55 rune-bearing pages contain one or more such sites. Fourteen pages contain **both** parities independently within that same physical page:

`p0, p3, p4, p8, p9, p19, p24, p25, p27, p34, p35, p41, p43, p44`.

One short decisive witness is original p0: repeat-pair second-rune offsets **122** and **207**, one even and one odd. Every single fixed Playfair pair phase is contradicted by one of those two sites on p0 alone. This holds whether the book uses one global pair clock or restarts at physical pages, and holds under a different secret keyed table on every page.

## Even printed-line resets cannot rescue the literal architecture

A more permissive historic proposal could restart Playfair every printed line, resetting the pair phase and even the keyed board between lines. The original-JPEG registered [allograph site inventory](lp2-doublet-allograph-crops.csv) documents all **86** repeated pairs, including the 82 whose two runes are on a single printed line. They occupy **79** different printed lines. Only **one** of those lines contains repeated pairs whose **second** rune positions disagree in line-relative parity.

That one original is **physical LP2 p24**, archive **41.jpg**, printed line number **3** (zero-based line index2). Its literal source text is:

`ᛡ-ᛈᚣᚢ-ᛉᚷᚷ-ᚹᛞᛁᛋ-ᚦᛡᛡᛈᚳᚪᚩ-ᚢᛗᚢ/`

The runes `ᚷᚷ` and `ᛡᛡ` have second-rune printed line columns **6** and **13** (zero-based), respectively. They occur *inside the same source-printed line*, as ordinary black glyphs, away from the line's ends. The original first-rune page offsets are **51** and **58**, and second-rune page offsets are **52** and **59**. Choosing the pair phase to place one repeat across an output-pair boundary places the other *inside* a Playfair output pair. No keyed board can repair the invariant; a deliberate pair-clock interruption or variable-width escape rule would have to be separately sourced.

The independently source-positioned pairs each have identical black ink color and source-native same-glyph black-pixel Jaccard about **0.940**. The prior comprehensive [glyph/allograph audit](lp2-adjacent-doublet-allograph-audit.md) found no separate glyph alphabet. This control prevents the easy claim that the two p24 events represent an untranscribed distinct rune.

## Original-cipher and authentic solved-register reproducibility

The single [CommonJS original-source SFT](../sims/lp2_playfair_digraph_parity_original_sft.cjs) reads these three already preserved inputs directly:

- [canonical GP29 source page indices](../resources/liber-primus/lp2-corpus.json), asserting 55 rune-bearing original pages and exactly 12,956 runes;
- [literal original runic transcription](../resources/liber-primus/lp2-transcription.txt), locating p24's 21-rune physical line and both ordinary duplicate pairs at printed columns6 and13;
- [independently source-registered 86-pair crops](lp2-doublet-allograph-crops.csv), asserting every original page-local pair index and the printed-line geometry.

For a nontrivial *positive* control, the same program converts all **95 authentic, already-solved original p57 GP29 runes** into valid Playfair input pairs with the conventional single filler cell in a 5×6 grid. The padded stream contains **96 symbols**. Actual encrypt→decrypt runs over all pairs with a demonstrably invertible keyed board shape, verifies **every** output pair differs and reconstructs **96/96** padded input symbols exactly. This is a synthetic Playfair wrapping of real solved GP text, not an original Cicada ciphertext decryption or a historical-grid claim.

[Original-repository Node22 GitHub Actions run 43680523362](https://github.com/FlareZ123/liber-primus/actions/runs/43680523362) **passed** `node --check`, all original ciphertext assertions, the literal printed-line witness, and the complete solved-p57 Playfair plant. The direct original result is deterministic; there is no seed, secret-grid fit, English scorer, artificial rune modification, empirical null or possible multiple-testing interpretation.

## Decision and remaining route

**Exclude a fixed-pair Playfair-style direct cipher with ordinary identical-pair handling under a continuous book, physical-page, or independently printed-line pair clock, irrespective of secret alphabet, filler glyph and key.** In particular, reassigning Playfair table cells, rotation, row-column dimensions or decryption direction cannot change the no-identical-output-pair invariant. The source supports no authored clock-reset instruction inside p24's witness line and no independent method of conveying hidden insertion/skip positions. Such extensions are distinct, untested ciphers and require their own source-selected operation and information-preserving inverse.

This result is an exclusion of one simple classic human-solve-path architecture. It must **not** be mistaken for an explanation of the 86 repeat events, or a general exclusion of other digraph/fractionation ciphers. It adds no plaintext or key to the unresolved LP2 material. A productive successor needs a period-authentic clue that chooses a mechanism with a genuinely variable pair phase or other reversible GP29 transform, and which predicts a coherent original unknown-page plaintext interval without fitting it.
