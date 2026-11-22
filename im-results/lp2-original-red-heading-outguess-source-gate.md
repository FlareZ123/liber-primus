# Original LP2 red-heading passwords against original JPEGs: complete native OutGuess gate

**Agent20, 17 November 2026. Evidence:** source-selected, exact historical-tool extraction; 18 original-image attempts with real positive and payload-free negative controls. **Result:** no authenticated extracted LP2 payload, plaintext, key or creator instruction. This closes a narrow steganographic route; it does not exclude encrypted binary, other password encodings or alternative carriers.

## The human solve-path hypothesis and its alternative

The original LP2 scans visually mark their chapter entrances in red. The original Cicada puzzle used OutGuess in earlier rounds, and the 2016 signed image also carries a genuine OutGuess/OpenPGP message. A human could plausibly treat an image's red heading as its own passphrase, rather than searching a large dictionary or inventing a key. The independent original-source gate takes **only the first red runes beginning at local offset 0** on nine image-visible chapter-opening pages, and tries two literal password transports: (a) the manuscript's exact GP29-to-Latin transliteration concatenated into a string, and (b) the literal UTF-8 runes. No ciphertext letter, password spelling or key substring is fitted to a putative result.

The strongest rival is that red headings are themselves encrypted content or that images carry no keyed steganography. The manuscript supplies no instruction explicitly pairing heading text with an OutGuess password. This experiment tests that one concrete pairing rather than asserting it was intended.

Original pages and JPEGs are source anchored by `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-ink-annotations.json`. The nine physical pages were **p0, p3, p8, p15, p23, p27, p33, p40 and p54**, in original order; their original archive JPEG numbers are **17, 20, 25, 32, 40, 44, 50, 57 and 71**, respectively. The p15 immediately following second red span, and p33's later red subtitle at offset91, are intentionally outside this strictly first-heading gate.

## Full 18-attempt exact result

The historical OutGuess 0.4 implementation was pinned to resurrecting-open-source-projects/outguess commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, with its bundled JPEG-6b reader. The executable [one-file CommonJS source](../sims/lp2_original_red_heading_outguess_sft.cjs) derives both keys, runs the already pinned native [keyed extractor](../sims/outguess_lp2_keyed_probe.cjs), and checks every source rune against canonical GP values.

| Original page | Latin-GP title key | Latin image header | Literal-rune image header | Recognizable payload |
| --- | --- | --- | --- | ---: |
| 0 | `SHEOGMIAFSYENGC` | yes | yes | 0 |
| 3 | `LJEOHNGCTHTAEJTXHTUOE` | yes | yes | 0 |
| 8 | `XIXMUXMCTHPOB` | yes | yes | 0 |
| 15 | `FULMAEAYOEA` | no | yes | 0 |
| 23 | `UAWNGGXDGIBIEOTBIY` | yes | yes | 0 |
| 27 | `MPYLSOAAEHLEEOIMLLSCP` | yes | no | 0 |
| 33 | `DEOXCFIAWHG` | no | no | 0 |
| 40 | `FNMYGDAEH` | yes | yes | 0 |
| 54 | `AMNGDIATHXIM` | yes | yes | 0 |
| **All 18** | | **7/9** | **7/9** | **0** |

**Fourteen** original attempts emit a nominal header-consistent byte sequence, totaling **284,181 binary bytes**. Extracted sizes range from **820 to 53,570 bytes**, and estimated Shannon entropy from **7.750839 to 7.996661 bits per byte**, consistent with length-adjusted high-entropy noise. No output has recognized plaintext, ASCII armor, ZIP, gzip or PNG signatures. Independent local inspection of the exact 14 preserved raw binaries with `file` called all **data**. `gpg --batch --no-default-keyring --list-packets` returned exit **2** on all 14; a few random prefixes deceptively resembled packet tags but had invalid versions/lengths. This is an additional reproducible format check, not evidence that no encrypted payload could exist.

The **critical negative control** applies each of the same exact 18 source-heading keys to a deterministic payload-free 2400×3600 libjpeg synthetic image. **18/18 clean images yield seemingly successful, length-consistent OutGuess headers**. Hence the 14 original “success” headers do not authenticate embedded data. This is consistent with the existing false-header pathology of the historical decoder: an extraction process exit0 and a reported byte count alone are insufficient.

Actual positive controls ran **for each of the 18 attempts**: keyed embedding and exact extraction of the independent 47-byte password-`79` planted message; historical default-key readable Cicada messages from authentic LP1 `00.jpg` and `08.jpg`. All passed, establishing that an actual embedded message can be recovered in the pinned execution environment.

## Reproducibility and precise decision

- [Successful full original-image GitHub Actions run 44024004880](https://github.com/FlareZ123/liber-primus/actions/runs/44024004880), job `original-red-key`; pinned build, eighteen native key/image tests, clean control and real-positive controls.
- [Complete 33-file artifact 14302607423](https://github.com/FlareZ123/liber-primus/actions/runs/44024004880/artifacts/14302607423), including every nonempty exact original output, per-key summaries and the aggregate `summary.json`. ZIP digest: `636cd4036e56853ea8f4faf76300fe5e2d18b60b5da50a5b3dd60ca119468815`.
- [Manual-only source workflow](../.github/workflows/agent20-original-red-headings-outguess.yml). The current code does no dictionary search, key fitting or modification of original images. Original-source and synthetic-control outputs are saved separately.

**Decision:** direct use of the first physical chapter heading as the password of **the same original page JPEG**, under those two unchanged historical transports, yields no authenticated hidden message. Avoid interpreting the 14 apparent native successes as recovered Cicada data or expanding this into free password mutations. This test neither falsifies LP2 image steganography generally nor solves any of the 56 unsolved pages. An alternative carrier-order/password derivation requires its own independent original clue before another extraction sweep.
