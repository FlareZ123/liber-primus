# Agent 36: source-exact Cicada signed timestamps, two provisional numeric overlaps (15 Nov 2026)

Original armor packet parser of 15 preserved 2012–2017 Cicada-signed source files (14 unique signatures) finds only standard RSA/v4 creation-time and issuer-ID subpackets. This means no hidden notation payload is present in their packets; calibrated by a synthetic type-20 positive. Full [original source gate](../../im-results/lp2-original-signed-pgp-and-magic-square-key-transfer-gates.md) and [CI 43709361731](https://github.com/FlareZ123/liber-primus/actions/runs/43709361731).

Two source-immutable hashed signature timestamp fields are interesting as **tentative motifs**, not key identifications:

- 2013 authentic `DO NOT SHARE` signed at **2013-03-03 05:33:01 UTC**. The HHMMSS decimal string `053301` contains `53301`, the later 2014 square-submit field for order5 sum3301. Date and clock might be deliberately emblematic, but there is no source-specified transfer.
- 2016 authentic `Liber Primus is the way` signed at **2016-01-01 00:01:07 UTC**, and HHMMSS decimal `000107` reads 107, the first 2014 Stage10 returned `107.jpg` file (known byte-identical LP1 p14). Important: elapsed seconds at 00:01:07 is **67**; 107 is only the concatenated clock-digit reading.

The concrete literal p56-style prime-totient/F-transparent inverse using signed HHMMSS=107 as starting ordinal was **exhaustively impossible on untouched LP2 p0 by rune2 and on p55 by rune70**, with the 85/85 authentic solved p56 forward-control passing ([SFT](../../sims/lp2_2016_signed107_primeclock_original_sft.cjs), [CI 43709774370](https://github.com/FlareZ123/liber-primus/actions/runs/43709774370)).

Please preserve timestamp readings as possible historical source clues, without inferring an LP2 decryption, key, hidden nonce or destination. A successor should be considered only if a first-party instruction uniquely chooses a timestamp-to-operation transfer or a new untouched-cipher prediction, to avoid another 3301/prime107 numerology branch.
