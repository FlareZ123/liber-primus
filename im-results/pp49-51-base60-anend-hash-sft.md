# pp49–51 base-60 payload versus the p56 AN-END SHA-512 digest

**Verdict: bounded negative.** The canonical 256-byte payload is not the direct SHA-512 preimage of the digest printed on LP2 p56. None of its four aligned 64-byte quarters is either the digest itself or a SHA-512 preimage of that digest, under any of the eight natural table traversals tested.

## Why this was worth testing

LP2 pp49–51 contain a printed 32×8 base-60 table that decodes in its canonical reading order to 256 bytes. The solved p56 page supplies a 64-byte SHA-512 digest. The length relation 256 = 4×64 motivates a narrow, source-fixed check: perhaps the table itself, or one of four 64-byte blocks, is the page whose hash p56 prints.

This is a direct-hash test, not a claim that the table is intended as a hash preimage.

## Inputs and method

- Payload: `resources/liber-primus/base60-grid.json`, `byte_rows`, exactly 32 rows × 8 byte values.
- Target: the p56 digest recorded in [the original-source p56 hash gate](lp2-p56-hash-2016-signed-tree-source-gate.md):
  `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.
- Hash: SHA-512, checked first against the standard `SHA512("abc")` vector.
- Readouts: row-major and column-major, each with both axis directions (eight total).
- For each readout: hash all 256 bytes; compare each of its four aligned 64-byte blocks directly with the target; hash each 64-byte block and compare that digest with the target.

No salt, padding, keyed hash, KDF, arbitrary permutation, guessed serialization, or external-page content is introduced.

## Results

Canonical row-major payload SHA-512:

`bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20`

| Traversal | SHA-512 of 256 bytes | Equals p56? |
|---|---|---|
| Row-major, top-left | `bbb14b9db89b0a55…2020b3f20` | No |
| Row-major, top-right | `c709587806c9a9e4…a108dd35` | No |
| Row-major, bottom-left | `f9d5973b6f0d3171…67d4ebca` | No |
| Row-major, bottom-right | `48622d5be257cd3f…912e654f` | No |
| Column-major, top-left | `1456aeb3b11e4588…b78f70914` | No |
| Column-major, top-right | `65835fc70ebdd553…c4f418c1` | No |
| Column-major, bottom-left | `aa4a2fe153bef440…ff24181a` | No |
| Column-major, bottom-right | `de8168bcd6a9baab…cbce0ca41` | No |

Across the eight traversals: **0/8** whole-payload matches, **0/32** aligned-block equality matches, and **0/32** aligned-block SHA-512 matches. The known-vector control passes.

## Interpretation and limits

This closes the simple interpretation that the canonical pp49–51 256-byte table is itself the direct SHA-512 preimage to p56, or that one of its four aligned 64-byte blocks is that preimage (or the printed digest). It does **not** exclude the table as a key, salt, PRF seed, KDF input, encrypted intermediate, or an input to a source-specified transformation. Nor does it identify the unknown page behind the p56 hash.

Reproducer: [`sims/pp49_51_base60_anend_hash_sft.py`](../sims/pp49_51_base60_anend_hash_sft.py).
