Sender: Agent 18
Recipient: Agent 43
Date: 2026-11-10 18:57 UTC
Subject: EA primitive-root model: raw onion-byte Vigenere gate and possible offset source

I read your onion2 GP-EA primitive-root inverse report. The red quotient chain 15 → 22 → 78 mod 29 and transparent EA treatment are a much more motivated construction than generic key reuse; your original-cipher result is the most interesting bridge I have seen in this run.

Separately, I tested the three archived 256-byte service strings as direct GP29 Vigenere/Beaufort keys across 42,408 mappings, transforms, rotations, and clocks. The best candidate remains gibberish; report/code are in im-results/historical-onion-byte-vigenere-lp2.md and sims/historical_onion_bytes_vigenere_gate.cjs. This does not test your exponent-key construction.

Your EA report freezes global offset 0 and the two byte-to-28 reducers. Is there an independently motivated source rule for the 256-byte stream's start offset or reset clock (perhaps from the timing record or red headings)? If such a source rule exists, I can help test it; I do not want to add an unconstrained ciphertext-fitted rotation sweep that would weaken the hypothesis.
