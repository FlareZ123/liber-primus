# Wordwise predecessor-difference cipher: all-secret affine-key shape obstruction

**Original-input decision, 11 November 2026:** A clue-motivated GP29 *difference* cipher was tested allowing **every independent nonzero affine multiplier and offset for each word** and treating the first ciphertext rune of every word as completely unconstrained. **Zero of the 343 original unsolved printed words of length ≥8** can be explained by any GP-encoded English lexicon word under this model, for either ordinal or GP-prime-value differences, using strict or permissive historical GP spellings. This is a very strong reference-English mismatch within the specified derivative-register family, **not** a universal proof that all possible plaintexts or non-GP text are impossible. No LP2 unknown plaintext, authentic key or continuation recovered.

## Clue and inverse model

The signed 2016 Cicada message instructs that Liber Primus words, meanings and *numbers* form a map, road and direction. A distinct simple reading from the already-tested word-sum shifts is that the encoded **difference of the numbers of successive plaintext runes** is the ciphertext. This direct difference operation might explain the unusual scarcity of adjacent equal ciphertext runes while preserving printed word lengths, but no original instruction authenticates it.

Give the model more freedom than a human would ordinarily assume. For *every* original printed word and every internal rune position `j≥1`, hypothesize:

```text
C[word,j] = a[word] × (f(P[word,j]) − f(P[word,j−1]))
            + b[word]  mod 29
a[word] ∈ {1,…,28}; b[word] ∈ {0,…,28}
C[word,0] arbitrary, even unrelated to the preceding plaintext
```

Here `f` is GP ordinal or the GP rune's prime value modulo29. A prime-totient reading yields the **same** internal differences, because subtracting 1 from every prime cancels. The arbitrary per-word `a,b` absorb any candidate secret word-specific key, source phase, page initialization, sign or offset; the unconstrained first rune allows book/page word-boundary feedback without needing a starting state. Only the **necessary internal difference pattern** is tested. In the prime model `f` is noninjective, so this invariant is not a complete decoder.

Normalize each internal ciphertext sequence `C[1…L−1]` under all translations/scalings over GF29 by subtracting its first value, then dividing by the first nonzero difference. Record that pivot and the complete normalized sequence. This canonical signature is identical for `a×x+b` for *every* `a ≠ 0, b`, so a single equality test checks all **812** key pairs per word without a search. Apply the same signature to the adjacent ordinal/prime differences of each lexicon word. Any correct native-GP plaintext word in the lexicon must have exactly the same signature.

**Source:** unmodified original [LP2 rune words](../resources/lp2-transcription.txt), parsed with [shared cross-page word parser](../sims/lp2_word_pages.cjs) into 2,896 words and 12,956 original rune glyphs; [TextBlob/Gutenberg word-frequency lexicon](../resources/control/english_wordfreq_textblob.txt), and independently selected Gibran, Emerson and Shakespeare native-English controls from `resources/control/`. Strict GP digraph codec and a permissive historical approximation `V→U, K/Q→C, Z→S` are reported separately; neither alphabet substitution is claimed to be uniquely canonical.

## Original versus source-native English

Each row uses the full independent word-frequency lexicon. Results in the original book:

| Original length threshold | Strict ordinal | Strict prime | Permissive ordinal | Permissive prime |
| --- | ---: | ---: | ---: | ---: |
| ≥5: 1,132 words | 348 | 343 | 357 | 359 |
| ≥6: 815 words | 42 | 40 | 44 | 52 |
| ≥7: 559 words | 2 | 1 | 2 | 2 |
| ≥8: 343 words | **0** | **0** | **0** | **0** |

For the same **permissive spelling** and minimum GP word length **8**, source-native controls retained high independent lexicon coverage, even *without* using their model-generated known plaintext to fit a key:

| Independently selected native English source | GP words ≥8 | Ordinal signatures present in dictionary | Prime signatures present |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 1,302 | 1,171 | 1,171 |
| Emerson, *Essays* | 8,388 | 7,150 | 7,150 |
| Shakespeare, excerpt | 4,121 | 2,581 | 2,582 |

Each native control word is also encrypted with independently varying secret `a,b` and an unrelated first ciphertext rune. The signature is recovered exactly in all controls because the invariant ignores these hidden keys. The native dictionary-matching rates vary by source and original word frequencies, but they remain far above the manuscript's **0/343**.

## Scope, use and next decision

The original mismatch strongly disfavors a direct native English GP29 predecessor-difference output under **any independently varying affine word key**. It is a different architecture from (a) stationary within-word arbitrary alphabet substitutions (which preserve *plaintext equality patterns*), (b) fixed-period GP28 predecessor-excluded rank ciphers, and (c) repeating source-byte keystreams. An affine transform of plaintext **differences** need preserve none of the original plaintext equality partitions, so this necessary-condition test adds coverage.

This exact decision **does not exclude** a general nonlinear f, nonaffine secret codebooks, concealed word segmentation, randomized output channels, plaintext in another language, hidden variable-rate intermediate encoding or ciphertext/previous-key nonlinear feedback. The reference lexicon is finite; no finite English wordlist proves that all imaginable coherent English plaintexts are excluded. A genuine solution needs independent source-derived operations that recover authentic original text rather than a retrospective dictionary fit.

**Reproducer:** [`sims/lp2_word_prime_difference_affine_gate.cjs`](../sims/lp2_word_prime_difference_affine_gate.cjs). A self-contained CommonJS source-invariant test with all original counts and independent native-GP positive controls asserted, no new workflow.
