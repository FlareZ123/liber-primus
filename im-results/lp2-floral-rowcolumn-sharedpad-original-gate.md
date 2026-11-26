# Floral-template printed row/column shared-pad inverse (Agent 7)

**26 November 2026 — scoped negative, no unknown plaintext/key.** The repeated botanical border across LP2 p40–55 is real artwork. This receiver uses its natural full-page text layout: physical p41–48 are consecutive twelve-line black-prose-layout pages before the numeric panel, and p52 is the first complete twelve-line page after it. The test differs from a shared linear page offset and a common line-reset pad by assigning a private key to every pair of printed line ordinal and rune ordinal within that line.

## Fixed inverse and prospective prediction within this receiver

The original transcription is parsed into physical rune-bearing lines and checked against all 55 unknown canonical page tapes, exactly 594 lines. Select p41–48 as fit pages and p52 as held receiver (all 263 runes). Each page has 12 lines, and the longest selected line is 26 runes. No punctuation-based shifts, fitted coordinate offsets, red headings, numeric cells or F-hold clock are introduced. For every row r and column j, posit `C[p,r,j] = P[p,r,j] + K[r,j] mod29`, with one arbitrary independent GP29 key symbol per coordinate. The repeated art motivates sharing; it does not authenticate this equation or the ordinal grid.

Use a Shakespeare-trained native GP29 trigram prior with .5 unigram smoothing and backoff masses 16/32, ignoring printed word boundaries. Marginalize separately at every row over all key sequences, with 841 last-two-key states, and independently maximize the joint language likelihood on the eight fit pages. Rows start under the unigram prior, so no cross-line linguistic transition is fitted. The exact conditional predictive log BF of p52 against independent uniform pad is log BF of the joint nine-page data minus log BF of the eight-page fit data. Decode p52 with the fit-only MAP key; all 263 coordinates are covered. Re-encrypt every decoded symbol exactly, an implementation check, not key identification.

Four held literary plants use two fixed contiguous nonoverlapping donor windows each from Gibran and Emerson, segmented into the exact original nine page/line lengths. Each plant has a fresh random grid. The independent-pad controls give each page its own grid. The language model uses neither donor nor original ciphertext.

| Case | Eight-page fit ln BF | p52 conditional ln BF | Held nats/rune | Held rune accuracy |
|---|---:|---:|---:|---:|
| Gibran shared 0 | 1468.659 | 247.563 | +0.9413 | 100.0% |
| Gibran shared 1 | 1318.499 | 259.289 | +0.9859 | 99.62% |
| Emerson shared 0 | 1000.311 | 251.264 | +0.9554 | 99.24% |
| Emerson shared 1 | 883.597 | 215.375 | +0.8189 | 99.24% |
| Independent-pad plants, range | −1175.955…−1077.435 | −356.350…−283.093 | −1.3549…−1.0764 | 2.28–4.18% |
| Original | −1092.429 | −330.180 | −1.2554 | unknown; incoherent |

Original p52 begins `DOEECFUEMWFEALDTHEARGESMHEO` under the frozen fit key. Its complete output is incoherent. The conditional likelihood is negative and inside the four independent-pad controls; the positive controls recover virtually all held runes.

**Decision:** retire this additive ordinary-consuming floral ordinal-grid common-pad receiver. The printed layout does not identify the key. This is distinct from the prior [all-page linear-position gate](lp2-page-position-shared-bijection-original-55page-gate.md) and [line-only reset](lp2-shared-line-reset-additive-pad-heldout-gate.md); neither arbitrary pixel-coordinate mappings nor different clocks are excluded. The holdout is receiver-specific; p52 has already been examined by the broader project. Do not fit new alignments on this negative.

[Standalone CommonJS SFT](../sims/agent7-floral-rowcolumn-sharedpad.cjs) · [Full raw results, layouts and input blob SHAs](agent7-floral-rowcolumn-sharedpad.json). Exact core executed in connected V8 on canonical repository inputs; standalone Node/Windows CI not run. No authoritative solution frontier change.
