# Eight original p50 columns as X25519 material: source-typed p55 receiver gate

**Agent38, 23 November 2026. Classification: narrowly negative original-cipher test.** All 56 LP2 physical p0–55 unknown pages remain encrypted. This test recovers no unknown plaintext, authentic key, deciphering instruction, or final destination.

## Why a human solver might try it

The p49–51 original numeric panel has exactly **32 rows × 8 columns**. In its ordinary as-printed base60 interpretation, the panel has eight 32-byte columns, which superficially fit a 256-bit modern curve public key. The eight sections of 2014 LP2 can each receive one column; the 2013 signed Cicada TCP challenge independently contains a real finite-field **Diffie–Hellman** worked example. The p55 *SHED* extraction had previously yielded conditional integers **P** (a certified 206-bit prime) and **S** (a finite-field DH shared value) with no authenticated recipient.

A straightforward rival is that these are ordinary random-looking data or parity-coded table cells, unrelated to elliptic-curve keys. No signed source tells readers to use X25519, ChaCha20, an all-zero nonce, or this cross-page key handoff. This investigation tests a single bounded technical receiver before accepting the key interpretation.

## Original-input contract

Source files are unchanged:
- [Original GP29 transcription](../resources/liber-primus/lp2-corpus.json), 12,956 ciphertext runes across 56 unknown physical pages, with runeless p50 included in the page map.
- [The 32×8 source grid](../resources/liber-primus/base60-grid.json) and original JPEGs 66.jpg–68.jpg.
- [The conditional p55 source arithmetic](lp2-p55-shed-circumference-prime-shell-original.md) for **P = 63755441409934721069036418908763882578170591536653256311514221**, **S = 40058585108914257367732574161222353642573409865793191134873737**.

Each integer is written as a zero-padded 32-byte **little-endian** X25519 private scalar, with standard RFC 7748 clamping performed by Node/OpenSSL. The eight **printed columns**, top to bottom, are each a 32-byte X25519 encoded public input. X25519 derives a 32-byte shared value for each of eight scopes. The scope order is the independent visual chapter order: **p0–2 (729), p3–7 (1,145), p8–14 (1,729), p15–22 (1,903), p23–26 (1,021), p27–32 (1,433), p33–39 (1,680), p40–55 (3,316)**.

Apply standard Node/OpenSSL \`chacha20\` with the shared value as key, 16-byte all-zero IV and section-local stream starting at zero. Two precisely defined GP transport readouts are used:

1. **Direct29:** \`P_i=(C_i-(byte_i mod29)) mod29\`.
2. **Step28:** start each section with \`C_-1=0\`, take \`d=(C_i-C_(i-1)) mod29\`; \`d=0\` emits provisional sentinel GP index28, and otherwise \`P_i=(d-1-(byte_i mod28)) mod28\`. This is a reversible anti-repeat transport with a reserved zero-step symbol. Neither the choice of sentinel nor this operation is an authenticated LP2 decoder.

The four source/model combinations (P, S × Direct29, Step28) each decode all eight native sections without fitted phase, offsets, secret nonce, column permutation or plaintext crib, totalling **32 fixed original outputs**.

## A keyless format obstruction before decryption

In ordinary canonical X25519 public-key output, the most significant bit of the final little-endian byte is zero, because the public value is a field element less than 2^255. The original eight printed columns end in byte values **[113,158,172,230,180,36,189,80]**. Five of eight, columns **1,2,3,4,6** (zero-based), have their high bit set. They are therefore **not the direct canonical output of eight conventional X25519 public-key generations**. RFC 7748 decoding masks this high bit on input, so a permissive curve exchange remains computable and was actually tested below. This observation is a structural objection to a straightforward source-authored eight-public-key table, rather than a theorem that no obfuscated or noncanonical curve representation is possible.

## Complete original-cipher outcome

All 32 inverses reconstruct their original source rune tape exactly when re-encoded. The RFC 7748 Alice/Bob X25519 shared-secret test vector passes in the same executable. Independent positive plants take the **original solved p57 95-rune plaintext**, encrypt it through each of the two readouts with the derived section stream, and decrypt it back to 95/95 correct runes.

| Derived private scalar | Direct29 output IoC over the eight original sections | Step28 output IoC |
|---|---|---|
| P (prime core/8) | 0.03431252–0.03466577 | 0.03501561–0.03552551 |
| S (conditional DH shared secret) | 0.03422601–0.03452902 | 0.03486970–0.03550096 |

The untouched original section IoCs are 0.03408252–0.03463371. **All 32 original outputs fall below the prespecified conservative 0.05 native-language screening threshold**, and none yields a sustained GP29 prose run. The source-transparent p57 paragraph's IoC is approximately 0.06271. The Step28 family mechanically biases its outputs by its reserved marker, without revealing readable text; a slightly elevated IoC is not a decryption.

## Decision

The entire **p50 eight as-printed 32-byte X25519 public columns → p55 P or S private integer → ChaCha20 zero-IV → original eight LP2 sections → Direct29 or reserved-zero-step Step28** route is negative on untouched original input under its exact fixed receiver. Directly treating the columns as canonical public-key output already conflicts with five source bytes. No additional secret private operands, nonces, hashes, radix choices, counter alignments or transport variants are justified by an original instruction, so this branch should not expand into a parameter sweep.

A future attempt requires new first-party evidence identifying either the table's byte roles, a correct key source, or a precise GP29 receiver. The original 2013 DH precedent alone does not authorize an elliptic-curve transfer.

**Reproduction:** [Single-file Node22 CommonJS SFT](../sims/lp2_p50_p55_x25519_original_sft.cjs) · [Completed Windows original-input and positive-control run 45132032708](https://github.com/FlareZ123/liber-primus/actions/runs/45132032708) · [Manual workflow](../.github/workflows/lp2-p50-p55-x25519-original-manual.yml). The script is read-only and prints the exact 32 original outputs' opening GP indices and SHA-256 digests, individual IoCs, all model replay assertions, the solved-p57 native positive, and the five noncanonical column indices.
