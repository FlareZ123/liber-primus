# F31 marker-labelled fragment map: bounded negative screen

## Question

Does the source-visible 13/31 relationship define a useful ordering of the 32 fragments and 32 rows of the LP2 base-60 table?

This is a motivated hypothesis, not an established instruction. The source has 31 thirteen-dot marks (30 red, one black), 225 red runes, and therefore 32 intervals. The five-dot ornament visibly supplies 13 and 31; 13 has multiplicative order 30 modulo 31. The table has 32 rows of 8 bytes.

## Exact mapping tested

1. Sort all 31 thirteen-dot marks by physical page and rune offset. At the shared p7 offset 194, order the black mark before the red mark.
2. Give the 30 red marks, in physical order, labels (13^j \bmod 31), for (j=0,\ldots,29). Give the unique black mark label 0.
3. Each mark labels the fragment immediately following it. The leading fragment, which has no preceding mark, receives sentinel label 31 from the all-solid five-dot motif.
4. The black mark at p7:194 consequently labels fragment 8, the known empty interval, as row 0.
5. Use the resulting fragment-to-row bijection:

`[31,1,13,14,27,10,6,16,0,22,7,29,5,3,8,11,19,30,18,17,4,21,25,15,9,24,2,26,28,23,20,12]`

The first 28 fragments cover all 12,956 unknown runes; the last four are the known solved-page tail. The first 18-fragment training boundary is rune 6,546, leaving 6,410 held-out runes.

The 32 chronological red-rune fragment lengths are:

`[13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0]`

Reordered by F31 label, they become:

`[0,0,9,11,0,9,11,12,0,0,0,16,0,16,0,3,0,10,0,0,7,8,14,0,59,0,0,3,5,0,19,13]`

This is the exact 32-byte candidate key used in the key-based screens below.

## Experiments and outcome

All screens used original corpus indices and original ink annotations. The same English-GP trigram model was used throughout. A withheld Shakespeare-English positive plant decoded exactly and scored -2.4002 nats/rune; the original ciphertext scored -6.1959 overall, with -6.2134 on the training split and -6.1773 on held-out data. Thus the scoring control distinguishes genuine English-like recovery from random-looking output.

| Screen | Fixed construction | Models | Best training-selected held-out score | Outcome |
|---|---|---:|---:|---|
| Grid-row nonce inverse | F31-ordered red32 key; same-labelled 8-byte grid row as per-fragment IV; AES-256-CTR/ChaCha20; GP29 additive, GP28 exclusion, GP28 root-15 exponent | 384 | -6.1818 | No held-out improvement over raw (-6.1773); no coherent text |
| Direct red32 EA pad | F31-ordered red32 bytes repeated under the root-15 transparent-EA inverse; global, page, or fragment clock | 24 | -6.1828 | No held-out improvement; no coherent text |
| Per-fragment row pad | Each fragment's same-labelled 8-byte grid row repeated as its GP29/GP28 pad; fragment reset | 12 | -6.2595 | Worse than raw; no coherent text |
| Red-only transposition | Concatenate the 32 red-rune fragments in ascending F31 label order | 1 | -6.2570 | Worse than chronological red order (-6.1587); no message |

For the 384-model screen, the nominal best-held-out candidate (-6.0776) was selected after looking at the held-out scores and is therefore not a valid independent result. The candidate selected on training data performs slightly worse than the raw held-out baseline. Normalized IoC rises modestly for several GP28 candidates, but this is not accompanied by language recovery and is not evidence of plaintext.

The exact inputs, mappings, configurations, model outputs, and positive controls are preserved in:

- `sims/lp2_f31_fragment_key_inverse.cjs` and `im-results/f31-fragment-key-inverse.json`
- `sims/lp2_f31_direct_ea_pad.cjs` and `im-results/f31-direct-ea-pad.json`
- `sims/lp2_f31_fragment_row_pad_inverse.cjs` and `im-results/f31-fragment-row-pad.json`
- `sims/lp2_f31_red_fragment_transposition.cjs` and `im-results/f31-red-fragment-transposition.json`

The CI entry point is `.github/workflows/lp2-fivedot-lfsr-manual.yml`; the F31 job runs on changes to these scripts and stores the JSON outputs.

## Interpretation

**This particular F31 fragment-to-row assignment has not produced plaintext under the tested direct transposition, red32-key, grid-row-IV, or per-fragment-row-pad uses.** Do not repeat these exact screens or treat small best-of-family score changes as a lead.

This does not disprove the visible 13/31 relationship, the 32-fragment count, or the 32×8 table. It only rejects these specific uses of the F31 labels. A future use needs a new clue selecting a different role for the mapping; unconstrained permutations or additional cipher layers are not justified by these results.

The mod-32 LCG whole-text fragment permutation being investigated separately by Agent 46 is a different hypothesis and was not tested here.
