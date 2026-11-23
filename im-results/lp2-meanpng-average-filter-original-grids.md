# PNG Average unfilter on two original LP2 source grids and the byte panel

**23 November 2026 — Agent10; original-input result: three frozen receiver negatives, no recovered unknown plaintext or authenticated cipher.** Exact standalone [Node22 source SFT](../sims/lp2_meanpng_pngaverage_original_sft.cjs), [Windows PASS 45259538676](https://github.com/FlareZ123/liber-primus/actions/runs/45259538676). This note describes a specific, executable plaintext test, **not** a claimed author instruction. Do not promote its reversible roundtrip alone.

## Source clue, competing explanation and frozen operation

The original printed p49–51 fifth 32-byte table column, independently conditionally selected by the missing-L high-band tokens and by p0 red title dimensions, produces the compressed secp256k1 P2PKH address `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK`. See [source/key synthesis](lp2-p50-missing-l-secp256k1-address.md). Its `Meanpng` prefix could reference a known 2014-available, literal operation from the **PNG specification**: the per-row **Average** reconstruction filter, `recon(x) = filtered(x) + floor((left_recon + above_recon)/2) mod 256`, with missing left/up pixels treated as zero. Unlike an unconstrained blur or floating-point pixel mean, this is a *lossless, fixed, named, 2-D inverse*. For a GP29 rune square, use exactly the same integer predictor with modulus29. No password, model search, offset, changed rune, inferred plaintext space, image crop, post-hoc phase, or additional cipher layer is introduced.

**Strongest rival:** `Meanpng` was recognized *after* electing Bitcoin compressed P2PKH for one printed column and is not an authenticated first-party source opcode. The address may be a coincidence or a deliberately recognizable pointer to a different missing file or action. In particular, the PNG specification actually filters byte samples; its application to GP29 rune indices is an explicit analogy, not a historical claim.

The two source-visible rune grids and one literal byte grid were frozen before testing:

1. **Opening physical p0–p2**: the unmodified runes concatenate as 262+266+201=**729=27×27**. Read row-major and apply precisely the PNG Average unfilter under arithmetic modulo29. This retains all original 729 glyph positions, including the p0 red title; no manual retokenization.
2. **Floral physical p40–p55**: remove only original printed red spans from the sixteen physically framed pages, yielding exactly **3,248 black runes=16×203**; the first original p50 table token `3N` is 203 under the same working base60 convention. Use row-major 203 columns and the *same* Average reconstruction modulo29.
3. **Actual p49–51 table**: the unchanged numeric panel is **32 rows × 8 columns** of 256 source-convention base60 bytes. Here apply the standard literal eight-bit PNG Average unfilter, with arithmetic modulo256, not the rune adaptation.

For all three, the forward encoder `filtered = original - floor((left+above)/2)` exactly recreates the input from the decoded output. This proves the implementation is a bijection on these fixed grids, **not** that it is the author's encryption.

## Complete original outcomes

| Original source | Length | Input IoC | Average-unfiltered IoC | Result |
| --- | ---: | ---: | ---: | --- |
| p0–p2 27×27 GP29 | 729 runes | 0.0340825156 | **0.0343651547** | No native GP prose; full original 729/729 replay |
| p40–p55 16×203 GP29 | 3,248 black runes | 0.0344918614 | **0.0344239700** | No native GP prose; full original 3248/3248 replay |
| p49–51 32×8 literal byte panel | 256 bytes | — | — | 103 printable ASCII source bytes vs **87/256** after unfilter; no PNG/file signature or readable instruction at byte start |

A **stricter byte-format exclusion** needs no decryption or language scoring. The PNG format requires every uncompressed scanline to begin with a one-byte filter method in `{0,1,2,3,4}`. Of the 32 original 8-byte source rows, **31/32** have first bytes outside that permitted set; only zero-based row24 has first byte `00`. Therefore the printed panel is *not itself* a 32-row byte stream of standard PNG scanline records. Reinterpreting arbitrary offsets/row boundaries would be an unsupported new serialization, not rescue this direct test.

The rune decoder first outputs, spelled with the **actual canonical chart**:

- Opening first 16: `S S AE S P AE I C B C L TH G C P EO`.
- Floral first 16: `A AE Y I P E H W NG Y C U L L Y S`.
- Byte-panel output first sixteen bytes: `cb 4c cd 20 71 25 90 ff c1 7f 42 0f 37 32 18 5f`, not PNG's `89 50 4e 47` file signature.

For an independent true-GP control, the script filters the **original solved p57 95-rune sequence** with the same 27-column algorithm, then exactly recovers **95/95** source GP symbols; that native positive's IoC is **0.0627099664**, in sharp contrast to both unknown-section outputs. Source and synthetic inverse/forward reconstruction and output assertions all passed on [the committed Windows runner](https://github.com/FlareZ123/liber-primus/actions/runs/45259538676).

## Decision

The direct PNG **Average** interpretation does not recover the opening square or floral rectangle plaintext and does not reveal an immediately typed byte-panel payload. The test excludes these *specific* geometries/moduli/directions and uses the actual historical reconstruction formula, unlike the separately tested original p0 27×27 two-axis integral inverse. It does **not** exclude a different PNG format carrier, a further source-selected key layer, a different original rectangle, an authentic Bitcoin address, or a lost historical file.

**Next evidence required:** a first-party instruction selecting a particular PNG operand, scanline operation or accompanying key, or a new original-cipher inverse producing held-out original prose; tuning filter directions, page subsets or English scores without that input would not advance plaintext recovery.
