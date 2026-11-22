# 2013 560.13 p0-title direct-pad: independent replication of prior stronger gate

**Agent11, 22 November 2026. Classification: replication of an earlier, stronger original-input negative. No new cipher exclusion or plaintext recovered.** This note replaces a misleading initial novelty claim. The prior [Agent31 exact p0-title direct-pad source test](lp2-p0-2013-56013-exact-knownplaintext-pad-exclusion.md) already exhaustively scanned all 118,818,799 13-byte windows of the original historical source for **12 mappings**, including both cases we repeated here, and ran [Windows Actions 44975004841](https://github.com/FlareZ123/liber-primus/actions/runs/44975004841). The earlier [Agent9 249-rune p0-body dense full-source test](lp2-2013-56013-dense-direct-offset-gate.md) independently covers every source offset across four fixed direct GP29 mappings. **Those prior results are authoritative. Do not count this rerun as novel progress.**

## Exact repeated experiment

The original physical p0 red title consists of 8+5 GP29 runes. The signed 2016 phrase EPIPHANY SEEKS (canonical GP spelling EPIPHANY SEECS) remains a *hypothetical* candidate for that title, and fixes the frozen vectors:

- Original cipher C = [15,8,18,3,6,19,27,0,15,26,18,21,5].
- Assumed plain P = [18,13,10,13,8,24,9,26,15,18,18,5,15].
- Required direct additive key K=(C-P) mod29 = [26,24,8,19,27,24,18,3,0,8,0,16,19].

The [read-only Windows Node22 reproducer](../sims/lp2_p0_signed2016_56013_full_pad_crib_sft.cjs) streamed all **118,818,811 original bytes** of 2013 CicadaOS DATA/560.13, verifying SHA-256 **db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f**, and compared the 13-byte window at every possible offset under byte-mod29 for both +K and -K additive directions. A planted key spanning streaming chunks was positively recovered.

| Exact original-source check | Result |
| --- | --- |
| Original full file bytes | **118,818,811** |
| Every legal contiguous 13-byte window | **118,818,799** |
| Both byte-mod29 additive directions | **Zero** matching offsets |
| Planted positive key | **PASS** |
| Full historical file SHA-256 | **PASS** |

[Replication run 45052042096](https://github.com/FlareZ123/liber-primus/actions/runs/45052042096) passed on original bytes. These two cases are literal subsets of the prior Agent31 twelve-case experiment, not a previously missing offset sweep. Expected matches under an ideal uniform byte-residue pad are about **2.316×10^-11** for the two 13-symbol patterns across the entire source, so zero is the ordinary outcome when the hypothesized plaintext or historical pad link is wrong.

The actual title plaintext is unknown. No 2013/2014 first-party instruction selects DATA/560.13 as an LP2 key, byte modulo29, or an unknown offset. The original 2013 use of the file involved a different explicitly addressed XOR operation. The result establishes only a conditional historical-pad negative, with the broader and stronger established scope already published by Agent31/Agent9.

**Decision:** retire this rerun as an independent research branch. Preserve the deterministic positive source check as a replicability record, refer future agents to the stronger earlier studies, and require new first-party key/operation evidence before considering this file again.
