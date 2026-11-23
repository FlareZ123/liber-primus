# Authenticated 2016 red-caption phrases as direct OutGuess keys on original 2014 JPEGs

**Agent28, 23 November 2026. Classification: original-image direct extraction attempt with key-authentication controls. Outcome: no recognizable hidden instruction, creator-selected key, original unknown LP2 plaintext, or destination.** This resolves one finite, historically executable use of a genuine later Cicada clue without claiming that the red headings have been deciphered.

## Proposed human solve path and source-selected scope

Cicada demonstrably used **OutGuess** on JPEGs during earlier rounds and again on the signed January 2016 `4gq25.jpg`. Its authenticated 2016 statement contains five contiguous phrases whose ordered GP29 word-lengths match original **red** 2014 LP2 captions. The full 43-word signed-message / all-14-red-caption length census, with a source-word-order control and the limitations of claiming plaintext from matching lengths, is independently documented in [the existing all-red caption report](lp2-p0-2016-epiphany-title-crib-gate.md). No decrypted heading is assumed here.

A low-cost, 2014-executable candidate next action is to use the **literal source wording**, including its original spaces and uppercase spelling, as the `outguess -k` password on the **same 2014 original JPEG** that prints the matching red caption. It uses one single source page and one literal phrase at a time. This is a hypothesis about password placement, **not an authenticated OutGuess instruction**.

All six matches were frozen before reading extraction results:

| Source red caption location | Original JPEG | Literal signed-source password | Actions run |
| --- | --- | --- | --- |
| LP2 p0 first two red words, 8+5 | `17.jpg` | `EPIPHANY SEEKS` | [45160636012](https://github.com/FlareZ123/liber-primus/actions/runs/45160636012) |
| LP2 p15 red pair, 4+5 | `32.jpg` | `LIES EMPTY` | [45160760414](https://github.com/FlareZ123/liber-primus/actions/runs/45160760414) |
| LP2 p15 following red triple, 4+2+5 | `32.jpg` | `WILL BE FOUND` | [45160776801](https://github.com/FlareZ123/liber-primus/actions/runs/45160776801) |
| LP2 p33 red pair, 2+8 | `50.jpg` | `THE DIRECTION` | [45160795771](https://github.com/FlareZ123/liber-primus/actions/runs/45160795771) |
| LP2 p33 second red pair, 3+5 | `50.jpg` | `ITS WORDS` | [45160812819](https://github.com/FlareZ123/liber-primus/actions/runs/45160812819) |
| LP2 p40 red pair, 3+5 | `57.jpg` | `ITS WORDS` | [45160831498](https://github.com/FlareZ123/liber-primus/actions/runs/45160831498) |

Exactly four source JPEGs and five distinct literal passwords are involved. This is **not** a general password sweep, a claim that all six captions contain those words, or an attempt to use later plaintext as a 2014-only clue.

## Executed, original-byte extraction

Reuse the existing pinned [OutGuess original-JPEG workflow](../.github/workflows/lp2-outguess.yml) and its read-only [keyed extractor](../sims/outguess_lp2_keyed_probe.cjs); select a single `custom_password` and `custom_image` per manually dispatched run. The workflow builds upstream OutGuess at commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`. Every run checks (a) exact recovery of a known-key, authentically embedded local payload, and (b) default-key recovery of the already solved original Cicada images 00 and 08. Each single-key run also applies the *same literal key to a deliberately empty, generated libjpeg carrier* as a false-header control.

The original source JPEG SHA256 values are `17.jpg 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`; `32.jpg 5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`; `50.jpg 13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d`; `57.jpg 3f5af995b39f94f268d4aa94825a10f2429f4a3affa1921a7f627e6d1bfcfb69`. Source numerals, artwork, and original text were never rewritten.

| Source/password | OutGuess status | Reported seed / extraction bytes | Extracted SHA256 | Entropy bits/byte | Type recognition |
| --- | --- | --- | --- | --- | --- |
| 17 / EPIPHANY SEEKS | 0 | 37534 / **25,424** | `a580917057a035a7707250d666a6e9924581b3d3e75e42e2e244e4f2f6e1f7eb` | 7.993706 | none |
| 32 / LIES EMPTY | 0 | 24931 / **27,566** | `9dcbf8c75b28ad9f5b022addd12be6ea65117c886d63b5f56af43a49d9058cd8` | 7.993700 | none |
| 32 / WILL BE FOUND | 0 | 25236 / **44,800** | `98a46dd65a1e69b6498422e6783875c6c4ffb278d7a3459113fe8ec0150675b6` | 7.996343 | none |
| 50 / THE DIRECTION | **SIGFPE** | none | no output | n/a | no successful extraction |
| 50 / ITS WORDS | 0 | 11183 / **36,616** | `61f13c7f156975002e1457505fc80dd32870e44b4901c9f3cd799290fcbefb21` | 7.994601 | none |
| 57 / ITS WORDS | 0 | 11183 / **36,616** | `1eb7d6b39ad1025ad0b50ed63bcc6d442349741de8f2358c8aa15aa403cfe212` | 7.994960 | none |

All six workflows completed green, meaning the extractor, instrumentation, and positive controls ran as designed; the p33 `THE DIRECTION` OutGuess subprocess itself **terminated with SIGFPE**, so its extraction is indeterminate. Five other extractions return high-entropy binary. None begins with a recognizable PGP, ZIP, gzip or PNG header and none is printable prose.

**The raw output alone is demonstrably a weak positive.** Every one of the five literal passwords also returned a seed, length and apparently valid nonempty binary payload from the generated **no-payload** JPEG. Thus an OutGuess success code or self-consistent extracted length does **not** authenticate a hidden message in the manuscript.

## Same-password original-page false-positive control

The identical literal password `ITS WORDS` is independently matched to **two** original red captions, p33 and p40, so testing both presents a rare source-selected same-key experiment without inventing a key or second target. Both produce **exactly the same seed 11183 and extracted length 36,616**, despite different source JPEGs and distinct binary SHA256s. Their first **1,008 extracted bytes** and last **534 bytes** are bitwise identical. Across the entire extracted 36,616-byte pair, **2,363 bytes (6.45346%)** occupy equal byte positions. The pairwise XOR contains that exact leading all-zero 1,008-byte run and terminal all-zero 534-byte run; its 256-value entropy is approximately **7.81352 bits/byte**. These checks were computed on the two exact [preserved raw run artifacts](https://github.com/FlareZ123/liber-primus/actions/runs/45160812819/artifacts/14810448256) and [p40 artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45160831498/artifacts/14810876693), independent of the extractor's own recognition flag.

To test whether this relationship proves the two genuine pages share a hidden source, rerun the **same password `ITS WORDS` on the unrelated p0 `17.jpg`** as a source-negative control. That [successful run45161217904](https://github.com/FlareZ123/liber-primus/actions/runs/45161217904) likewise returns **the exact same seed and 36,616-byte length**, again with a different SHA256, and the same first and last32 bytes. Comparing actual raw bytes:

| Original JPEG pair, same password `ITS WORDS` | Equal positions / 36,616 | Identical prefix | Identical suffix |
| --- | --- | --- | --- |
| p33 (50) versus p40 (57), two apparently matched red captions | **2,363** | **1,008 bytes** | **534 bytes** |
| p0 (17) versus p33 (50), unrelated original control | **2,773** | **1,138 bytes** | **534 bytes** |
| p0 (17) versus p40 (57), unrelated original control | **2,821** | **1,008 bytes** | **1,445 bytes** |

The source-unrelated control reproduces the same, or larger, deterministic-looking overlaps. Consequently the matching 1,008-byte prefix and identical seed/length are **not evidence of shared hidden prose, an authored p33/p40 key, or a cryptographic two-time-pad**. The extraction is partly carrier-dependent, but these coincidences are compatible with the existing decoder returning high-entropy material from JPEGs that have no known OutGuess payload. Because the synthetic control also emits fake plausible headers, **no message is authenticated by these features**.

## Cryptanalytic decision

The entire source-word-shape-matched, case-preserving `outguess -k` interpretation yields **zero recognizable original-message payloads in six fixed primary trials** and no independent sign that five binary outputs were intentionally embedded. The sixth subprocess crashes and cannot be counted as a missing payload. This is a **bounded failure of a specific 2016-message→red-caption→JPEG-password continuation**, leaving encrypted/untyped stego, other passwords, other embedding algorithms, the original red-caption plaintext and the main LP2 cipher unresolved.

Do not promote any of the apparent OutGuess seed/length matches to evidence of hidden pages or reuse; the original and empty controls show they are not diagnostic. The causal next step, if any, would require **an independently selected stego key plus a typed, verifiable payload** or an original-caption plaintext recovered by a complete reversible cipher. No additional key-variant search is licensed by these outputs.

**Reproduction:** each table row is an already executed manual dispatch of the repo's existing `lp2-outguess.yml` with exactly the indicated `custom_password` and original `custom_image`. All log records retain the literal key, source, seed, output SHA256, first/last32 hex and empty-carrier calibration; the original raw binary extracts are preserved as 30-day Actions artifacts at the linked run pages. Same-key byte-equality figures follow by direct comparison of those authenticated run artifacts, independent of any plaintext or guessed key.
