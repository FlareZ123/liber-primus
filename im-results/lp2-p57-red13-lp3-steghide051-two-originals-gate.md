# Original p57 red13 rim password `LP3lRA#` on two original LP3 JPEGs under Steghide 0.5.1

**Decision, 22 November 2026:** Neither original JPEG whose page number the rim's literal `LP3` could describe contains a Steghide 0.5.1 carrier recognizable under the one fixed `LP3lRA#` key. Full authentic historical AES-CBC fixture and wrong-password negative control pass. The exact candidate key/carrier pairings are closed as **Steghide 0.5.1 payload sources**, with no statement about other formats, missing historical materials, or whether ASCII `LP3lRA#` was intentionally authored. All 56 unknown LP2 pages remain undeciphered.

The fully original source route fixes a seven-rune red `PARABLE` title followed by 13 red dots on solved physical LP2 p57; the 32×8 original table spanning p49 (10 rows), p50 (13 rows), and p51 (9 rows) has a 76-cell clockwise NW rim. One-based rim cells13–19 yield signed base60 ASCII bytes **`[76,80,51,108,82,65,35]`**, exactly `LP3lRA#`. This is a plausible literal locator but not independently certified key intent. `LP3` could refer to **first-release LP1 page03 `03.jpg`** (whose solved text mentions INSTAR as does p57 PARABLE) or **LP2 page3 `20.jpg`**. A historical OutGuess run on LP1 page03 already yielded only false-header random output; the LP2 page03 OutGuess candidate was independently closed earlier. This is a **separate steganography format** test rather than password hunting.

The Steghide decoder uses the exact original JPEG DCT values and the 24-bit historical Steghide embedded magic **`0x73688D`** under the candidate password. An authentic Steghide v0.5.1 AES-CBC payload fixture from pinned third-party [stegostudio commit `201689b5755c0f1267223cd881429e679230b835`](https://github.com/rickschaves/stegostudio/commit/201689b5755c0f1267223cd881429e679230b835) recovers its original **160 bytes byte-for-byte**, while its wrong key does not pass magic. The existing all-original JPEG scanner previously tested 10 different common passwords, **not this key**, so the two-carrier receiver is a distinct source-selected test.

| Source-original JPEG | SHA-256 | Bytes | Nonzero DCT | Steghide magic under `LP3lRA#` |
|---|---|---:|---:|---|
| LP1 `03.jpg` | `b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f` | 892,759 | 981,216 | **No** |
| LP2 `20.jpg` | `1453ef27ea607c6ea378d6472c908e77c2881caba33c72d1893caddee8dc1117` | 599,916 | 684,348 | **No** |

Both fail the **necessary full Steghide magic**, so no plausible corresponding Steghide AES-CBC extraction is present. This rules out this finite exact carrier/key/format hypothesis without rescues, offsets or generic password scans.

**Reproduction:** [Windows Node22 original-source SFT](../sims/lp2_p57_rim13_lp3_steghide051_two_originals_sft.cjs), [manual pinned upstream workflow](../.github/workflows/agent12-p57-rim13-lp3-steghide-two-originals.yml), [Windows execution PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45032764604). Positive fixture and both original targets are printed in the CI logs. No unknown GP29 plaintext or authentic external locator recovered.
