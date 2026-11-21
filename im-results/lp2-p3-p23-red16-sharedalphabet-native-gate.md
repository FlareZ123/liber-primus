# Two visually marked LP2 red16 titles: all-secret shared substitution alphabet

**Agent14, 21 November 2026. Bounded original-cipher exclusion.** A source-defined pair of 16-rune red headings, on physical LP2 p3 and p23, cannot be encoded by one fixed *arbitrary* bijective GP29 substitution alphabet if their most constraining printed words are ordinary native-GP vocabulary words. This is independent of the previously rejected shared additive pad model, and still recovers no unknown-page plaintext, actual cipher, authorial key or final destination.

## Distinct clue, exact source, and keyless invariant

The original JPGs `20.jpg` and `40.jpg` have the only two separately printed red16 heading paragraphs of this shape, at p3 and p23. Their original visible word divisions are **2|11|3** and **2|6|3|5**, respectively. The canonical `resources/liber-primus/lp2-corpus.json` and literal `lp2-transcription.txt` give unchanged heading index sequences:

- p3: `[20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]`
- p23: `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`

This finite candidate is a **shared, phase-independent 29-way monoalphabetic codebook**: the same arbitrary injective map from 29 GP plaintext rune identities to 29 ciphertext rune identities is used across both complete headings. It need not be affine, additive, ordered, sourced from any guessed key, or related to the numeric table. Such a map must preserve **every equality and inequality of rune identities** within each word and across both words. That is a key-independent invariant of *all* (29!) possible secret alphabets.

The real weakest premise is that both headings would share one monoalphabetic cipher. Neither original red ink nor the signed historical source explicitly says so. The test therefore constrains this appealing shortcut without asserting its authorship.

## Finite native lexicon original result

Use the same pinned **32,190-word** GP29-encodable project native vocabulary as the separate [shared-pad original gate](lp2-p3-p23-red16-sharedpad-native-gate.md): TextBlob frequency, Shakespeare, Gibran and Emerson; `IO→IA`, `ING→NG`, `V→U`, `K/Q→C`, `Z→S` are explicit normalization rules. Count a word compatible only if its complete GP rune sequence has exactly the **same equality and inequality pattern** as the relevant original cipher word.

The 11-rune p3 middle glyphs have pattern

`0,1,2,3,4,5,6,7,5,8,1`.

Only **one** dictionary word shares it: `descriptive`, among 1,708 native eleven-rune words. This **is not a decrypt**, because any arbitrary substitution can map the displayed cipher shape to that coincidental spelling, and the actual plain word may be outside the lexicon.

The second p23 title word has six glyphs and pattern `0,1,2,3,4,2`; **137** native six-rune words satisfy its own pattern. Yet **none** can share the same injective source-to-plaintext rune map required by `descriptive` on p3's eleven-rune middle. The complete fixed pair requires **zero compatible `11↔6` dictionary-word choices**, before considering either title's other five words. The contradiction is exact even when the secret GP29 substitution is completely unrestricted, rather than fitting a short finite key.

A planted native pair `DESCRIPTIVE` and `FORMER`, enciphered under the *same* invertible 29-way map `C=(7P+3) mod29`, passes the exact shared-codebook word-pair gate; using an independently shifted map for `FORMER` fails it. This controls the equality-constraint implementation without claiming this fixed affine map belongs to Cicada.

## Decision and narrow scope

The two original red headings cannot both have the p3 middle word and p23 second word drawn from this pinned ordinary English GP29 lexicon under **a shared global monoalphabetic codebook**, regardless of its 29 unknown permutations. The narrow first-title local shape alone has one accidental normal-word match, and must not be promoted to the plaintext `DESCRIPTIVE`.

This is *not* an exclusion of different page alphabets, positional changing keys, F-transparent nonlinear updates, unusual foreign/proper names outside the lexicon, altered word divisions or a more complex cipher. It supplies no cipher key or decrypted runes. Reopen only on an independent source instruction connecting two headings' alphabets.

**Reproduction:** [one-file Windows22 CommonJS SFT](../sims/lp2_p3_p23_red16_sharedmono_native_sft.cjs); [successful CI run 44946315241](https://github.com/FlareZ123/liber-primus/actions/runs/44946315241), including exact original hashes via full original GP indices and complete synthetic positive/negative controls.
