# Original pp49–51 mirror fold versus solved-p56 512-bit digest

**Decision (16 November 2026): specific negative, no unknown plaintext.** Scans 66–68 show a bilaterally ornamented 32×8 table interrupted by a red 10-dot marker. Solved p56 has the same general 10-dot marker introducing a literal 128-character hexadecimal digest. Source motivator: the floral border suggests a horizontal reflection, and a further vertical reflection would reduce a 256-byte field to exactly 64 bytes. Neither reflection nor XOR nor a p56-digest receiver is explicitly instructed by the source, especially the vertical reflection; this is a bounded hypothesis.

Input `resources/liber-primus/lp2-grid-256.json` supplies original three-page token counts 80/104/72 and conditional base-60 byte values. The literal p56 digest is:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

For the 32×8 original byte table `T[r,c]`, calculate `H[r,c] = T[r,c] XOR T[r,7-c]` for 32 rows and four left columns (128 bytes), then `D[r,c] = H[r,c] XOR H[31-r,c]` for 16 rows and four columns (64 bytes). Row-major `D`:

```text
5dbac289d8058ae9e99a62d0030aa6e66f1f351071c7e7d4d6b919ebe2f8bac6b76083704c45d3fc2d605ecee1c740e60f6e5835c954558f638da93989b599ea
```

The double fold matches the published p56 digest at **1/64 byte positions** and differs on **278/512 bits**. The one-axis fold is 128 bytes with 50 printable ASCII values; the double fold has 20/64 printable ASCII values. Neither yields apparent readable plaintext.

The standalone source-exact CommonJS positive-controlled reproducer is [`sims/lp2_p49_bilateral_fold_p56_digest_sft.cjs`](../sims/lp2_p49_bilateral_fold_p56_digest_sft.cjs). It checks every radix-60 token, exact 80+104+72 page segmentation and 161 distinct source bytes, then constructs one 64/64 synthetic planted positive and a failed one-bit-tamper control. The original-source computation was independently executed against the fetched current repository data before script publication.

**Scope:** This only excludes a direct bytewise 4-way XOR mirror as a literal p56 digest recovery; it does not show a table cipher, a source-selected hash algorithm or an LP2 plaintext inverse. Further spatial key variants require an independently authored selector, not another unfixed symmetry sweep. The main scientific status in `results/README.md` is unchanged.
