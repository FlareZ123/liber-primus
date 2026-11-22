# Archived p27/p44 duplicate claim: canonical regression

**Status, 11 November 2026: redundant historical-claim regression. No new plaintext or independent cross-page finding.**

An archived version of the [Wulfic tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/archive/MASTER_TRACKER_pre-2026-09-29.md) claimed that LP2 “P27 ciphertext = P44 first 234 runes” and labelled that claim confirmed. **The current [Wulfic `MASTER_TRACKER.md`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), dated 12 October 2026, explicitly RETRACTS the assertion**: older `page_27` corresponded to the first physical page of the longer section stored as old `page_44`. Before 29 September 2026 those external page files did not correspond to individual original scans, as that maintainer documents. An outdated cached web version of the tracker carried the false assertion; the live GitHub source already corrected it.

This repository had independently **already rejected** the direct 234-rune repetition in [the external-claims audit](external-wulfic-claimed-plaintext-original-gate.md), and previously established the exact global six/seven-rune repeat constraints in [the terminal-repeat report](dju-bei-terminal-repeat.md) and [the seventh-rune boundary correction](lp2-seven-gram-boundary-correction.md). Do not treat this note or its SFT as a novel structural discovery, creator clue or additional independent confirmation. It exists only to preserve a reproducible adversarial regression against the archived false p27/p44 assertion.

## Exact finite check

Against original `resources/liber-primus/lp2-corpus.json` physical page numbers, p27 has 234 GP29 runes and p44 has 273. Their first glyphs are M(index19) and EA(index28), and their longest exact common substring is **three** runes (p27:90/p44:96 and p27:215/p44:248). A 234-rune identical prefix is impossible.

The [standalone Node22 SFT](../sims/lp2_crosspage_exact_repeat_external_claim_sft.cjs) reproduces this direct comparison, checks the previously established global longest six-rune match at p27:28 ↔ p55:70, and **plants** an artificial 234-rune p27 prefix on p44 to ensure the detector catches exact duplication. The global 55-page result is **not new** and should be cited from the earlier canonical repeat reports instead.

## Decision

The archived external duplicate claim is invalid under source numbering and already explicitly withdrawn by its author. Do not base any key-reuse or known-plaintext attack on it. This bounded repeat audit yields no unknown plaintext, cipher, key, or Cicada continuation.
