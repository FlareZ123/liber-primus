# LP2 AN END literal digest as an original-JPEG OutGuess password

**Decision (Agent28, 14 November 2026):** Using the original 128-character hexadecimal digest printed on the solved LP2 p56 as the exact OutGuess 0.4 password on the two immediately preceding/containing original terminal JPEG carriers recovered **no message**. This is a bounded source-led negative. The p55 test crashed with `SIGFPE` and is therefore **inconclusive as a valid extraction**; the p56 test exited with status 1 and no output. Neither experiment supplies LP2 plaintext, key material, a hidden-page URL or a validated deciphering rule.

## Clue and precommitted narrow consumer

The original LP2 p56 ("AN END"), physically `73.jpg`, contains a 512-bit digest, printed literally in lowercase hexadecimal rather than encrypted runes. Its preceding plaintext says a deep-web page hashes to that value and asks pilgrims to seek it. Earlier 2014 Cicada stages demonstrably used OutGuess on JPEG page images, with a password option. These two original inputs motivate a cheap alternative: use the **literal printed digest as the OutGuess `-k` argument** on physical p55's `72.jpg` and the containing p56's `73.jpg`, with no altered spelling, phase, substring, changed extractor or carrier permutation.

The fixed password (128 ASCII characters) was:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The password test is **not stated by the author**. An exact 512-bit hash identifies the missing page; an OutGuess password is only a hypothesis, and decoding one JPG would not itself establish that this interpretation is intended.

## Original-binary execution and controls

Used the repository's already existing manual-only `.github/workflows/lp2-outguess.yml` and `sims/outguess_lp2_keyed_probe.cjs`, pinning maintained OutGuess 0.4 source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` and the repository's unmodified original LP2 JPEGs. No exploratory password generation or additional image scans were run.

The existing SFT completed three independent controls for **each** run:
* A known 47-byte message was embedded in original `17.jpg` using password `79`, then recovered exactly (**47/47 bytes**).
* Default OutGuess extraction of authentic earlier Cicada `00.jpg` and `08.jpg` recovered their documented signed-text controls.
* The exact 128-character hash key extracted an apparently valid **36,490-byte** header and payload from a deterministic **payload-free synthetic JPEG**. That false output had no recognized file format, illustrating why a nonempty OutGuess header alone would not authenticate hidden data.

| Target original carrier | Manually dispatched run | Outcome |
| --- | --- | --- |
| `72.jpg`, LP2 p55 (the last unknown page) | [43577396879](https://github.com/FlareZ123/liber-primus/actions/runs/43577396879) | `SIGFPE` on extraction; 0 matched headers, 0 raw candidates; no crash-free negative is established |
| `73.jpg`, LP2 p56 (prints the digest) | [43577553923](https://github.com/FlareZ123/liber-primus/actions/runs/43577553923) | OutGuess exit 1; 0 matched headers, 0 raw candidates, 0 recognizable payloads |

Both jobs finished successfully as **test harnesses** despite the individual extraction failures, as recorded in their logs. The workflow prints the error/signals explicitly rather than silently interpreting failed retrieval as an empty valid payload.

## Interpretation and next decision

The original p56 digest does **not** yield a payload under the exact one-key OutGuess 0.4 test on the containing page `73.jpg`. Original p55 `72.jpg` is a real unresolved extractor failure and cannot be declared a cryptographic no-match by this test. The no-payload synthetic image gives a useful specific false-header control, and the known 2014 extractions rule out a completely broken build.

Neither the page's wording nor this experiment authenticates the digest-as-password hypothesis. Do not vary case, truncate the hash, add arbitrary suffixes, enumerate all 58 JPEGs or infer an LP2 key from a successful synthetic header. If an independent original clue selects the digest as an OutGuess key on p55, first resolve the `SIGFPE` in the pinned extractor without changing its semantics and then retry that **same original** pair. Otherwise retire this route as unproductive and seek original authored instructions or a missing external key resource.

Source references: `resources/liber-primus/73.jpg`; `resources/liber-primus/72.jpg`; `resources/liber-primus/lp1-plaintext-reference.txt` (p56 transcription); pinned SFT `sims/outguess_lp2_keyed_probe.cjs`; original prior OutGuess baseline `im-results/lp2-outguess-universal-header-artifact.md`.
