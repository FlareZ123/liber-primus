# Printed 256-byte LP2 table as a direct RC4 key: original-input gate

**Status (15 November 2026): two bounded original-input RC4 consumers rejected, no recovered unknown plaintext, source key, or destination.** The printed 256-byte grid can hypothetically serve as a direct RC4 KSA key. The first study applies it to GP29 unknown page runes; the second applies it to three archived OutGuess **pseudo-payloads** already classified as source-forced-header artifacts. Neither yields prose or a usable next-stage file. The original LP2 images do not establish these as secret-message carriers, and the source supplies no visible instruction to choose RC4.

## Source and frozen proposal

LP2 physical pp49–51 print 32×8 two-character entries. The repository's canonical base60 interpretation yields exactly 256 bytes in printed row-major order: [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). A standard RC4 key may contain 256 bytes, so the table has an immediately testable **hypothetical** role as a complete RC4 KSA key. This key length alone does **not** provide a visible instruction to use RC4, and the base60 reading is an assumption.

Fix the key to all 256 printed bytes, standard RC4 KSA and PRGA, no added nonce, discard or key derivation. Convert output bytes to GP29 pads by `byte mod 29`. Test the following **eight** reversible original-cipher inverses across the 55 rune-bearing physical LP2 pp0–55, containing **12,956 unknown rune indices**:

- RC4 either continues across the book or resets at each physical page.
- Output is either a direct GP29 additive stream or a page-local ciphertext-difference stream, where the predecessor before each page's first rune is the zero field element.
- Both additive key signs are admitted; all modes invert and forward-encrypt exactly.

These choices are bounded for their direct key/cipher semantics. They do not purport to cover RC4 drop-N, a KDF, stream/key skips, non-GP encodings, doublet edits, or arbitrary keyed operations.

## Original result and positive control

The original ciphertext has IoC **0.0344783978645**. The eight decoded original candidates all retain near-random GP29 IoC, with extrema **0.0344623592555–0.0345262753762**, and their initial rune previews are nonsensical. The candidate values, which can be reproduced by the linked SFT, are:

| RC4 clock | Direct + | Direct − | Difference + | Difference − |
| --- | ---: | ---: | ---: | ---: |
| Book | 0.034502158 | 0.034512119 | 0.034472893 | 0.034477147 |
| Page reset | 0.034462359 | 0.034526275 | 0.034490087 | 0.034470974 |

For each of the eight models, a separately obtained solved-LP1 English transliteration was greedily converted to native GP tokens and encrypted under that exact model, then independently inverted. **12,956/12,956 planted GP runes were recovered exactly in every mode**, with recovered IoC **0.062154698**, as compared with the original source's **0.03448**. This is a strong correctness test for the finite invertible implementation and a bounded negative for native-GP English recovery. It is not evidence that an authentic LP2 solution must have this IoC or use this text register.

**Standalone reproducer:** [`sims/lp2_grid256_rc4_original_sft.cjs`](../sims/lp2_grid256_rc4_original_sft.cjs), using the two canonical source JSON files and [the independently solved LP1 textual control](../resources/liber-primus/lp1-plaintext-reference.txt). The first 32 candidate runes and per-model recovered control count are emitted for inspection; the positive control asserts exact roundtrip.

## Derived binary-artifact gate: OutGuess pseudo-payloads (15 November)

The above GP29 rune-stream trial has a distinctly different possible recipient: three **58,152-byte** files archived in the public [Wulfic/Cicada3301-Liber_Primus OutGuess corpus](https://github.com/Wulfic/Cicada3301-Liber_Primus/tree/main/data/outguess). These correspond to scan-file labels \`page_17.bin\`, \`page_21.bin\`, and \`page_43.bin\`. Their exact original preserved Git blob identities are \`dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6\`, \`58ba0c966954f2a02964995613a6ba93fca57425\`, and \`e4c94e1d285aff041276bf5c7bb1c265e987d93d\`, respectively. These are **exact bytes of archived derived blobs**, not independently authenticated embedded data. The [prior all-58 original-image header proof](lp2-outguess-universal-header-artifact.md) establishes that the LP2 JPEG coefficient-bit geometry forces the encrypted OutGuess header to `ffffffff` under **every** password, making the 58,152-byte `Default key` length a pseudo-length. It reproduced these same three Git blob identities and also found the identical 1,417-byte prefix in unrelated cover images. Thus these derived blobs are **known false-header extraction artifacts** under this codec/key rather than validated independent LP2 binary cipher recipients.

The three blobs share an **exact 1,417-byte prefix**. Since every proposed mode applies the *same, position-aligned RC4 keystream* to all three files, their decrypted first 1,417 bytes are necessarily identical under **every** key or drop. This window is **one repeated observation**, not three independent recipient confirmations. Only the differing suffixes could give genuinely separate file-specific predictions; the printable-header decision here does not use that independence. A **frozen 16-mode** candidate uses the source table's **all 256 bytes** as a standard RC4 KSA key, in four geometry readouts (printed row-major, full reverse, reverse each printed eight-cell row, and column-major) and four standard RC4 output drop lengths (0, 256, 768, 3072). For each mode, XOR the entire 58,152-byte source file with the RC4 keystream and examine its first 1,417 bytes. There is no guessed key, byte substitution, dynamic KDF, unknown offset search, or editing of the source binary.

- **All 3 frozen original Git blob IDs and lengths verified**, including shared prefix exactly 1,417 bytes.
- **16 distinct candidate common-prefix outputs (each repeated identically across all three files)** have between **253 and 256 distinct bytes** among the 1,417 positions, with ASCII printable fraction **0.369795–0.396613**, consistent with random-looking binary rather than a visible English message. Every 58,152-byte candidate output uses all **256 byte values**.
- A standard independent RC4 \`Key\` / \`Plaintext\` test vector decrypts exactly to the published \`BBF316E8D940AF0AD3\` ciphertext, and a separate planted 256-byte-grid-key positive round-trips. Thus the negative comes from source bytes and the finite operator choice, not a broken RC4 implementation.

The [standalone original-binary SFT](../sims/lp2_grid256_rc4_outguess_original_sft.cjs) fetches each frozen blob as bytes, validates its Git hash, and reports all 16 binary outputs without executing untrusted files. The [Windows successful original-source workflow 43736386856](https://github.com/FlareZ123/liber-primus/actions/runs/43736386856) passed all assertions and ran the full fixed family.

This **additional derived-byte calculation** excludes only readable first-window output for the exact 16 candidate direct RC4/XOR operations on the preserved pseudo-payloads. Because a genuine hidden-message input is unestablished, it is **not evidence against RC4 as a possible LP2 cipher**. A differently keyed original OutGuess payload, alternate byte encoding, independent source KDF, or cipher other than RC4 is outside it. Critically, a common 1,417-byte header by itself is compatible with a tool-extraction artifact, so its presence cannot authenticate any original embedded message.

## Interpretation

The simple source-table-as-full-RC4-key interpretation under the specified direct-GP and ciphertext-difference operations yields no decryptions. A direct **256-element permutation state** is separately impossible on the exact same original table: both source-compatible byte interpretations contain only **161 distinct byte values**, so any full S-box / post-KSA RC4 permutation would require at least **95 changed cells**, regardless of secret global byte relabeling or order. See the [source-exact collision-invariant proof](lp2-p50-source-consumer-and-sbox-gate.md). Other **non-permutation** 256-element states, repeated-byte RC4 keys, alternate state transitions or independently selected binary consumers remain untested here, pending an original clue. Do not extend this negative to all stream ciphers or mistake the 256-byte coincidence for a cipher instruction. Further work should supply an independent algorithm/state clue and test a held-out original interval.
