# Original p27 Fibonacci16 rune-key as native 2013 MP3/JPEG steganography password

**Agent12, 15 November 2026. Classification: source-derived single-password original-carrier tests. Native OpenPuff rejects one original MP3 setting, while OutGuess's original JPEG extractions terminate without files and share a misleading header on an unrelated carrier. No previously undeciphered LP2 plaintext, original hidden payload, authentic creator key, or final destination recovered.**

## Human-visible selector and one frozen candidate

The first-party original LP2 physical p15 (scan32) contains a Fibonacci-prime 4×4 square defining the sixteen distinct Fibonacci offsets

`F = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`.

After the p15 original 20-rune red heading, picking these sixteen offsets from the consecutive black ciphertext body of p15–22 and summing their published GP29 rune-primes gives **708**, itself printed in the p15 number square. The identical original pickup, restarted at the **19-rune red-heading boundary** on the independently illustrated p27 butterfly/wing chapter, picks the exact original rune indices

`[9,8,6,1,8,0,18,4,19,4,21,26,22,17,27,19]`

from the black p27–32 body. Their GP-prime sum is **761**, matching the period-original 2013 `761.MP3` filename, whose original ID3 title is *The Instar Emergence* and contains the already authenticated p57 PARABLE. The p27 wing and 2013 title provide an independently legible thematic link. These exact arithmetic correspondences and source photos were established in [the upstream Fibonacci pickup report](lp2-p15-fibonacci-body708-candidate.md); they were **discovered retrospectively** in a heavily searched corpus, so they are evidence for an experimental selector, not a creator-signed command.

A plausible literal hidden-data route is to concatenate the **sixteen extracted original GP rune names**, in order, exactly as conventional GP ASCII inventory labels, to form the single ASCII password

`NHGUHFERMRNGYOEBIAM` (19 ASCII bytes).

This candidate is distinct from using the two extracted sums as MP3 byte offsets or reducing audio bytes into a GP29 keystream, both already studied. A solver who acquired the 2013 audio and earlier Cicada's steganography utility could attempt this directly on its original MP3 file. The weakest premise is that **the authors never say to use a p27 ciphertext rune pickup as an OpenPuff password**; they may have intended the numerical relationship for a completely different purpose. No other passphrase spelling, offset, salt, bit level, file order, decode or parameter is selected by this test.

## Complete native original-carrier inverse

Run actual period-compatible **OpenPuff 4.00 on 32-bit Windows**, not a synthetic byte stream. Its exact version and executable are pinned via the already operational original-source workflow. Before checking the unknown original, the job retrieves original 2014 `interconnected.mp3` and uses the independently published 2014 OpenPuff password **`33011033`**, options B/C disabled and MP3 Maximum 1/2, to extract and authenticate the actual 745-byte original `magicsquares.txt`. This **known-source original positive control succeeded** before the unknown-target stage.

The candidate test then loads the unmodified, separately SHA-256-verified 2013 `761.MP3` with **A=`NHGUHFERMRNGYOEBIAM`**, B and C disabled, MP3 Maximum `1/2 (50%)`. It selects the real GUI carrier and TreeView bit level, invokes native `Unhide!`, and retains screenshots, selection/capacity metadata and the native error dialog. The original target is 4,010,732 bytes, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`.

**Actual result:** Native target selected capacity **976 bytes**. OpenPuff returned `Task interrupted: corrupted stream` (`native-corrupted-stream`) rather than a file or meaningful plaintext. The Windows job itself completed **successfully** because both the independently authenticated 2014 positive and the original target's native data-level result were obtained; `success` is not an LP2 payload success. This is a verified **negative at one exact key/setting**, not proof that the original MP3 contains no hidden data under another source-selected operation.

Original-experiment evidence: [successful Windows Action run **43689580924**](https://github.com/FlareZ123/liber-primus/actions/runs/43689580924), target native log `SOURCE GATE: native-corrupted-stream`, `CAPACITY BYTES: 976`; [complete 40-file GUI result artifact **14152310252**](https://github.com/FlareZ123/liber-primus/actions/runs/43689580924/artifacts/14152310252). The exact [one-password original-rune SFT](../sims/lp2_fib761_openpuff_password_sft.cjs) asserts both Fibonacci selections, source prime sums and exact candidate password. The [manual Windows native extraction workflow](../.github/workflows/agent12-fib761-original-openpuff-manual.yml) includes authenticated tool/carrier downloads, genuine 2014 positive, original target inverse and evidence upload.

## Separate original JPEG source test using historically demonstrated OutGuess

The signed 2016 Cicada steganography carrier uses ordinary historical **OutGuess 0.4** JPEG extraction. A distinct source-fixed reading of the **same** p27 Fibonacci16 ASCII password tests three unmodified original LP2 JPEGs, without fitting a second password or scan phase: physical p27 `44.jpg` (wing/instar image), physical p55 `72.jpg` (its uniquely repeated terminal `DJU-BEI` marker), and an unrelated original p0 `17.jpg` as the false-positive carrier control. All retain their original pixels and file bytes.

The manual Actions job checks out and builds pinned OutGuess source at Git commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`. Its genuine **2016 signed image** original positive extracts the exact **1,136-byte** OpenPGP text with SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`. A separate **47-byte** planted payload is embedded into a copy of original `44.jpg` under **the very same password** `NHGUHFERMRNGYOEBIAM`, then recovered bit-for-bit. Thus both authentic historical extraction and the candidate-key native embed/recover are validated before the unknown images are inspected.

Every unmodified candidate reported the exact same misleading, key-dependent retrieval header **`seed: 39007, len: 64016`** despite visibly different images and lengths:

| Original JPEG | Actual source role | OutGuess exit/result | Apparent header | Extracted file |
| --- | --- | --- | --- | --- |
| p27 `44.jpg` | wing/2013 Instar thematic selector | Terminated by **SIGFPE**, exit status null; no complete extraction | seed39007/64016 | **0 bytes** |
| p55 `72.jpg` | repeated final p27 phrase | Process ended with null exit status; no complete extraction | seed39007/64016 | **0 bytes** |
| p0 `17.jpg` | independent unrelated original-image negative carrier | Process ended with null exit status; no complete extraction | seed39007/64016 | **0 bytes** |

The repeated seed and length across an unrelated original p0 image are **not independent evidence for a shared hidden file**. No genuine complete payload, signature, file header or plaintext could be checked. These runs are properly **inconclusive native crashes as an absence-of-payload test**, while the shared header defeats the weaker claim that OutGuess's apparent header alone is positive evidence. All three source-image invocations actually terminated under native **SIGFPE** (floating-point exception), with no recovered files, while both authentic and planted positive controls passed. The initial job had omitted the OS termination signal and misleadingly appeared to be a timeout. The signal-aware independent full original rerun [43690573792](https://github.com/FlareZ123/liber-primus/actions/runs/43690573792) confirmed exactly **SIGFPE for all three**, zero source payload bytes, shared false-looking header and no execution timeout or valid wrong-password verdict. This is a native crash, not a cryptographic rejection. There is no reason to brute-force additional image/key variants from this candidate.

[Source-pinned OutGuess test](../sims/lp2_fib761_source_outguess_original_sft.cjs) · [manual native workflow](../.github/workflows/agent12-fib761-outguess-original-manual.yml) · [successfully completed job **43690141100**](https://github.com/FlareZ123/liber-primus/actions/runs/43690141100) with the exact successful controls and three confirmed original SIGFPE crashes · [revised signal-aware JSON artifact **14151739601**](https://github.com/FlareZ123/liber-primus/actions/runs/43690573792/artifacts/14151739601).

## Research decision

Retire **the one p27 Fibonacci-rune-name password under native OpenPuff 4.00 MP3 Maximum1/2 on original 761.MP3**. The corresponding pinned OutGuess p27/p55/p0 JPEG tests provide no recovered bytes and exhibit identical apparent retrieval headers across selected and unrelated originals; leave the absence of a hidden original-JPEG file **unproven** after the three confirmed SIGFPE terminations. The negative says nothing about a different author-issued password or tool, and there is no original manuscript instruction selecting a larger search around this key. Preserve the independent 708/761 source arithmetic as speculative rather than spending resources on password variants. A breakthrough still requires authenticated unknown-page plaintext, a recovered key, a selected decoding operation or a different original payload which independently validates its intended route.
