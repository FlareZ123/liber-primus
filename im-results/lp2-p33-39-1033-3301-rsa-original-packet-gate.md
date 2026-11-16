# Cuneiform 1033/3301 as direct RSA residue packets: original-input capacity gate

**Classification (16 November 2026):** mathematically exact exclusion of one human-plausible original-input representation, under an explicit stationery GP29 alphabet and minimal unsigned packet framing. No unknown LP2 plaintext or authentic key has been recovered. The printed numbers do not instruct RSA.

## First-party observable premise and competing interpretation

LP2 physical pp33–39 visibly repeat the two cuneiform-rendered numbers **1033 and 3301** in their seven headers. Both decimal integers are prime. Earlier Cicada stages used public-key cryptography, so a possible paper-and-pencil hypothesis is to use them as small RSA factors and read the consecutive seven-page ciphertext as base-29 unsigned RSA residues. A rival explanation is that the numbers refer to other 2013/2014 puzzle constants and that the text is a different cipher.

The exact 29-symbol original chapter in `resources/liber-primus/lp2-corpus.json`, pages 33–39 inclusive, contains **1,680 ciphertext runes**. Notably, 1,680 is divisible by 5, which supports a complete source-sized test of 336 putative five-rune packets with no padding. The original punctuation/word separators are preserved as layout evidence but do not participate in this hypothetical binary-register operation.

## Necessary width proof, valid under every fixed secret rune relabeling

The minimal fixed-width unsigned GP29 packet for a residue modulo integer `n` has `w=ceil(log_29(n))` digits. Its leading base29 digit cannot exceed `floor((n-1)/29^(w-1))`. A stationary unknown bijection from printed rune identities to digit values can permute labels but **cannot reduce the number of distinct printed first-position identities**. A complete original packet stream with more first-symbol identities than allowed is impossible for that modulus, regardless of exponent, chosen plaintext, private key, or invertible fixed rune relabeling.

| Printed-number modulus hypothesis | Minimal width | Largest legal leading digit | Allowed first-position identities | Actual original identities at every global phase |
| --- | ---: | ---: | ---: | ---: |
| 1033 | 3 | 1 | 2 | **29 / 29 / 29** |
| 3301 | 3 | 3 | 4 | **29 / 29 / 29** |
| 1033×3301 = 3,409,933 | 5 | 4 | 5 | **29 / 29 / 29 / 29 / 29** |

All original source-wide phases are checked, rather than postselecting one. Allowing a separate unselected packet-clock reset at **every original physical page** cannot rescue the direct representation: for width 3, the lowest distinct source leader count on any page/phase is **24**; for width 5 it is **20**, both far above the respective maximum 4 or 5. In particular any one of the seven physical pages independently contradicts all three direct minimal-width readings.

The proof covers source GP29 indices or any **single secret GP29 permutation at chapter level**, and also grants separate hidden alphabets per physical page because the original page-specific leader counts individually exceed the limits. It does not apply to nonminimal or variable-width packets, multiple cipher layers, symbol-dependent source compression, omitted digit prefixes, fractionation, encrypted output alphabets varying every packet, or another interpretation of the two numbers. In particular **this is not an exclusion of RSA in general**.

## Real cryptographic positive control

The [standalone Node22/CommonJS original-source test](../sims/lp2_p33_39_1033_3301_rsa_packet_sft.cjs) additionally generates **336 real RSA ciphertext residues** under `n=1033×3301`, `e=65537`, `φ(n)=3,405,600`, `d=3,398,273`; deterministic four-digit GP29 input blocks yield five-digit ciphertext blocks. Direct modular exponentiation with the private exponent recovers **336/336 original input packets = 1,344/1,344 plaintext digits**. Every generated ciphertext fits the bound on five-digit packet leaders. This confirms the serialization and cryptographic arithmetic are operational and explains exactly which necessary invariant the untouched original contradicts.

The code reads and asserts the unchanged 1,680-rune source, computes every phase and every physical page, creates its own real RSA plant, checks the true private-key inverse and fails closed if the original packet count becomes compatible with the given moduli. It neither scores synthetic English nor searches for keys.

## Research decision

Retire **direct unsigned minimal-width fixed-alphabet RSA-residue packing using these two printed numbers** for the seven-page cuneiform chapter. The stronger unknown is whether the labels specify a different algorithm or a nontrivial value-to-rune channel. A successor should require a first-party rule explaining packet lengths, symbol capacity and original word/line breaks before trying new numerical transforms. Under the tested direct model, tuning RSA exponents can never decipher the source because most original packets do not represent legal residues. This is a capacity result, not a plaintext breakthrough.
