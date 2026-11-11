# Exact 2013 761.MP3 XOR applied to the signed 2016 tree JPEG

**Result (11 November 2026): bounded negative.** The historically demonstrated 2013 use of the byte-preserving `761.MP3` as an XOR pad does **not** expose a recognized file container when applied once, byte-for-byte from offset zero, to the byte-pinned 2016 `4gq25.jpg`. The reversible output is preserved with its exact SHA-256; no unknown LP2 plaintext, authentic key, deciphering operation or continuation was recovered.

## Independent source selection and strongest objection

The 2013 Twitter-stream stage used an original Cicada MP3 byte stream as an XOR operand to expose a JPEG and eventually the Gematria Primus table ([2013 source/walkthrough, prior audit](audio-761-pad-scan.md)). The independent 2016 release publishes `4gq25.jpg`, a tree image whose OutGuess content is signed with the recognized Cicada key ([pinned 2016 source](../resources/cicada2016-4gq25.md)). A human retaining the earlier XOR rule could apply it directly to this later image. Its strongest objection is that the 2013 XOR was stage-specific: the 2016 image already has its own verified OutGuess delivery.

This task tested **only** the frozen historical byte operation: `output[i] = 2016_jpeg[i] XOR original_full_mp3[i]` for `0 ≤ i < 26342`. There was no ID3 strip, byte offset optimization, pad cycling, reversal, PCM decoding, fragment scanning, arbitrary key schedule or post-hoc header correction. This distinction matters because the original MP3 has an ID3 header at byte zero.

## Original sources and exact computation

- 2013 `761.MP3`: immutable external archive `rtkd/iddqd` commit `f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, path `2013/02/761.MP3`. **4,010,732 bytes**, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`; starts with ASCII `ID3`. This is the complete original file, not the separately investigated 4,010,526-byte audio payload.
- Signed 2016 JPEG: `resources/historical/cicada2016-4gq25.jpg`; **26,342 bytes**, Git blob SHA-1 `22027296dcd7df53c5127e6aadbabeaf3223f72d`, SHA-256 `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe`; starts `FF D8 FF`.
- Wrong-carrier control: original LP2 scan `resources/liber-primus/49.jpg` (physical p32); **362,637 bytes**, SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`. It is another ordinary JPEG and uses the same frozen MP3 bytes and offset.
- Code: [exact single-file CJS gate](../sims/cicada761_2016_tree_xor_gate.cjs), callable via manual-only [historical audio workflow](../.github/workflows/audio-761-pad-scan.yml), probe `xor-2016-image`. The code asserts source byte identities, computes both complete XOR outputs, checks common file signatures, asserts that XORing back recovers every source byte, and saves the original resulting bytes.

## Observed original and wrong-carrier outputs

| Measurement | 2016 signed tree | Wrong p32 JPEG |
| --- | --- | --- |
| XOR output bytes | 26,342 | 362,637 |
| First 32 hex bytes | `b69ccce300104a464802545959580001008d0000ff8b6131616a6a632737293d` | `b69ccce300104a464802545959590190011c0000ffb26b5228212f3a70636373` |
| SHA-256 | `5db4bd483bd3cb7b3d39753f32e67497d0c03e264ec0aff91441c635c6a2bbfa` | `dff4fd2a7e848226ceb9ed4bbc42389cf2a8e80d24f130658b88faf64f9c9e2c` |
| Known container magic (JPEG/PNG/GIF/ZIP/GZIP/PDF/7z/RAR/Ogg/ID3/SQLite/ELF/ASCII PGP) | none | none |
| XOR twice restores source | 26,342/26,342 | 362,637/362,637 |

The shared first three output bytes `B6 9C CC` are predicted without a search by `FF D8 FF XOR 49 44 33`, explaining why a generic JPEG under this complete-file pad shares the same unrecognized prefix. Source JPEGs already represent a known file container; a useful standard-file extraction would normally require a recognizable *new* structure or independently supplied byte layout.

**Executed manual CI:** [successful run 43082017371](https://github.com/FlareZ123/liber-primus/actions/runs/43082017371), using the two original full byte files. Both exact outputs were uploaded as [artifact 13883659006](https://github.com/FlareZ123/liber-primus/actions/runs/43082017371/artifacts/13883659006), with GitHub's artifact ZIP digest `26b35b182083aa3c47be906a3feeced2cfdbb135031aa72ce185f09ead43a3e6`. The first CI attempt [43081908991](https://github.com/FlareZ123/liber-primus/actions/runs/43081908991) failed before execution on a JavaScript syntax typo (numeric-leading object key); it was corrected before this successful run. No computational result was taken from the failed attempt.

## Interpretation and stop

The frozen offset-zero full-MP3 cross-round pad produces **no recognizable file-header payload**, and the negative result behaves like the unrelated JPEG control. Inverting the same operation proves correct implementation and input preservation, but does not prove a message should be encoded by it. No success criterion involving authentic plaintext, independently specified key, or source-selected continuation is met.

This retires **only** the direct full-file offset-zero historical MP3 XOR transfer to the signed-2016 image as an ordinary file-container recovery mechanism. A deliberately headerless cryptographic blob, an embedded code requiring its own independently sourced format, or some different Cicada-prescribed transform lies outside the test. Further offset/PCM/byte-skip sweeps would require a new original clue; the broader original-MP3 pad-to-LP2 rune experiments are already bounded in [the audio audit](audio-761-pad-scan.md).
