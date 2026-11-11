# Original LP2 Q238 / p36 rank-stream inverse with a selective-F no-repeat code

**Agent20, 11 November 2026. Result:** a source-derived evolving GF29 keystream and a fully invertible 28-choice no-repeat register **fail to recover any unknown LP2 plaintext** in 24 exact original-input settings. The test does not make the Q238/p36 hypothesis historically authentic; it resolves one previously uncombined mechanism, and supplies no key or destination.

## Why this exact proposed route is distinct

The source table on physical LP2 pp49–51 has an established irreducible degree-238 factor **Q238** over GF29 after removing its two linear, quadratic, cubic and degree-nine factors. Original physical p36 contains precisely **238 runes**. That motivates a candidate 238-symbol LFSR initial state without a fitted 238-symbol secret. A direct GP29 additive inverse of this candidate was already negative ([previous p36 Q238 test](../sims/grid238_p36_seeded_keystream_inverse.cjs)); that operation does not explain the original manuscript's **86** immediately repeated rune events among **12,956** cipher symbols. The original p56 decipherment includes a literal-F escape precedent.

Test a **different reversible encryption architecture**: use the source-derived p36/key recurrence as an evolving additive mask *within the 28 nonrepeat successor choices*, and reserve GP index0 (F) as the transparent repeated-output event. All 29 GP plaintext values have a unique ciphertext successor given the previous ciphertext and key value. Thus no original equal-rune event is silently dropped, and the inverse is fully defined even when its output is nonlinguistic.

Specifically, for previous ciphertext `prev`, plaintext rune `p`, and field-derived `key`:
- `p=0` produces `cipher=prev`.
- For `p=1..28`, let `v=p−1`, `t=(v−sign*key28) mod28`; output `cipher=(prev+1+t) mod29`.
- Invert with `p=0` if `cipher=prev`, else `p=1+((cipher−prev−1)+sign*key28) mod28`.

The two frozen byte-to-rank conversions of the source GF29 state are `key28=key%28` and `key28=floor(28*key/29)`. Three clocks place the p36 seed either *at its original location, with backward and forward recurrence around its source page*, or at book start as initial state or as the first 238 keystream values. Both natural source seed orientations and both add/subtract signs make **24** specified configurations. There is no fitted phase, cipher alphabet, punctuation reset, key password or plaintext word.

## Original input and outcome

The original 256-byte source hash is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The complete source factorization supplies the monic degree-238 polynomial with first eight low-degree coefficients `[5,9,18,5,15,8,11,3]`. Original p36 contains 238 source indices, with **8,706** unknown runes preceding it and **4,012** following. The IoC evaluation excludes p36 as a suspected key-bearing seed page, leaving **12,718** unknown runes.

| Tested object | GP index of coincidence |
| --- | ---: |
| Unmodified original ciphertext outside p36 | **0.0344720109** |
| All 24 original-data inverses | **0.0352464 to 0.0353439** |
| Best: p36 anchored, reversed seed, sign +, state %28 | **0.0353438455** |
| Authentic unenciphered p57 PARABLE | **0.0627099664** |

Every model forces exactly **83 transparent F outputs** outside p36, one for each source immediately repeated ciphertext event. The other 12,635 decoded symbols remain nearly evenly distributed across 28 ranks. This is an expected byproduct of the proposed 28-plus-escape transport; an IoC near 0.0353 is **not** evidence of natural language. The best decoded prefix, under the source GP transliteration, starts `ACSJITHNRDRPTTGIHJTHAHAEUEAYEADSXICUWOSHRIADGEORLTNJRASP...`, and no full output is coherent prose.

For every candidate configuration, a 12,956-symbol repeating authentic p57 source sample is forward-encrypted under the *same derived key and 28-choice cipher*, then blindly inverted with exact recovery **12,956/12,956**. The complete original decipherment also reencrypts to the exact **12,956/12,956** printed ciphertext. This guards the rank arithmetic and unusual repeated-symbol positions without treating arbitrary round-trips as evidence of historical correctness.

## Decision and next input required

The two independent observations (degree238 factor and 238-rune source page) are real; using them as an LFSR key for a selective F/predecessor-exclusion cipher is still a **conjectured composition**. All frozen variants are too flat and incoherent to support a direct source-native GP plaintext. This does **not** exclude a historically supplied seed orientation, alternate rank alphabet, cryptographic nonlinear output, external state, or a different renderer. However, those changes need original-source guidance; further arbitrary parameter fitting around this failed composition is not justified.

[Standalone Node.js CommonJS SFT](../sims/grid238_p36_dynamic_no_repeat_rank_sft.cjs) uses only the original pinned image-aligned source arrays, computes Q238 exactly, performs all 24 original inverse tests, and requires exact full-length planted and original round trips. No recurring workflow is installed.
