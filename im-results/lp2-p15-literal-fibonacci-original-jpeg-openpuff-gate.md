# LP2 original p15 Fibonacci keyword: one period-native OpenPuff JPEG test

**Decision (Agent8, 18 November 2026):** No concealed file recovered under this exact first-party-clue password/carrier/depth assignment. This is a single bounded original-byte negative, not a verdict on p15's arithmetic or all possible image steganography. **No new unknown LP2 plaintext or key.**

## Human-readable route and rival

Physical LP2 p15 is scan `resources/liber-primus/32.jpg`. Its red-centered 4×4 numeral spiral is independently solved as `abs(3301 − prime(F_n+1))` for the sixteen distinct initial Fibonacci indices. This permits a human solver to name the mathematical sequence **FIBONACCI** directly from the page, without ciphertext-scoring or a guessed word. Earlier Cicada 2014 material demonstrates native OpenPuff v4.00 hidden-file extraction and a known JPEG payload provides a separate calibration, making `FIBONACCI` as a candidate passphrase for the *same source page* a narrowly motivated experiment.

The weakest step is critical: **there is no original-page or signed first-party instruction saying to use the mathematical sequence's name as an OpenPuff password**. The rival is that the p15 grid encodes an ordinary numerical instruction and the image carries nothing under this steganography scheme. No claims about image payloads follow from the sequence alone.

## Exact original experiment

- **Carrier:** byte-unchanged physical p15 original scan `32.jpg` (and no other page, no multicarrier chain).
- **A-only password:** exact ASCII uppercase `FIBONACCI`; OpenPuff fields B/C disabled by its native defaults.
- **Tool:** verified original OpenPuff **v4.00** x86 Windows, pinning `OpenPuff.exe` Git blob `466e03c792075313ce533a5dc7a789e8a41209f9` and `libObfuscate.dll` `f3b1c3315f8286346416fefd6141410f422f2454`.
- **Format/level:** `Jpeg (Image)`, `1/2 (50%) - Maximum`.
- **Independently authenticated positive:** the pinned published 2014-compatible source JPEG, A=`12345678`, JPEG Maximum, recovered exactly the publisher's 35-byte `hidden.txt` (`Dies ist eine versteckte Nachricht!`), before testing p15.
- **Original target capacity after native level selection:** **2,960 bytes**.
- **Real native response:** `Task stopped: corrupted stream`; `native-corrupted-stream`; **0 extracted files**, no completion dialog. The Windows job completed successfully because the original negative and the exact positive control both executed, **not** because LP2 payload was found.

[Reproducible workflow](../.github/workflows/agent8-p15-fibonacci-single-original-native.yml) · [Completed original-byte Windows run **44267418796**](https://github.com/FlareZ123/liber-primus/actions/runs/44267418796) · [48-file native positive/original GUI evidence artifact **14411445618**](https://github.com/FlareZ123/liber-primus/actions/runs/44267418796/artifacts/14411445618).

## Cryptanalytic decision

Retire **only** this `FIBONACCI` → OpenPuff v4.00 → original p15 single-JPEG Maximum extraction. A different carrier, independently supplied passphrase or another extraction format requires its own source clue. There is no reason to create a password spelling, depth or carrier search around this failed postulated operator. The p15 number-grid derivation and the more promising need for an actual unknown-page reversible GP29 transformation remain open.
