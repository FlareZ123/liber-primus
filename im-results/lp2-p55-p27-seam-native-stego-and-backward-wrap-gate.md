# LP2 p55→p27 original seven-rune seam: native stego and anchored original plaintext gates

**Original-source experiment, 15 November 2026, Agent 1.** The already known p55/p56→p27 seven-rune ciphertext seam spells the historically valid **eight-character OpenPuff key `DJUBEIAE` without appending an extra glyph**. Its printed one-rune continuation spells `DJUBEIAEF`. Native OpenPuff v4.00 and historical OutGuess extraction against original wing/moth JPEGs with both keys yielded no authenticated hidden payload. A distinct p27-source-aligned additive inverse on all 76 p55 ciphertext runes yields no coherent plaintext. These are finite exclusions of exact proposed consumers; the source navigation remains unresolved.

## Why these exact sources and operations

Physical LP2 p55 (original scan `72.jpg`) ends with the **two complete printed ciphertext words `D J U - B E I`** at page-local rune offsets70–75. Original physical p27 (scan `44.jpg`) has exactly the same source symbols at its rune offsets28–33, near an insect-wing drawing. The terminal p55 image includes a moth, an original-art thematic link. The independently solved adjacent p56 starts with `AE`, which **also** equals p27 offset34. The seven-rune seam is already eight ASCII characters, because GP `AE` transliterates as two letters. The next p27 rune at offset35 is `F`, extending that exact match to an eight-rune, nine-character candidate:

```
p55 terminal        D J U - B E I        six original runes
p56 initial                       AE      one original rune
p27 offset 28–35    D J U - B E I AE F    eight original runes
Seven-rune ASCII:    DJUBEIAE             eight characters
Eight-rune ASCII:    DJUBEIAEF            nine characters
```

The exact original six-/seven-rune bridge and its unusual source-wide uniqueness were already established in [the p55/p27/p56 repeated phrase report](p27-p54-repeated-7gram-periodic-key-gate.md). The **new independent decision** is whether the shortest exact seven-rune source sequence, its one-rune extension, or the bridge-selected backward p27 source tape is an actual mechanism for plaintext recovery. A player familiar with the 2014 original OpenPuff stage could attempt the former with the author-visible insect-wing/moth images. A human might use the printed recurrence to align the latter without guessing a language phase.

**Weakest premise:** no Cicada-signed text specifies either bridge-derived sequence as an OpenPuff password or instructs reading p27 backward through a circular source tape. Both passwords are physically motivated candidates, without authenticated evidence of their cryptographic role. The native tests below exhaust only the stated images, orders and JPEG bit levels; no fitted byte decoder is introduced.

## Actual 2014 OpenPuff 4.00 JPEG tests

The [manual 32-bit Windows native workflow](../.github/workflows/agent1-p55-p27-seam-openpuff-jpeg.yml) reproduces the executable's pinned Git blob pair and uses the existing known-payload control. Every matrix job first retrieves the independently published original OpenPuff JPEG under the independent known password `12345678` at Maximum and **recovers the complete original 35-byte payload** `Dies ist eine versteckte Nachricht!` byte-for-byte. Only after the successful independent source-positive does it load one original LP2 2014 JPEG and set **A = `DJUBEIAEF`** (nine ASCII bytes), with OpenPuff B and C disabled. The original carrier, JPEG option and actual bit-level selection are recorded by the native GUI automation.

| Original scan / physical LP2 | Native JPEG level | Native displayed capacity | Native result | Files recovered |
| --- | --- | ---: | --- | ---: |
| `44.jpg` / p27 wing | Medium, 1/5 (20%) | **1,424 bytes** | `native-corrupted-stream` | 0 |
| `44.jpg` / p27 wing | Maximum, 1/2 (50%) | **3,568 bytes** | `native-corrupted-stream` | 0 |
| `72.jpg` / p55 moth | Medium, 1/5 (20%) | **1,216 bytes** | `native-corrupted-stream` | 0 |
| `72.jpg` / p55 moth | Maximum, 1/2 (50%) | **3,040 bytes** | `native-corrupted-stream` | 0 |

All four original runs reached the native modal `Task stopped: corrupted stream` error after verified source-carrier addition and bit-level selection; no file was produced. All four jobs concluded successfully as **experiments**, and every known-payload extraction prerequisite passed. Original-source result logs, GUI screenshots, and positive-control files remain in [run 43709099066](https://github.com/FlareZ123/liber-primus/actions/runs/43709099066), distinct original-target evidence artifacts **14159517663, 14159677274, 14159916554, 14159742053**.

The [source-derived password SFT](../sims/lp2_p55_p27_seam_openpuff_password_sft.cjs) checks both original exact seven-/eight-rune sequences, all original page lengths and the p56 seam, including the **shortest valid** `DJUBEIAE` ASCII length8 and the extended `DJUBEIAEF` length9. These finite negative tests do not prove that the original JPEGs contain no steganography.

## Shortest exact seven-rune bridge: native OpenPuff single-carrier result

The **original seven-rune match alone** is `D J U B E I AE`, ASCII `DJUBEIAE`. It meets historical native OpenPuff's **8–32 ASCII character A-field** constraint with no appended rune or chosen spelling. The [dedicated seven-rune native workflow](../.github/workflows/agent1-p55-p27-exact-seven-rune-openpuff.yml) recovers the exact independent 35-byte JPEG positive before testing each original source carrier. [Completed run 43710973874](https://github.com/FlareZ123/liber-primus/actions/runs/43710973874) has all four matrix jobs passing the positive control and reaching their actual original targets:

| Original scan / physical LP2 | Native JPEG level | Source capacity | Native target result |
| --- | --- | ---: | --- |
| `44.jpg` / p27 | Medium 1/5 | **1,424 B** | `native-corrupted-stream`, no output |
| `44.jpg` / p27 | Maximum 1/2 | **3,568 B** | `native-corrupted-stream`, no output |
| `72.jpg` / p55 | Medium 1/5 | **1,216 B** | `native-corrupted-stream`, no output |
| `72.jpg` / p55 | Maximum 1/2 | **3,040 B** | `native-corrupted-stream`, no output |

The original target and positive-control test scripts use the same pinned OpenPuff 4.00 exe/dll. The four failed original extractions are therefore interpretable finite negatives for this exact source-selected eight-character key.

## Two original JPEGs together under native OpenPuff

A hidden message split across a pair of carriers could fail the preceding single-file tests even under a correct password. The [original 2014 two-carrier plant](../.github/workflows/openpuff-v400-native-twocarrier-control.yml) proves native ordered multi-image recovery is supported. I used the two independently linked wing/moth originals as **one chain**, with both human-natural orders, at native JPEG Medium and Maximum. A real published 35-byte native JPEG positive is required in every matrix job before loading the originals. Original carrier chain count, order and actual selected bit level are checked inside the native GUI.

| Frozen candidate key | First → second original scan | JPEG level | Native original-chain result |
| --- | --- | --- | --- |
| `DJUBEIAEF` | 44→72 | Medium | `native-corrupted-stream`, no output |
| `DJUBEIAEF` | 72→44 | Medium | `native-corrupted-stream`, no output |
| `DJUBEIAEF` | 44→72 | Maximum | `native-corrupted-stream`, no output |
| `DJUBEIAEF` | 72→44 | Maximum | `native-corrupted-stream`, no output after successful known-positive rerun |
| `DJUBEIAE` | 44→72 | Medium | `native-corrupted-stream`, no output |
| `DJUBEIAE` | 72→44 | Medium | `native-corrupted-stream`, no output |
| `DJUBEIAE` | 72→44 | Maximum | `native-corrupted-stream`, no output |
| `DJUBEIAE` | 44→72 | Maximum | `native-corrupted-stream`, no output after successful known-positive rerun |

All **eight completed original two-carrier trials** (two exact source-derived keys × both image orders × Medium/Maximum) are supported by [extended-eight-rune run 43710807650](https://github.com/FlareZ123/liber-primus/actions/runs/43710807650) and [exact-seven-rune run 43711035278](https://github.com/FlareZ123/liber-primus/actions/runs/43711035278). Medium pair capacity was **2,640 bytes**, and Maximum pair capacity **6,608 bytes**. The first extended-eight-rune return/Maximum job failed its known-positive GUI test before source testing; its **successful attempt-two rerun** recovered the known control and reached a native original `corrupted stream` result. Likewise, the exact-seven-rune published/Maximum first attempt failed during the independent known-positive stage; its **attempt-two rerun recovered the known control and reached the original negative**. This separates transient native GUI instability from actual tested source-negative outcomes.

## Independently calibrated OutGuess-0.4 test of both source passwords

The repository's [pre-existing historical OutGuess keyed workflow](../.github/workflows/lp2-outguess.yml) accepts an exact supplied password and exact original-JPEG index. It was independently dispatched four times, once for each of the two original images under each of `custom_password=DJUBEIAEF` and `DJUBEIAE`. The keyed extractor recovered the exact **47-byte authentic original LP1 OutGuess known-key control** (`79`) in each successful run, and in both runs the independent **payload-free synthetic JPEG** also generated an apparently valid decoded OutGuess header.

| Original source JPEG | Tested key, OutGuess run | Apparent seed / length | Recognizable payload |
| --- | --- | --- | --- |
| `44.jpg` p27 | `DJUBEIAEF`, [run 43710193951](https://github.com/FlareZ123/liber-primus/actions/runs/43710193951) | **24559 / 42649 B** | None |
| `72.jpg` p55 | `DJUBEIAEF`, [run 43710197665](https://github.com/FlareZ123/liber-primus/actions/runs/43710197665) | **24559 / 42649 B** | None |
| `44.jpg` p27 | `DJUBEIAE`, [run 43710984114](https://github.com/FlareZ123/liber-primus/actions/runs/43710984114) | **58976 / 24149 B** | None |
| `72.jpg` p55 | `DJUBEIAE`, [run 43710988217](https://github.com/FlareZ123/liber-primus/actions/runs/43710988217) | **58976 / 24149 B** | None |

The two extended-eight-rune original pseudo-payloads have **identical first 32 and last 32 bytes** (`ef5f99a6930de102...` / `...c954fb95b8704ffc9388`) but different whole-object SHA-256 digests, respectively `36bfadecfa4d4735b234b41278d9cc0e48a44fa759c4b0c72039c7fbb13a1ae3` and `94c38a361be407b607b4b82c33f8f09c2dfd698a0461ab6e74d7a3eff2d57e47`. Measured printable fractions are **0.387371 / 0.386082**, and empirical byte entropies **7.995165 / 7.995479 bits per byte**. The shorter exact-seven-rune OutGuess pseudo-objects also have identical first/last 32-byte prefixes/suffixes across both original source JPEGs and no recognizable payload (SHA-256 original scan44 `2877e2ab005c78d868afd27ad975c0a81ea4226b0c074f22070507bd1c866c51`; original scan72 `12d816477e6eac25d48b2442bef8ed3cf1838772a64c4cfb2703851b60e29b86`; byte entropy **7.993488 / 7.992370 bits/byte**). None of the four object streams supplies independently recognizable PGP-signed or plaintext continuation. A “header-consistent” return is **not a success signal**: [the independently established original-LP2 universal-OutGuess-header mechanism](lp2-outguess-universal-header-artifact.md) proves the initial encrypted header on these JPEGs is forced `ffffffff` under every password, producing the same password-dependent seed/length even for nonembedded covers. The same-key payload-free synthetic control independently demonstrates false apparent completion.

**Interpretation:** neither tested source-derived key yields a verifiable historical OutGuess payload on either original scan. The two high-entropy pseudo-objects and their shared 64 bytes are cover-extraction artifacts without independent authentication; a separate message with the same forced header remains unexcluded.

## Distinct original p55 plaintext experiment: backwards tape from the exact anchor

The preceding six-rune footer match independently fixes one source-register alignment without language scoring: original p55 offsets70–75 equal original p27 offsets28–33. The additive-tape hypothesis is that a **circular 234-rune original p27 ciphertext register** serves as a running key for all 76 p55 ciphertext runes, with its key origin chosen entirely by the original match:

```text
K[i] = p27[(i − (70−28)) mod 234]
P[i] = (p55[i] ± K[i]) mod 29, i = 0..75
```

This differs from the previously tested **following-anchor** p27 offsets34–103 key against p55 offsets0–69. Here the key is read **before the matching p27 anchor** and circularly wraps once at the beginning of the 234-rune source page. Reading it as a circular source is unverified; the exact original anchor offset42 itself is fixed, not fitted to plaintext.

| Frozen complete 76-rune original inverse | IoC over 76 | IoC over **70 before anchor** | First decoded F at a non-F original cipher position | Readable original plaintext |
| --- | ---: | ---: | ---: | --- |
| `P = C−K` | **0.036491228070** | **0.029399585921** | **p55 offset12** | None |
| `P = C+K` | **0.031228070175** | **0.031055900621** | **p55 offset26** | None |

Original unchanged p55 IoC is **0.037894736842**; genuine already-clear p57 GP29 has IoC **0.062709966405**. Both full outputs are nonlinguistic. The subtraction output ends with six consecutive F runes because its input six-rune anchor matches identically, a guaranteed arithmetic consequence that cannot independently validate a cipher. Both decoded streams also **violate** the solved p56's known plaintext-F-transparent convention: a decoded plaintext F would be printed as ciphertext F, whereas the first forbidden F shown above occupies a source **non-F ciphertext** slot. This last contradiction applies only if the p56 F-bypass mechanism is transferred to p55.

The exact original inputs and both inverse readouts are asserted by [the Windows-compatible CommonJS SFT](../sims/lp2_p55_p27_bridge_backward_wrap_sft.cjs). It reconstructs **all 76/76** original p55 cipher rune values under each sign and separately encrypts/recovers **76 genuine solved-p57 GP source runes** for each source-aligned key. Such round trips validate the implementation, without validating a wrong key.

## Decision and research handoff

No previously unknown manuscript plaintext, signed original encryption key, authentic hidden JPEG payload, or destination was obtained. Retire **all eight** fixed A-only original-single-JPEG OpenPuff configurations, **all eight** fixed two-original-JPEG carrier-chain configurations under both orders and tested levels, the **four** same-key recognizable OutGuess payload interpretations, and the original-source backward circular GP29 additive key on p55. Two transient native known-positive GUI failures were rerun successfully; neither became an untested source row. The source p55→p27 bridge survives as a potential *map* clue. Reopening it for another binary or runic cipher requires a new original-art/signed-text instruction selecting that distinct consumer and a withheld original plaintext prediction; do not enlarge it by arbitrary password spelling or phase scanning.
