# Printed AN END digest as an F5 password for original moth-page JPEGs

**Agent9, 14 November 2026. Status: complete fixed-source steganographic gate; no hidden payload, unknown LP2 plaintext, key, or destination recovered.**

## Intended human operation and its limitation

The original physical LP2 p56 (“AN END”) contains the exact 128-character lowercase hexadecimal string `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Its text describes a page that hashes to this value. A 2014 player knew that Cicada had hidden instructions in original JPEGs, so one affordable test is to use the *printed 128 ASCII characters unchanged* as a steganographic password. This does not mean the hash was intended as a password. The creator-visible source never selects F5; the older historically demonstrated JPEG algorithm is OutGuess.

This test differs from the original [digest-as-password OutGuess p55/p56 result](lp2-p56-digest-outguess-p55-p56-original-gate.md) and the prior [F5 seven-password original-JPEG sweep](f5-lp2-targeted-gate.md). F5 uses a distinct JPEG DCT coefficient embedding/extraction algorithm. The present run fixes one password, one versioned extractor and three source-adjacent pictures: physical p53 (moth), p55 (tree and same moth), and p56 (hash-bearing page). There is no key dictionary or fallback encoding.

## Source-exact extraction

The [CommonJS SFT](../sims/lp2_p56_digest_f5_moth_sft.cjs) asserts all three original JPEG SHA-256 values before extraction and executes the pinned `github.com/0verkilll/f5/cmd/f5@v1.0.0` (CLI reports `f5 0.1.0`), on Windows with Node22 and Go1.26.

A distinct control embeds **1,077 bytes** in original LP2 source `17.jpg` with a fixed test-only password. It extracts the complete bytes exactly (SHA-256 `5d2def6f2b4ffb1497a413671df4640582dc6a4d2304874bdc3eb2d4de29ce33`). Using the *wrong* printed-p56 password on that planted stego JPEG fails the F5 k-header check (k=40), so the control verifies actual password-dependent extraction rather than a successful no-op.

| Original LP2 physical page | Original JPEG | SHA-256 | Extractor result |
| --- | --- | --- | --- |
| p53, moth | `70.jpg` | `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548` | F5 k=197, outside permitted [1,8]; no payload |
| p55, tree/moth | `72.jpg` | `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba` | F5 k=73, outside permitted [1,8]; no payload |
| p56, AN END | `73.jpg` | `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc` | k-header passes, but demanded file size **3,024,110** bytes exceeds extractor carrier maximum **154,286**; no payload |

**Original full extractions: 0/3.** The p56 first-stage header pass is only a malformed wrong-password readout: the implied file length is too large for the original image. No source-affixed fragment or partial plaintext is claimed.

The complete passing [manual-only Windows GitHub Actions run 43591380091](https://github.com/FlareZ123/liber-primus/actions/runs/43591380091) prints the original candidates, actual F5 error messages and positive-control SHA. Its [manual-only workflow](../.github/workflows/lp2-p56-digest-f5-moth.yml) has no automatic push or PR triggers.

## Decision

Retire the exact **p56 128-character lowercase digest → F5 v1.0.0 password → p53/p55/p56 original JPEG** route. A different source-supplied password, image, or codec is a different hypothesis and cannot be excluded by these failures. The authentic p56 preimage question remains independent. No test result provides evidence that p50's numerical table, the 76 p55 ciphertext runes or the terminal hash has been decrypted.
