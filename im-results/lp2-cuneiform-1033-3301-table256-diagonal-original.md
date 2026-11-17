# Original 1033/3301 cuneiform diagonal selector and finite inverse

**Agent43, 17 November 2026. Original-input negative; no unknown plaintext, key, creator-selected cipher or destination.** The [full Node22 SFT](../sims/lp2_1033_3301_diagonal_original_sft.cjs) passed on the repository's pinned source objects in [GitHub Actions run 44130218417](https://github.com/FlareZ123/liber-primus/actions/runs/44130218417).

## Source-visible reason for the attempt

The original p33–39 decorative cuneiform register repeats **1033** and **3301**. The adjacent p49–51 numerical register prints **256 two-character values in 32 rows × eight columns**. As exact arithmetic, `1033 = 4×256+9` and `3301 = 13×256−27`, so the original numerals define full-period steps `9=8+1` and `229=−3×9 mod256` through the table. Also `3301+3×1033=25×256`. Both steps are coprime to256. On a distinct original receiver, physical p33–39 has **1680 runes =28×60**: 28 nonrepeating GP29 choices × conventional base60, and `3301 mod1680=−59=1−60`, another row-diagonal stride. Both 1033 and3301 are coprime to1680.

These facts do **not** prove intended design. The chapter factorization, modulo operation, row-major traversal and additive inverse were each chosen analytically. The source does not authenticate any decoder. Earlier p50 address-pointer reports already used the literal numerals as *single addresses*; this experiment instead fixes *full-cycle strides* and tests their cryptographic consequences.

## Full original-cipher inverse

Read the unchanged [original-table transcription](../resources/liber-primus/lp2-grid-256.json), and form two candidate 256-byte registers: conventional radix60, and source-motivated radix59 omitting its entirely absent lowercase `f`. For each step `s∈{9,229}`, start at physical table cell zero, then take `K[i] = byte[(i*s) mod256] mod29`, with no phase tuning. Apply two signs under either direct `P[i]=C[i]±K[i]` or chained `P[i]=C[i]−C[i−1]±K[i]` GP29 inverse (initial prior ciphertext zero) to the three source sections. Each receiver thus has **16 fixed candidates**; no fitted key, keyword, text or starting phase.

| Ciphertext receiver | Rune count | Original rune IoC | Candidate IoC range |
| --- | ---: | ---: | ---: |
| Original cuneiform p33–39 | 1680 | 0.03436002 | 0.03422389–0.03479821 |
| Original floral/table p40–53 | 3008 | 0.03454263 | 0.03439448–0.03459968 |
| Original terminal p54–55 | 308 | 0.03382123 | 0.03305977–0.03576716 |

Uniform GP29 baseline is `1/29≈0.03448`; the independently clear p57 PARABLE is approximately `0.06271`. Every original output remains nonlinguistic and close to uniform. In-band positive plants encrypt repeated **actual clear p57 GP runes** under every exact source-key formula and recover **all original plaintext symbols** under all 48 inverse/receiver pairs.

## A stronger keyless feedback test on 1680

The precise `28×60` section and the two complete-ring strides give another fully reversible candidate without presupposing the numerical table as a key: `C[i]=P[i]±P[(i+s) mod1680] (mod29)`, with `s=1033` or `3301`. Each source-selected step generates a single even-length cyclic orbit. For the **plus** model a necessary condition is `Σ(−1)^i C[i] ≡0 mod29`; for **minus** the necessary condition is `ΣC[i]≡0 mod29`. These follow algebraically by summing alternating or ordinary pairs around the cycle. They are independent of all unknown plaintext and seeds.

The original chapter has **alternating sum 1** and **ordinary sum 11**, modulo29. Therefore **all four full-cycle signed-feedback inverses are impossible on the unmodified original ciphertext**, whatever plaintext/key seed is guessed. Independent planted p57 positive controls forward-encrypt and reverse-recover the entire 1680 symbols under every one of these same four models, so the obstruction is not a decoder error.

## Decision

A mathematically exact and visually motivated diagonal reading was tested to its original-input consequence; it yields **no authentic plaintext**. The numerical equalities are retrospective and do not establish Cicada's intended operator. The full-cycle table-key candidates fail, and the cyclic GP29 linear feedback class has a strict algebraic contradiction. No wider offset/seed sweep or fitted exception is justified by the current source. Reopen only if an authentic clue independently specifies a different receiver, traversal, noncyclic boundary, or original key. Later ciphertext output filtering and genuinely external pads are outside this gate.
