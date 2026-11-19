# p23 five-dot / prime-totient cardinal route to `THEORIG` and candidate `THE ORIGIN`

**Agent5, 19 November 2026. Classification: source-constrained hidden-layout instruction candidate. This does not decrypt p23 ciphertext and does not recover an unknown-page cipher key. The five-letter completion was recognized after the stronger seven-transliteration prefix, so the two evidence levels are kept separate.**

## Source-selected line and solved-control serializer

Three original LP2 scans reuse the same five-circle stencil: physical p7, p23 and solved p56. Exact source-image registration already establishes that p7→p23 is a vertical reflection. Both pages contain ten printed text lines, so the reflected counterpart of p7's terminal rubric line is p23's initial line. This supplies a source-visible p23 line selector without searching unknown ciphertext for language.

The solved p56 cipher supplies the positive-cardinal serializer already used independently on p33:

```text
T(n) = phi(p_n) mod29 = (p_n - 1) mod29
```

where `p_n` is the nth prime and `n` is one-based. P33's separately promoted title-count result demonstrates that this exact map can serialize manuscript layout cardinals into GP29 text.

Physical p23 line1 has five printed words with lengths

```text
[2,6,3,5,4]
```

and the first four words are exactly its red 16-rune heading. Applying the fixed serializer to the full selected line gives

```text
[2,6,3,5,4]
T -> [2,12,4,10,6]
GP -> TH EO R I G
   = THEORIG
```

No unknown rune values, language score, offset, phase, cipher sign or candidate plaintext selects these five operands.

The length vector is also exactly `[K,a,e,g,q]=[2,6,3,5,4]` under the independently source-reconstructed signed-2016 DH23 state. That identity was noticed after the line was selected and is retained as corroboration rather than used as the selector.

## Manuscript-wide controls

Across all **604** rune-bearing printed text lines, p23 line1 is the only line with the exact word-length vector `[2,6,3,5,4]`, and the only line whose direct fixed-T serialization contains `THEORIG`.

There are only three five-word lines whose word lengths are a permutation of the complete cardinal set `{2,3,4,5,6}`:

```text
p12 line5  [6,3,2,4,5] -> EORTHGI
p23 line1  [2,6,3,5,4] -> THEORIG
p53 line3  [3,4,2,5,6] -> RGTHIEO
```

P23 alone orders the set by taking the two endpoints inward, `2,6,3,5,4` (or its exact endpoint-reversed counterpart `6,2,5,3,4`). Thus the source-selected line is exceptional both in its serialization and in its cardinal geometry.

The identical motif's adjacent text controls do not produce language under the same fixed extension rule described below: p7's terminal adjacent line yields `THGRTHRIN`, and solved p56's terminal adjacent line yields `THTHGRRGIAE`.

## Candidate completion to `THE ORIGIN`

After `THEORIG` had already been observed, the five-circle / five-word coincidence suggested the source-local cardinal pair

```text
dot count = 5
word count = 5
5 * 5 = 25
```

Appending `[5,25]` to the five selected word lengths gives

```text
[2,6,3,5,4,5,25]
T -> TH EO R I G I N
   = THE ORIGIN
```

This completion is unusually economical but was found after reading the `THEORIG` prefix. Multiplication and squaring are indistinguishable here because both visible counts equal five. It therefore does **not** receive a blind-discovery probability and is not promoted as established plaintext.

Two source facts independently echo the required terminal cardinal 25: the selected p23 line's final rune has canonical GP0 value **25**, and p23's ninth line is the page's unique 25-rune line. The authenticated signed-2016 message also places the second `THEIR` at zero-based word position 25. These observations strengthen the salience of 25, while their recognition history means they remain corroborative.

A second semantic observation is that the five source lengths themselves move from the outside of the consecutive set `2..6` inward to its center. That makes the missing suffix `IN` descriptively compatible with the geometry, but it is interpretation rather than a separate cryptographic proof.

## Evidence boundary and p50 origin cross-check

The strongest chronology-safe result remains:

```text
exact five-dot mirror selector
+ solved p56 cardinal serializer
+ p23 line1 word lengths
=> unique manuscript-wide THEORIG
```

A later cross-object test now gives the full `THE ORIGIN` completion a separately typed consumer. Under the p50 register already selected on solved/source controls, literal table address0 contains `3N = 203`, and native-base60 quotient-first `divmod29(203) = [7,0]`. In the authenticated 2016 signed text, zero-based word7 is `THE`. The canonical origin cell therefore reads exactly `[THE, 0]`, or **THE ORIGIN**. Across all 256 original p50 tokens it is the sole canonical cell whose quotient is any authenticated `THE` position and whose remainder is0. A cyclic token-multiset shift gives 1/256 for that frozen relation. Reopening a conservative 16-way radix/token-order/pair-order/source-origin family weakens the cyclic familywise tail to 14/256.

This cross-check is not blind: p50 cell0 was public before the relation was formulated. It therefore strengthens the semantic completion without promoting it to established plaintext. Full details and the exact control are in `im-results/lp2-p23-origin-p50-cell0-crosscheck.md` and `sims/lp2_p23_origin_p50_cell0_crosscheck_sft.cjs`.

The full `THE ORIGIN` should now be treated as a source-constrained hidden instruction candidate with a cross-object p50 consistency check. A future promotion still requires an untouched consequence or reversible receiver selected before target inspection. Do not use this result to reopen the already failed five-dot coordinate-affine, five-column, direct p56-stream-transfer or generic constellation families.

## Reproduction

- SFT: `sims/lp2_p23_fivedot_totient_origin_prefix_sft.cjs`
- Windows Node22: [PASS 44457719011](https://github.com/FlareZ123/liber-primus/actions/runs/44457719011)
- Source-art registration: `im-results/lp2-mirrored-five-dot-original-page-bridge.md`
- Serializer control: `sims/lp2_p33_totient_hidden_text_sft.cjs`
