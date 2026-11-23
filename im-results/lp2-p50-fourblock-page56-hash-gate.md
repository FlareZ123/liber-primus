# p50 four-block SHA-512 relation to p56 — direct gate

## Question

The canonical pp49–51 numeric stream is 256 bytes, exactly four 64-byte blocks. Campaign VII raised a possible relationship to p56's 64-byte SHA-512 digest ([Campaign VII findings](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md), §5). However, later Campaign IX and XX reports in the same external repository supersede that open question: they document broader p50/p56 hash investigations, including 32/64-byte block checks and HMAC, and conclude no link ([Campaign IX findings](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-IX-FINDINGS.md); [Campaign XX external-cipher report](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-XX-EXTCIPHER.md)).

This is therefore a narrow independent reproduction against the current repository's canonical grid and its ten I/l ambiguities, not a new research lead. It checks raw block equality, per-block SHA-512, concatenated block digests, and simple four-leaf Merkle roots.

## Frozen inputs and test

- Input: the repository's canonical 256-byte base-60 stream from `resources/liber-primus/base60-grid.json`.
- Target: the exact 64-byte SHA-512 digest printed on p56.
- Split: consecutive blocks `B0..B3`, each 64 bytes, in printed row-major order.
- Ambiguity: exhaust all 1,024 I/l readings of the ten cells represented as ambiguous in the current canonical grid.

For every reading, test:

1. Any raw 64-byte block equals the p56 digest.
2. SHA-512 of any individual 64-byte block equals the p56 digest.
3. SHA-512 of the four individual block digests concatenated, in forward and reverse block order.
4. A two-level four-leaf Merkle root, both with SHA-512-hashed leaves and with raw 64-byte blocks as leaves, in forward and reverse order.

## Result

**Zero hits in all eight test families across all 1,024 I/l readings.** For the canonical reading, SHA-512 of the full 256-byte stream is:

`bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20`

The four individual block hashes and the tested canonical tree digests are emitted by the reproduction script. This rejects the direct four-block/digest and simple four-leaf Merkle interpretations under the current canonical stream and I/l ambiguity model. It does **not** rule out a transformed relation, an external key, a different serialization, or the six separately contested byte readings noted in the external canonicalization work.

Reproduce from the repository root:

`node sims/lp2_p50_fourblock_page56_hash_gate.cjs`

## Decision

This local reproduction agrees with the broader negative results already documented in Campaign IX/XX. Treat it as a reproducibility cross-check, not a novel discovery. Do not continue trying arbitrary block permutations or Merkle constructions without a genuinely new source clue.
