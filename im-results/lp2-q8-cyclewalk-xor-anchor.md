# Exact shared q8 five-bit cycle-walk XOR inverse under H-shuffle (#2726)

## Decision

The proposed five-bit XOR mask action cannot explain the 49 complete p54 groups within the frozen 10,842-type native lexical register and three arbitrary OOV exceptions, even granting every group an independent initial key phase. **No original key or plaintext recovered.** The 17 remaining p54–55 groups (including the page-spanning group) were withheld from inference. There is no qualifying key to apply to them.

This is a complete finite exclusion of this particular action, not a claim that all binary ciphers, arbitrary alphabets, H-shuffle or H-decoy fail.

## Exact action and inverse

For p in 0..28 and m in 0..31, define T_m(p) = p XOR m when that value is <29, otherwise p. The second XOR returns an out-of-range partner to p, so this is exactly conventional cycle walking; T_m is an involution. Literal plaintext F (ordinal0) emits zero without advancing the eight-position mask clock; all other plaintext symbols consume one mask. A consuming ciphertext zero is legal if the inverse produces nonzero p. All 32 masks have distinct effective actions on nonzero plaintext, verified exhaustively. The search grants arbitrary group starts, quotients eight rotations of the same key tape, and includes nonprimitive tapes as a relaxation.

For a ciphertext/plaintext rune pair, construct a 32-bit domain of allowed masks. For a hypothesized lexical plaintext word, intersect the domain at each consuming key phase, including repeated phases, and reject impossible literal-F alignments. A ciphertext group containing >=8 nonzero runes must have >=8 consuming positions under every legal alignment, so every mask slot is constrained. Enumerate the Cartesian product of the eight resulting domains for every lexicon word of the same length, canonicalizing key rotation. Any legal key within B arbitrary OOV groups must explain at least one of B+1 eligible anchors; unioning their exact candidate sets is therefore complete. For each candidate decode every fit group over all phases and both legal zero branches, stop when B+1 misses are reached. A candidate is accepted only when all fit groups are evaluated within budget. No arbitrary candidate limit or language score is used.

Use the #2678/#2684 10,842-type donor-excluded register: first 80% of the three pinned literary donor corpora, plus native solved sections excluding WELCOME and KOAN. Original text is the corrected transcription, line/page carries merged. The full terminal chapter contains 66 groups/308 runes. Use 49 p54 groups wholly contained before the page-spanning group; 17 complete groups are reserved for the frozen continuation. Grant all three chapter-level OOV exceptions to fit, a more permissive gate than a 5% fit-only budget. Select the four longest eligible fit groups by count of nonzero ciphertext, breaking ties by printed index, before testing candidate words.

## Hidden-key recovery controls

Three 66-group windows from the donor tails, each independently keyed and with fit and held groups shuffled independently. The first eligible window per donor with <=3 fit OOV, <=2 withheld OOV and >=4 eligible fit anchors is used. True keys are not supplied to the inference procedure. Each fit produces a **unique cyclic key class**, matching the hidden key; the held groups are decoded only with this class.

| Donor | Fit candidate classes | Fit groups recovered in register | Held true words retained | Held uniquely correct words | Held uniquely correct runes |
|---|---:|---:|---:|---:|---:|
| Gibran | 6,127 | 46/49 | 16/17 | 15/17 | 59/66 |
| Shakespeare | 6,260 | 48/49 | 16/17 | 13/17 | 58/69 |
| Emerson | 7,917 | 47/49 | 16/17 | 16/17 | 65/80 |

Every in-register withheld true word is retained (48/48), and 182/215 withheld runes lie in uniquely correct words. Three independent-per-group random key/phase nulls yield no accepted shared key. Initial nulls on the first two donors had only three eligible anchors; those are censored by the exact solver. Before original inference, the null protocol was amended to draw independent-per-group keys until at least four eligible anchors exist (up to 64 draws; actual 2,2,1), conditional on solver applicability. No source or original parameter was altered. This calibrates key/word recovery under the frozen native plants, not actual word-order reconstruction.

## Original result

There are eight eligible p54 fit groups. The four frozen anchors (zero-based group indices 47,14,1,2) admit respectively 0,0,1848,1881 cyclic key classes. Their union has 3729 distinct candidates. All are rejected after four missing fit groups. None can cover at least 46/49 fit groups, even with arbitrary per-group phase. The two zero-domain anchors already require two of the three available OOV exceptions, but that alone is not the decisive proof: the entire remaining union is tested. The reported largestPartial is the count of hits before early rejection, **not** the global maximum word coverage.

No key reaches the held p55 gate. Forward re-encryption would only be an invariant under this action and cannot compensate for absent lexical support. Retire this specific mask receiver under fixed intact native groups and the finite OOV register. An unknown alphabet, different word segmentation, or larger OOV allowance are different assumptions requiring independent evidence, not a rescue of this decision.

## Reproduction

[CommonJS SFT](../sims/lp2_q8_cyclewalk_xor_anchor_sft.cjs) runs from repository root; [raw output](lp2-q8-cyclewalk-xor-anchor-output.json) pins all five input blob IDs. Core executed in connected JavaScript runtime; standalone Node wrapper not independently run, no CI claim. 
