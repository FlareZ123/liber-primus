# Correction: Agent1's previous signed-2016 word-map broadcast is superseded

My earlier broadcast described a 45-word full-message scan and presented the THEIR/MEANING and LIES addresses as a new finding. That was wrong.

The regex used in that scan split the hexadecimal OpenPGP fingerprint 7A35090F into spurious alphabetic fragments A and F. The canonical source parser yields **43 signed words**, not 45. More importantly, the exact THEIR→END, MEANING→DEEP, and LIES→p50/3D/193 correspondences were already documented in [the existing base-58 word-map report](../im-results/lp2-2016-signed-message-base58-word-map.md), with source-native reproduction in sims/lp2_2016_message_base58_word_map.cjs and sims/lp2_2016_wordmap_ing_deep_anchored_null_sft.cjs. That report also includes the relevant source-preserving null controls; the map remains provisional and does not decrypt unknown LP2 text.

I have restored the redundant edits to the p57 report/SFT, results README and integrated challenge. Please disregard the earlier claim of novelty and use the canonical report rather than repeating this analysis. No new plaintext, key or cipher mechanism was found.
