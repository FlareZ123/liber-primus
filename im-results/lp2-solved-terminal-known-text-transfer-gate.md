# Direct transfers from solved LP2 material: bounded negatives

**12 November 2026 · Agent 7 · intermediate result, not a decipherment.**

## Question

Can the only authenticated LP2 cipher mechanism or the only solved LP2 plaintext provide a simple, source-selected operation for the 12,956 unknown runes on pages 0–55?

Two fixed human-solver hypotheses were tested on the original GP29 stream. Neither used the 256-cell numerical table, guessed external material, free key offsets, or post-selected plaintext fragments.

## Source and positive controls

The original corpus is `resources/liber-primus/lp2-corpus.json`; printed word boundaries come from `resources/lp2-transcription.txt` through the canonical `sims/lp2_word_pages.cjs` parser. The parser gives **2,896 words / 12,956 runes**, and the flattened words reproduce every original p0–55 GP29 index in order.

The solved p56 plaintext is recovered independently by its established continuous rule:
`P_i = C_i - (prime_j - 1) mod 29`, with the single literal plaintext/ciphertext F at p56 rune offset 56 not consuming a prime. This reproduces all **85/85** p56 runes and consumes 84 primes. The original clear p57 page supplies **95/95** plaintext runes. The exact p57 GP spelling used here is `TUNNELNG` (no I before the final NG rune), matching the original rune stream.

The language model is a word-internal GP29 trigram model trained on the first 240,000 characters of the repository's pinned Shakespeare control; the final 60,000 characters are held out. It uses add-one smoothing and scores each original printed word independently. The held-out English control scores **−2.469840 nats/rune**; the untouched unknown ciphertext scores **−4.366021**.

Both proposed encoders also pass source-native synthetic positive controls: 1,000 held-out English words (3,997 runes) are encrypted and recovered exactly under each respective operation. These controls validate implementation, not the hypotheses.

## Candidate A — reset the authenticated p56 prime-totient clock at every printed word

The source-visible word boundaries motivate one simple alternative clock: at the beginning of every printed word, reset the p56 key to (prime_0=2), then subtract (prime_j-1) for successive runes in that word. No literal-F exception is generalized or searched.

| Readout | GP29 trigram score (nats/rune) |
|---|---:|
| Raw unknown ciphertext | **−4.366021** |
| Source-consistent subtraction, word reset | **−4.385359** |
| Opposite-sign direction control, word reset | **−4.349302** |
| Held-out English control | **−2.469840** |

The source-consistent subtraction is slightly worse than the raw ciphertext. The opposite sign is marginally less poor but remains far from English. The subtraction output has a **2.49%** exact training-dictionary word hit rate, versus **2.24%** for the raw ciphertext; this small change does not produce readable text or a sustained language score.

**Decision:** reject this exact p56-derived word-reset clock as a direct GP-English inverse. This does not reject other per-word operations, other key schedules, or non-English intermediate text.

## Candidate B — repeat the complete solved p56+p57 plaintext as a running key

A solver may reasonably try the only complete known LP2 plaintext as key material. Concatenate the solved p56 plaintext followed by the clear p57 plaintext, in printed order, to form one **180-rune** GP29 key. Repeat it continuously over p0–55, without resets at words, pages, or chapter boundaries.

Only the natural sign and read-direction controls were tested:

| Decode sign | Key direction | GP29 trigram score (nats/rune) |
|---:|---|---:|
| − | p56→p57 forward | **−4.370773** |
| − | reversed | **−4.360792** |
| + | p56→p57 forward | **−4.362203** |
| + | reversed | **−4.386128** |

All four outputs remain essentially at the raw-ciphertext level. The best score, reversed-key subtraction at **−4.360792**, is still about **1.89 nats/rune** below held-out English and is not readable plaintext.

**Decision:** reject the exact repeated 180-rune p56||p57 additive key in either sign and either direction. This is a bounded negative for this direct key transfer, not for every possible use of solved pages as a key or selector.

## Overall conclusion

Neither direct transfer recovers unknown LP2 plaintext:

1. Reusing the authentic p56 `φ(prime)` operation with a reset at every printed word fails the English-register test.
2. Repeating the complete solved p56+p57 plaintext as one additive key fails in both signs and read directions.

The p56 and p57 source controls, canonical 12,956-rune input alignment, and both synthetic inverse plants pass. No unknown plaintext, authentic LP2 key, or intended destination was recovered. Because these are intermediate exclusions, they belong in `im-results/`; `results/README.md` is unchanged.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_terminal_known_text_transfer_gate.cjs
```

The script verifies the original word/rune alignment, the exact p56 inversion and p57 plaintext, computes source-file SHA-256 hashes, reproduces both score tables, and asserts exact recovery of both 1,000-word synthetic plants. It uses only Node built-ins plus the existing canonical word parser.
