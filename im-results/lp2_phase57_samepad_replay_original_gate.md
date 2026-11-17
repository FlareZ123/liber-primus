# LP2 collision-repair cipher: exact losslessness and same-pad replay gate

**17 November 2026, Agent15, Director Issue [#1296](https://github.com/FlareZ123/liber-primus/issues/1296). Classification: bounded original-cipher negative with a reusable necessary condition. No unknown plaintext, authentic key, or continuation recovered.**

## Why this test matters

The independent [pnotisdev Phase57 two-rule model](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase57_mechanism.md) explains several original LP2 ciphertext statistics with a collision repair and an additional per-word null/check rune. Its preferred R4 variant replaces a repeated provisional cipher glyph with

```
T(c[j-6]) = (24 - 2*c[j-6]) mod 29,
```

provided the six-back rune is in the same printed word and the repair trigger fires. The model reports a good descriptive fit (χ²6.7, empirical P≈0.643 in 500 simulations) and explicitly leaves the original p27/p55 `DJU BEI` duplication unexplained. A statistical match cannot be treated as a decipherment. The exact R3/R4/R7 rule *discards* the provisional rune. An immediate formal collision proves it loses information even when the key and random repair choices are known:

- Previous emitted rune `a=7`, six-back rune `b=3`, fixed additive key `k=5`, therefore `T(b)=18`.
- Plaintext rune `p=2` proposes `c=7`, collides with `a`, and the triggered repair overwrites it with `18`.
- Different plaintext rune `p'=13` proposes `c=18`, does not collide, and also transmits `18`.

The two plaintexts have the same known key consumption and the same resulting ciphertext state. The independently drawn null/check symbol in the published model carries no disambiguation. An actual decoder therefore needs an explicit side channel, an escape code, or a lossless retransmission. This distinction is relevant to selecting **real key and plaintext recovery operations** rather than refining a fitted generative model.

## New lossless candidate: retransmit the collided rune with the same pad

The most economical lossless adaptation is to insert the `T` symbol as a marker, then re-emit the collided provisional ciphertext rune using the *same* key/clock position. Such a forward rule preserves the displaced plaintext. It makes a very strong **key-independent original-cipher prediction**: at every inserted repair marker `j`, the emitted glyph immediately before and after the marker must be identical:

```
c[j] = (24 - 2*c[j-6]) mod 29
c[j-1] = c[j+1]
```

This is the visibly recognizable `A T A` palindrome of the original transmitted rune string. A source-relevant six-back restriction requires all three runes and the six-back antecedent to lie inside the same printed word. Count this *without fitting any key, choosing any deciphered letter, or varying the -2/24 map*.

We parsed the actual 2014 transcription `resources/liber-primus/lp2-transcription.txt` into literal hyphen/period-delimited words, removed printed line-break markers, inserted the absent numeric-only p50 page, and exactly matched **every page's complete 29-symbol rune sequence** to `resources/liber-primus/lp2-corpus.json`. The resulting literal punctuation delimiter parser has 2,928 tokens on unsolved p0–55; this differs from the repo's 2,896-word joined/canonical word contract, so the result is explicitly scoped to the physically marked separators. An independent **generous page-only** check ignores word boundaries entirely.

| Original-input register | Eligible marker centers `j` | `T`-relation hits | Two-step echo `c[j−1]=c[j+1]` | Both simultaneously |
|---|---:|---:|---:|---:|
| All eight relevant glyphs inside the same literal printed word | **713** | **46** | **26** | **1** |
| Page-only, disregarding all word boundaries | **12,564** | **465** | **426** | **13** |

The **only original within-word** joint hit is physical **p45, literal word index16, rune index7** (all zero based); its complete transliteration is `AEJRAUHRTHR`. The unconditioned independence reference for the word-internal joint count is `46×26/713≈1.68`, close to the observed single event. This is merely a descriptive reference, since original cipher letters are not independent.

Even the page-only relaxation permits just 13 potential same-pad repair insertions across all 12,956 unknown runes. In the source-relevant word-internal register, **45 of 46** six-back `T` hits cannot be immediate same-pad retransmission markers, independently of the secret key. Thus the simple information-preserving variant **cannot explain the many apparent `T` repairs** that motivated Phase57. The original R4 replacement itself remains lossy.

### Precise limits and next causal fork

This certificate excludes **only** insertion of `T` followed by same-pad, immediately retransmitted provisional ciphertext. It does **not** exclude Phase57 R2's delayed plaintext under the *next key symbol*, a differently clocked retransmission, a position/state-coded escape, a true original plaintext `T` relation without repair, or an external side channel. R2-alone was already simulated by the external work and failed its original word-length profile (G z≈8); **R2 combined with an additional per-word check/null** is a different potential lossless family, but still needs an unambiguous marker/escape rule before an inverse can be defined.

**Decision:** stop allocating decryption searches to the described lossy R3/R4/R7 rules and to the same-pad repair-to-`A T A` variant. If a first-party cue or cipher construction selects a *uniquely decodable* delay/escape mechanism, freeze its key clock, demonstrate full-message exact inverse on planted native GP plaintext, and demand original LP2 coherent prose plus exact forward reconstruction on a withheld page. The original six-rune `DJU BEI` bookend remains a separate unresolved source clue.

## Reproduction

[Read-only Node22/CommonJS single-file test](../sims/lp2_phase57_samepad_replay_gate_sft.cjs) checks all 58 source page transcriptions rune for rune, the 12,956 unknown rune count, exact marker and palindrome joint counts in both registers, the only strict witness, a planted same-pad `A T A` positive and a deliberately broken negative. No arbitrary substitutions, guessed keys, training corpus, or file writes are involved.
