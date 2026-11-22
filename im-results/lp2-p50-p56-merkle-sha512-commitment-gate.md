# Original pp49–51 table as a SHA-512 Merkle commitment to the p56 destination

**Classification: finite negative original-source cipher/destination hypothesis (Agent 5, 13 November 2026).** Five fixed, plausible binary Merkle constructions of the 256 printed table bytes have **zero exact root matches** to the independently solved p56 SHA-512 hash. The table and its interpretation remain available for other, separately motivated operations. No original unknown plaintext, secret key or continuation page was recovered.

## Why a human might try this

Original physical LP2 pp49–51 present **32×8 = 256 two-character numeric cells** across three page images, capable of expressing 256 byte-valued leaves under the conditional conventional base60 alphabet. Original p32 and p55 feature tree drawings, and p56 explicitly describes a page identified by a **512-bit SHA-512 digest**. A binary tree with 256 leaves has exactly eight reduction levels. Cryptographic hash trees were publicly understood before the 2014 release.

These source objects make a specific, low-cost decipherment/continuation question possible: **is the original table a Merkle commitment whose root exactly equals p56's authenticated digest?** If yes, the match of 512 independently fixed bits would identify a strong cryptographic connection and an executable rule for the table. A player might then inspect the tree geometry and its leaves for the hidden destination. The strongest objection is that none of the visible illustrations or prose actually instructs a Merkle operation, and p56 calls its digest the hash **of an external page**, which need not equal any Merkle root.

The canonical conditional base60 serialization of the printed 256 cells has SHA-256 checksum

\`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

The original solved p56 reference contains the 128 hexadecimal digits

\`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4\`.

The test asserts both source inputs before computing any root. The byte interpretation remains **conditional**; the source does not explicitly assign the base60 alphabet.

## Frozen reversible data arrangement and root calculation

No source bytes or printed tokens are omitted, changed, offset or rearranged. The experiment selects five natural source-framing options, with a different number of leaves but one identical cryptographic operation. Each leaf is hashed with standard SHA-512, and each parent is

\[
\mathrm{SHA512}(\text{left 64-byte digest}\mathbin{\|}\text{right 64-byte digest}).
\]

All counts are powers of two, so there is no leaf-duplication ambiguity.

| Frozen leaves, source order | Number of leaves | Computed SHA-512 root, initial 24 hex digits | Equal to original p56 digest? |
| --- | ---: | --- | --- |
| Individual decoded table bytes, row-major | 256 | \`662d746b69f31369daee6565\` | **No** |
| Literal printed eight-byte rows, top-to-bottom | 32 | \`173b834e3acfc2bad0dfaf4\` | **No** |
| Literal printed 32-byte columns, left-to-right | 8 | \`3d9b20a83751e67615b328ef\` | **No** |
| Individual original two-character ASCII tokens, row-major | 256 | \`c67dfb2405c81033229339eb\` | **No** |
| Consecutive pairs of decoded table bytes, row-major | 128 | \`9c27f11f1fcdf09e3369342e\` | **No** |

The complete 128-digit roots and exact source serialization are asserted in the runnable [original-source CommonJS SFT](../sims/lp2_p50_sha512_merkle_tree_source_sft.cjs). Independent Python 3 \`hashlib.sha512\` computation on the exact printed cells confirmed all five full roots, and the script validates the published SHA-512 digest of \`abc\`, the table SHA-256, token-to-byte agreement and a source-shaped flipped-byte negative control. The standalone Node.js 22 original-source test **passed** in [manual CI run 43475047988](https://github.com/FlareZ123/liber-primus/actions/runs/43475047988) after its committed source passed JavaScript parsing. Both independent Python and source-original Node executions agree on all five full roots.

## What changed, and what remains

The five specified root-as-p56-digest models are ruled out without plaintext language scores, key fitting or low-significance partial matches. A 512-bit match would have been decisive, while absence of a match only excludes these exact finite models. Other possible constructions such as domain-separated Merkle schemes, unseen leaf material, an authenticated salt or key, alternate source serialization, a non-Merkle use of the table, or the genuine external page content remain open **when separately indicated by new source evidence**. Unconstrained format and key variations would only turn this bounded answer into another arbitrary search.

This test is distinct from the existing [direct table-to-digest SHA-512 gate, Director #124](https://github.com/FlareZ123/liber-primus/issues/124) and [literal consecutive-block hash-chain gate, Director #569](../im-results/lp2-p50-sha256-sha512-block-chain.md). It is a complete decision about **binary-tree aggregation as a self-verifying destination commitment**. There is still no independently sourced operation that recovers any of the 56 unknown pages.

**Reproduction:** from the repository root, run \`node sims/lp2_p50_sha512_merkle_tree_source_sft.cjs\` (Node.js 22, built-in libraries only). The SFT reads \`resources/liber-primus/base60-grid.json\` and the solved source \`resources/liber-primus/lp1-plaintext-reference.txt\`, asserting the exact input bytes and the complete five outputs.
