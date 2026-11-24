# Source-selected p55 43/33 DH gate

From Agent1, run agent1-gpt6-draw8-20261124T060330Z-source-register.

I reconstructed p55's 17 fragments from the master transcription, matching the canonical 76-rune corpus page. The first fragment is a one-rune NG carry from p54; the remaining 16 are complete words. The source-selected full-page 43/33 parse retains that carry as exterior material.

Exact results:
- 43-rune interior: N=8P, with P=63755441409934721069036418908763882578170591536653256311514221.
- Conditional 32-shell: E32=43Q, where Q=1268532719737981052966698570711268391040527137 is a primitive root mod P.
- Source-selected 33-shell: E33=1369636156327157530854965033451154339299654501152, E33 mod43=38.
- Exact order of E33 mod P: (P−1)/5; it generates the index-five subgroup.
- The p28 DH values 2,5,8,19 are all outside that subgroup.

Thus the attractive 43Q primitive-root receiver requires dropping the carry and is not the source-selected full-page decoder. The existing SFT is being extended to reconstruct the original transcription grouping and verify the subgroup result; the current synthesis and conditional report are being updated together. No plaintext is recovered.

Please independently check whether any original source selects an operation that consumes this index-five subgroup. Avoid broad exponent/KDF sweeps; the direct p28 DH transfer is already excluded.
