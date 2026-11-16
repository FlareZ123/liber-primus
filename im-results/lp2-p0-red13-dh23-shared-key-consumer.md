# p0 red-title prime sums as a 2013 DH candidate: source-to-operand gate

**16 November 2026, Agent26. Status: reproducible arithmetic candidate; no unknown plaintext or LP2 key recovered.** This report records the strongest red-title/DH interpretation and tests its simplest p56-family consumer. It does not promote a numerical alignment into a source-selected key.

## Original p0 input and arithmetic

The original p0 red title has two words, 8 and 5 GP runes, separated by the small red word separator. The original transcription and canonical corpus agree on the 13-rune sequence. Summing the source Gematria Primus prime weights within each word gives:

| Field | Rune count | GP-prime sum | Modulo 23 |
| --- | ---: | ---: | ---: |
| First red word | 8 | **347** | **2** |
| Second red word | 5 | **315** | **16** |

The signed 2013 TCP-server source contains a worked Diffie–Hellman group with modulus \(p=23\) and generator \(g=5\). In that group, the two derived residues have discrete logarithms:

\[
5^2 \equiv 2 \pmod{23},\qquad 5^8 \equiv 16 \pmod{23}.
\]

They therefore yield the same shared scalar:

\[
16^2 \equiv 2^8 \equiv \mathbf{3}\pmod{23}.
\]

The arithmetic is exact and reproducible. Additional alignments are the 8−5 word-length difference of 3 and the second red word's final GP index 5, equal to the source generator. These are suggestive cross-checks, not independent proof that the red words were intended as DH shares.

## Why this is not yet an LP2 key

The signed 2013 source authenticates a participant-operated DH protocol and a worked \(p=23,g=5\) example. It does **not** say to sum the p0 red words' GP prime weights, reduce those sums modulo 23, or treat the resulting 2 and 16 as the two public shares. Its server/client role split uses participant-chosen DH values; the source does not identify the p0 words as an organizer-supplied DH exchange. Nor does it specify a KDF, a GP29 rune-to-byte conversion, a keystream serialization, or an LP2 receiver for the shared scalar 3. The 2013 `BASE29` command is a separate positional integer conversion and does not fill this gap.

Thus the red-title arithmetic is a **source-motivated hypothesis**, not a source-selected operation. Without a source-selected consumer, scalar 3 cannot be promoted to the key for any unknown LP2 page.

## One direct p56-family consumer fails at the first black rune

A natural downstream test is to use the scalar 3 as the starting prime for the authentic prime-totient cipher. The first key is \(\varphi(3)=2\). The first black p0 ciphertext rune after the 13-rune red title and 13-dot marker is TH, GP index 2. Subtracting the first key gives:

\[
P_0 = (2-2)\bmod29 = 0 = \text{F}.
\]

The plaintext-F-transparent forward rule is independently established on three solved Cicada controls: LP1 WELCOME/DIVINITY, LP2 p56, and the complete LP1 second koan. Plaintext F is emitted as ciphertext F and consumes no key symbol. Consequently, if this p56-family cipher is transferred to p0, a key-consuming inverse that turns ciphertext TH into plaintext F is illegal: the corresponding forward ciphertext would have to be F, not TH.

This rejects the **specific direct consumer** “DH scalar 3 → start p56 prime-totient stream at prime 3 → decrypt p0 from its first black rune.” It does not prove p0 uses the p56 cipher, and it does not exclude a different source-selected use of the DH scalar.

The simplest direct Caesar shifts by ±3 and Atbash-plus-shift−3 also fail to produce a readable first black word; the SFT records their exact transformed strings without treating language scoring as a key selector.

## Reproduction and source limits

Run from the repository root:

```sh
node sims/lp2_p0_red13_dh23_consumer_sft.cjs
```

The script reads the original rune-index corpus and transcription, verifies the 8+5 red-title split and prime sums, computes the discrete logarithms/shared scalar, and checks the first-symbol p56-family consumer. Primary source references:
- [Signed 2013 TCP-server source](../resources/external/2013-tcp-server-signed-source.md)
- [2013 source-operation synthesis](../results/2013-original-gp29-source-map.md)
- [Original p0 red-ink boundary adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md)
- [Blind F-transparent decoder positive on three solved controls](lp2-ftransparent-word-lexical-viterbi.md)

**Decision:** retain the red-title DH arithmetic as an interesting but unselected candidate; reject its direct p56 prime-totient consumer under the verified F-skip rule. No complete p0 sentence, second blind sentence, unknown-page plaintext, key, or intended destination is recovered. Do not search arbitrary KDFs or consumers without a new first-party selector.
