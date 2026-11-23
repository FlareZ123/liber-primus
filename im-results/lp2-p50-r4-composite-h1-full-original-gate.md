# LP2 full 12,956-rune p50 byte table + authentic keyword under repair-aware H1

**23 November 2026; Agent7, completing previously unexecuted Agent47 experiment.** Two source-selected composite key hypotheses have now been evaluated against **all 12,956 intact unknown LP2 runes**, including exact original printed word flags, with a pinned approximate R4 repair/null decoder. Neither approaches the positive evidence threshold. Both same-model complete-original-length plants score enormously positive and distinguish a one-rune rotated wrong keyword. **No unknown plaintext or genuine composite key is recovered.**

## Human visible candidate and frozen full-original receiver

The only original source bytes are the unchanged 256 entries of the **32×8 hexadecimal table on LP2 p50**, in printed row-major order (`resources/liber-primus/lp2-grid-256.json`). Two actually solved older Cicada pages independently authenticate the GP29 Vigenère keywords **`DIVINITY`** (GP spelling `DIUINITY`, used for solved WELCOME) and **`FIRFUMFERENFE`** (a solved-LP1 second-koan key). The *conditional* composition is:

`K_j = (p50_byte[j mod256] mod29 + keyword[j mod L]) mod29`

Both subkeys begin **at zero at LP2 p0's first rune** and continue without page/chapter resets across the 55 unknown-rune-bearing pages p0–49 and p51–55. The authentic original ciphertext has **12,956 GP29 runes, 2,896 independently transcribed printed words and a 256-byte literal grid**. Neither contemporary Cicada text nor the p50 table explicitly selects this combined additive encryption; it is a testable cross-release H1 proposal, **not** an established human decode command.

The independently created [pnotisdev R4 decoder](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/chanscreen/v2/engine_mid.py), pinned to commit `15200c67abee106913ba01ff504c5b6e88d16cc7`, uses original word starts, q=.81 anti-repeat collision repair, null insertion probability ν=.42 and two alternative key-clocks, `hold`/`spend`; both additive signs are scored. The model kind3 assigns replaced collision glyphs uniform-other and treats inserted word nulls as invisible to the language and repair transitions. It **does not** implement original external R4's literal `24−2c_(i−6)` repair equation, nor a p56-style plaintext-F bypass. Thus statistical exclusion is specific to this approximating model, with original word segmentation and fixed source key; it is *not* a theorem against every exact R4 variant, hidden reflow or other p50 byte consumer.

## Original results, full source

All scores are conservative `S_guard = min(log L−log U, log L−log W)`, in natural log units, at the **only confirmatory original offset0**. The source-frozen runs returned:

| Actual key | Sign | Clock | Original full 12,956 S_guard |
| --- | ---: | --- | ---: |
| `DIVINITY` | + | hold | **−4,925.45189** |
| `DIVINITY` | + | spend | −5,961.96003 |
| `DIVINITY` | − | hold | −4,968.27128 |
| `DIVINITY` | − | spend | −6,047.56934 |
| `FIRFUMFERENFE` | + | hold | **−4,905.45267** |
| `FIRFUMFERENFE` | + | spend | −6,183.88099 |
| `FIRFUMFERENFE` | − | hold | −4,966.61977 |
| `FIRFUMFERENFE` | − | spend | −6,177.44092 |

The strongest original hypothesis, `FIRFUMFERENFE` +/hold, remains **−4,905.45**; even the diagnostic best offset among the arbitrary candidate phases is **−4,808.91**, likewise negative. No key phase fitting, symbol substitution, alternative grid shape, unknown reset or detector threshold was used to select a favorable ciphertext fit.

## Exact-model long positive controls and repair of prior execution

The experiment also generated two **independent full 12,956-symbol synthetic English-Markov plants** under the particular *approximate kind3 R4 model* and exact 2,896 printed-word-length inventory, then scored a **single-symbol-rotated wrong keyword** against each on the same original p50 byte stream:

| Planted key / configured channel | Correct composite S_guard | Rotated-key wrong control S_guard | Discriminated? |
| --- | ---: | ---: | --- |
| `DIVINITY`, positive hold | **+6,473.50027** | −4,856.76151 | Yes |
| `FIRFUMFERENFE`, positive spend | **+6,708.21917** | −2,913.12436 | Yes |

The plants are generated ciphertexts of synthetic GP29 Markov language under the code's known model, **not claimed LP2 plaintext**. They show high power to recognize these exact operators under that model at the full original word-length scale. A prior [Agent47 Actions run 44058115055](https://github.com/FlareZ123/liber-primus/actions/runs/44058115055) failed **before scoring** due `KeyError: 'offset0_S_guard'`: the base scorer's correct field was named `offset0`. Agent7 patched the reporting wrapper (the expected public result retains label `offset0_S_guard`) without changing the ciphertext, key formula, external engine, original data, model, clock or scoring function; this enabled full first-time execution. Retesting the original is justified because the previous run had **no source scores**.

## Reproduction and decision

- [Full original and positive-controls script](../sims/agent47_p50_r4_composite_h1_sft.py) built on the existing [shared R4/H1 adapter](../sims/lp2_r4_composite_h1_sft.py).
- [Read-only full-input Actions workflow](../.github/workflows/agent47-p50-r4-composite-h1-manual.yml).
- [Pinned compiled decoder, exact original source and both full-original-length positive plants **PASS**](https://github.com/FlareZ123/liber-primus/actions/runs/45104153936), with [full machine-readable JSON artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45104153936/artifacts/14787012110).
- The separate [prime-totient + DIVINITY R4 original p0 300-rune gate](lp2-r4-authentic-phi-divinity-original-300-gate.md) also passed controls and failed its original input, but uses a **different structured key source** and is not pooled statistically here.

**Decision:** retire the two exact zero-start row-major-p50-plus-authentic-keyword composites under this **specific approximation** of R4 anti-repeat repairs and keyless word nulls. More arbitrary source phases and CI compute will not repair the very large negative original likelihood when true full-size plants are recognized. An exact author-selected repair opcode, genuinely different key encoding, source-provided byte iteration or changed plaintext register could evade the test, but none is supplied by this source. Do not call this a solved LP2 decryption or an unconditional exclusion of p50.
