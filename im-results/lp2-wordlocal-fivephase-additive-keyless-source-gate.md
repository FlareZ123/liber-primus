# Three-register key-independent GP29 word-local five-phase affine exclusion

**Agent20, 16 November 2026. Classification: original-input finite-register exclusion.** The genuine Liber Primus unknown pages remain undeciphered. This study extends a **previously established key-independent all-secret GF29 five-phase affine word test** beyond its original English fixture to independently pinned **Latin Vulgate and corrected Old English Beowulf**, with exact independent word-shape controls. It does not rediscover the English-only theorem or recover plaintext.

## Original-source premise and existing key-independent technique

The unsolved original LP2 p0–55 has **12,956 GP29 runes, 2,896 authentic printed words and 32 page-carrying words**. There are **104/2,105 within-word lag-five echoes** and only 86 adjacent repeat runes. These source features suggest testing five repeated key positions within each printed word. Earlier work already formalized the strongest direct *word-local affine* family in [the original all-secret word-local test](../sims/lp2_wordlocal_fivephase_allsecret_sft.cjs) and demonstrated **0/109** original long words compatible with the English source register. The missing discrimination was whether a plausible different underlying language, particularly Latin, could evade that English-only bound.

A historically plausible and very generous model rekeys **every word independently**, allowing one arbitrary nonzero GF29 multiplier and five completely unconstrained phase shifts:

\[
  C_{w,j}=a_w P_{w,j}+k_{w,j\bmod5}\pmod{29},
  \quad a_w\in\{1,\dots,28\}.
\]

No relationship between successive word keys is assumed. For every position \(j\ge5\), the five phase shifts cancel:

\[
  d^C_{w,j}=(C_{w,j}-C_{w,j-5})\bmod29
  =a_w(P_{w,j}-P_{w,j-5})\bmod29
  =a_w d^P_{w,j}.
\]

Because GF29 is a field, if the vector contains any nonzero component, divide **the entire vector** by its first nonzero component. The multiplier \(a_w\) disappears. If all differences vanish, use the all-zero vector. Consequently **the full projective fifth-lag difference signature is identical for plaintext and ciphertext under every one of \(28\cdot29^5\) per-word keys**, without searching any of them. For fixed original word length, compare this signature against all GP-native candidate plaintext words.

We also evaluate two intuitive subfamilies to make the source-era cipher interpretation transparent: (a) additive period-five Vigenère (fix \(a_w=1\)); and (b) arbitrary per-word **±Atbash/ROT orientation** in each phase, allowing five independently flipped signs \(\epsilon_{w,r}\in\{-1,+1\}\) with five unconstrained shifts. In case (b), each phase's fifth-lag *whole vector* is canonicalized under sign reversal. Both subfamilies have the same long-word exclusion, but the complete arbitrary-multiplier test above is strictly more general than either one at the source word lengths.

## Three independent GP-native source language registers

The fixed reference datasets are the project's **29,157-word modern English** frequency fixture, the independently corrected 10,885-word/48,012-rune Old English *Beowulf* source, and the 39,835-source-word Latin *Vulgate* New Testament fixture. Each source retains its original word boundaries before GP transcription. Use original GP runes and native orthography for TH, NG/ING, AE, EO, IA/IO and K/Q→C, V→U, Z→S, without changing the ciphertext. A finite corpus absence should not be extrapolated to every possible word in a language.

For each length, the table lists the number of *original printed LP2 words* compatible with **at least one candidate reference word** under **any nonzero scalar multiplier and five entirely independent word-phase keys**.

| Original printed runes | Original LP2 words | Modern English compatible | Old English *Beowulf* compatible | Latin *Vulgate* compatible |
|---:|---:|---:|---:|---:|
| 6 | 256 | 256 | 256 | 256 |
| 7 | 216 | 216 | 216 | 216 |
| 8 | 156 | 153 | 32 | 111 |
| 9 | 78 | 9 | 0 | 3 |
| 10 | 52 | **0** | **0** | **0** |
| 11 | 32 | **0** | **0** | **0** |
| 12 | 18 | **0** | **0** | **0** |
| 13 | 4 | **0** | **0** | **0** |
| 14 | 3 | **0** | **0** | **0** |
| **Total length 10–14** | **109** | **0** | **0** | **0** |

Under the exact source word lengths and three finite reference corpora, **none of the 109 original 10–14-rune words can be a word in any of those registers under any independent five-period affine key**. This is a new original-input extension of the stronger existing English theorem. The result is significant against Latin as an alternative register: the more permissive **arbitrary five-phase secret alphabet's equality-only signature** matches **107/109** original long words in that Latin source ([independently established register contrast](lag5-contiguous-echo-second-order.md)), yet all 109 fail the necessary modular affine relationship. Thus the Latin equality matches cannot rescue an affine five-phase inverse via choosing different per-word keys.

The independent ±Atbash/ROT subfamily gives zero compatible words at every length 10–14 in all three reference corpora. At shorter lengths, its supported source word counts are:
- 6 runes: English/Old English/Latin = 256/256/256;
- 7 runes: 216/159/200;
- 8 runes: 100/4/46;
- 9 runes: 6/0/2.

The additive case gives respective original support counts for length 8 of 24/1/4 and length 9 of 1/0/1; the stronger multiplier gate subsumes both. The all-arbitrary 29! secret substitution family is **outside** this affine theorem and remains distinguishable from an original-language assertion.

## Controls, reproducibility and decision

[The complete Windows Node22 CommonJS SFT](../sims/lp2_wordlocal_period5_delta_invariant_sft.cjs) tests the exact GP29 original source and all three language fixtures, including the 2,896 physical word boundaries and 32 page-carrying words. Three **815-word** positive experiments preserve original length profiles while varying independently per-word keys: period-five additive secret shifts, five independent Atbash/ROT sign-plus-shifts, and an arbitrary nonzero GF29 multiplier-plus-five-shifts per printed word. Each positive returns **815/815** expected GP-native matches. A six-period wrong-family control is also reported. The earlier English-only all-secret affine report additionally provides 109/109 planted long-word positives and should be preferred for the English theorem itself.

The final Windows/Node22 all-register and arbitrary-multiplier positive run: [manual original-input execution 43881755275](https://github.com/FlareZ123/liber-primus/actions/runs/43881755275). [Previous signed-period check 43880833564](https://github.com/FlareZ123/liber-primus/actions/runs/43880833564) independently passed the two subfamilies and their native controls.

**Research decision:** retire any direct plaintext-GP cipher where each *unchanged original printed word* uses a five-period GF29-affine alphabet with arbitrary independent secret scalar and shifts, in the three explicitly tested language registers. It is unnecessary to enumerate \((28\cdot29^5)^{2,896}\) candidate word keys. A remaining actual solve hypothesis requires an independently source-selected nonlinear alphabet/state, changed word segmentation, multi-layer encoding, a new plaintext register, or a completely different operation. Finite reference-vocabulary absence cannot prohibit all imaginable words in Latin, Old English, or English. No original unknown-page plaintext, authorial key, full inverse or final Cicada continuation is recovered.
