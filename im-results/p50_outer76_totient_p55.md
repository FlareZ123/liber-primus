# Exact original p50 perimeter-totient transfer to physical p55

**Agent49, 12 November 2026. Classification: complete original-cipher decoder negative, no unknown plaintext/key.**

## Clue-to-operation path

The original p49–51 grid prints **32×8=256** numerical cells. Its rectangular boundary has **76 cells**, matching the complete original **76 GP29 runes** of physical p55 (including the carry from p54). The following solved p57 PARABLE says **“shed our own circumferences”**, while the intervening solved p56 cipher subtracts **Euler totients of primes** modulo29. A natural human hypothesis is to read the original numerical table's 76 perimeter values clockwise from top-left, take their Euler totients as the additive key, and subtract them from p55's rune indices in source order.

This would specify a complete, reversible 76-symbol decoder with no guessed GP alphabet or key, conditional on the table's conventional base60 reading. The cross-page transfer and clockwise start are independently unverified interpretations.

## Exact source-zero obstruction

The original clockwise perimeter includes **byte zero** at row-major grid cell **192**, boundary position **52** (zero-based). The corresponding p55 rune is literal **X**. Euler's totient **φ(0) is undefined**. Thus the literal 76-symbol decoder cannot operate on every original source position without an additional creator-specified convention. Any perimeter traversal still encounters that zero.

For a bounded full-length numerical test, explicitly introduce the **nonstandard** extension φ(0)=0, leaving the p55 X passthrough. At all other positions apply `P_i = (C_i - φ(grid[ring_i])) mod 29`. Its complete original-source output is:

```text
IA NGIAHIA RI ITH BLTHTEAOE OETCOEMF GS AEXHIGPCXAEAEYSH NGNLGUI TJNGN OEA AEGOAXFC EOSHEIATHO BL LNGIAYOR GHF AEAA
```

The original p55 IoC is **0.0378947368421**; the extended decoder's IoC is **0.0333333333333**, with no coherent GP-native prose. Exact reencryption recovers all **76/76** original ciphertext symbols. A separately encoded solved-p57 GP-native control decrypts **76/76** correctly. These checks validate program correctness, without authenticating the conjectured operation.

## Decision and reproduction

**Retire this exact clockwise perimeter-totient hypothesis.** Literal Euler totient has an undefined original input; the explicitly stated zero-passthrough convention is reversible and produces only nonlinguistic text. Earlier plain perimeter-byte and predecessor-differential p55 variants were different source operations, and their negative evidence does not substitute for this bounded test. A different zero exception, phase, direction or encoding needs an independently visible author instruction before another run. No unknown LP2 plaintext, key or destination has been recovered.

[Single-file CommonJS original-source SFT](../sims/p50_outer76_totient_p55_sft.cjs) asserts the original table, complete boundary geometry, source zero and p55 X location, precise output and two 76-rune roundtrips. It executed successfully against the exact committed repository corpus.
