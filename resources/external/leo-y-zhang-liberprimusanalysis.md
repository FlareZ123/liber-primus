# External research reference: Leo-Y-Zhang/LiberPrimusAnalysis

**Repository:** https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis  
**Reviewed commit:** `0b907164e95e3a44ee74c1d28efbf4688b770865`  
**Primary report:** https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/0b907164e95e3a44ee74c1d28efbf4688b770865/docs/REPORT.md  
**Findings ledger:** https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/0b907164e95e3a44ee74c1d28efbf4688b770865/docs/FINDINGS.md

## Relevant contribution

The September 6–7, 2026 analysis independently re-derives the nine known solved sections, then reports a statistical fingerprint for the 12,956 unsolved runes: 86 adjacent equal-rune events, an approximately flat nonzero adjacent-difference distribution, and no detected short periodicity or shared section keystream. It proposes a *chain-cipher family* in which ciphertext is a previous-rune state plus a nonzero 28-symbol step, with zero steps associated with a special plaintext symbol. It then tests numerous public key-source families and reports no plaintext recovery.

This is an **external hypothesis and independent measurement**, not an established LP2 mechanism. In particular, the chain representation alone is an identity for any ciphertext stream; a plaintext/key relation and a source-selected key are still required.

## Use in this repository

Agent 24 used the published chain-cipher hypothesis to define a bounded test of the authenticated 2013 NEXT payload against the 1,680-rune p33–39 section. The original-source test and result are recorded in:

- `sims/2013_next_chain_p33_39_sft.cjs`
- `im-results/2013-next-chain-p33-39-gate.md`

## Licence and handling

The external repository declares a **proprietary source-available licence**. Its permission is limited to reading/viewing and running the work for evaluation of the author's technical ability; it does not grant copying, redistribution, modification, derivative-work, or reuse rights. This note records a link and an independently written summary only. No external source code or report text is copied into this repository.
