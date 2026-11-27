# Original p50 table: typed cryptographic objects excluded by source-byte invariants

**22 November 2026, Agent49; Director issue [#2183](https://github.com/FlareZ123/liber-primus/issues/2183). Classification: bounded exact negative. No unknown LP2 plaintext, creator key, decoder or continuation recovered.**

## The decision and its human clue

LP2 pp49–51 visibly print **32 rows of eight two-character numerals**, exactly **256 values**. The documented base60 numeral interpretation and its source-motivated omitted-lowercase-f base59 counterpart both yield 256 legal bytes. A human solver familiar with Cicada's 2012–14 use of OpenPGP, hashes and cryptography might recognize the native width of a byte-oriented algorithm. We therefore ask whether the unmodified row-major stream is itself a usable standard object, without inventing a password, permutation, state clock or ciphertext-specific key.

The original tokens come from [the fixed 256-cell source](../resources/liber-primus/lp2-grid-256.json); prior [original-image adjudication](lp2-grid-11-original-glyph-adjudication.md) fixes the eleven disputed glyphs. The conventional base60 byte hash is SHA256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`; base59 byte hash is \`511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79\`. No source author has specified that p50 is an RC4, SHA or packet register, so these are candidate recognizers, not claims about author intent.

## Exact tests beyond earlier p50 direct AES / SHA-256-message-schedule work

1. **RC4 key-scheduling output state:** the internal S array is a permutation of every byte 0..255, regardless of the secret key. Both actual p50 byte streams have **only 161 different values**, including duplicates, so neither can be a complete unmodified RC4 S[256] state under **any byte permutation**. A real RC4 KSA plant produces 256 distinct bytes. This excludes an internal RC4 *permutation state*, not an RC4 keystream, ciphertext or arbitrary key.

2. **SHA-256 round-constant table:** [NIST FIPS 180-4 / RFC 6234](https://www.rfc-editor.org/rfc/rfc6234) specifies 64 × 32-bit K constants, a natural **256-byte** typed object based on cube roots of the first 64 primes. A byte-order or row/column permutation preserves its byte histogram. Multiset intersections with the exact 256 K bytes are **110/256 (base60)** and **124/256 (base59)**, versus a mandatory **256/256** for any direct copy or reordering. A genuine K-table plant gives 256/256. This does **not** invalidate the separate earlier source-original [SHA-256 message-schedule](lp2-p50-sha256-sha512-block-chain.md) exclusion or general SHA use.

3. **OpenPGP binary packet, both historically motivated radices:** the earlier [base60 literal-packet gate](lp2-p50-direct-openpgp-literal-source-gate.md) already rejects source \`CB E7 A7\`: new-format tag11, first partial length128 (< RFC 4880 minimum512), invalid literal body format A7. The *distinct omitted-f base59* prefix is **\`C8 E3 A4\`**: new-format **tag8 Compressed Data**, first partial length **8** (again too short), followed by invalid compression-algorithm octet **A4**, outside the [RFC 4880](https://www.rfc-editor.org/rfc/rfc4880) permitted 0,1,2,3. Therefore neither direct documented byte reading is a legal packet beginning at source offset zero. An external transform or different input cannot be ruled out.

4. **Raw DEFLATE (RFC 1951):** standard built-in decompression rejects the entire unchanged 256-byte base60 and base59 streams. A genuine encoded plant round-trips. This extends the header-only ZIP/zlib/gzip/generic magic exclusions already covered elsewhere by a full raw bitstream decoder, without an arbitrary offset or password search.

## Reproduction and decision

The self-contained [Node.js 22 Windows-compatible SFT](../sims/lp2_p50_native_cryptoformat_invariants_sft.cjs), **[verified passing on original repository sources in Windows CI run 45000257261](https://github.com/FlareZ123/liber-primus/actions/runs/45000257261)**, reconstructs both numeral streams from original fixed tokens, asserts both complete SHA256 input identities and original source caches, and runs positive controls for each tested algorithm. No arbitrary order, arithmetic transform, different source byte sequence, statistical word score or guessed secret enters the gates. Under **both** literal radices, the decoded table lacks a valid typed packet, native RC4 S-box, complete SHA-256 round-constant table or raw DEFLATE object.

**Decision:** retire these *four exact literal-object* interpretations. The 256 bytes may still be an opaque ciphertext, nonce/key material, PRNG output, separately framed file or a numeric navigation table. None has a recognizable first-party binary consumer, independently usable secret, authentic unknown-page inverse or plaintext. A productive follow-up would require a creator-supplied **format or decryption operand**, rather than more arbitrary offsets, transforms, or byte recognizers. The previous [AES-expanded-key](lp2-grid-aes-expanded-key-source-gate.md), [SHA-256-expanded-message and hash-chain](lp2-p50-sha256-sha512-block-chain.md), [historical literal-byte-archive anchor](lp2-p50-historical-exact-byte-source-anchor-gate.md), and [2014 Onion2 direct consumer](lp2-2014-onion2-256bytes-grid-source-gate.md) negatives stand unchanged.

## Physical row-wise systematic Reed–Solomon gate (Agent6, #3132, 27 November 2026)

**Decision: no literal physical row is a valid codeword of the fixed QR-field, root-zero shortened RS family under either documented numeric codec.** This is a different test from #243's GF29 polynomial factors, #1209's terminal GF257 interpolation, #2909's perimeter/interior receiver, and #2318's ECC200 reshape. No authenticated LP2 instruction selects RS; the historical QR precedent motivates this bounded candidate only.

Source: scan-adjudicated `resources/liber-primus/lp2-grid-256.json`, blob `2550eae357442912220e05dc51147523a61dd75a`, physical rows preserved 10|13|9. Standard historical convention: GF(256), primitive polynomial 0x11d, alpha=2, generator roots alpha^0 through alpha^(r-1), r=1..7, message prefix and appended remainder, ordinary or source-horizontal-reflected row. ZXing's [pre-release 1.7 API](https://javadoc.io/static/com.google.zxing/core/1.7/com/google/zxing/common/reedsolomon/GenericGF.html) documents the QR field; [field source](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/common/reedsolomon/GenericGF.java) fixes 0x11d and generator base zero. Shortening leading zero message symbols leaves the same polynomial.

Every such codeword C(x) has C(1)=0, equivalently bytewise XOR of all eight cells = 0. This necessity is independent of parity length, systematic placement, and every permutation within a row, including the observed reflection. It is also independent of the particular field multiplication because addition is XOR. The 32 physical row syndromes in source order are:

- base60: 116,119,30,195,5,87,200,190,23,9,35,91,122,101,242,220,147,140,34,118,219,254,47,51,216,85,210,80,138,223,201,216.
- omitted-f base59: 121,124,17,198,24,76,213,187,103,9,86,85,115,100,255,167,151,73,49,103,168,254,59,186,201,52,219,81,156,39,160,216.

Thus each of the three physical pages independently rejects the row premise, with zero of 64 distinct row readings satisfying the necessary condition. Full generator division and Horner evaluation additionally give zero syndrome-valid and zero exact regeneration matches among 896 radix/orientation/redundancy/row cases. Matched controls copy each original data prefix and replace its suffix with canonical systematic parity: 896/896 regenerate exactly and pass all roots; 7,168/7,168 one-bit mutations (every position of every plant) fail the necessary check. These deterministic controls verify the encoder and check, not an independently calibrated recovery of a secret.

[SFT](../sims/lp2_p50_row_rs_root0_sft.cjs), commit `3a77bbc49a89caa572f27ab3bf20e269ef5b3081`; exact run() core executed on the pinned JSON in connected V8. Standalone Node wrapper has not separately run. No CI needed for the mathematical certificate. Retire this root-zero literal-row family, including arbitrary within-row permutations. Root sets excluding 1, an unknown extra symbol per row, error-corrected received words, nonliteral byte transforms, and non-row framing are outside scope; there is no independent source selector for those here. Do not infer any payload or unknown plaintext.


## All-field fixed affine row-code obstruction (Agent6, 27 November 2026)

The root-zero syndrome excludes only one generator-root family. A stronger necessary condition eliminates **every proper fixed linear or affine length-eight GF(256) row code** on the complete panel, independently of its dimension, parity coefficients, root set, evaluation points, systematic positions and common column ordering. The 32×8 printed geometry and the historical QR/RS precedent are the motivation; no authenticated selector for a row code is asserted.

Let R contain the literal eight-byte rows, and let D consist of r_i XOR r_0 for each subsequent row. A shared nonzero parity functional w with an arbitrary fixed intercept b requires Rw=b·1, hence Dw=0. If rank(D)=8 then w=0, and no proper affine subspace contains the rows. Any proper linear code is a special case. This also rules out fixed invertible coordinate mixing, column permutations, nonzero per-column field scalings and fixed offsets of such a code (all preserve affine dimension). The calculation assumes the same coordinate transformation for every row in the tested scope.

Enumerate **all 30 monic irreducible degree-eight polynomials over GF(2)** (test divisibility by every monic polynomial of degree 1–4), interpreting each literal byte as the polynomial with its bits as coefficients. GF256 elimination yields:

| Literal codec | Scope | Min rank R across 30 fields | Min rank D across 30 fields |
| --- | --- | ---: | ---: |
| Base60 | Entire 32 rows | 8 | 8 |
| Base60 | p49 (10 rows) | 8 | 8 |
| Base60 | p50 (13 rows) | 8 | 8 |
| Base60 | p51 (9 rows) | 8 | 8 |
| Base59 | Entire 32 rows | 8 | 8 |
| Base59 | p49 (10 rows) | 8 | 8 |
| Base59 | p50 (13 rows) | 8 | 8 |
| Base59 | p51 (9 rows) | 8 | 7 |

The only affine rank-seven exceptions among the 240 codec/scope/field tests are isolated p51 under omitted-f base59, polynomial 0x1dd or 0x1e7. Their unshifted row rank is still eight, so they permit only a page-local proper affine coset, not a linear code; p49 and p50 independently fail even if field/code choice is page-private. No original instruction selects either exception. The standard 0x11d, 0x11b and 0x12d fields all have affine rank eight on every page under both readings. For 0x11d the first eight source-row differences of the full panel are independent, with minor determinants 44 (base60) and 67 (base59). The raw output records all field-specific selected minor row indices and determinants (indices are zero-based within R or D respectively).

The frozen [SFT](../sims/lp2_p50_row_affine_allfield_sft.cjs) (commit f7f1da393335274c170512bd60f47d9d66277310) ran its exact fetched computational core on grid blob 2550eae357442912220e05dc51147523a61dd75a in connected V8. [Complete raw ranks and controls](lp2-p50-row-affine-allfield-output.json), commit 25259f387189bf51080350b7119034e8e8c8e65e: 7,650 nonzero field-inverse identities, 240 matched-prefix systematic rank-deficient plants, 240 affine-translated plants, 240 full-rank basis plants, 240 common reflection checks, all pass. The standalone Node wrapper was not separately executed.

**Decision:** retire every exact proper fixed GF256 row-code/coset model in the stated literal polynomial-basis scope, not just root-zero RS. Even secret generalized-RS roots and multipliers cannot rescue a common proper row subspace. Other arbitrary bit-basis identifications of GF256, nonlinear encoders, row-varying transforms, noisy received words and alternative block framing are outside the theorem. This is an all-key structural exclusion, not an authenticated coding instruction, recovered key or plaintext. No further row-root search is warranted.
