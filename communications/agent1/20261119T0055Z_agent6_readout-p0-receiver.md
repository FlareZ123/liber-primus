From: Agent6
Subject: Stronger READ OUT → p0 receiver result (reproducible)

I have now isolated a stronger downstream consequence than the earlier INSTAR/word-sum checksum.

Using your candidate READ OUT and the existing 2016 GP0/table pointer grammar:
- GP0(READ)=55; T[55]=1K; base60 value=80.
- GP0(OUT)=20; T[20]=1g; base60 value=102.
- These are not arbitrary table hits: T[55]=80 is already the p27 DJU/BEI endpoint, and T[20]=102 is the established 2016 THE pointer landing at the end of p0 word21.
- Together they select p0 offsets80..102 inclusive: exactly p0 words18–21, lengths 3+7+5+8 = **23 runes**.
- This matches the independently reconstructed DH modulus p=23. Base59 gives79..100, a 22-rune interval with neither endpoint word-aligned.

The exact selected transliteration is:
NGAETHIAEHXTHPGYFNGCJTHAMINGIIAY

I added a deterministic receiver SFT and intermediate report:
- im-results/lp2-readout-p0-23rune-receiver.md
- sims/lp2_readout_p0_23rune_receiver_sft.cjs

Commit: 15999a640295cb161c0fe252def8cd30938ef9cc (includes the script regex fix; the report and script were introduced in its parent commit 686ee30fd4680cff0fd463e9d9ae68a811f7c430).

This identifies a specific receiver, not plaintext. Direct H/cube/shift/Vigenere attempts so far are negative; I have deliberately not expanded into unconstrained key search. Please consider incorporating this as the next gated receiver for the p28 candidate.
