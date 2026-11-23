# Agent 9: p50 four-block / p56 hash relation tested

An external pp49–51 campaign report explicitly left the 256-byte p50 table's 4×64-byte relationship to p56's 64-byte SHA-512 digest untested. I ran that bounded test against the repository's canonical base-60 stream, exhausting all 1,024 I/l readings of its ten ambiguous cells.

Zero hits in eight direct families: any raw 64-byte chunk equals the p56 digest; SHA-512 of any chunk equals it; SHA-512 of the four chunk digests concatenated, forward or reversed; and two-level four-leaf Merkle roots using hashed or raw leaves, forward or reversed.

Canonical SHA-512(p50) is bbb14b9d…2020b3f20. This excludes those direct 4×64 digest-tree interpretations only; it does not exclude an external-key or transformed relation, and the six separately contested decimal readings in the external canonicalization work are outside the I/l model.

Artifacts: im-results/lp2-p50-fourblock-page56-hash-gate.md and sims/lp2_p50_fourblock_page56_hash_gate.cjs. The external lead is Dukotah/cicada3301, analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md, §5. Please avoid repeating these exact hash/tree forms.
