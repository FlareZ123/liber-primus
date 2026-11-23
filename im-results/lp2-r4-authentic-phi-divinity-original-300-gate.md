# Original p0 300-rune R4 composite: authentic φ(prime) plus DIVINITY

**23 November 2026, Agent7. Decisive original-window negative for a fixed two-authentic-key combination under a pinned approximate R4 decoder.** The unknown LP2 plaintext, key, cipher and destination remain unresolved. This recovers no new plaintext.

## Why this test is independent and first-party motivated

The genuinely solved LP2 p56 `AN END` uses successive-prime totient shifts φ(p)=p−1 modulo GP29. The genuinely solved earlier LP1 `WELCOME` uses the GP29 Vigenère keyword `DIVINITY` (transliterated GP tokens `DIUINITY`). An independent [pnotisdev R4 investigation](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/docs/HYPOTHESES.md) proposed that combining these two distinct already-authenticated operators could hide periodic-key structure under a nearly uniform source keystream, while LP2's rare equal adjacent runes and word-length anomaly may reflect separate collision repairs / one-null-per-word insertion.

The **one frozen candidate** is `K_j = (p_j−1+GP(DIUINITY[j mod8])) mod29`, p_j beginning at prime2, starting at the literal **first unknown LP2 rune p0 index0**, no secret offset, key phase, page reset or initial skip. Its fixed GP keyword indices are `[23,10,1,10,9,10,16,26]`. The receiver is the **first 300 unchanged original cipher runes** on p0→p1. Two additive directions and the decoder's separately defined `hold`/`spend` collision-clock modes are four bounded interpretations fixed independently of outcomes.

The external reference decoder is `pnotisdev/cicada3301` at commit `15200c67abee106913ba01ff504c5b6e88d16cc7`, `work/chanscreen/v2/engine_mid.py` plus its compiled Rust `backward_mid.rs`, kind3, fixed `q=0.81`, one uniform keyless inserted midword rune per eligible word with probability `ν=0.42`. Its *approximate* collision repair uses uniform-other substitution and its inserted null is invisible to the language-model and anti-repeat states. It does **not** implement the exact separate R4 `T(c−6)=24−2c` repair value or the authentic p56 plaintext-F skip; thus this is not a universal exclusion of all compositions with R4. A cross-release key composition has no direct Cicada-authored instruction assigning it to p0; the test remains a motivated hypothesis.

## Original and native-model positive, independent wrong-key controls

With exactly one fixed offset0 source clock, the engine returns its conservative `S_guard=min(log L−log U, log L−log W)` score. A source hit would require **S_guard ≥29.80** over the 300-rune window; large negative values indicate the original source disfavors the hypothesis.

| Input | Cipher sign | Repair clock | Frozen offset0 S_guard | Pass 29.80 |
| --- | --- | --- | ---: | --- |
| **Original p0 first300** | + | hold | **−120.93605** | No |
| **Original p0 first300** | + | spend | **−154.86677** | No |
| **Original p0 first300** | − | hold | **−101.68224** | No |
| **Original p0 first300** | − | spend | **−153.98012** | No |
| Genuine-model planted 300, correct K | + | hold | **+143.63738** | Yes |
| Genuine-model planted 300, correct K | + | spend | **+156.24555** | Yes |
| Same hold plant, independent random K | + | hold | **−123.78820** | No |
| Same spend plant, independent random K | + | spend | **−129.66482** | No |

The source input is pinned by SHA-256 of its 300 original GP29 rune indices followed by the 300 printed word-start flags: `7d37f7543ffd10b775987193b425d194b43bf661ee7d7b8f67f970f62b474a30`. The first500 fixed key values have SHA-256 `124fc82a895f8a60f0c0ea4bc30a0af0d63e3767140aa890c7e085a54eed892c`.

Each planted control is 300 symbols of **synthetic English-Markov GP29 data generated under the approximate engine's known R4 null/repair model**, and is **not** genuine LP2 plaintext. The correct source-derived combined key passes; independently random incorrect keys do not, establishing discriminating power for **that** 300-window model. Unconstrained best-offset diagnostics, although computed by the external engine, are negative and cannot be used to choose a convenient source phase.

## Reproduction, scope and decision

- [Source-pinned Python reproducer](../sims/lp2_r4_composite_h1_sft.py), original `lp2-corpus.json` / `lp2-transcription.txt`, existing pinned external engine and model.
- [Manual GitHub Actions runner, pinned environment](../.github/workflows/agent7-r4-phi-divinity-original.yml).
- [Windows-independent GitHub Ubuntu Actions **PASS**, original/positive/wrong-key scores](https://github.com/FlareZ123/liber-primus/actions/runs/45104211442), [exact raw JSON artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45104211442/artifacts/14787280225).

**Decision:** retire this single unshifted, source-fixed φ(prime)+DIVINITY key under the *approximating* R4 language model on p0's first300 runes. The most favorable original score is at least **131.48 nats below** the confirmatory threshold, against plants scoring ~144–156, so it supplies no reason to spend CPU on optimized phase/word-null patterns. The exact R4 collision equation, a fully authored p0 operation, other keys and non-GP registers are outside this test. No plaintext/key is asserted; only independent original-output signal would reopen this narrow composite.
