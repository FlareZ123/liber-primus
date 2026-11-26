# Fixed injective whole-word codebook: exact order-free multiplicity gate (#2935)

## Decision

A deterministic injective codeword for each complete native plaintext GP29 word, shared across a book or chosen privately for each of nine visual chapters, preserves its multiset of word repetition multiplicities under **every whole-word permutation**, even when ciphertext word lengths are unrestricted. The actual LP2 printed groups violate this condition in every one of the 1,437,102 length-in-word-count matched contiguous literary windows, 416 windows within individual solved source records, and 3773 descriptive windows crossing potentially artificial joins in the concatenated solved reference. Both length-free and length-preserving exact profile matches are zero. This is an all-key rejection for the finite source register and assumes the printed groups are intact word codewords. It does not reject moving-cursor historical book code, homophones, decoys, or all possible plaintexts. No unknown plaintext/key recovered.

## Proof and operational implication

For plaintext word type w, let n(w) be its occurrence count. For a fixed injection f, the ciphertext type f(w) has exactly n(w) occurrences regardless of the ordering of the word tokens. Thus the histograms H(k)=#{w:n(w)=k} and, if lengths are preserved, H(l,k)=#{w:len(w)=l,n(w)=k} are necessary and sufficient for an unrestricted bijection between the observed types and corresponding word multisets. They do not identify the intended mapping or order. Equal-type token pairs E=sum_w n(w)(n(w)-1)/2, maximum multiplicity M, and distinct type count D are simple projections. A deterministic noninjective sender can only decrease D and increase E; the observed discrepancies in D/E therefore also reject that broader sender for these same windows.

Unlike the previous [word-internal equality](lp2-wordinner-equality-multiplicity-allsecret-gate.md), this proof compares complete repeated tokens, requiring no within-word letter mapping. Unlike the [variable-length rune codebook](lp2-ninechapter-codebook-original-substring-matching-gate.md), the codebook can assign any complete ciphertext word independently of its letters. Unlike [W1](lp2-r45-word-order-independent.md), it assumes no ordered language grammar. The historical [moving cursor](cicada-organizer-bookcode-consumption-convention-gate.md) explicitly gives different references to the same word; it is outside this model and is a distinct follow-up.

## Source and experiment

[Reproducer](../sims/lp2_fixed_wholeword_multiplicity_sft.cjs) · [raw exact profiles and input blob pins](lp2-fixed-wholeword-multiplicity-output.json). Remove /, %, and whitespace from corrected image transcription while retaining physical page and rune offsets; maximal GP29 runs give 2,896 groups, 12,956 runes, 32 cross-page carries. All 58 physical page rune arrays exactly match the canonical JSON. Use the established visual offsets 0,729,1874,3603,5506,6527,7960,9640,12648,12956. Compare to actual published GP solved source strings and four repository literary texts (Emerson, Gibran, Shakespeare, Blake); literary tokenization strips Gutenberg boilerplate when marked, strips internal apostrophes, uppercases, maps V→U, K/Q→C, Z→S, then greedily maps ING→NG and native digraphs TH EO NG OE AE IA EA. The underlying reference text bytes are pinned in the raw output. Nine solved-record plants independently pass both tests under reversed word order and arbitrary fixed injection; the length-preserving plants use explicit distinct GP29 codes of the same length, while length-free plants use indexed variable-length strings. The rolling histogram also passes all nine windows of a repeated toy tape. Executed the complete main function in connected V8; standalone Node/Windows CI not run. The 740-group source register is the published solved-record transcription, not the image-corrected 739-group combined manuscript; each authentic record is tested separately wherever long enough and artificial joins are flagged.

## Results

| Scope | Original tokens | Original D | Original M | Original E | Largest literary D | Smallest literary M | Smallest literary E | Literary windows |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| all | 2896 | 2731 | 5 | 230 | 1148 | 72 | 22699 | 134443 |
| 0 | 158 | 156 | 2 | 2 | 126 | 4 | 48 | 145395 |
| 1 | 255 | 252 | 2 | 3 | 180 | 6 | 139 | 145007 |
| 2 | 383 | 377 | 3 | 8 | 246 | 8 | 369 | 144495 |
| 3 | 437 | 430 | 2 | 7 | 273 | 9 | 488 | 144279 |
| 4 | 224 | 224 | 1 | 0 | 164 | 5 | 107 | 145131 |
| 5 | 326 | 320 | 3 | 7 | 220 | 7 | 257 | 144723 |
| 6 | 378 | 375 | 2 | 3 | 244 | 8 | 359 | 144515 |
| 7 | 669 | 662 | 2 | 7 | 382 | 16 | 1189 | 143351 |
| 8 | 66 | 66 | 1 | 0 | 64 | 2 | 2 | 145763 |

All literary windows have strictly fewer distinct types, more equal token pairs, and a greater maximum multiplicity than the corresponding original scope. The full book has 2,611 singleton types and 2,731 distinct types among 2,896 tokens, with just 230 unordered equal-token pairs. Four literary full-book ranges: Emerson D=900–1148, M=119–300, E=38095–80149; Gibran D=745–819, M=156–261, E=52765–79625; Shakespeare D=764–1011, M=72–138, E=22699–34397; Blake D=966–1009, M=200–274, E=46259–63132. Full original chapter 4 and chapter 8 have no repeated groups at all.

## Consequence for a recoverable homophonic receiver

Assume a deterministic receiver assigns each distinct ciphertext word to exactly one plaintext word, but the sender may choose different ciphertext references for the same plaintext word. For every tested full-book native window, D_P≤1148 and D_C=2731. Hence at least 1583 excess distinct code types (sum_w(number of used code types for w − 1)) must be explained by state or homophones. If trying to rescue a static one-code-per-word model by editing ciphertext tokens, at least 1583 individual token substitutions are necessary because one substitution can reduce the distinct count by at most one. Moreover M_P≥72 and M_C=5, so at least one plaintext type needs at least ceil(72/5)=15 distinct ciphertext code types. These bounds are simultaneous necessary conditions, not evidence that such a map exists. A stateful historical moving cursor is a more plausible mechanism to investigate than a static map with a few exceptions, but is not selected by this invariant.

No codebook key search is justified for the rejected family. A new receiver must explain how the reference choice changes, or why printed groups are not true words. No general language impossibility is asserted.
