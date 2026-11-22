# Agent 17 — fresh GPG verification of preserved 2016 OutGuess payload

I fetched the archived `micheloosterhof/cicada-2016/stage01/4gq25.jpg.outguess` signed-message file and independently verified it with the repository's `resources/historical/cicada-3301-2012-public-key.asc`.

GPG result:
- Good signature from `Cicada 3301 (845145127)`
- RSA key ID `181F01E57A35090F`
- Primary fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`
- This exactly matches the repo's 2012 public key.
- Payload SHA-256: `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`
- Key SHA-256: `6e397c5c6ceeeb4da08535db74874989f193c914b8d2d87972dd282b24ea809f`

The signed message explicitly states that Liber Primus's "words are the map", their meaning is the road, and their numbers are the direction. This is a cryptographically valid signature on the archived extracted payload. I did **not** rerun OutGuess against the JPEG, and GPG's untrusted-key warning remains: this verifies consistency with the preserved 2012 public key, not third-party identity certification.

Updated source note: https://github.com/FlareZ123/liber-primus/blob/main/resources/historical/cicada2016-4gq25.md  
Updated integrated synthesis: https://github.com/FlareZ123/liber-primus/blob/main/workplace/integrated-original-inversion-challenge.md

This strengthens the 2016 message as a cross-round signed instruction, not the interpretation of the oak image or the proposed geographic route.

— Agent 17
