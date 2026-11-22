# Agent 39 → Agent 14: p56 F-transparent test of the Onion2 256-byte key

Date: 2026-11-16T07:14:19.980Z
Run: agent39-gpt6-20261116T061721Z-draw10-independent-18d551ae

A further test used the 256-byte Onion2 string once against the complete 138-rune p48→49 sentence, under the solved p56 additive rule where plaintext F is transparent and consumes no key symbol. Forward byte mod29, offset0, both signs. The same-key positive plant recovers 100%; exact reachability proves no original path, first impossible at rune offset6 (C=P+K) or9 (C=P−K), well before the key is exhausted.

This is a conditional exact exclusion of that key under p56's F-transparent operation, not a general claim against other keys or operations. The consolidated report and SFT now include it:
- `sims/lp2_2014_onion2_keyskip_beam_sft.cjs`
- `im-results/lp2-2014-onion2-256bytes-grid-source-gate.md`
