# p33 solved-control serialization recovers `THEIR RISE`

**Agent4, 19 November 2026. Classification: new manuscript-internal hidden-text candidate with an exact solved-control serializer. No unknown p0-p55 ciphertext plaintext is claimed.**

## Result

Physical p33 is independently selected by the p23/p56 half-turn page rise `56-23=33`; its solved-control layout yields the source-visible `THEIR RISE` phrase. A separate conditional DH/p50 pointer also maps `B=19→p50[19]=0X→base60 33`, but this is corroboration rather than the page selector. P33 carries two source-visible red title word-length pairs:

```text
upper title lengths = [2,8] = [K,A]
lower title lengths = [3,5] = [e,g]
```

The solved p56 cipher supplies an authenticated integer-to-GP29 serialization rather than a guessed KDF. If `p_n` is the nth prime, its key clock is

```text
T(n) = phi(p_n) mod 29 = (p_n - 1) mod 29
```

for positive one-based cardinal ordinals. The p56 inverse recovers all 85 runes of `AN END...`, including the literal-F pause, and forward reencryption reproduces the original ciphertext. The dedicated SFT repeats that full control and its 25-rune holdout before applying `T` to p33.

P33 itself fixes H polarity. The already-established local relation

```text
lower heading [21,2] --H--> [19,23] = upper M marker + upper title initial D
```

means forward H points from lower source material toward the upper section. Extending each title-length pair one H step toward the opposite section is therefore source-directed: the upper title uses `H^-1`; the lower title uses `H`.

For the upper title:

```text
[2,8]
H^-1([2,8]) = [5,3]
[2,8,5,3]
T -> [2,18,10,4]
GP -> TH E I R
     = THEIR
```

For the lower title:

```text
[3,5]
H([3,5]) = [27,8]
[3,5,27,8]
T -> [4,10,15,18]
GP -> R I S E
     = RISE
```

Reading the two physical sections top-to-bottom therefore gives:

```text
THEIR RISE
```

This is the first coherent plaintext-like output found here from a p33 layout packet using an independently authenticated solved-page integer serializer.

## Why this differs from the rejected p33 key sweeps

The operands are literal title word counts already present in the p33 state-register result. The map `T` is exactly the solved p56 prime-totient clock, rather than a fitted affine map or repeating DH key. The H orientation is already fixed elsewhere on the same page by the lower-to-upper heading relation. The physical title order is fixed by the image. Unknown-page ciphertext, dictionary scores, trigram scores, field permutations, phases and offsets are absent from the construction.

A zero-based prime index does not recover either word. Charging the four H/Hinv polarity assignments on the two fixed title pairs leaves exactly the source-directed upper-Hinv/lower-H assignment with both recovered words. Manuscript-wide, the existing red-span census finds only eight red spans that are exactly two complete words, and p33's upper `[2,8]` pair is the unique occurrence of that ordered shape.

These controls do not justify a post-hoc probability for the English phrase. They establish that the mechanism is narrow, source-typed and reproducible.

A later precommitted manuscript-wide transfer scan charges all eight exact two-word red spans under both one-step H/H^-1 extensions with this same solved-p56 serializer. It finds no additional authenticated signed-2016 or solved-p56/p57 word. It also shows that p40 repeats the lower title-length pair `[3,5]`, so p40 mechanically yields `RISE` under forward H as well. **RISE alone is therefore non-unique.** P33's evidence is the conjunction of the unique upper `THEIR`, the page-fixed opposite H polarities, the full state-layout packet, and the signed-source 19→25 rise loop. See `lp2-redspan-totient-extension-scan.md`.

## Interpretation and next causal test

`THEIR RISE` should be preserved as hidden text or an instruction candidate, not yet promoted to unknown LP2 ciphertext plaintext. Its semantics remain open. A relevant possibility is that it instructs a rising or ordinal treatment of a previously identified sequence. That must be predicted on untouched material rather than inferred from a convenient target.

The immediate successor should freeze this exact pipeline and ask whether another independently selected pair-bearing receiver produces a blind continuation. Candidates must already carry an H direction and positive cardinal counts. Do not reopen arbitrary p33 repeating keys, H phases, field permutations or prime offsets.

## Reproduction

- SFT: `sims/lp2_p33_totient_hidden_text_sft.cjs`
- Windows workflow: `.github/workflows/agent4-p33-prime-totient-hidden-text.yml`, PASS [44454927901](https://github.com/FlareZ123/liber-primus/actions/runs/44454927901)
- Inputs: `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json`
- Upstream p33 state report: `im-results/lp2-p33-dh-layout-state-register.md`
- Solved p56 control: `sims/authentic_lp2_p56_totient_regression.cjs`
