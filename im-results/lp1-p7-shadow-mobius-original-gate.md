# LP1 p7 shadow/Möbius matrix: source-selected LP2 tests

**Status: bounded negative; no LP2 plaintext, key or destination recovered.** This tests one human-plausible reading of LP1 physical p7, not the full Möbius/PGL(2) family.

## Source clue and fixed construction

LP1 p7 (original image resources/liber-primus/07.jpg) contains the number sequence **272 138 shadows 131 151**, the value **18** (printed twice in the passage), and the word **MOBIUS**. A solver could reasonably ask whether the four numbers are the row-major coefficients of a 2×2 Möbius matrix and whether 18 supplies its starting point.

Reducing the four numbers modulo the 29-symbol Gematria Primus alphabet gives

\[
M=\begin{pmatrix}272&138\\131&151\end{pmatrix}\bmod29
 =\begin{pmatrix}11&22\\15&6\end{pmatrix}.
\]

Its determinant is **26 mod 29**, so it is invertible; its projective order in PGL(2,29) is **30**. The source word “shadows” motivates the transpose as the only alternate orientation tested:

\[
M^T=\begin{pmatrix}11&15\\22&6\end{pmatrix}.
\]

Both M and its transpose have a 30-point orbit from the printed seed 18. The 30 points of P1(F29) naturally match 29 GP runes plus one word-boundary symbol. This numerical fit is attractive, but the manuscript does not explicitly supply matrix brackets, the seed interpretation, the infinity/space assignment, or an instruction to apply this operation to LP2.

## Original input and controls

The reproducer parses the canonical LP2 transcription with the repository's existing lp2_word_pages.cjs parser, then asserts exact equality against lp2-corpus.json:

- 2,896 printed words, including 32 cross-page word joins;
- 12,956 original ciphertext runes across 55 rune-bearing pages;
- 2,895 word separators, giving a 15,851-symbol rune-plus-space stream.

The baseline original ciphertext has IoC **0.034478398**, all-rune GP29 trigram log score **−14.004469**, and within-word trigram score **−13.990082**. A 12,956-rune Emerson control, partitioned into the exact original word lengths and encoded with the source orthography (including the LP1/p57 ING rune), scores **−7.716723** all-rune and **−7.706232** within-word, with IoC **0.062979423**.

## Tests

### A. Direct projective global clock

Use the canonical coordinate embedding: GP rune x is the finite field point x in F29, and a printed word separator is infinity. At absolute symbol position i, apply M^(i+φ) or M^−(i+φ), with only the source-visible candidate phases φ=0,18. Test both row-major M and its shadow transpose M^T.

| Matrix | Phase | Direction | Output IoC | All-rune trigram | Within-word trigram | Output spaces |
|---|---:|---:|---:|---:|---:|---:|
| M | 0 | + | 0.034516 | −14.041988 | −14.048607 | 542 |
| M | 0 | − | 0.034493 | −14.032708 | −14.036110 | 528 |
| M | 18 | + | 0.034509 | −14.056073 | −14.061723 | 488 |
| M | 18 | − | 0.034490 | −14.077493 | −14.081125 | 551 |
| M^T | 0 | + | 0.034486 | −14.058403 | −14.046485 | 545 |
| M^T | 0 | − | 0.034513 | −14.034407 | −14.032719 | 520 |
| M^T | 18 | + | 0.034487 | −14.050761 | −14.054854 | 539 |
| M^T | 18 | − | 0.034513 | −14.085459 | −14.086745 | 534 |

Every output remains random-like and substantially below the native-English control. The transformation also changes the number of spaces, as expected when the projective action moves infinity; no output yields coherent words or a readable passage.

### B. Orbit-derived 29-symbol key, reset per printed word

A second natural reading uses the orbit from seed 18 as the key schedule. Remove the single infinity point, leaving the 29 finite residues in orbit order; this is a permutation of all GP29 symbols. Apply it as a repeating additive key within each word, resetting at every printed boundary; this is a bounded word-oriented reading, not a claim that the signed 2016 wording specifies this key. Here sign + means plaintext = ciphertext + key (mod 29), and sign − means plaintext = ciphertext − key (mod 29). Test both signs and both M and M^T.

| Matrix | Sign | Output IoC | All-rune trigram | Within-word trigram |
|---|---:|---:|---:|---:|
| M | + | 0.034451 | −14.023875 | −14.001248 |
| M | − | 0.034476 | −13.995943 | −14.001670 |
| M^T | + | 0.034455 | −13.992934 | −14.032161 |
| M^T | − | 0.034469 | −14.035666 | −14.044429 |

The best all-rune score improves on the raw ciphertext by only 0.0115 nats/rune, while its within-word score is worse than raw. The previews are not coherent text. The finite orbit is a complete alphabet permutation, but it does not provide a usable LP2 key.

### C. Orbit-order embedding

If instead the 30 alphabet symbols are assigned to the 30 projective points in orbit order, the action of M becomes exactly a progressive 30-symbol shift s_i→s_i+i mod 30. Both directions were tested on the complete original rune-plus-space stream. The best all-rune score is **−13.949464** and the best within-word score **−13.948487**, still far below native English; IoC remains **0.03448–0.03453**. This embedding therefore adds no matrix-specific decipherment.

## Reproducibility and decision

The single-file Node SFT performs all three interpretations, asserts the exact original source transcription and corpus match, verifies that both matrices have projective order 30 and full seed-18 orbits, and runs exact forward/inverse positive controls on a source-shaped 12,956-rune native-English plant. All positive controls round-trip exactly. As always, a bijective wrong-key round trip is an implementation check, not evidence that the historical key has been identified.

Run from the repository root:

~~~bash
node sims/lp1_p7_shadow_mobius_lp2_gate_sft.cjs
~~~

**Retire only these fixed readings:** the row-major four-number Möbius matrix (and transpose), seed 18, canonical P1(F29) embedding, global position clock at phases 0/18, orbit-derived word-local additive key, and orbit-order progressive shift. The source does not establish that these numbers form a matrix or select any of these consumers. Do not generalize this negative to every Möbius transformation, other matrix constructions, different state updates, or non-English intermediate representations. No workflow was added and no established-result synthesis changes.
