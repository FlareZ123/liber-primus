# LP2 scroll255→p8: multiplicative GP29 word checksum is impossible for all secret keys

**Original-source decision, 22 November 2026.** Under the *conditional, previously frozen* p7 GF(4)/p50 radix59 correction of the original p8 ciphertext, the 255 original whole scroll words on physical p3–p7 cannot produce the 255 corrected p8 rune outputs via ANY globally shared multiplicative GP29 word checksum of the form:

```
H(word) = b + a * product(z[r] for each rune r in word) mod 29
```

In fact the exact source witness excludes the *strictly more general* family **H(word) = f(product(z[r] for each source rune r in word) mod29)** for **every possible deterministic global output function f:GF29→GP29**, including arbitrary secret nonlinear, noninvertible or bijective output codebooks, and every secret 29-element glyph-weight vector z (including zero). The affine form displayed above is a special case. No unknown plaintext or true author key has been recovered. This is an independently useful conditional impossibility, distinct from earlier *additive* secret wordhash obstructions and fixed rune index/prime-product direct tests.

## Why this original mechanism was worth testing

The genuine original p7 closing five red words have source GP29 index-products **[11,26,8,15,2]** modulo29. Multiplication therefore has a visible original precedent. The previously identified 255-state GF(4) register, seeded from these red-word products, and the p49–p51 table interpreted as radix59 give the candidate `H[i]=(original_p8[i]+key[i]) mod29`. This correction was fitted after previously identified duplicated words, and is therefore **not authenticated** as a Cicada operation.

On this corrected tape, three repeated original scroll words and one newly identified black/red **EO·X vs X·EO anagram** have equal corresponding outputs: word pairs **(47,240),(48,231),(235,236),(88,179)** yield paired outputs **(20,20),(8,8),(2,2),(9,9)**. See [Agent4's fourth anagram equality](lp2-scroll255-gf4-radix59-untrained-anagram-fourth-equality.md). A commutative product over one unknown weight per source glyph could naturally preserve these four repeated-multiset equalities. Testing the *whole 255-word register* is the decisive next step.

## Complete all-secret mathematical obstruction (arbitrary postprocessing)

The corrected 255 p8 rune outputs contain **every residue 0 through28** at least once. **More decisively, the 242 original BLACK source words alone have all29 distinct corrected output symbols and each of 29 GP rune types occurs in black words producing at least16 different outputs.** Thus the exact no-go persists even if all13 original RED words are exempted, receive an independent arbitrary secret codebook, or are interpreted as instructions rather than data. For **each of the 29 GP29 input symbols** independently, there exist at least two original scroll words containing that symbol but yielding *different corrected outputs*. In fact, the source words containing any particular rune span **16 to26 distinct corrected values**. Rune F alone is witnessed in original scroll words 5 and9 with corrected outputs16 and4.

Suppose one unknown rune weight `z[r]` were zero. Every source word containing that rune would have product zero, hence the *same* output `b`. This contradicts the two-different-output witnesses for **all 29 source glyphs**. Consequently every secret weight must be nonzero, even if the output function f is an arbitrary unknown lookup table: a zero weight would force identical products and therefore identical outputs for all source words containing that symbol. With all weights nonzero, the product is restricted to the **28-element group GF29×**. Any *single global deterministic output function*, irrespective of how complicated, can emit **at most 28 distinct output symbols from 28 possible inputs**. But the unchanged corrected original p8 emits **all 29 different GP29 values**. Contradiction. In particular, no output-affine a/b values or arbitrary nonlinear 29-entry secret codebook can rescue a globally stationary secret multiplicative source-letter wordhash.

This proof admits unconstrained GP29 secret weights, includes zero-weight escape cases, permits an entirely arbitrary deterministic output map including all affine cases, and holds on the exact source-corrected original 255-word register. It does not exclude secret position-dependent weights, nonlinear combinations of product and sum, a non-affine output recoding, per-word changing offsets, or an entirely different source interpretation. Those need first-party operands before further search.

## Reproduction and controls

- [Self-contained original-cipher Windows Node.js CommonJS SFT](../sims/lp2_scroll255_multiplicative_wordhash_allsecret_sft.cjs). It independently checks the 13-red/242-black source-colored word register and that black words alone establish the whole exclusion. It reads committed `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, original grid and source-ink annotations, builds all 255 scroll words, repeats the original conditional 255-state key and exact reverse transform, then checks the original four word-pair equalities.
- It verifies all 29 possible `b` against the output, writes the 29 two-word unequal-output witnesses, asserts at least16 output values for every source glyph, and tests both nonzero-weight and zero-weight **positive cryptographic plants** with full p8 key roundtrip.
- **PASS:** The complete committed test was executed in a V8 JS runner against exact repository source-file bytes on 22 November 2026. There was no new GitHub Actions workflow or uncontrolled password search.

**Decision:** Stop pursuing **any stationary deterministic global function of a commutative secret GP29 letter-weight product** as the missing 255→255 word-to-rune consumer under the conditional frozen GF4/radix59 correction. Preserve the four original correspondences as conditional local structure. Genuine progress requires an authored complete word-output law yielding previously unknown continuous plaintext or independently selected key material.
