# LP2 adaptive LZW / BASE29 code grammar gate (#2884)

**Decision:** reject the specified canonical LZW-to-GP29 serialization followed by q8/q13 additive encryption, including literal-F hold on the serialized digit stream. No original plaintext or key recovered. This is exploratory: historical LZW grammar is real, but no first-party clue selects this GP29 transport. Do not generalize to actual GIF bit packing, other compression grammars, a cipher before compression, or other key clocks.

## Exact receiver
Use GIF89a's adaptive LZW dictionary (initial literal alphabet 0–31, CLEAR=32, EOI=33, next entry=34, maximum 4096 entries). Native plaintext permits only GP29 literals 0–28. Emit one initial CLEAR, greedy phrase codes, freeze dictionary at capacity, no midstream CLEAR, final EOI. The decoder accepts the standard next-entry special case and requires canonical re-encoding. Instead of GIF binary packing, use a fixed number of BASE29 digits per code, computed from the maximum possible next code at that decoder state; two digits initially, three from next-code 841. The extra framing choice is ours, not Cicada's.

Historical grammar: [GIF89a specification, Appendix F](https://giflib.sourceforge.net/gifstandard/GIF89a.html). Independent published example: [GIFLIB LZW image data](https://giflib.sourceforge.net/whatsinagif/lzw_image_data.html). Its prefix codes 4,1,6,6,2,9,9,7 decode to 1,1,1,1,1,2,2,2,2,2,1,1,1 at minimum literal width 2. Our decoder exactly reproduced that prefix.

## Original impossibility
Every nonempty stream begins [1,3,0,x] in GP29 digits: CLEAR and the first literal. Thus literal F hold after serialization forces ciphertext digit 2 to equal 0 (zero-based). None of the nine fixed chapter starts satisfies it; the entire book also fails. This needs no key assumption. It does not apply to holds on uncompressed plaintext.

Ordinary additive sender: with period q, maintain each phase's possible shifts independently. The two CLEAR digits and first literal high digit fix three phase shifts. For each subsequent code the high digit must be in 0..floor(maxCode/29^(width-1)); intersect the phase's possible shifts with this necessary constraint. Allow extra inadmissible code values in this gate, so rejection is sound. Every chapter and the book yield an empty phase domain for both q8 and q13, at offsets 8 or 14, before dictionary-width changes. All possible phase rotations and additive signs are absorbed by independent unknown shifts.

| Original frame | Length | q8 failure offset | q13 failure offset | third rune (F=0) |
|---|---:|---:|---:|---:|
| p0–2 |729|14|14|18|
| p3–7 |1145|8|14|12|
| p8–14 |1729|8|14|14|
| p15–22 |1903|8|14|20|
| p23–26 |1021|8|14|7|
| p27–32 |1433|8|14|26|
| p33–39 |1680|8|14|14|
| p40–53 |3008|8|14|19|
| p54–55 |308|8|14|21|
| p0–55 |12956|14|14|18|

## Native controls
59 disjoint donor-window instances across Emerson, Gibran, Shakespeare (lengths 308/729/3008/12956; up to five per length and donor). The 59 are distinct within each donor/length stratum, not independent across lengths. All exact LZW encode/decode round trips succeeded. 118 ordinary encrypted transports, using native key strings DIUINITY and FIRFUMFERENFE, all decrypt, decode, re-encode and reproduce ciphertext exactly; all pass the necessary phase gate. 118 literal-F-hold forward controls use exact serialized plaintext; no unique held-F inverse claimed. 236 matched length seeded uniform random ciphertexts, zero pass the ordinary grammar gate.

Serialized digit length / native input length: 1.014–1.506 (mean 1.211), so this particular adaptive grammar does not compress native GP29 prose in rune count. Adjacent-repeat rates: ordinary 2.088–5.312% (mean 3.473%); F hold 2.407–7.728% (mean 5.029%); random 1.806–5.152% (mean 3.427%). Original whole book 86/12955=0.664%. No plant approaches the original repeat deficit, even though LZW changes plaintext length and removes printed word boundaries. Rates descriptive, not a significance test across overlapping donor windows.

## Reproduction
[SFT](../sims/lp2-lzw-base29-grammar-gate.cjs), [raw JSON](lp2-lzw-base29-grammar-gate.json). Run from repository root with Node. Actual connected JavaScript core executed against the pinned repository corpus and donor texts; standalone CI not run. Source ciphertext unchanged. Previous LZ78 printed-group parser, static word codebooks and raw DEFLATE branches were not repeated. No basis to spin off compression variants without a source-selected receiver.
