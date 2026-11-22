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

## External finite row-major stream candidate (Agent5, 18 November 2026)

A public prior-art implementation in [cicada-solvers/JBO-cicada_tools](https://github.com/cicada-solvers/JBO-cicada_tools) labels a 256-token list `CUNEIFORM_STREAM` and tries it as a finite additive/subtractive GP29 keystream. Its [`secrets.py`](https://github.com/cicada-solvers/JBO-cicada_tools/blob/main/secrets.py) token list matches all 256 tokens in the local `lp2-grid-256.json` exactly, in row-major order from pages49–51; it is not a separate artifact. The [`experiments.py`](https://github.com/cicada-solvers/JBO-cicada_tools/blob/main/experiments.py) method tests base59/base60, all six permutations of the digit/uppercase/lowercase chunks, forward/reversed stream, and both signs. Its [`KeystreamTransformer`](https://github.com/cicada-solvers/JBO-cicada_tools/blob/main/transformers.py) consumes the finite stream once: it transforms the first 256 runes of a section and leaves the remainder unchanged. It does not repeat the key or skip F.

The external implementation applies the candidate to its five unsolved sections 011–015 (LP2 pages23–55). We reproduced that exact scope from the external section JSONs and checked each section's rune sequence against the local original corpus: pages23–26 (1,021 runes), 27–32 (1,433), 33–39 (1,680), 40–53 (3,008), and 54–55 (308). The 69,904-line external [`english_wordlist.txt`](https://github.com/cicada-solvers/JBO-cicada_tools/blob/main/english_wordlist.txt) (Git blob SHA `29deee2071c60b907f071f5d0a1ebfa1a3c57a18`; 69,503 unique runic forms after the same `english_to_runes` normalization) was used only for scoring and was not copied. The external repository declares no license, so no code or dictionary is vendored.

There are 48 key variants (2 bases × 6 chunk permutations × 2 directions × 2 signs) across five sections = 240 candidates. The exact external gates were reproduced: at least three consecutive initial words in the dictionary and normalized 29-symbol IoC ≥1.4. **No candidate passes.** The maximum initial dictionary prefix is one word; the maximum normalized IoC is 1.051969, below threshold. In target section 013 (pages33–39), the maximum prefix is one and maximum IoC is 1.00481. This is a bounded negative for the finite row-major stream exactly as specified; it does not exclude F-transparent, repeated, offset, or non-additive table uses, but none of those extensions currently has a first-party selector.

Reproduction: `node sims/lp2_cuneiform_table256_rowmajor_keystream_sft.cjs /path/to/english_wordlist.txt /path/to/JBO-cicada_tools/liber_primus`. The script checks the external wordlist's Git blob SHA before running.

## Decision

A mathematically exact and visually motivated diagonal reading was tested to its original-input consequence; it yields **no authentic plaintext**. The numerical equalities are retrospective and do not establish Cicada's intended operator. The full-cycle table-key candidates, the finite row-major base59/base60 stream above, and the cyclic GP29 linear feedback class are negative under their stated scopes. No wider offset/seed sweep or fitted exception is justified by the current source. Reopen only if an authentic clue independently specifies a different receiver, traversal, noncyclic boundary, or original key. Genuinely external pads remain outside this gate.
