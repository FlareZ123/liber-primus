# LP1 p05 mirrored JPEG bytes as an LP2 pad (Agent 13, 2026-11-10)

**Current status: bounded negative over five million-plus fixed-offset, reversible and rejection-sampled JPEG pad candidates. No LP2 plaintext recovered.**

## Why this pad was worth testing

One original LP1 image, `05.jpg`, has an intentionally structured byte envelope: a complete **336,353-byte JPEG**, a **360-byte encoded 5×5 magic-square matrix**, and a **336,353-byte reverse copy of the complete JPEG**. The 360-byte center is genuinely additional data, with 358 ASCII hex characters that decode in reverse order to 25 numerical cells summing to 1033 across every row, column and diagonal. SHA-256 of the entire original image is `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`. See [jpeg05-palindromic-magic-square.md](jpeg05-palindromic-magic-square.md). The previously described 72,700-byte mirrored tail is one slice of the larger exact byte-reversal envelope; the last occurrence of `FF D9` is inside appended reverse data and is not the original JPEG's actual end.

The mirrored region is long enough to offer a literal additive pad for the 12,956-rune LP2 ciphertext. Previous broad image-steganography analyses do not, by themselves, test the hypothesis that the already-visible LP1 JPEG bytes are *the key source*.

## Decoder and search space

The CommonJS code reads the actual `lp2-corpus.json` rune indices, the original `05.jpg`, and the English trigram language model trained from `resources/control/shakespeare_first300k.txt` by `sims/grid_keyskip_viterbi.cjs`.

The encryption family is `C_i = P_i ± K_j mod 29`. If a candidate pad symbol would reproduce the preceding ciphertext rune, the decoder permits it to be discarded, consuming the next pad byte; **zero, one or two rejected draws per encoded rune** are modeled by an exact Viterbi recursion. A penalty of 3.5 per extra draw discourages spurious key skips. Two byte-to-rune reductions are searched: `byte % 29` and `floor(byte * 29 / 256)`. Both pad directions are tested.

### Initial fixed-start screen

[GitHub Actions run 42745748353](https://github.com/FlareZ123/liber-primus/actions/runs/42745748353) evaluated 80 configurations (four byte-source orientations × two reducers × two signs × five offsets 0, 1, 29, 256, 3301) over heads of pages 0, 1, 20, 49, 51, and 55. The strongest page-0 180-rune log-score was **−5.50750/rune**. Over 24 independent within-pad circular-rotation null searches of the same 80-setting family, mean best score **−5.47444**, SD **0.08758**, maximum **−5.28561**, empirical **p=16/25=0.64**. The planted positive control, at entropy-diverse offset 3301, decoded **180/180** known runes and matched all four deliberately rejected pad draws.

This first screen supplies a direct matched negative, but does not cover arbitrary byte starts.

### Exhaustive offset search on the mirrored 72,700-byte region

[Successful opt-in run 42746120377](https://github.com/FlareZ123/liber-primus/actions/runs/42746120377) scanned every byte start from 0 through 72,040 inclusive for each of:

- mirrored trailer or byte-reversed trailer (the original prefix);
- `byte % 29` or scaled-29 reduction;
- additive sign + or −.

That is **72,041 × 8 = 576,328** actual key configurations. The offset bound reserves space for a 220-rune confirmation at the maximum three consumed pad draws per rune.

For every combination, a Viterbi 24-rune head score was computed. The best **140** head scores across the entire grid were independently decoded to **220 runes** with the identical model. The best initial head scored **−3.27575/rune**. The strongest 220-rune candidate scored **−5.20918/rune**, using `trailing-mirror:scaled29`, negative sign, byte offset **27,850**. Its output was an irregular 29-rune stream, with no validated readable passage. All 140 shortlisted candidates remained at noise-like language scores on lengthening.

**Positive control:** an independent LP1 plaintext excerpt was encrypted with the actual trailer bytes at a hidden start **12,345**, positive sign, eight rejected pad draws, same two-skips-per-rune mechanism. The head screen ranked the genuine start **#1 of 72,041 possible offsets** for its branch; full 220-rune Viterbi decoding recovered **220/220** runes and **8/8** rejected draws. Planted 24-rune head score **−2.70287/rune** against the highest real LP2 head **−3.27575/rune**. The full planted decoding had much better language fit than the best actual key candidate.

The calibrated initial screen and the exhaustive control show the method can recover strong English plaintext when the hypothesized key family is true. The exhaustive stage itself lacks a full family-wise wrong-key null and covers only a Shakespeare-English score; these limits prevent treating any negative as a mathematical exclusion of the entire family. In particular, more skips, a different reduction, an altered key, differing page starts, different languages, and offsets in the small excluded tail are untested.

## Extended original-file byte-window searches

The previously examined 72,700-byte prefix is only part of the **336,353-byte original JPEG**. Another [opt-in run 42746453100](https://github.com/FlareZ123/liber-primus/actions/runs/42746453100) scanned the **first 600,366 bytes of the packaged file** (the valid original JPEG, 360-byte center, and part of the reversed JPEG), forwards and backwards, with the two reductions and two signs. For each of the eight settings, all **599,707 byte starts** supporting a 220-rune window at the maximum three pad draws per rune were covered. This totaled **4,797,656** independent 24-rune head calculations. The 140 best heads were decoded to 220 runes; best final language score was **−5.3384/rune** (original-file prefix, scaled29, sign +, offset **384,380**) and remained non-linguistic. A full 220-rune planted sample at offset **300,000** had the true offset **rank 1 of 599,707**, recovered **220/220** runes and **10/10** skipped draws. Its 24-rune head scored **−2.41120/rune**, against best LP2 **−3.25208/rune**.

A further construction avoids the possible bias of `byte % 29`: read the mirrored prefix in either direction, **discard raw bytes 232–255**, then map each retained byte `% 29`. Exactly eight appearances of every rune index per group of 232 raw byte values are possible, yielding an unbiased conversion under uniform bytes. From 72,700 input bytes this produces **67,122** retained pad symbols in the chosen image. [Run 42746707065](https://github.com/FlareZ123/liber-primus/actions/runs/42746707065) searched **66,463 starts × two directions × two signs = 265,852** candidates on **each** of LP2 pages **0 and 5**. Best 220-rune final scores were **−5.2578** on page 0 and **−5.4293** on page 5. Again, no readable text. The planted offset **12,345** ranked **#1 of 66,463** under the correct reducer/sign, recovered **220/220** runes and **7/7** rejected draws.

These extensions expand the search to **5,905,688 individual 24-rune head evaluations** across the three exhaustive runs, with a 140-candidate 220-rune confirmation for each page × family. Most key hypotheses share image bytes under reversal: the 336,353-byte JPEG prefix is exactly the reverse of the suffix, with 360 intervening bytes. Thus forward and reverse raw-byte candidate lists have large deterministic overlap, and the 5,905,688 figure counts evaluated configurations, not independent keys. Their outcomes consistently fail the controlled natural-language recovery test, with no plaintext/key success. The head-screen positive controls are point demonstrations for Shakespeare-like English on the named generators, rather than calibrated universal sensitivity to every register.

## Reproduction and what remains open

- Initial scan + pad-rotation null + 180-rune plant: [`sims/mirror_jpeg_pad.cjs`](../sims/mirror_jpeg_pad.cjs), [opt-in workflow](../.github/workflows/mirror-jpeg-pad.yml).
- Exhaustive 576,328-offset mirrored-pad Viterbi screen, 140 candidate confirmations, plus rank-one plant: [`sims/mirror_jpeg_offsets.cjs`](../sims/mirror_jpeg_offsets.cjs), [workflow](../.github/workflows/mirror-jpeg-offsets.yml).
- Exhaustive 4,797,656-offset full-JPEG extension: [`sims/mirror_jpeg_whole_offsets.cjs`](../sims/mirror_jpeg_whole_offsets.cjs), [workflow](../.github/workflows/mirror-jpeg-whole.yml).
- 531,704 unbiased-rejection candidate evaluations on pages 0 and 5: [`sims/mirror_jpeg_rejection_offsets.cjs`](../sims/mirror_jpeg_rejection_offsets.cjs), [workflow](../.github/workflows/mirror-jpeg-rejection.yml).

The mirrored trailer is an **unproven candidate key source**. The concrete tested class now includes every admissible start of both the mirrored prefix and the declared first-600,366-byte file window under two modulo-29 reducers plus a third unbiased-rejection reducer on the mirror, with signs ±. These scans cover declared byte windows, **including reversed-image bytes in the 600,366-byte extension**, not only a JPEG pixel/entropy stream. Only the specified 0–2 collision-rejection transition model and the English-like register are covered. Possible alternatives include image/pixel-derived keys, different byte reductions or encryption transitions, independent per-page state, and external key material.
