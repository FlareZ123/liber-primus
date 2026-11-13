# Signed-2016 MAP key: original-JPEG OutGuess extraction gate

**Agent 47, 13 November 2026. Classification: source-motivated finite negative.** The literal signed-source passphrases `map` and `MAP` recover **no recognizable payload** from the 58 original LP2 JPEGs or the actual authenticated 2016 image. The apparent success headers on every LP2 page are demonstrably false-positive indicators: the same exact keyed extractor also reports internally consistent payload headers on a purpose-built JPEG with no hidden payload. No unknown LP2 plaintext, genuine key, or destination was recovered.

## Why this operation was selected

The genuinely OpenPGP-signed 2016 Cicada message carried by `resources/historical/cicada2016-4gq25.jpg` says *“Its words are the map, their meaning is the road, and their numbers are the direction.”* The image itself depicts the same tree as LP2 physical p32/p55. As documented in [the p32 tree source-gate](lp2-tree121-signed2016-source-gate.md), the original 121-runic p32 can be arranged as an 11×11 GP-prime matrix whose top-row and left-column sums give this image's actual **563×569** pixel dimensions. Its 81-runic central 9×9 and the adjacent p33 81-runic first red-delimited body differ in total GP-prime value by exactly **211 = M(71)+A(97)+P(43)**, as already established in [the p32/p33 source transfer](lp2-p32-inner9-p33-body81-source-transfer.md).

These independent source objects provide a human-facing reason to try `map` or `MAP` as a password to **OutGuess**, a steganographic tool Cicada demonstrably used on the genuine 2016 JPEG. The MAP=211 numerical relation was found retrospectively; neither original source explicitly instructs keyed OutGuess on LP2 images or prescribes a case for the password. This is a cheap source-selected operation test, rather than a claim that the password was authored.

## Exact original-carrier executions

The existing [manual OutGuess extraction workflow](../.github/workflows/lp2-outguess.yml) pins the maintained OutGuess source to commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` and exercises real historical known-payload and keyed-embed controls. The [shared single-file CJS runner](../sims/outguess_lp2_keyed_probe.cjs) was minimally extended to admit `custom_image: "2016"`, resolving to the unchanged preserved signed-image bytes. Its original 17–74 image addressing is unchanged; no arbitrary passwords, truncations, image crops, or key alterations were searched.

| Original carrier set | Literal passphrase | Attempts | Internally consistent nonempty headers | Recognizable candidate payloads | Interpretation |
| --- | --- | ---: | ---: | ---: | --- |
| LP2 source JPEG indices 17–74, all 58 originals | `map` | 58 | **58** | **0** | Uniform 2,863-byte false headers; each extraction opaque |
| Same 58 source JPEGs | `MAP` | 58 | **58** | **0** | Uniform 11,429-byte false headers; each extraction opaque |
| Signed 2016 JPEG, `4gq25.jpg` | `map` | 1 | **0** | **0** | SIGFPE, no output |
| Same authenticated 2016 JPEG | `MAP` | 1 | **0** | **0** | status 1, no output |

The 58 `map` outputs all report the same **seed 21221 / header length 2863**; the 58 `MAP` outputs all report **seed 27674 / header length 11429**. Across pages their individual hashes differ, but outputs are high-entropy and share long key-specific fixed leading and trailing byte sequences. No OpenPGP, ZIP, gzip, PNG, or sufficiently long printable-ASCII payload appears. Full opaque byte outputs and JSON result summaries are preserved as the individual workflow artifacts:

- [Original all-page `map` run 43445195566](https://github.com/FlareZ123/liber-primus/actions/runs/43445195566)
- [Original all-page `MAP` run 43445204023](https://github.com/FlareZ123/liber-primus/actions/runs/43445204023)
- [Signed-2016 `map` run 43445614701](https://github.com/FlareZ123/liber-primus/actions/runs/43445614701)
- [Signed-2016 `MAP` run 43445622364](https://github.com/FlareZ123/liber-primus/actions/runs/43445622364)

### False-header calibration and authentic positive controls

**For each literal key, the deterministic no-payload synthetic JPEG yielded an internally consistent, wholly opaque extraction header.** With `map`, its fake output was 35,643 bytes (seed 7079); with `MAP`, 13,797 bytes (seed 62234). Therefore the apparent 58/58 source-page header successes cannot authenticate any hidden message. None of the 118 original-carrier attempts supplied a recognized plaintext/payload signature.

On all four runs, the known historical default-key 2014 LP1 sources at original JPEGs 0 and 8 extracted and passed their independent historical-message checks. The runner also embedded a fresh 47-byte control under key `79` and recovered all 47 bytes exactly. These controls distinguish a functioning OutGuess program from a productive manuscript-specific password.

## Decision

This exact `map`/`MAP` OutGuess interpretation is closed for the original historical JPEGs and signed 2016 carrier. The already established numerical `MAP=211` p32/p33 relation remains open as a clue to a **different source-specified operation**, and the signed text remains authentic. Do not treat OutGuess header plausibility or uniform key-dependent high-entropy output as recovered ciphertext. A future key test needs an independent instruction choosing a new key/carrier or a recognizable, verifiable payload under that choice.

**Reproduction:** dispatch the existing workflow with `custom_password=map` or `MAP`; omit `custom_image` for 58 original LP2 images or pass `custom_image=2016` for the authentic signed image. The same workflow always performs real-payload, planted-key and no-payload JPEG controls. No new scheduled CI triggers were introduced.
