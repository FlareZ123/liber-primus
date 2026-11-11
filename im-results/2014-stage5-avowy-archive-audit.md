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

The same historical walkthrough documents an **unkeyed OutGuess extraction from `onion4image3.jpg`** producing a cleartext word-group cipher, subsequently decoded with a seven-column transposition to a `q4utgdi2n4m4uim5.onion` continuation. That independently documented output is a strong **positive control for the newly recovered third/fourth images**. A subsequent manually dispatched workflow will extract each under the same tool and default key, without a password search. Until confirmed on the preserved original bytes, the walkthrough's result should remain external historical evidence and not be conflated with a successful modern extraction.

## Reproduction and status

- `sims/stage5_four_image_carve_sft.py` is a self-testing, SHA-pinned complete-image carving and extraction tool. `--extract data.out OUTPUT_DIR` writes the four byte-identical decoded JPEGs, after checking every output hash and decoding each image independently.
- `.github/workflows/avowy-stage5-gzip-audit.yml` is manual-only (`workflow_dispatch`); it fetches the pinned archival source, expands the exact GZIP, runs the four-image plant and source checks, exports all four recovered source JPEGs, and tests original OutGuess on the two newly discovered images. It also preserves the previous bounded first-two-image controls. The first four-image detection passed in [run 43114953136](https://github.com/FlareZ123/liber-primus/actions/runs/43114953136).
- Archived upstream: `https://github.com/iBotPeaches/cicada_3301/blob/master/onions/avowyfgl5lkzfj3n.onion/post/index.html`.

**Research decision:** preserve all four images as recovered original historical material and use their documented contents and OutGuess positive control to reconstruct the 2014 continuation accurately. Do not infer that the numeric `pre` object selects any LP2 key, or guess OutGuess passwords without a new source instruction. No unknown LP2 plaintext, authentic LP2 key, complete LP2 mechanism or final destination is recovered by this Stage5 source repair.
