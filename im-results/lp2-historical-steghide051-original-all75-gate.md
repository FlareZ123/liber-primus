# Entire original archive: Steghide 0.5.1 JPEG magic and source-key gate

**Agent41, 13 November 2026. Bounded original-byte negative.** No new plaintext, authentic key, image payload or continuation destination recovered.

## Why this different wire was checked

Early Cicada challenges demonstrably used password-protected JPEG steganography. The repository had substantial OutGuess, JSteg and JPEG-level investigations, but no indexed complete-image test of Steghide v0.5.1's password-specific 24-bit embedded magic. Steghide 0.5.1 is a historically available JPEG embedding system and its exact magic prefilter can distinguish an image-carried message without scoring candidate English. The manuscript does **not** select Steghide or one of the following passwords: this is a finite historical-carrier experiment, not a claimed decipherment mechanism.

The implementation uses the independently measured Steghide 0.5.1 wire from [stegostudio commit 201689b5](https://github.com/rickschaves/stegostudio/tree/201689b5755c0f1267223cd881429e679230b835), GPL-3.0, loaded at runtime. The external 2026 implementation reproduces a 2014-available format; it is not assumed to be Cicada-authored.

## Exact test

Read original archive images 00.jpg–74.jpg inclusive, with **no decompression/recompression cycle before coefficient parsing**. For each image compute the authenticated implementation's nonzero DCT coefficient parity EValues once. For each of ten ASCII passwords, compute the exact Steghide v0.5.1 selector state and test the original **24-bit 0x73688D magic**. On any hit, attempt the upstream header identifier and actual supported-mode payload recovery with original ciphertext bytes.

Passwords: the empty string plus nine source phrases preserved with original case: 3301, 7A35090F, FOLD, epiphany, THE PRIMES ARE SACRED, THE TOTIENT FUNCTION IS SACRED, Liber Primus is the way, LET THE TEXT GUIDE YOU, SOME WISDOM. No dictionary scan or fit to extracted English.

**Positive control:** the original third-party **Steghide Win32 v0.5.1 AES-CBC JPEG** oracle fixture, whose encoded payload was generated independently using the historical application binary, verifies with the correct password and rejects the wrong one. The complete authenticated original hidden payload of **160 bytes** is recovered byte-for-byte; SHA-256 **915cd08344c74b2abd39efc84f85be62cd45ad2ccef40737386067f083103ee9**. This tests file framing, selector parity, password, cryptographic operation and exact recovered bytes.

**Original archive:** 75 source JPEGs × 10 passwords = **750** magic-check attempts; **0** historical Steghide magic hits, **0** validated headers, and **0** extracted messages. JPEGs with unusual image components remain subject to the supported upstream parser's restrictions. An arbitrary unknown password would remain undetected.

The [single-file CommonJS reproducer](../sims/lp2_steghide051_original_carrier_gate.cjs) implements an exact 24-bit magic prefilter and calls the upstream identifier and full decoder for any positive. The [manual Windows CI](../.github/workflows/lp2-steghide051-original-manual.yml) checks out the decoder's exact pinned commit. [Successful original-byte GitHub Actions run 43405007020](https://github.com/FlareZ123/liber-primus/actions/runs/43405007020) prints every image and result, including the fixture and all 75 original scans.

## Decision and remaining possibility

This retires one complete-source corpus scan with these ten historically meaningful passphrases under **Steghide 0.5.1's authenticated selector**. It neither excludes Steghide with an unknown key nor establishes anything about the manuscript's GP29 cipher. The complementary [historical JPHide v0.5 whole-archive gate](lp2-historical-jphide-v05-original-all75-gate.md) also found no verified header under its nine source-literal passwords.

Do not expand this into guessing unlimited passwords. An independent cipher clue selecting a Steghide password or hidden-message carrier would materially change the research decision.
