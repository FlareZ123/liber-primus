# A fixed plaintext symbol as predecessor-repeat escape: original LP2 gate

**Research decision (Agent3, 16 November 2026):** A simple reversible cipher family that could explain the scarcity of adjacent identical ciphertext runes is strongly disfavored under independently source-calibrated GP29 English. No unknown LP2 plaintext, creator key, or historical cipher was recovered.

## Source motivation and necessary condition

Original unknown physical LP2 pages p0–55 have exactly **12,956 ciphertext runes across 2,896 printed whole words**, and only **86 identical adjacent-rune pairs**: 23 at printed word entries and 63 within words. Their nonzero mod29 predecessor differences are approximately uniform, making a deliberate suppression of zero differences one possible explanation.

The explicit candidate is a globally fixed single-symbol zero-step escape. For one unknown plaintext rune S, set step(S)=0. Map the remaining 28 plaintext runes bijectively onto 28 nonzero GP29 steps, under any 28-way secret key. Encrypt with C_i=(C_(i−1)+step(P_i)) mod29. This has a genuine inverse, but also an **all-secret necessary invariant**: a repeated ciphertext rune is equivalent to plaintext S at the same position, regardless of the unknown nonzero key assignment.

This is a proposed family. It is distinct from the historically authentic solved p56 plaintext-F passthrough, which emits literal F and does not consume its prime key. Nothing original yet selects the new rule as intended.

## Exact whole-word test

The [SFT](../sims/lp2_fixed_selfloop_symbol_original_gate.cjs) reconstructs the complete corpus directly from the original-layout runes and independently asserts exact equality with the 12,956 canonical indices. It joins printed words across line/page breaks. For each word, a bitmask records every ciphertext repeat against the immediately preceding glyph; the mask must equal exactly the placements of a **single fixed plaintext letter S** in that word.

Independent source-English lexicon: the fixed public 29,088-entry length≤14 part of the TextBlob word-frequency list, encoded by the validated LP1/p57 GP convention (QU→CW, V→U, K/Q→C, Z→S, ING/NG→one rune, IO→one rune). Each original word mask must appear as a source-native English word of **exactly the original word's GP length and fixed-symbol positions**. No key enumeration is needed.

**Original result:** 21/29 candidates have at least one impossible printed word under that exact lexicon. The eight lexical survivors are **C, N, S, T, E, L, D, A**. Every survivor is an extremely common English rune, with length-conditioned expected counts far exceeding the observed 86 marker positions.

| Candidate plaintext S | Original word masks absent from reference lexicon | Expected occurrences under exact length-matched weighted English | Z from observed 86 |
| --- | ---: | ---: | ---: |
| C | 0 | 499.65 | −19.74 |
| L | 0 | 557.75 | −19.80 |
| D | 0 | 621.11 | −23.05 |
| T | 0 | 815.44 | −28.56 |
| N | 0 | 884.77 | −30.95 |
| S | 0 | 920.88 | −29.60 |
| A | 0 | 1067.78 | −35.37 |
| E | 0 | 1565.03 | −44.30 |
| EA | 5 | 81.92 | +0.46 |
| IA (solved IO) | 7 | 65.32 | +2.71 |
| NG (solved ING/NG) | 10 | 125.48 | −3.60 |

The seemingly plausible rare rune EA fails five original word-shape constraints. One independent source-observed example is original p27 word index1476, page-local rune offset79, a 12-rune word with repeats at its zero-based positions5 and11. The exact source word is **ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ**. No length12 GP English entry in the fixed reference lexicon has exactly those two EA positions and no other EA. The same word forces a contradiction for several other rare candidates. Rare symbols needing less than 86 placements also fail source-location invariants elsewhere.

The frequency calculation weights the reference word-count frequencies **within each original printed word length**, so it does not mistake LP2's unusual word-length composition for a cryptographic signal. In 500 deterministic independent length-matched word-book controls, every one of the eight lexical survivors occurred **over 400 times** in every control. This finite observation is a calibration, not a discovery-corrected p-value. The 29,088-word lexicon does not represent all historical English, poetry, codebooks, Latin, or intentional misspellings.

## Exact reproduction and result interpretation

The [standalone Windows Node22 SFT](../sims/lp2_fixed_selfloop_symbol_original_gate.cjs) includes 29 synthetic source-native positively invertible cipher plants, one for each possible escape rune, using a secret-like bijection for the other 28 steps. All plants and all original-word assertions passed in [manual Windows CI run 43818792802](https://github.com/FlareZ123/liber-primus/actions/runs/43818792802).

**Decision:** Retire globally fixed plaintext-symbol→zero-predecessor-step as a plausible direct original LP2 English cipher explanation. No choice of the other 28 secret steps alters its observed 86-bit escape placement mask. The gate does not exclude varying escape symbols, unusual plaintext, changing states, resets, or different anti-repeat mechanisms. Advancing such a rival requires an independently original-sourced control rule or a genuine recovered plaintext segment, rather than additional unfixed permutations.