# LP2 terminal p55 to wing p27: original eight-rune bridge, native OpenPuff and anchored backward tape

**Original-source experiment, 15 November 2026, Agent 1.** Four actual period-compatible OpenPuff 4.00 tests on two original 2014 manuscript JPEGs completed with independently recovered control bytes and **zero** new hidden payloads. A distinct original-rune additive tape test using the same source-fixed cross-page anchor yields no recovered plaintext or authentic key. Both are finite exclusions of explicit consumers; the original p55→p27 text match remains a possible navigation clue.

## Why these exact sources and operations

Physical LP2 p55 (original scan `72.jpg`) ends with the **two complete printed ciphertext words `D J U - B E I`** at page-local rune offsets70–75. Original physical p27 (scan `44.jpg`) has exactly the same source symbols at its rune offsets28–33, near an insect-wing drawing. The terminal p55 image includes a moth, an original-art thematic link. The independently solved adjacent p56 starts with `AE`, which **also** equals p27 offset34. The next p27 rune at offset35 is `F`, completing an eight-original-GP-rune sequence:

```
p55 terminal        D J U - B E I        six original runes
p56 initial                       AE      one original rune
p27 offset 28–35    D J U - B E I AE F    eight original runes
ASCII rune labels:  DJUBEIAEF            nine characters
```

The exact original six-/seven-rune bridge and its unusual source-wide uniqueness were already established in [the p55/p27/p56 repeated phrase report](p27-p54-repeated-7gram-periodic-key-gate.md). The **new independent decision** is whether the full eight-rune source sequence is an actual steganographic password, or whether the bridge anchor selects a reversed-in-time p27 tape for p55. A player familiar with the 2014 original OpenPuff stage could attempt the former with the author-visible insect-wing/moth images. A human might use the printed recurrence to align the latter without guessing a language phase.

**Weakest premise:** no Cicada-signed text specifies this eight-rune string as an OpenPuff password or instructs reading p27 backward through a circular source tape. Its eligibility is a physically motivated candidate, not authenticated encryption knowledge. Neither test searches other passwords, carrier orders, levels beyond those stated, or a fitted byte decoder.

## Actual 2014 OpenPuff 4.00 JPEG tests

The [manual 32-bit Windows native workflow](../.github/workflows/agent1-p55-p27-seam-openpuff-jpeg.yml) reproduces the executable's pinned Git blob pair and uses the existing known-payload control. Every matrix job first retrieves the independently published original OpenPuff JPEG under the independent known password `12345678` at Maximum and **recovers the complete original 35-byte payload** `Dies ist eine versteckte Nachricht!` byte-for-byte. Only after the successful independent source-positive does it load one original LP2 2014 JPEG and set **A = `DJUBEIAEF`** (nine ASCII bytes), with OpenPuff B and C disabled. The original carrier, JPEG option and actual bit-level selection are recorded by the native GUI automation.

| Original scan / physical LP2 | Native JPEG level | Native displayed capacity | Native result | Files recovered |
| --- | --- | ---: | --- | ---: |
| `44.jpg` / p27 wing | Medium, 1/5 (20%) | **1,424 bytes** | `native-corrupted-stream` | 0 |
| `44.jpg` / p27 wing | Maximum, 1/2 (50%) | **3,568 bytes** | `native-corrupted-stream` | 0 |
| `72.jpg` / p55 moth | Medium, 1/5 (20%) | **1,216 bytes** | `native-corrupted-stream` | 0 |
| `72.jpg` / p55 moth | Maximum, 1/2 (50%) | **3,040 bytes** | `native-corrupted-stream` | 0 |

All four original runs reached the native modal `Task stopped: corrupted stream` error after verified source-carrier addition and bit-level selection; no file was produced. All four jobs concluded successfully as **experiments**, and every known-payload extraction prerequisite passed. Original-source result logs, GUI screenshots, and positive-control files remain in [run 43709099066](https://github.com/FlareZ123/liber-primus/actions/runs/43709099066), distinct original-target evidence artifacts **14159517663, 14159677274, 14159916554, 14159742053**.

The [source-derived password SFT](../sims/lp2_p55_p27_seam_openpuff_password_sft.cjs) checks all 8 original GP runes, both independent page lengths and the p56 match, including exact `DJUBEIAEF` transliteration and 8–32-character native password eligibility. This excludes **only the four specified single-carrier OpenPuff A-only setups**; it does not prove the original JPEGs contain no steganography.

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

No previously unknown manuscript plaintext, signed original encryption key, authentic hidden JPEG payload, or destination was obtained. Retire the fixed A-only native OpenPuff candidate on the two named JPEGs at the two tested bit levels and the complete original-source backward circular additive key on p55. The source p55→p27 bridge survives as a potential *map* clue. Reopening it for another binary or runic cipher requires a new original-art/signed-text instruction selecting that distinct consumer and a withheld original plaintext prediction; do not enlarge it by arbitrary password spelling or phase scanning.
