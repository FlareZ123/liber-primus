# Previous ciphertext word prime sum as BASE29 autokey

Agent 38, 2026-11-26. **Scoped negative; no recovered unknown plaintext.**

## Mechanism and scope

Test the minimal big-endian BASE29 representation of the previous printed ciphertext word's GP prime sum as a repeating additive key for the next printed word, with the key position reset to zero at each word. The initial seed is zero. For both signs, test ordinary consumption and literal F transparency (plaintext F produces ciphertext F without consuming a key position; a consumed symbol may not decrypt to F). This composition is a hypothesis, not an authenticated instruction: the historical sources independently motivate GP sums, BASE29, and additive rune encryption, but do not specify their combination.

This is distinct from [scalar/progressive previous ciphertext sum](lp2-previous-cipher-wordprime-original-inverse.md) and [previous plaintext sum BASE29](lp2-previous-plaintext-prime-sum-base29-autokey.md). The ciphertext feedback is known before decoding the next word, so exact reachability factors wordwise. The source transcription's 2,896 printed groups flatten to exactly the 12,956 canonical unknown runes (86 adjacent repeats).

## Result

| Encoder sign | Ordinary plaintext IoC | Adjacent repeats | Runes in exact native dictionary words | Impossible transparent-F words |
|---|---:|---:|---:|---:|
| + | 0.034500036879268 | 450 | 33 | 371 |
| - | 0.03451968596260668 | 442 | 26 | 383 |

Ordinary output is nonprose; every rune re-encrypts exactly. Native dictionary coverage is descriptive and not an independent language-model score. For transparent F, retain a state for each reachable consumed cursor: when C=F permit a hold, and permit consumption only when the resulting P is non-F. Histories merging at the same cursor have identical future reachability. Thus the nonexistence of a final state is exact for this model.

First contradictions: plus sign word index 2 (p0), key [10,25], ciphertext [2,11,6,25]; minus sign word index 1 (p0), key [11,28], ciphertext [15,26,18,21,5]. These follow a complete prior ciphertext word, so changing the initial seed cannot remove them. No lexical assumptions are required for the transparent-F contradiction.

## Controls

WARNING (184 runes), WELCOME (515), LOSS OF DIVINITY (755), PARABLE (95) planted from native transcriptions. Both signs recover every ordinary-control rune and replay every control. Every true transparent-F consumed cursor is reachable; the retained representative may differ from the planted plaintext due to ambiguity. The plus WELCOME representative matches whole words totaling 507/515 runes; minus PARABLE 81/95; all others exact. This is a reachability control, not blind unique plaintext recovery.

## Reproduction

Run `node sims/lp2_previous_cipher_prime_sum_base29_autokey_sft.cjs` from repository root. Core experiment executed in connected JavaScript; no CI run claimed.

Source blobs: canonical corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, printed transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f.

Retire this exact construction rather than tune nearby sign/phase/seed variants absent an independently selected operation. No change to the authoritative solution count.
