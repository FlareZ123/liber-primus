# Running GP-prime state through the authentic 256-byte grid: causal inverse

**Evidence:** finite exact original-cipher attack with source-native positive control. **No unknown LP2 plaintext, key or destination was recovered.** Successful execution: [GitHub Actions 42805437889](https://github.com/FlareZ123/liber-primus/actions/runs/42805437889), 10 November 2026.

## New causal candidate

The original LP2 cipher has 12,956 GP ciphertext runes, 55 rune-bearing pages, eight printed text sections and a 32×8 base-60 byte table on physical pages49–51. Each published ciphertext rune has a GP prime value. Define a **running source-prime accumulator q**, reset at one of four declared boundaries and updated *after* printing each cipher glyph:

    q[i+1] = (q[i] + GPprime(C[i])) mod 32
    K[i] = grid[(q[i] + phase) mod 32][column(i)]

The column is either the visible section index 0–7, or the uninterrupted glyph clock modulo8. The byte-to-rank key is K mod28 or floor(28K/256); phases run through all 32 values. Encode non-EA GP symbols using either cyclic or numeric sorted rank among the 28 output glyphs other than the preceding printed ciphertext glyph. Apply either sign to the key modulo28. GP EA (index28) is transparently encoded as a repeated printed glyph. The first glyph of each physical page is transported openly as its initial state.

This is a complete **causal, lossless 29-to-28-step transducer** in which previously published ciphertext primes select the next source-grid byte. Unlike static grid pads, the state evolves with the encrypted message. Its entire model is fixed by public source inputs and six finite choices, without freely fitted 29-symbol key rows.

Declare four reset policies (book, page, text section, word), two column clocks, two byte reductions, two signs, two 28-rank conventions and 32 rotations: **2,048 exact reversible models**. Select only on physical pages0–27 and freeze parameters for physical pages28–55. The statistic is 28-value GP-rune index of coincidence excluding page heads and EA repeats; uniform baseline 1/28=0.0357142857.

## Completed original and positive-control results

| Ciphertext | Training IoC | Unfitted heldout IoC |
| --- | ---: | ---: |
| Original LP2 winner: book reset, global rune clock, scaled28, negative, cyclic rank, phase22 | **0.0358606609** | **0.0357343723** |
| Original, retrospective maximum over heldout scores (invalid as discovery score) | 0.0357148735 | **0.0359706380** |
| Independently sourced Shakespeare-GP plant, actual secret key | **0.0626638947** | **0.0611375119** |

The planted model's true key had section reset, visible section column, mod28 key reduction, positive sign, cyclic rank, phase15. Source GP plaintext comprised exactly **12,956 known runes**, encrypted with the exact fully reversible mechanism. The 2,048-model scanner independently ranked the **exact planted key first** on training data, recovered **12,956/12,956 true plaintext runes**, and re-encrypted identically. The chosen original-cipher mode also re-encrypts the original glyphs exactly, showing that roundtrip is necessary but cannot by itself establish authentic decryption.

Under this model the untouched original sequence remains near the 28-rank uniform baseline, unlike an English-GP plant. This rules against this concrete source-motivated, stateful key schedule producing natural GP-English plaintext. It does not exclude different key derivations, compressed binary plaintext, variable framing, stronger state, external inputs, or a different role for the EA marker.

## Reproduction and consequence

- Exact CommonJS encoder, decoder, source-state iterator, search and positive recovery: [sims/grid_running_prime_state_inverse.cjs](../sims/grid_running_prime_state_inverse.cjs).
- Run from the existing [source-grid manual workflow](../.github/workflows/grid-section-digests.yml); complete executed JSON in [CI 42805437889](https://github.com/FlareZ123/liber-primus/actions/runs/42805437889).
- Source inputs are the original GP corpus, original transcription, 32×8 grid and the unchanged independent Shakespeare text fixture; no original cipher bytes were altered.

The tested source-key construction cannot support the actual plaintext recovery objective. A future attack needs a new, independently constrained key/state mechanism and must predict original plaintext outside its fitted interval. More cycles of the same 2,048-configuration scan are not justified.
