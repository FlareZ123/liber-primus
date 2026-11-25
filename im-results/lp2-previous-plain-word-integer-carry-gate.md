# Previous-plaintext whole-word integer BASE29 carry (#2759)

## Decision
The terminal third body word has **zero lexical candidates over all 24,389 initial residue classes**, independently of the first word's lexical membership. No chapter has a fully lexical training prefix. Both native controls recover the exact seed and continuation. No authentic plaintext/key.

The earlier fixed integer affine carry, reverse/repeated previous-word carry, previous-word prime-sum autokey, and previous-word digitwise shift studies have different full-width equations. Prior all-secret low-digit affine bounds in `sims/lp2_base29_wordcarry_allsecret_previousword_sft.cjs` include this model on p16–21 and p40–53, but not the exact full-width corrected terminal seed-class decision.

## Fixed receiver and exact residue collapse
Treat each genuine complete printed GP group as an integer, big-endian, retaining width and leading zeroes. For i>0, P_i=(C_i-P_{i-1}) mod 29^L_i. No F hold, no repeated key digits, sign/multiplier/reset variants. First plaintext group is free; its ciphertext can be replayed by an initial IV. Subsequent state is uniquely recovered. Parse 2,896 groups, 12,956 canonical unknown runes and 32 cross-page carries; nine source-leading red spans excluded, preserving all complete body groups.

In corrected p54–55 the first three group widths are 8,3,6. P_2 depends on P_1 only modulo 29^3. Enumerate all 29^3=24,389 residues; every possible P_2 is represented once. P_3=C_3-P_2 mod29^6 occupies an interval of 24,389 consecutive integers. Its first three GP runes can only transliterate NGTHY or NGTHIA. No dictionary entry among all 24,389 possible third words. This exact finite-lexicon result permits arbitrary first plaintext word, and covers all 29^8 possible first-word seeds by equivalence classes. It is not an all-language impossibility.

| Terminal seed class gate | Count |
|---|---:|
| All initial residues | 24,389 |
| Second word in dictionary | 785 |
| Third word in dictionary | 0 |
| Both second and third in dictionary | 0 |

## Native plants and original prediction
Vocabulary: 40,751 distinct GP spellings from TextBlob and solved native records, with every segmentation of literal GP tokens and documented/common K,Q,V,Z,ING,IO aliases; native target excluded for each plant. Score lexical frequency on fitting prefix only. This dictionary is finite, not complete GP English.

| Target | First-word lexical seeds | Longest fully lexical initial run | Best prefix lexical words | Frozen heldout lexical words |
|---|---:|---:|---:|---:|
| p0–2 |2320|3|12/78|6/78|
| p3–7 |2320|1|14/126|6/126|
| p8–14 |785|3|20/190|12/191|
| p15–22 |2320|1|29/216|15/216|
| p23–26 |6311|3|15/110|9/110|
| p27–32 |6729|3|23/161|12/162|
| p33–39 |192|1|23/188|10/188|
| p40–53 |4207|2|27/333|26/334|
| p54–55 |6311|2|8/47|0/17|

For terminal fitting, use only 47 groups wholly on p54; the crossing 11-rune group remains wholly held out along with p55, so no future fragment leaks into seed selection. Frozen winner gives zero lexical hits in 17 withheld groups. All chapter winners produce nonprose.

Two genuine native sections (WELCOME and LOSS OF DIVINITY, first63 words, independently held out of native lexicon) planted with IV3301; exact hidden first words recovered and all 47/47 prefix and 16/16 suffix words on both plants, exact replay. The first IV is not independently identified beyond the first-width modulus; only seed/remaining chain matters.

Reproduce: `node sims/lp2_previous_plain_word_integer_carry_sft.cjs`; core executed in connected V8, standalone Node wrapper/CI not separately executed. Commit 08a32c44ff1505f1d35a0b4174ecb48c7daaa51c. Retire this fixed direct-native integer receiver; no variants without source selector.
