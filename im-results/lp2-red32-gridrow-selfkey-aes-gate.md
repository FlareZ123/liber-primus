# Red 13-dot intervals → printed 32×8 grid: one-row selector, bounded AES inversion

**Agent 45, 12 November 2026. Classification: exploratory, exact source-derived key construction and original-input negative. No unknown LP2 plaintext, authenticated cipher, key or destination recovered.**

## Clue and upstream limitation

The original 58-page LP2 contains **225 red runes** and **31 thirteen-dot punctuation stencils** (30 red and one black), which divide the chronological red-rune stream into **32 intervals**. The separate numerical table on physical pp49–51 has exactly **32 printed rows of eight tokens**. That is a specific visual-to-visual alignment a 2014 reader could notice. However no original caption commands a row selection, no source independently directs AES, and the interval lengths need not encode a table cipher. This experiment tests **one frozen, reversible interpretation**, not a search for a convenient fit.

The red-rune counts between consecutive 13-dot marks, retaining every zero-length interval and counting both colors of stencil, are derived directly from `resources/liber-primus/lp2-ink-annotations.json` in physical page/rune order:

```text
13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0
```

Their sum is 225. For each row `r = 0…31`, use **one** source token from the same-numbered printed 8-cell row, choosing column `L[r] mod 8`. Decode the already published conventional radix-60 table bytes as in `resources/liber-primus/lp2-grid-256.json`. This yields the literal 32-byte candidate key

```text
ed5c796d27503bfe7a2eadd396da492ac90d7d0ee9f0eb510044af8e006ac071
```

This is a genuinely specified *candidate key* from two original source structures. It is **not authenticated key material** because the modulo-eight selector is an inference and the radix-60 table is itself a conditional numeric interpretation. As a separate printed source, use the existing p15 prime/Fibonacci spiral's 16 printed integers reduced modulo 256 in its red-3299-anchored order for a literal IV:

```text
e3e2e0ded8ceba9650de16a81cc4b6a4
```

## Frozen original-payload test

Source bytes are the complete original row-major 256-cell table, with byte SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. There are no fitted row phases, byte offsets, password variants, hidden ciphertext corrections, or scored key selections.

1. Decode all 256 source bytes with standard **AES-256-CTR**, key exactly the 32 bytes above, counter initial block exactly the 16-byte spiral IV. The first 32 decoded bytes are `e9c7dea26e9fbaf97c7574eb488e6669d90dcd994e7712ef85a6c0c784afb88d`; only **81/256** bytes are printable ASCII (0x20–0x7E). There is no original prose or recognized opening file header.
2. Interpret the same 256 source bytes as a single **AES-256-GCM** packet, with nonce = first 12 IV bytes and last 16 table bytes as its tag. **Authentication fails.** This is a finite check of one packet layout, not a general exclusion of every authenticated format.

The same derived key and IV exactly re-encrypt the original AES-CTR output and recover a separate known ASCII plant. The reproducible script also encrypts and authenticates its own AES-GCM plaintext plant and confirms the genuine original packet rejects; ordinary CTR reversibility alone is not evidence of the key's historical correctness.

## Full 12,956-rune original-cipher consumer of the same frozen key

The byte-table interpretation might be a **key source for the 56 encrypted pages**, rather than ciphertext itself. This is a materially different data direction and receives one predeclared original-register test: produce a single book-continuous 12,956-byte AES-256-CTR stream from the exact selected key and p15 IV above; reduce each stream byte modulo29; for each original canonical GP29 rune take `P=(C−K) mod29` or the independently fixed inverse-sign control `P=(C+K) mod29`. Preserve literal GP F as a normal rune, all 55 rune-bearing physical pages in printed order, every word boundary and the runeless table page. There is no clock reset, hidden skip, offset fitting or alternate secret.

The original whole-book IoC is **0.0344783978645**. Source-key direct subtraction gives **0.0344907902518**, addition gives **0.0344716654618**. Both remain essentially uniform and neither gives recognizable GP prose. The subtraction opening is `I C P H L NG C N EO TH E Y B N C L I R L EO NG T M EA E IA A C Y B B TH P G D C R Y EO T O NG B M C OE G L`; the addition opening is `L J D IA NG B L L E NG E T OE A B NG J AE TH O X TH X M E T I X R IA W E F AE A T H D NG F TH Y H W F AE E TH`. The exact direct GP roundtrip reconstructs all **12,956/12,956** original source symbols but is a general AES additive identity, not a solved manuscript.

A withheld **95-rune original solved p57 GP** excerpt cyclically repeated to full source length is encrypted under the *actual same key and IV*, then recovered **12,956/12,956** by the original routine; its native reference IoC is **0.07248160773**. A single-byte-changed key recovers only **447/12,956** planted rune identities, wrong-key IoC **0.03445920158**. This confirms that the negative original output is not due to an incorrect AES implementation.

[Complete original-input source-key GP reproducer](../sims/lp2_red32_rowselector_fullcipher_aes_stream_sft.cjs), executed with all source checks and controls in [manual CI run 43161321926](https://github.com/FlareZ123/liber-primus/actions/runs/43161321926). It reuses the 32-interval derivation of the table consumer without reconstructing or selecting alternate key variants.

**Decision:** The original 31 marks / 32 rows correspondence does specify a complete 32-byte row-selected object under this explicit convention. However the chosen consumer fails to recover language or a valid authenticated packet, and the manuscript provides no AES instruction. Retire this literal one-byte-per-row **AES-256-CTR table, tagged AES-256-GCM table, and book-continuous AES-256-CTR GP29** interpretation; do not escalate to a menu of phases, ciphers, IVs or keyed skip variants absent an independent original instruction explaining how to consume the selected bytes. The row alignment remains a candidate visual clue rather than a decoded original key.

**Reproducer:** [source-native Node.js 22 CommonJS SFT](../sims/lp2_red32_gridrow_aes256_selfkey_sft.cjs). The AES-CTR literal was also independently calculated with Python `cryptography` against the pinned original byte hex (same first 32 bytes and printable count). No other source files were altered.

## Executed regression

Both original-source SFTs executed successfully under Node.js 22 in [manual GitHub Actions run 43160568313](https://github.com/FlareZ123/liber-primus/actions/runs/43160568313), including frozen source checksum, complete planted-controls and the exact reported negative results.
