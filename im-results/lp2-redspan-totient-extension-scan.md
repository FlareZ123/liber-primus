# Manuscript-wide red-span prime-totient extension scan

**Agent4, 19 November 2026. Precommitted bounded transfer test. Classification: negative for a general red-span decoding channel; positive control `THEIR` remains p33-specific, while `RISE` is mechanically duplicated by p40's identical [3,5] title-length pair. No unknown body plaintext is claimed.**

## Frozen family

Before opening outputs, `workplace/agent4-redspan-totient-extension-precommit.md` fixed the complete family:

- all eight annotated red spans that are exactly two complete printed words;
- the source-order word-length pair `[x,y]`;
- exactly two one-step extensions, `[x,y] || H([x,y])` and `[x,y] || H^-1([x,y])`;
- the exact solved-p56 serializer `T(n)=phi(p_n) mod29=(p_n-1) mod29` on positive one-based cardinals;
- exact complete four-rune matches only, against a frozen register containing authenticated signed-2016 words plus solved p56 and p57 words;
- no substrings, dictionary expansion, offsets, alternate prime origin, Caesar shifts, extra H powers, or unknown ciphertext scoring.

This charges 8 spans × 2 orientations = **16** outputs. The frozen register contains 68 distinct source/solved words, of which 17 have four-rune canonical GP encodings.

## Result

Windows run [44456115079](https://github.com/FlareZ123/liber-primus/actions/runs/44456115079) passes the full scan.

Exactly one charged output matches the frozen authenticated/solved register:

```text
p33 upper [2,8] || H^-1([2,8])
= [2,8,5,3]
T -> [2,18,10,4]
= THEIR
```

There are **zero additional register hits**.

The known lower p33 control is still reproduced:

```text
p33 lower [3,5] || H([3,5])
= [3,5,27,8]
T -> [4,10,15,18]
= RISE
```

The scan also exposes an important non-independence: p40's opening red title has the same word-length pair `[3,5]`. Consequently the same frozen forward-H construction gives exactly the same `RISE` output on p40. This follows from the duplicated operands and is not a second cryptographic discovery.

Post-output inspection of the original p40 artwork shows prominent bilateral plants/vines growing upward around the page. That visual is compatible with the word `RISE`, but it was noticed after the output and is therefore qualitative corroboration only.

## Decision

The solved-p56 serializer should **not** be promoted into a manuscript-wide decoder for arbitrary red headings. In the charged finite family, p33's upper `THEIR` is the only exact authenticated/solved-word hit. The lower `RISE` component is shared mechanically with p40 because both headings have lengths `[3,5]`.

The evidential unit on p33 is therefore the conjunction:

1. unique upper `[2,8]` produces `THEIR` under the page-directed H^-1 extension;
2. lower `[3,5]` produces `RISE` under the independently fixed opposite-section H direction;
3. the same p33 page independently links signed-2016 THEIR positions 19→25 and rise6=`a`;
4. the full p33 state-layout packet remains the sole 15/15 manuscript packet in the charged family.

Future use of `RISE` should require an independently visible selector such as a vertical/ascending operation. It does not license applying the serializer to other headings or reopening p40 cipher menus.

## Reproduction

- Precommit: `workplace/agent4-redspan-totient-extension-precommit.md`
- SFT: `sims/lp2_redspan_totient_extension_scan_sft.cjs`
- Workflow: `.github/workflows/agent4-redspan-totient-extension-scan.yml`
- PASS: [44456115079](https://github.com/FlareZ123/liber-primus/actions/runs/44456115079)
