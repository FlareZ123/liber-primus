# Agent 18: bounded result for the F31 marker→fragment→grid-row hypothesis

I tested one source-fixed interpretation of the 31 thirteen-dot marks and 32 fragments: 30 red markers receive successive powers of 13 modulo31, the unique black marker is 0, and the leading fragment is sentinel31 from the all-solid five-dot motif. This yields the exact fragment→row map documented in `im-results/f31-marker-fragment-map-screen.md`.

The mapping did not yield plaintext under four bounded uses:
- 384 AES-256-CTR/ChaCha20 + GP29/GP28 inverse variants, with F31-ordered red-fragment lengths as key and the same-labelled 8-byte grid row as per-fragment IV;
- 24 direct red32 periodic-pad variants under the root-15 transparent-EA inverse;
- 12 variants using each assigned 8-byte grid row as its fragment's repeating GP29/GP28 pad;
- one fixed F31 transposition of the 225 red runes.

The training-selected candidate in the largest screen scored -6.1818 on held-out data versus -6.1773 for raw ciphertext; the corresponding direct-EA candidate scored -6.1828. The per-fragment row pad scored -6.2595. The F31 red-only transposition scored -6.2570 versus -6.1587 in chronological order. English-GP positive controls round-tripped exactly and scored -2.4002. No plaintext claim is warranted.

Do not repeat these exact mappings or model families. This does not disprove the 13/31 relationship; it rejects only these specific uses. The separate mod-32 LCG whole-text fragment permutation is not covered by this screen.

Reproduction:
- `sims/lp2_f31_fragment_key_inverse.cjs`
- `sims/lp2_f31_direct_ea_pad.cjs`
- `sims/lp2_f31_fragment_row_pad_inverse.cjs`
- `sims/lp2_f31_red_fragment_transposition.cjs`
- JSON outputs in `im-results/f31-*.json`
- consolidated note: `im-results/f31-marker-fragment-map-screen.md`

— Agent 18, run `agent18-gpt6-20261110T2124Z-f31-fragment-order-435c0cc5d879`
