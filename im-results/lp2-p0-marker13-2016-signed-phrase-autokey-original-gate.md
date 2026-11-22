# LP2 p0 original marker13: signed-2016 phrase as a GP29 key seed

**Status (16 November 2026, Agent1):** A bounded original-input negative on three fully specified *direct* GP29 additive mechanisms, each with both signs and three historically native numeric projections. No unknown plaintext, author-specified key or instruction was recovered.

## Actual independent clue and the unproved bridge

The original `17.jpg` (physical LP2 p0) contains a red **8+5**-rune heading, followed by the large **13-dot** marker at GP offset13. The correct original-source ink boundary is documented in [the JPEG adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md). The signed 2016 Cicada message contains the first-party English phrase **“epiphany seeks”**, also an **8+5**-letter phrase which in natural GP29 single-letter spelling is exactly 13 runes, `EPIPHANY SEECS`, numerically

```text
18,13,10,13,8,24,9,26,15,18,18,5,15
```

The 8+5 length correspondence and marker are an **independent cue for one candidate input**, but neither the 2016 message nor the source scan says to use this phrase as a p0 *body* key. The red heading is itself different ciphertext (`SHEOGMIAF-SYENGC`). The premise is explicitly speculative, and this report tests it once as a fixed, common, period-plausible keyed operation.

The original source input is the unchanged p0 black body `resources/liber-primus/lp2-corpus.json`, physical page0 rune offsets13–261 inclusive: **249 runes, including 13 ciphertext-F occurrences**. The header is excluded. All indices use that repository GP29 alphabet, with rune F=0.

## Frozen reversible models

For original ciphertext `C_i`, plaintext `P_i` and key `K_i`, both additive signs are exhaustively attempted: `P_i = (C_i ± K_i) mod29`. The candidate seed comprises the 13 exact GP indices above. For each sign:

1. **Repeat:** `K_i = seed[t mod13]`, where `t` is the key-consuming ordinal.
2. **Plaintext autokey:** `K_i = seed[t]` for `t<13`; thereafter `K_i=P_{t-13}` over the previous key-consuming plaintext symbols.
3. **Ciphertext autokey:** same 13-seed initialization, thereafter `K_i=C_{t-13}` over the previous key-consuming ciphertext.

The key symbol is independently mapped to one of three fixed numeric domains: `ordinal r`, `GPprime(r) mod29` or `(GPprime(r)-1) mod29`. This makes **18** models total, with no arbitrary offsets, mode switches, learned key, alternative seed spellings or recovered/edited source runes.

For each original ciphertext F, the exhaustive decoder admits (a) encrypted non-F if the additive inverse is nonzero, and (b) literal plaintext-F pass-through, which emits F without consuming key state. A plaintext F is *never* produced by an encryption operation; this matches the historically verified solved-page F-transparent convention. Every legal path is retained, rather than chosen by an English-language beam. The native complete forward encoder uses the same rule.

## Original-cipher result

| Numeric key map | Repeat signs − / + | Plaintext-autokey signs − / + | Ciphertext-autokey signs − / + |
| --- | ---: | ---: | ---: |
| GP ordinal | 0 / 0 | **15** / 0 | 0 / 0 |
| GP prime mod29 | 0 / 0 | 0 / 0 | 0 / 0 |
| GP prime totient mod29 | 0 / 0 | **16** / 0 | 0 / 0 |

Entries count **legal complete 249-rune inverse paths**. Sixteen of the eighteen models are mathematically impossible on this unchanged original window under the specified F handling. The two nonzero cells have 31 total complete decodes, but their best native-reference scores remain at the scrambled-ciphertext level:

- Ordinal plaintext autokey, negative sign: best smoothed GP trigram log-score **−3.62749 per predicted symbol**, IoC **0.03485**, opening `PIAAEEONGTPGDPLPNGRYMILDHASEOSYIRLMBOEDU...` (15 full paths).
- Totient plaintext autokey, negative sign: best score **−3.64286**, IoC **0.03469**, opening `DIACEOWTHDBSDUGPTCOJDGLEASARDEHCOLEOUALBO...` (16 paths).
- Original unchanged 249-rune body: score **−3.65749**, IoC **0.03436**. Original solved p57 95-rune source: score **−2.04450**, IoC **0.06271**.

These scores are small-register diagnostics, not multiple-testing-adjusted evidence. The source ciphertext and all preserved paths show no continuous recognizable phrase from the hypothesized inverse. Neither positive cell identifies an authored key or yields a usable unknown plaintext.

**Independent implementation controls:** for every one of the 18 distinct models, the actual 95-rune clear p57 source was *forward encrypted*, including its three literal F symbols, with the chosen 2016 seed and mode. The same exhaustive inverse recovered the complete **95/95 source-native plaintext** among its legal paths for all **18/18** models. This checks key-state advancement and F ambiguity while making no historical claim about those artificial encipherments. All original zero-path exclusions are therefore model-gated rather than an untested decoder failure. The source GP word spelling is from the same canonical corpus, not generic ASCII transcription.

## Decision and replication

Run on Windows 11 / Node.js 22 from the repository root with the committed [single-file SFT](../sims/lp2_p0_2016_epiphany_marker13_autokey_sft.cjs); it imports the repository's original GP29 corpus and source-native solved text. Full 18-model original and positive output passed [manual CI run 43802839555](https://github.com/FlareZ123/liber-primus/actions/runs/43802839555) on commit `11f34f7c7700747d3aedacc388020e9975df4eae`.

**Retire this exact direct seed-as-key family**. This negative does not refute `EPIPHANY SEEKS` as a header plaintext guess, unrelated use of the p0 marker, nonadditive operations, hidden state, different F rules or a key supplied elsewhere in the puzzle. A future attack needs a source-selected **specific reversible operation**, rather than another unconstrained spelling, offset or cryptosystem sweep. The known LP2 plaintext status is unchanged.
