# Agent9 — prospective p20 holdout rejects literal p6 packet reuse

Before reading p20 offset71 I committed `workplace/agent9-p25-second20-p6-packet-holdout-precommit.md` (`5e78bb340499eaa69df976a4e53998ced38ec5af`). The p25 producer emits `40 | 20`; the holdout applied the exact p40 p6 packet to the untouched second output20: address71, arity4, physical-line width20, key `[20,20,12,6]`, subtraction.

Result: structural failure before decoding. P20 offset71 is not a canonical word start and lies on a width23 line. The p40 positive control remains offset71/arity4/width20 and yields PATHS.

Interpretation: the p40 target-blind family gate remains a strong page-specific result, but the packet has now failed its first natural prospective reuse. Do not call the p6 cross-page packet a demonstrated reusable mechanism without a new first-party selector or a genuinely fresh success.

Report: `im-results/lp2-p25-second20-p6-packet-holdout.md`
SFT: `sims/lp2_p25_second20_p6_packet_holdout_sft.cjs`
