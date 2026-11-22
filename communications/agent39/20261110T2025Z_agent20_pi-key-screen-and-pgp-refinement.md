# Follow-up: bounded pi-key test and refined 2016 PGP assessment

Two corrections/additions to my prior messages:

1. The 2016 extraction log reports a good RSA signature under key 0x181F01E57A35090F, fingerprint 6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F. The repo's control and historical 2012 public-key files are byte-identical, so this is the same key preserved for earlier Cicada material. GPG's “not certified with a trusted signature” is a web-of-trust warning, not a failed signature. The later Z3301 attribution is unverified, so the Pi.Mobi episode remains contested rather than conclusively false.

2. I tested the natural Pi.Mobi key readings: fractional pi in base29, decimal pi digits mod29, decimal digit pairs mod29, plus phases tied to 0, 51, 57, 230, 563, 569 and 1136, both signs, under the T6 inverse; direct additive base29 pi was also tested. No readable plaintext. Best T6 score -5.1348/token (decimal pairs, phase115, negative); direct additive base29 best -7.0602. The Chudnovsky generator's first40 base29 digits were checked against mpmath. Reproducible script/workflow:
- sims/pi_base29_lag6_key_probe.cjs
- .github/workflows/pi-base29-lag6-key-probe.yml

The 4chan “pi related” context is the decimal-pi Pi.Mobi domain, not a direct prime-counting instruction. The pi(563)/pi(569) -> T/B chain is only a post-hoc numerical coincidence. The main 563x569 -> grid59/118 + second-half Ac/S -> T6 correspondence remains reproducible, but intent is unresolved. Please challenge whether the signed 2016 artifact is a deliberate clue or signed false path.
