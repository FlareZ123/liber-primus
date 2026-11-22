# LP2 AN END digest as an original-JPEG OutGuess password

**Resolved bounded decision, 14 November 2026, Agent41.** The 128-hex digest from solved LP2 p56, supplied unchanged as the exact OutGuess 0.4 password, **cannot yield a complete standard OutGuess payload from original p55** under the pinned historical coefficient/iterator rule. Earlier `SIGFPE` is now reproduced at the exact adaptive divisor and explained by a capacity shortfall. The neighboring original p53 completes a 56,462-byte **false-header extraction** with no recognizable signed text; p56 also fails. This closes the precise digest-as-password consumer for those source images, while **not excluding unrelated passwords, a different codec, or an external hash preimage**. No unknown LP2 plaintext or key was recovered.

## Why this exact test was selected

Solved p56 AN END prints `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`, ostensibly the 512-bit hash of an unknown deep-web page. The immediately preceding p55 (original `72.jpg`) repeats a moth illustration also visible on p53 (`70.jpg`). Historically authentic Cicada stages used OutGuess on JPEGs, but the manuscript does **not** authorize treating the digest as an OutGuess password. This is a frozen, source-motivated conjecture rather than a general steganographic claim.

Agent28's initial [p55 run 43577396879](https://github.com/FlareZ123/liber-primus/actions/runs/43577396879) ended in `SIGFPE` and therefore could not establish a negative; its [p56 run 43577553923](https://github.com/FlareZ123/liber-primus/actions/runs/43577553923) exited 1. The pinned builder was resurrecting-open-source-projects/outguess commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` (OutGuess 0.4); the original runner and positive controls are in `sims/outguess_lp2_keyed_probe.cjs`. An independent original-source DCT-reader/ARC4 implementation already establishes that **every LP2 JPEG has encrypted OutGuess header `ffffffff` for every password**, because the initial 1,024 eligible bits are ones. See [universal-header original source result](lp2-outguess-universal-header-artifact.md).

## Exact independent fault reproduction

The new [read-only executable SFT](../sims/lp2_outguess_digest_fault_sft.py) uses the project's independently calibrated `outguess_bitmap_dump.c` and `outguess_extract.py`, with exact input JPEG SHA-256s, fixed passwords, and a safe simulation of the historically documented `iterator_adapt` arithmetic. It records the first capacity impossibility **before** attempting an invalid modulus, then stops at the precise point where the original extractor divides by zero. It performs no password enumeration or key retuning.

| Source JPEG | Exact SHA-256 | Eligible DCT bitmap bits | Outcome |
| --- | --- | ---: | --- |
| LP1 authentic Stage04 `03.jpg` | `b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f` | 811,192 | Password `Default key`: full 31,809-byte PGP-signed original, SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`; no fault |
| LP2 p53 `70.jpg` | `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548` | 758,806 | Full 56,462 bytes from forced header; SHA-256 `2a38acd6c0c101c02023ffa7087ec65465cbf2393df6acf20995805f1876776e`; no authenticated content |
| LP2 p55 `72.jpg` | `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba` | 629,181 | First impossible minimum-bit budget at byte 44,190: 98,175 remaining versus 98,176 needed. **At byte 56,445 of 56,462, 135 bits remain for the required 136: skip modulus truncates to zero.** No valid complete extraction |
| LP2 p56 `73.jpg` | `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc` | 428,609 | Insufficient bitmap bits before the first payload byte; safe simulator reaches zero skip modulus at byte 50,554 |

All three LP2 headers are *identically* source-forced `ffffffff`, decrypted as `36838edc` with **pseudo-seed 33,590** and **pseudo-length 56,462**. In p55, the historic skip algorithm consumes at least one fresh coefficient position for each bit sampled, so 135 positions cannot encode 136 remaining bits. The original `SIGFPE` arises from attempting `arc4_getword(...) % skipmod` after adaptation has set `skipmod=0`. Clamping that divisor to 1 would change the historical retrieval rule and **still cannot recover the full declared payload**, because there is insufficient capacity at the frozen seed/clock.

The authentic 2014 `03.jpg` control returns 31,809 bytes, beginning with `-----BEGIN PGP SIGNED MESSAGE-----` and matching the archived signed-source SHA-256. This is an actual source-positive extraction, materially stronger than a synthetic round trip. The p53 full-length output begins with the same pseudo-header `36838edc` as the p55/p56 partial outputs; its apparent completeness alone cannot authenticate a message. A separate previous deterministic payload-free JPEG even emitted a complete 36,490-byte false-header output with this very same digest password.

## Decision and bounded scope

For the **one exact printed digest password** and unchanged **historical OutGuess 0.4** coefficient order/ARC4 selector, p55 and p56 are now decisive capacity failures. The formerly inconclusive p55 `SIGFPE` was an old extractor's unguarded zero divisor on an already impossible pseudo-payload, not evidence for a hidden message. The neighboring p53 completes a pseudo-payload and provides no independently authenticated signed text or file type. No source-derived reason warrants altering the password or a different extraction algorithm on these results.

Retire this fixed-key p55/p56 OutGuess hypothesis and preserve the independent original continuation-hash investigation. Do not infer that all original LP2 JPEGs lack steganography.

**Reproduction:** `python sims/lp2_outguess_digest_fault_sft.py` (Python 3, C compiler and libjpeg development library). Prior [authenticated OutGuess controls](../sims/outguess_lp2_keyed_probe.cjs), [historical header analysis](lp2-outguess-universal-header-artifact.md), and [source positive/signature gate](cicada2014-stage04-stage08-pgp-original-source-gate.md).
