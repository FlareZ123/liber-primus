# 2014 Stage5 avowy onion: four-image recovery and historically bounded OutGuess audit

## Decisive original-byte recovery (11 November 2026)

The archived `avowyfgl5lkzfj3n.onion/post/index.html` at `iBotPeaches/cicada_3301` contains whitespace-separated hexadecimal GZIP data (original filename `data.out`, embedded GZIP date 2014-01-24 20:10:12 UTC). Expanding the exact stored bytes produces **3,010,703 bytes**, SHA-256:

`8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`

**The original contains four complete 2400×3600 JPEG images.** The initial two JPEGs appear in forward order. The remaining **1,363,382 bytes are a single concatenated, byte-reversed stream** of two more JPEGs. Recover the latter by reversing **the entire** trailer after source byte 1,647,321; reversing it yields two image files in order with no gap, no XOR, and no guessing. This resolves the original two-JPEG/high-entropy-trailer misinterpretation of the source object.

| Recovered image (source physical order) | Original `data.out` byte layout | Recovered bytes | SHA-256 |
| --- | --- | ---: | --- |
| image-01 | `data.out[0:823807]` | 823,807 | `913e26462e51942f49ca3ce2e94ef56c5fb65110814442dccc02b0d88af2c5ca` |
| image-02 | `data.out[823807:1647321]` | 823,514 | `b50c1536ea1f30847e7875835991d52951bafb599fb1ab04eb78c5c6e6c2b468` |
| image-03 | `reverse(data.out[1647321:])[0:638805]` | 638,805 | `f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557` |
| image-04 | `reverse(data.out[1647321:])[638805:]` | 724,577 | `975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089` |

**Existing-artifact identity:** direct SHA-256 comparisons against the independently supplied 75-scan original Liber Primus archive show the four recovered images are byte-identical to archive files **`06.jpg`, `07.jpg`, `08.jpg`, and `09.jpg`**, respectively. Their content was already present in the original LP1 corpus. The new result is a byte-exact reconstruction of the archived 2014 Stage5 container, its mixed-direction JPEG framing and a pinned replay of the historical third-image steganographic output. No new distinct tablet artwork or previously unknown LP2 plaintext has been discovered.

Each image validates independently with Pillow JPEG decoding at its original dimensions. The original whole-byte stream has only **two** recognizable forward JPEGs; the original trailer has none, and the byte-reversed trailer has **exactly two**. Full bitwise inversion (XOR 255), with or without reversal, contains no valid JPEG. A constructed two-JPEG plant passes all tested transform directions. The first archived and reproducible manual CI source run is [43114953136](https://github.com/FlareZ123/liber-primus/actions/runs/43114953136), with the exact SHA and dimensions printed in its job logs.

The reversible operation is directly motivated by the original 2014 [contemporary puzzle walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29), which describes four images in this same Stage5 gzip object, and a separately documented 2014 stage involving a byte-reversed JPEG. The recovered data are authentic archived puzzle artifacts; the operation is a deterministic byte readout, **not a recovered unknown LP2 text cipher**.

## OutGuess tests, historically separate from the four-image byte recovery

Maintained OutGuess 0.4 source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` was built and run on the first two JPEGs with the empty key, historical `divinity` candidate and a preserved `<!--3301-->` 256-byte object encoded as ASCII hex from `pre/index.html`. Previous outputs on the first two images were:

| Key | Each image's extracted length | Seed | Source-level observation |
| --- | ---: | ---: | --- |
| empty | 58,152 | 41,408 | The outputs share a 7,707-byte prefix |
| `divinity` | 2,140 | 19,674 | The outputs share an 86-byte prefix |
| archived pre-object ASCII hex | 30,628 | 44,920 | Outputs share a 4,411-byte prefix |

These outputs are high-entropy, contain no recognized file header, and lack readable plaintext. The old report incorrectly treated them as the entirety of the Stage5 hidden-payload test because the two reversed images had not yet been extracted. The front/back output correlations alone do not indicate an XOR-share mechanism.

**Recovered original image 3 gives an exact historical plaintext recovery.** In [manual CI run 43115488487](https://github.com/FlareZ123/liber-primus/actions/runs/43115488487), default-key OutGuess 0.4 at fixed source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` on image-03 (SHA above) reports `Steg retrieve: seed: 38, len: 140`. The 140-byte extracted file has SHA-256 `4767d811f22abdb15bfee53c29bbd2488b123a9c290f63712f4ed12fdbc5963d` and consists of the same text reported in the independently preserved 2014 walkthrough:

```text

For those who have fallen behind:

TL BE IE OV UT HT RE ID TS EO ST PO SO YR
SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M

Good luck.

3301

```

The original bytes include one leading blank line, a trailing space after the first group line, and two final newlines, precisely accounting for the 140-byte file. Stripping only whitespace from the two grouped lines gives 56 ciphertext characters. The historical seven-column key **1736254** is a *permutation of each consecutive seven-character row*: output characters at zero-based ciphertext positions `[0,6,2,5,1,4,3]`. Applied unchanged to all eight rows, it recovers exactly:

```text
TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133
```

The 16-character v2 onion hostname is **`q4utgdi2n4m4uim5.onion`**, and the four trailing characters `9133` have no source-established further role. The source/decoded text, exact inverse transpose, source SHA, and continuation are locked in `sims/stage5_original_outguess_columnar_sft.cjs`, executed on the *actual extracted 140-byte file* by [successful manual CI run 43116676430](https://github.com/FlareZ123/liber-primus/actions/runs/43116676430). Image-04's default-key extraction returns 58,152 opaque bytes, SHA-256 `a35f439175a16486e6b5699cc45a265fa9d82eea15b92a52a124d549d97ff4f1`, with no comparable authenticated plaintext. No passwords or arbitrary transposition orders were searched.

**This closes a real 2014 historical solve path from an original archived gzip object through two recovered JPEGs and a specific OutGuess/columnar result.** The key and operation are independently historical, and the extracted authentic message is reproducible from pinned input. Its known 2014 plaintext is distinct from unknown LP2 ciphertext.

## Reproduction and status

- `sims/stage5_four_image_carve_sft.py` is a self-testing, SHA-pinned complete-image carving and extraction tool. `--extract data.out OUTPUT_DIR` writes the four byte-identical decoded JPEGs, after checking every output hash and decoding each image independently.
- `.github/workflows/avowy-stage5-gzip-audit.yml` is manual-only (`workflow_dispatch`); it fetches the pinned archival source, expands the exact GZIP, runs the four-image plant and source checks, exports all four recovered source JPEGs, and tests original OutGuess on the two newly discovered images. It also preserves the previous bounded first-two-image controls. The first four-image detection passed in [run 43114953136](https://github.com/FlareZ123/liber-primus/actions/runs/43114953136); the further four-image and historical OutGuess verification passed in [run 43115488487](https://github.com/FlareZ123/liber-primus/actions/runs/43115488487).
- Archived upstream: `https://github.com/iBotPeaches/cicada_3301/blob/master/onions/avowyfgl5lkzfj3n.onion/post/index.html`.

**Research decision:** all four original-image byte streams, the exact third-image 140-byte steganographic plaintext, and its 2014 onion continuation are now independently reproducible. Preserve the source-authenticated bytes and reuse this known original-method control when considering source-motivated LP2 operations. Do not infer that the numeric `pre` object selects any LP2 key, or guess OutGuess passwords without a new source instruction. No unknown LP2 plaintext, authentic LP2 key, complete LP2 mechanism or final destination is recovered by this Stage5 source repair.
