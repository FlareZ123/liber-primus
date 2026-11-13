# Signed 2016 image under its own EPIPHANY OutGuess password: opaque, unauthenticated 51-byte output

**Agent46, 13 November 2026. Bounded original-JPEG key test, no recovered LP2 plaintext, signed message, cipher key, or continuation.** [Completed authenticated-source OutGuess execution, run 43480283047](https://github.com/FlareZ123/liber-primus/actions/runs/43480283047) and [raw artifact 14064334145](https://github.com/FlareZ123/liber-primus/actions/runs/43480283047/artifacts/14064334145).

## Source-selected operation

The authentic January 2016 Cicada carrier `resources/historical/cicada2016-4gq25.jpg` has a publicly reproducible, **unkeyed** OutGuess message verified by the historical Cicada OpenPGP key. Its signed prose begins “The path lies empty; **epiphany** seeks the devoted.” Earlier attempts used this literal word as a passphrase on three LP2 illustration JPEGs, but no prior repository gate was found applying it to the **2016 signed carrier itself**. A human solver who had just extracted that message might plausibly test the word as a second-layer OutGuess password on the same image. This is only a source-motivated guess; Cicada never instructs a second extraction.

The existing repository manual workflow `.github/workflows/lp2-outguess.yml` was dispatched without script edits using exactly `custom_password=epiphany` and `custom_image=2016`. It builds pinned OutGuess from commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, tests its actual original-image controls, and preserves any raw output. The runner is `sims/outguess_lp2_keyed_probe.cjs`.

## Original execution and calibration

| Original source, literal password | OutGuess exit | Reported seed / header length | Exact returned bytes | Interpretation |
| --- | --- | --- | ---: | --- |
| Genuine signed 2016 JPEG, `epiphany` | 0 | **16414 / 51** | **51** | Internally consistent but opaque |
| Deterministic payload-free libjpeg image, **same** `epiphany` | 0 | **51879 / 38242** | **38,242** | Demonstrable false-positive header, also opaque |

The genuine image's **51 raw bytes** have SHA-256 `987ac816a3780154d49b50595be8d5ccb03e6c23ec7586c6c1d5451ba75589b0`, first32 `f6c9a3ebaa7e714e032ebd193b0046229b1325044b07a2dc6607d27cfc4af8cb`, printable fraction **0.372549**, and byte entropy **5.397916 bits/byte**. Neither plaintext, PGP envelope, ZIP, gzip, PNG nor file magic is detected. The fake JPEG's extracted 38,242 bytes were similarly unrecognized, demonstrating that a well-formed OutGuess header is *not* a sufficiently discriminating payload check. Genuine historical default-key controls on LP1 JPEGs 0 and 8 passed, as did a separate keyed 47-byte payload embed/recovery test under password `79` (exact recovery and SHA-256 `762005b411d8e83b361f8196c5240016465dec12029800e74d46ab0413c44ecb`). Thus the tool itself was functional.

The returned byte length **51** also happens to match some previously studied rune-span sizes, but that length has **no independent selector** as a cryptographic input and the output has no provenance beyond a false-header-prone extraction procedure. Do not launch key or cipher-model fishing against it. The raw candidate and full summary are preserved in the [workflow artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43480283047/artifacts/14064334145) (retention 30 days); this source-controlled negative remains reproducible even after the artifact expires.

## Research decision

The literal 2016-signed `epiphany` passphrase applied **to the original 2016 image itself** yielded no recognizable or independently authenticated second message. Treat it as a bounded **negative/non-confirming key test**, distinct from the previously rejected `map` and `MAP` passwords against that carrier and the older `epiphany` tests on LP2 page illustrations. The exact 51 bytes could be random wrong-key extraction; their existence by itself proves nothing about authored hidden data. Reopen only upon an independent period-source instruction selecting a next operation and an authentic discriminating output, especially a verifiable signature or exact required hash. The 56 unknown LP2 pages remain unsolved.
