# Original LP2 opening 729-rune QR-v3 interior: exact all-secret function-pattern obstruction

**Decision, 23 November 2026 (Agent10).** Physical LP2 p0–p2 contains exactly **729 = 27 × 27 GP29 runes** (262, 266 and 201). This suggests a plausible, completely defined attempt to read those runes as the **27 × 27 inner modules of a standard, 2014-available 29 × 29 QR Code version 3**. A version-3 QR has fixed three-corner finder, separator, timing, alignment and dark modules; their pattern is independent of message, Reed–Solomon corrections, error-correction level and the format-selected data mask. The original fails **at least 69 of 199 constrained function modules**, even granting an arbitrary secret 29→2 codebook and every dihedral orientation with both book reading directions. This excludes the *literal static rune-value-to-module QRv3* architecture. No unknown plaintext, key, historically selected QR opcode or destination was recovered.

## Human-observable clue and competing explanation

A 2014 reader could notice that the original book's first physically illustrated span p0–p2 is exactly **27 × 27**, and that the Gematria Primus alphabet contains **29 different signs**. A standard version-3 QR symbol is **29 × 29** modules, so treating the first original rune square as the 29-square's **one-module-trimmed interior** is a simple, player-era-recoverable conjecture. The source's three cruciform page-opening marks might suggest QR's three finder corners, but that artistic analogy is **speculative and cannot select a decoder by itself**. Equally plausible rivals are that 27×27 is accidental, that 729 instead represents some other mathematical layout, or that a cipher must first change GP29 rune values.

The source data are the exact, unmodified `resources/liber-primus/lp2-corpus.json` p0–p2 GP29 indices and the independently preserved `lp2-transcription.txt` manuscript order. Original physical LP2 page p50 with its separate numeric table is irrelevant here. All 729 original runes remain in source order before one of 16 predeclared placement conventions. No language scoring, private key fitting, syntactic rescoring or changes to source runes are allowed.

## Frozen QR layout and full-secret model

Adopt published **QR version 3**, with full integer coordinates 0–28 in each direction. Put the 27×27 source runes at square positions **(r+1,c+1), 0 ≤ r,c ≤ 26**. The module values fixed independently of any payload are:

- Three 7×7 finder patterns at corners (0,0), (0,22), (22,0), together with their one-module white separators.
- A timing stripe on full row6, columns8–20, and on column6, rows8–20, with alternating modules.
- One 5×5 alignment mark with top-left (20,20), center (22,22).
- The mandatory dark module (21,8).

The overlapping geometry inside the trimmed square supplies exactly **199 known function cells**: **108 finder + 39 separator + 26 timing + 25 alignment + 1 dark**. All format bits, ECC bits and data bits are deliberately **ignored** because their values depend on the unknown payload or QR options. This is maximally favorable to the QR conjecture within the specified static binary alphabet.

Permit each GP symbol `g ∈ {0,…,28}` to have its own *completely unknown* bit `f(g) ∈ {0,1}`, with no arithmetical, historical or balance restriction. The other free choices are the **eight square symmetries** (four rotations × reflected/unreflected) and reversing the **entire 729-rune tape** before placement. This tests sixteen geometric/read-order models. It does not choose or optimize a QR mask, because a standard QR mask never changes these 199 function modules.

## Exact original-input result, no secret-key enumeration

For each fixed read order, count `n[g,0]` of the times original rune `g` occupies a function cell required to be white and `n[g,1]` required black. The optimal hidden bit `f(g)` is independently the majority target, so the smallest possible error count among *every one of the 2^29 private rune-to-binary functions* is exactly

```
sum over g=0..28 of min(n[g,0], n[g,1]).
```

Because each GP rune's bit may be chosen independently, this is an exact attainability theorem, stronger than a sample of secret keys. Running the entire original 729-rune input returns:

| Tested placement family | Original-function-cell mismatch |
|---|---:|
| Minimum over all 16 independently specified geometric/read orders | **69 / 199** |
| Maximum across the same 16 orders | **75 / 199** |
| Success criterion for an actual uncorrupted QRv3 function pattern | **0 / 199** |

The best original match still contradicts **69 mandatory QR modules** even after maximizing independently over every secret GP29 binary assignment. No QR Reed–Solomon correction can repair inconsistent finder/alignment/separator/timing function modules. The QR-v3 interpretation with one uniformly selected binary output per GP glyph therefore cannot produce the original opening square in any declared read direction.

## Independent positives and implementation

The [read-only standalone Node22/CommonJS SFT](../sims/lp2_p0_729_qrv3_inner_sft.cjs) freezes the QR module geometry, source page lengths, all 199 fixed positions, 16 symmetries, exact all-secret minima and 69–75 source mismatch range. A separately generated 729-rune synthetic input uses an explicit nonconstant GP29→binary map and puts the required value at every QR function module. The same all-secret decoder gives **0/199 errors**; deliberately complementing the planted secret assignment gives **199/199 errors**, an independent wrong-key diagnostic. This checks that the test's no-go is not caused by a trivial mismatch in the source-to-grid mapping.

The same 199-module QR function template was also independently compared against a genuine standard **version-3 QR symbol** generated with the Python `qrcode` library (forced version3, payload `CICADA3301`, ECC level M, border0): **all 199/199 expected fixed module values agree**. This check validates the public module coordinates independently of the original GP manuscript. Library generation is a diagnostic rather than a dependency of the complete committed Node22 SFT.

## Research fork

Retire this particular human-motivated **direct, static rune→QR-bit interior embedding**, including any arbitrary secret alphabet choice, rotation, reflection and full-tape reverse. The observation 729 = 27² remains authentic, but it does not establish a QR decoder or key. A version-3 QR remains possible only after an independently selected additional **position-dependent operation**, a very different spatial encoding or a source-authored overlay. Such extra transformations remove the decisive equality invariant and must be motivated by new original artwork or authenticated 2014-era instructions before ciphertext-dependent fitting. Meanwhile preserve the separate p0–p2 27×27 arithmetic studies, which test genuinely different inverse families.

**No authentic unknown LP2 plaintext, source-selected cipher, recovery of other pages or Cicada destination is established.**
