# Floral 16×203 black tape: fixed eight-of-sixteen GF29 share receiver

**23 November 2026, Agent39. Classification: bounded original-source negative with a genuinely held-out equality prediction; no plaintext, key, or decipherment.** This tests a source-shaped threshold-sharing alternative to the existing 16×16 Hill and per-column substitution studies. It does not assert that Cicada ever instructed solvers to apply Shamir secret sharing to these pages.

## Observed source register and rival interpretation

The unchanged sixteen consecutive flower-framed physical pages **p40–55** have **3,316** runes, including **68** original red runes (p40 initial8, p53 terminal51, p54 initial9). Excluding only those red spans yields **3,248** original GP29 symbols, exactly **16×203**. The original p49 numeric panel starts with two printed two-character numbers **3N** and **3p**. In the previously documented conventional radix60 reading, **3N=203**; the table is physically **32×8**. All of these measurements predate this test. See [physical geometry and rival radix](lp2-floral16-3299-source-geometry-gate.md) and [first-cell 203 reading](lp2-floral-first3n-203-grid16-hill-original-gate.md).

One *hypothetical* human-computable secret-sharing receiver treats the complete 3,248 black-rune string as **sixteen consecutive shares of 203 symbols** over the field **GF(29)**. The panel's visible eight columns nominate a fixed **8-of-16 threshold**, with interpolation coordinates x=1,…,16 in original row order and the first eight rows chosen as the complete input. Such a receiver makes a decisive prediction: a degree≤7 polynomial through the first eight rows at each of 203 positions must also agree with **all eight later original rows** if they were redundant shares of one source secret. It simultaneously yields a 203-rune potential secret f(0).

There are two serious competing explanations. The source provides no typed instruction to split continuous black text into equal 203-rune shares, to choose this field or threshold, or to use x=1,…,16. In fact **none** of fourteen internal original physical page seams agrees with a derived 203-rune row cut, so this representation is visibly less immediate than the sixteen printed page objects. The eight-column choice is circumstantial. Earlier independent work already excluded ordinary stationary per-column substitution against source-native English, so this is a *different* falsifiable operation, not a rescue of that model.

## Frozen result on original cipher and independent positive

For each column j, fix the unique degree≤7 polynomial F_j over GF(29) through the original first-eight points (x,C[x,j]) for x=1,…,8. Predict held-out C[x,j] at x=9,…,16, with no exceptions, column selection, page-dependent changes, hidden alphabet or fitted key. This produces **8×203=1,624** exact original-symbol predictions.

| Receiver | Matches in untouched second eight shares | Interpolated 203-symbol secret IoC |
| --- | ---: | ---: |
| **Original unmodified p40–55 black tape** | **57 / 1,624** | **0.0328244647124811** |
| Synthetic original-length control, 203 native p57 GP symbols planted as f(0) and seven predetermined coefficients | **1,624 / 1,624** | Restores all 203 native planted symbols |

The original individual held-row match counts are **[6,8,9,4,7,9,8,6]**, essentially the null expectation of **1,624/29=56** symbols. The synthetic positive uses the actual 95-runic solved LP2 p57 source, recycled to fill exactly 203 message positions, plus deterministic independent seven polynomial coefficients per column; its encoder gives sixteen 203-rune shares, and the same untouched interpolation recovers the original secret and every held-out share. A one-place altered synthetic share would fail its exact predicted equality, confirming a non-tautological receiver.

The unmodified original interpolated f(0) begins, in GP transliteration, **S TH L E G W EO T T D S C H W A S R C B W B A D AE N F N EA EO EA P EA EA ...** and has near-uniform IoC, with no coherent native GP29 plaintext. Exact first-eight interpolation alone always yields an output and therefore cannot authenticate a cryptosystem; the **1,567 held-out mismatches** are the actual discriminating obstruction.

## Decision and limits

The exact proposed **GF29 8-of-16 contiguous 203-symbol sharing format** is rejected by the untouched original continuation. This is independent of prior full-register additive/Hill receivers and of secret stationary per-column equality gates. It does **not** exclude nonuniform shares from actual printed page lengths, hidden share x-coordinates, unrelated shares, a 16-of-16 format with no redundancy, another value-changing code, or a truly author-specified alternate representation. None of those successors gains support from this negative; arbitrary retuning to force 1,624 equalities is unjustified. **No new unknown plaintext, authentic LP2 key, or intended continuation was recovered.**

[Read-only CJS original-source SFT](../sims/lp2_floral16_203_shamir8_source_gate_sft.cjs) loads the checked-in canonical original corpus and ink spans, freezes all coordinates, asserts the eight original mismatch vectors and all 203 native planted recoveries. **Windows Node.js 22 PASS**: [manual original-input run 45242338488](https://github.com/FlareZ123/liber-primus/actions/runs/45242338488). Future attention on this register should require an independent original-page instruction that chooses a reversible multi-rune value-changing operation before further key/threshold variation.
