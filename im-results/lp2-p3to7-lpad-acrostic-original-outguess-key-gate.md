# Original LP2 red-initial `LPAD` as an OutGuess passphrase on its five-page carrier

**18 November 2026; Agent33; bounded original-source negative.** The four exact red-span starts in physical pp3–7 read **LPAD** (L at p3:0; P at p3:119; A at p6:71; D at p7:194). This unusual source-defined string could be a historical OutGuess passphrase: earlier genuine Cicada images used OutGuess. The competing interpretation, already documented in [the source readout](../workplace/lp2-p3to7-red-initial-lpad-readout.md), is that `LPAD` names left-padding or is a coincidental acrostic. The present experiment does not decide that interpretation. It asks one concrete question: *does the exact uppercase four-letter password open a recognizable historically embedded message in any of the five original JPEGs containing those red passages?*

## Exact original operation

- Original physical pp3,4,5,6,7 = source JPEGs `20.jpg`–`24.jpg`, unchanged.
- Single original-source password `LPAD`, case preserved as canonical GP29 Latin transliteration. No lowercase, added numerals, transformed words or key dictionary.
- Historical pinned OutGuess 0.4 at commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, extraction `outguess -k LPAD -r source.jpg candidate.bin`. The actual executable uses its own bundled JPEG-6b codec, not a local reimplementation.
- For every target, an independently embedded 47-byte keyed positive recovers exactly, authentic default-key Cicada scans `00.jpg` and `08.jpg` recover real texts, and a fresh deterministic payload-free libjpeg image is subjected to the same exact password. An OutGuess success status and consistent pseudoheader on a no-embed cover are *not* evidence of an embed.

The [self-contained CJS driver](../sims/lp2_p3to7_lpad_outguess_original_sft.cjs) calls the existing [calibrated native extractor](../sims/outguess_lp2_keyed_probe.cjs), source-checks every red span against the canonical original GP runes, and preserves each candidate's exact bytes. The manual [Windows-compatible Node22 source](../sims/lp2_p3to7_lpad_outguess_original_sft.cjs) is executed with native dependencies on Ubuntu GitHub Actions to preserve the historical codec. Full passing [CI run 44260211132](https://github.com/FlareZ123/liber-primus/actions/runs/44260211132), [raw five-page candidates and summary artifact 14407577485](https://github.com/FlareZ123/liber-primus/actions/runs/44260211132/artifacts/14407577485).

## Observed source results

| Source JPEG | OutGuess header-consistent | Extracted bytes | Shannon entropy, bits/byte | Recognized message/signature |
|---|---|---:|---:|---|
| `20.jpg` | yes | 39,274 | 7.994859 | none |
| `21.jpg` | yes | 39,274 | 7.995268 | none |
| `22.jpg` | yes | 39,274 | 7.995464 | none |
| `23.jpg` | yes | 39,274 | 7.995492 | none |
| `24.jpg` | yes | 39,274 | 7.994805 | none |

**All five original outputs share the exact same first 32 bytes**, `57396a992087f6cfb7d01aac03840bc5069f8a610ba6d948ff2d55322d66c791`, while their full SHA-256 values differ. In all five keyed clean-cover controls, native OutGuess *also* reports a syntactically consistent pseudoheader. There is no extracted PGP armor, signature, ZIP/gzip/PNG signature or highly printable message, and the 39 KB high-entropy tails provide no independent semantic object. Each native positive test succeeded. The common pseudoheader and common original prefixes are compatible with the extractor's deterministic key-conditioned false-header behavior, which previous probes documented; they are not five independently confirmed payloads.

**Result:** the bounded direct `LPAD`-as-OutGuess-key route recovers **zero recognizable original payloads**, despite 5/5 nominally successful extractions. It is unjustified to treat any of these as recovered plaintext or key material. A deliberately encrypted binary could in principle pass these superficial diagnostics, so the broader existence of LP2 steganography is **not** disproven. Further variants of the password or guessed carrier order require a separate first-party selector.

**Decision:** do not extend this to a `LPAD` password dictionary. Revisit the acrostic as a source instruction only when an independent operand and a typed reversible receiver are identified. No unknown LP2 rune ciphertext, original-cipher mechanism or destination is decrypted by this test.
