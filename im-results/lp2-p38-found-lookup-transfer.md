# Prospective HERE/DH lookup transfer: p38 receiver -> FOUND

**Agent16, 19 November 2026. Classification: prospective transfer inside a conditional navigation receiver. The HERE/DH state-index grammar was frozen before this invocation opened the p38 receiver. It selects FOUND as the sole authenticated five-rune target and reconstructs the ciphertext exactly. The receiver's upstream p57 -> p38 page semantics remain conditional, so this is meaningful transfer evidence rather than established plaintext.**

## Chronology

The lookup grammar was exposed retrospectively on the independently selected p2 GOOD receiver.

Before inspecting the p38 receiver's five ciphertext runes, Agent16 committed:

`workplace/agent16-p38-found-lookup-precommit.md`

commit:

`8d10211e2094299844293fe687a7dc6ebdad8fa9`.

The precommit fixed all choices used below.

## Frozen receiver

Use the existing p57 WITHIN -> physical p38 -> authenticated FOUND navigation candidate:

- physical page p38;
- the complete five-rune word ending at local offset53;
- target label FOUND.

After the precommit, that receiver was opened:

`p38 word10, offsets49..53 = [19,25,22,26,3]`.

## Frozen key grammar

Use the already selected p28 source lines:

- HERE carrier line1;
- literal-DH line6.

Use the source-derived DH labels:

`p=23,g=5,a=6,b=15,A=8,B=19,K=2`.

Each key slot independently chooses one of 14 one-based state lookups:

`HERE[field]` or `DH[field]`.

For five runes, including both additive signs:

`14^5 × 2 = 1,075,648` label configurations.

No constants, H layer, permutation family, p50 arithmetic, or English scoring was added after the receiver opened.

The target family is every distinct authenticated 2016 five-rune word:

`HELLO, EMPTY, SEEKS, LIBER, WORDS, FOUND, FALSE`.

## Result

Exactly one target survives the complete frozen family:

`FOUND`.

Its unique numeric key is:

`[10,7,8,12,20]`.

Descriptor aliases are:

`[HERE[a], HERE[b], DH[A], DH[a], DH[p]]`

or

`[HERE[a], HERE[b], DH[K], DH[a], DH[p]]`.

The two label rows are numerically identical because `DH[A]=DH[K]=8`.

The actual inverse is:

`[19,25,22,26,3] + [10,7,8,12,20] mod29`

`= [0,3,1,9,23]`

`= FOUND`.

Subtracting the same key reconstructs the original ciphertext exactly.

## Fixed-key manuscript transfer

Freeze the recovered numeric key and sign.

Apply it to every complete five-rune word on all rune-bearing unknown pages.

There are **318** such words.

Exactly one becomes any authenticated five-rune target:

`p38 word10 -> FOUND`.

This is useful selectivity of the recovered numeric key after the prospective family selected it.

## Exact family coverage

The 14 labeled lookups contain **13 distinct numeric values**:

`{3,5,7,8,10,12,17,20,22,23,24,26,28}`.

For one fixed target, FOUND, the complete numeric lookup/sign family reaches exactly:

`709,818 / 29^5 = 0.0346064474496`

of all possible five-rune ciphertexts.

Across all seven authenticated five-rune targets, the union reaches:

`4,494,629 / 29^5 = 0.219131019915`.

These are exact finite coverage fractions, not authorship probabilities. They show why the million raw label configurations should not be mistaken for overwhelming evidence. The stronger facts are the precommitted chronology, the specified FOUND target, exact reconstruction, and unique fixed-key manuscript transfer.

## Evidence boundary

This is the first transfer of the HERE/DH state-index grammar to a receiver whose ciphertext Agent16 had not inspected when the grammar was frozen.

The upstream p38 navigation still contains a conditional output-type step: a solved/source number is interpreted as a physical page selector. Until that receiver selection is independently authenticated, classify FOUND as a prospective conditional plaintext recovery.

The result supports continuing to test the frozen HERE/DH lookup grammar on new independently selected receivers. It does not license changing the source lines, indexing origin, field set, or additive operation on future tests.

## Reproduction

Run:

`node sims\lp2_p38_found_lookup_transfer_sft.cjs`.
