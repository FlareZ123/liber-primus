# Bounded test of the p29-G / p50-F 23-symbol length bridge

**Status:** negative for direct alignment and a repeated 23-symbol additive key. The length relation is exploratory, not an established selector.

## Premise

The source-derived p39 red-triad polynomial G=[15,5,27] divides the 277-rune p29 GP29 sequence exactly, producing a 275-symbol quotient (remainder [0,0]). The source-derived p50 product polynomial F=H·G=[12,17,11,21,23] divides the 256-byte p50 table modulo 29 exactly, producing a 252-symbol causal quotient (remainder [0,0,0,0]). The quotient lengths differ by exactly 23, matching the modulus in the authenticated 2013 DH 23 example.

This suggested one narrow hypothesis: the extra 23 p29 quotient symbols might select a key or prefix/suffix alignment for the 252-symbol p50 quotient. The weakest premise is substantial: p29 was selected by a unique divisibility observation after scanning pages; the p50 quotient is only one causal quotient, not a source-selected systematic frame; and the 2013 DH modulus does not itself prescribe a 23-rune key.

## Frozen tests

All divisions use high-degree-first coefficients and leading-coefficient-normalized polynomial long division over GF(29). No page offsets or arbitrary alignments were searched.

1. Compare the first 252 p29 quotient symbols with the p50 quotient.
2. Compare the last 252 p29 quotient symbols (drop exactly 23 leading symbols) with the p50 quotient.
3. For each of the two 23-symbol p29 prefix/suffix candidates, repeat it as an additive GP29 key across the p50 quotient, testing both signs.

## Results

| Source object | Input length | Divisor | Quotient length | Remainder | Quotient IoC |
|---|---:|---|---:|---|---:|
| p29 GP29 page | 277 | G=[15,5,27] | 275 | [0,0] | 0.034054413 |
| p50 byte table mod 29 | 256 | F=[12,17,11,21,23] | 252 | [0,0,0,0] | 0.036330867 |

| Alignment | Exact symbol matches | Best constant additive shift | Matches after best shift | Difference-sequence IoC |
|---|---:|---:|---:|---:|
| p29 quotient prefix 252 vs p50 quotient | 7/252 | +11 | 15/252 | 0.036299247 |
| p29 quotient suffix 252 vs p50 quotient | 11/252 | +12 | 15/252 | 0.034402074 |

| 23-symbol key | Operation | Decoded GP29 IoC |
|---|---|---:|
| p29 quotient prefix 23 | subtract repeated key | 0.035097704 |
| p29 quotient prefix 23 | add repeated key | 0.034180737 |
| p29 quotient suffix 23 | subtract repeated key | 0.036046291 |
| p29 quotient suffix 23 | add repeated key | 0.037311073 |

None approaches a language-like IoC.

## Conclusion and limits

The exact 23-length difference is worth retaining as an observation, but **neither direct quotient alignment nor the simplest repeated 23-symbol additive-key interpretation produces plaintext**. This rejects only the two direct alignments and four Vigenere variants. It does not reject an independently source-selected nonlinear use of the quotients.

Do not extend this into a 23-key/offset/generator sweep. No source fixes prefix versus suffix, a repeated-key operation, or the p29 page as key material. A further task needs a new clue that selects the quotient frame and reversible operation independently of the length match.

## Reproduction

Run from the repository root:

    node sims/p29_g_p50_f_23_bridge_sft.cjs

The script reads resources/liber-primus/lp2-corpus.json and resources/liber-primus/base60-grid.json. It uses Node built-ins only and fixes all alignments and operations in advance.
