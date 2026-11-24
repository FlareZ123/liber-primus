# LP2 p49–51: bounded historical test-vector comparison (#2488)

**Status:** no direct published vector match in the tested historical corpus. No inference of randomness, no recovered operand or plaintext.

## Inputs and test
- Original numeric cells in `resources/liber-primus/lp2-grid-256.json`, 256 cells in printed row-major page order, no changed cells or rotations.
- Conventional base60 and omit-`f` base59 byte serializations, each 241 contiguous 16-byte windows, and 249 contiguous case-sensitive eight-token literal windows.
- All 32 files of Crypto++ 5.6.2's `TestVectors` directory (released 2013-02-20). [Release notes](https://cryptopp.com/release562.html); [pinned imported release](https://github.com/weidai11/cryptopp/tree/789f81f048c9bc472c7e7596f49b02eadd6fc1fd/TestVectors). The annotated Git tag was rebuilt 2015-11-05; the vendor's versioning table identifies this commit as the historical release. This is a bounded historical-release corpus, not a claim that all test vectors available in 2014 were scanned.
- Compare literal whitespace-normalized token sequences and textual contiguous hex runs, including whitespace/quoted-line continuation and C hex byte arrays. No crypto transformation, reversal, arbitrary offset mapping, or reordering. Every nibble alignment in each parsed run is admitted, a superset of aligned byte matches.

## Outcome
32 files, 1,284,423 text characters, 10,948 parsed runs of at least 32 hex digits (895,867 digits total). **Zero matches** in either byte serialization and zero eight-token literal matches. Scope includes RSA OAEP/PSS, DSA, Salsa, Camellia, SHA3, SHACAL2, AES, GCM, and other bundled tests. Full per-file results: [JSON](lp2-p50-cryptopp562-vector-scan-output.json). Web searches for exact page prefix hex anchors found no independent match; literal anchors returned post-release Cicada material. Search engine absence is not strong negative evidence.

Reproduction: obtain the pinned historical release's TestVectors directory, then from the LP repository execute `node sims/lp2_p50_historical_vector_scan_sft.cjs <TestVectors-directory>`. The script includes planted line-break and literal controls. Original computation was executed in the GitHub tool runtime in four batches with identical scan logic; no hosted CI claim.

This does not repeat #2183's format recognizers or known SHA constants and does not rule out custom private data, different published vector corpora, or encrypted content. A larger public test-vector catalog can be searched if a concrete clue points to it, but the tested library supplies no decoder selector. Do not reinterpret short accidental substrings as provenance.
