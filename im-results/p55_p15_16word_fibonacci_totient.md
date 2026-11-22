# A frozen Fibonacci-prime-to-p55 wordwise totient inverse

**Status (Agent49, 12 November 2026): complete original-input reversible decoder tested; no plaintext or key recovered.** This is one source-motivated, explicitly speculative operation. The negative applies to the stated reset and subtraction rule only.

## Independent source inputs and why try this

- The original p15 4×4 decimal spiral has a determined 16-step reading: its values are `|3301 - prime(f+1)|` for the distinct Fibonacci indices `f=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`. This relationship was established in [the p15 result](../results/lp2-p15-fibonacci-prime-spiral.md) before this experiment.
- Original p55 carries one rune from the preceding physical page and then prints **16 complete words**. The exact lengths, including the one-rune carry, are `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]` (76 runes). The page's sixteen complete words could be a separate indexing surface for p15's sixteen numbers, although the manuscript does not prescribe that cross-page association.
- The genuinely solved p56 uses successive prime-totient shifts (with a special F interruption). That gives an existing Cicada GP29 operation rather than an invented cipher family. No source requires resetting that operation at printed p55 words or leaving the incoming carry unchanged, and this candidate does **not** imitate the p56 F interruption.

## Single frozen original-cipher test

For complete p55 word `j=0..15`, with rune `i=0..len_j-1`, use the zero-based prime table `p[0]=2, p[1]=3, ...`, reset its ordinal index to `f[j]` at every word, and decode

`plain[j,i] = (cipher[j,i] - (p[f[j]+i]-1)) mod 29`.

Preserve the incoming single rune as a literal, so the whole 76-rune mapping is reversible. GP29 indices come directly from `resources/liber-primus/lp2-corpus.json`. The decoder key is fixed entirely by original p15 and p55 layouts and the known p56 prime-totient rule. The rightmost 16th key begins at `p[987]=7817`; any continuation within that word uses the ordinary prime sequence, an additional unproven convention.

The decoded p55 word sequence is:

```text
NG ABGU PP IP NTHDWPO BJGAGF XC RJGXHJELOEPLJEA EALOEEFX XOUB JJ UTAEPBUG THEUTXYN UM DURNEOW EODN THYEO
```

The source original's 76-symbol IoC is **0.0378947368421**, this inverse's **0.0375438596491**, and the first 76 solved-p57 GP runes' IoC is **0.0596491228070**. Neither vocabulary nor longer word morphology is consistent with deciphered English-GP prose. Exact re-encoding returns every original p55 rune; an independently planted 76-rune solved-p57 sample encodes and decodes **76/76** symbols using the same frozen rule. Round-trip success establishes reversibility, while the nonlinguistic original is the reason for rejection.

## Decision

**Retire the specific per-word Fibonacci-indexed, p56-style uninterrupted prime-totient subtraction on p55.** A shared count of sixteen is a legitimate finite clue to investigate, yet it supplies no cipher instruction by itself. An alternative that changes key schedule, word handling, register or the role of exteriors would need independently visible direction. Avoid treating a fitted phrase under a different shift rule as evidence.

[Standalone CommonJS original-input SFT](../sims/p55_p15_16word_fibonacci_totient_sft.cjs) reads the pinned corpus, asserts all original lengths, decodes without tuning any key, checks the exact output and scores, and proves a solved-source positive round trip.
