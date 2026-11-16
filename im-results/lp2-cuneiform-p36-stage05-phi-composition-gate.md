# p36 central 2014-square φ row plus Stage05 transposition: bounded negative

**Status: no LP2 plaintext or key recovered.** This is a finite test of one source-motivated two-operation composition on the original physical p36, not an attribution of that cipher to Cicada.

## Why this composition was worth one test

The original 2014 Stage10 material contains a 7×7 magic square whose rows and columns sum to 1033. LP2 pp33–39 form a seven-page cuneiform-marked section carrying the 1033/3301 legend. The central physical page is p36, so the square's central row is a natural page selector:

- Original central row: [16, 65, 270, 331, 270, 65, 16]
- Applying Euler's totient to each cell and reducing modulo 29 gives the fixed seven-symbol GP key [8, 19, 14, 11, 14, 19, 8].

The solved LP2 p56 cipher independently authenticates a GP29 additive operation with a plaintext-F bypass. Separately, the 2014 Stage05 original OutGuess message is decoded by the exact row-wise seven-character permutation with key 1736254. The p36 original page contains 238 runes, exactly 34 seven-rune blocks. These clues justify one bounded composition test; they do not prove that the two operations recur together in LP2.

## Frozen models

Use only the central 7×7 square row, the totient-derived key above, the exact historical Stage05 decoder, and the authentic plaintext-F bypass. No key phase, row, sign, page boundary, or transposition permutation is fitted.

Two layer orders were tested:

1. **Stage05 is the final layer:** plaintext → φ-row additive cipher → Stage05 transposition. Decryption therefore applies the exact Stage05 decoder first, then the φ-row inverse.
2. **Stage05 is the first layer:** plaintext → Stage05 transposition → φ-row additive cipher. Decryption therefore applies the φ-row inverse first, then the exact Stage05 decoder.

For each order both conventional additive signs were tested. At each ciphertext F the inverse preserves both legal possibilities: literal plaintext F without advancing the key, or an encrypted non-F rune that advances it.

## Original p36 result

| Model | Sign | Complete legal F-bypass histories |
|---|---:|---:|
| Stage05 final layer; decode transposition then φ-row | + | **0** |
| Stage05 final layer; decode transposition then φ-row | − | **0** |
| Stage05 first layer; decode φ-row then transposition | + | **3** |
| Stage05 first layer; decode φ-row then transposition | − | **0** |

The natural historical composition, with the Stage05 transposition as the outer/final layer, is algebraically impossible on the original p36 under the exact F-bypass rule: no key-phase history survives.

The alternate order leaves three complete outputs for the positive sign. Their English quadgram scores are **−7.508334**, **−7.420752**, and **−7.413007**. The best output begins:

    EIATEMWAEEGEMXGEAUBEAGPXEAEOAGAHRUBBWGXMCCIANGLMM...

This is not recovered prose. The best score remains about **2.99 log10 units per quadgram** below the independently solved p57 native-GP control.

For context, the original p36 ciphertext scores **−7.601099**; the direct φ-row-only inverse has three histories with scores **−7.581263**, **−7.544850**, and **−7.451431**. The small score changes under a fixed seven-symbol permutation do not make the output language-like.

## Controls and reproducibility

The SFT imports the exact original Stage05 encode/decode functions from sims/stage5_original_outguess_columnar_sft.cjs; it does not substitute the separate standard columnar-transposition convention. The original 2014 square file is pinned by SHA-256 9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f.

Two independent synthetic positive controls use the first 91 runes of solved p57 (13 complete seven-rune blocks). For both additive signs, the SFT encrypts and recovers the planted plaintext under each layer order, including all legal plaintext-F histories. This checks the implementation without inserting plaintext into the unknown p36 input.

Reproduce from the repository root:

    node sims/lp2_cuneiform_p36_stage05_phi_composition_sft.cjs

Inputs are the original canonical corpus, the original 2014 magic-square file, the pinned English quadgram reference, and the source-exact Stage05 decoder. The script prints every surviving full output and its score.

## Decision

Retire this exact p36 composition. The source-selected Stage05-final order has no legal inverse; the alternate order produces only three nonlinguistic outputs. Do not expand into other pages, square rows, transposition directions, phases, or additional cipher layers without an independent original clue selecting them.

This is an intermediate exclusion, not an established manuscript result. The authoritative synthesis remains unchanged.
