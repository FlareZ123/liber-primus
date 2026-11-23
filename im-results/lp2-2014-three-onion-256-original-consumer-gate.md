# Three original 2014 onion 256-byte strings: actual consumers and LP2 seed gate

**23 November 2026, Agent7. Decision for [Director #2350](https://github.com/FlareZ123/liber-primus/issues/2350): no Cicada-authored generator/seed/nonce consumer or LP2 selector is established for these three original strings.** The strings are genuine archived historical page material, but the most concrete contemporary consumer is a **participant-authored Perl XOR experiment** that does not yield a typed object. No arbitrary cryptographic key derivation has been attempted and no LP2 plaintext or key has been recovered.

## Separate original source locations, names and formats

All three captured strings contain **512 ASCII hexadecimal characters = 256 bytes** and have **distinct historical webpage addresses/stages**, rather than appearing together in a single signed Cicada protocol:

| Label in historical participant collection | Archived page/source | First 12 hex bytes | Historical role |
| --- | --- | --- | --- |
| `761` | [2014 second-onion/early status HTML](../resources/external/2014-stage03-index.html); [dated growth witnesses](../resources/cicada2014-onion2-timing.json) | `634292ba49fe336edada779a` | Page's initially growing hex string |
| `1033` | [2014 third onion static HTML](../resources/external/2014-stage04-index.html) and [contemporary Stage005 source archive](https://github.com/neuroretransmit/cicada/blob/master/2014/005-third-onion/512.raw) | `87de5b7fa26ab85d2256c453` | Page with HTML comment `<!--1033-->`, subsequently updated to large JPEG-containing hex |
| `3301` | [2014 fourth onion preliminary 256-byte page](https://github.com/neuroretransmit/cicada/blob/master/2014/006-fourth-onion/avowyfg151kzfj3n_256.hex) | `bf1d5574ca36efd524e6c34c` | Preliminary 256-byte hex replaced after downtime with a gzip carrier containing LP1 pages6–9 |

The three unchanged full strings are preserved together in [the contemporary three-string collection](../resources/external/2014-stage05-three-onion-hex-blocks.txt). The [third-onion archival reconstruction](https://github.com/neuroretransmit/cicada/blob/master/2014/005-third-onion/README.md) explicitly calls its first 512-hex artifact a **loose end** and describes the subsequently supplied multi-image payload. The [fourth-onion reconstruction](https://github.com/neuroretransmit/cicada/blob/master/2014/006-fourth-onion/README.md) likewise describes the 256-byte first page being replaced after downtime by an **actual gzip file** carrying later pages. The gzip decoding operation applies to the later, longer gzip file, not to the original 256-byte 3301 placeholder.

## One real participant-authored consumer, and its explicit limitation

The contemporary public [micheloosterhof/cicada-2014 `stage05/test.pm`](https://github.com/micheloosterhof/cicada-2014/blob/master/stage05/test.pm) literally embeds the three exact 256-byte strings, parses each into Perl byte arrays, and outputs `dec1033[i] XOR dec761[i] XOR dec3301[i]` for each i=0…255. An alternative bytewise `(dec1033+dec761+dec3301) mod256` is present only as a **commented-out** experiment. This is the clearest discoverable historical function actually consuming all three strings, but its source is an **investigator test script**, not a Cicada-signed or served instruction. The associated Stage05 README only requests the page with Tor `wget` and does not specify XOR, an LP2 receiver, a key schedule or a generator.

Directly evaluating the literal three-way XOR operation on those historical bytes yields the complete **256-byte** output, whose first 32 bytes are:

`5b819cb121a264e6dc6a7085f53b20212a4637fe647801b6134d10ec2e6e88475`

Only **95/256** bytes are printable ASCII (`0x20`–`0x7e`), and the initial bytes do not identify an ASCII signed message, gzip, JPEG, ZIP, PNG or other obvious typed historical receiver. This is a **diagnostic**, not a proof against a binary payload with an unknown codec. Under the commented-out addition alternative, the leading 32 bytes are `a93d42adb59edaa02016fe3941c5dc95d4bac7487acef94c0fc5de9228a07637`, with **82/256** printable. Neither operation has an original author-supplied key, nonce, iteration rule or destination in the archived source.

## Decision and next causal requirement

The original source-selected path through the 2014 service uses the **updated** JPEG/gzip carriers, explicit image/OutGuess operations, original rune decipherment, and onion URLs. Source reconstruction establishes this path without requiring the temporary three 256-byte strings to be PRNG seeds. The participant Perl XOR does not independently select a cipher or clock on unknown LP2 pages. Therefore this branch fails the mandated author-instruction/consumer prerequisite; **do not commission SHA-256, AES, MT19937, KDF, XOR-pad phase or rejection-clock sweeps based solely on equal byte lengths or prime labels**. Existing unrelated [epoch-seed screen](lp2-2014-epochseed-two-original256-gate.md) and [authentic three-share XOR](lp2-2014-onion3-triple-xor-original-table-gate.md) already cover sharply different inputs.

Reopen this route only if an independently authenticated Cicada source identifies these specific **256-byte** strings as operands for a named receiver, with a decoder and original LP2 input relation. The current archival record cannot certify that a missing historical instruction never existed, but it supplies no supported original-cipher inversion. This is a documented negative source gate, **not** evidence of a plaintext solution.
