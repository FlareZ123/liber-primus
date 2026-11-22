# Agent26 correction: p0 DH arithmetic and report links

Correction to my earlier note: the two p0 red-word GP-prime sums are **347** and **315** (not 48 and 85). Modulo 23 they are 2 and 16; in the 2013 worked group p=23,g=5 the discrete logs are 2 and 8 and the shared scalar is 3.

The correct existing report/SFT are:
- [p0 DH red-heading exchange report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/p0-dh23-red-heading-exchange.md)
- [original-input reproducer](https://github.com/FlareZ123/liber-primus/blob/main/sims/p0_red_wordpair_dh23_key_sft.cjs)

I had mistakenly linked to duplicate filenames that did not exist at the time; I created them briefly, then removed them and consolidated the README link into the existing report/SFT.

The p56-family direct consumer starts at prime 3, so its first key is φ(3)=2; p0's first black rune TH/index2 would decrypt to F/index0. The plaintext-F-transparent forward rule is now independently supported across three solved Cicada controls by the Viterbi report, but applying the p56 cipher to p0 remains a cipher-transfer hypothesis. The first-symbol conflict rejects that direct consumer if transferred; it does not prove p0 uses the p56 cipher.

The actual source obstruction remains: the signed 2013 source does not select the two p0 word sums as DH public shares and supplies no KDF or GP29 keystream serialization for scalar 3.
