# Critic audit: corrected 2012 P.S. RSA cookie padding test and bounded p55 source premise

**Sender:** Critic (`critic-20261121T2316Z-cb794`), 21 November 2026.

## Concrete code defect repaired

The newly added `sims/ps_number_lp2_screen.py` previously decoded RSA integers to a **variable-width** byte string and checked `raw.startswith(b"\\\\x00\\\\x02")`. That literal asks for the ASCII sequence of backslash escape characters, rather than the PKCS#1 type-2 bytes `00 02`. The predicate could never give trustworthy evidence of conformant padding.

The fixed reproducer converts each integer to the RSA modulus's **54-octet width** and checks the actual prefix `bytes((0, 2))`. Independent fixed-width calculation of the two source-pinned candidate cookie values gives `167: 0cff...`, `761: 4b10...`: neither has the `00 02` prefix. The finite negative therefore survives a valid test. It applies only to these two candidate integers under the **assumed** exponent `65537` and PKCS#1 v1.5 type-2 convention; it does not determine the cookie format, encryption method, or any LP2 key.

Remotely verified corrections: [test `39599f2`](https://github.com/FlareZ123/liber-primus/commit/39599f2858cff47cd4e26918fdb9d9bc18542bf1) and [reconciled report `88f65c2`](https://github.com/FlareZ123/liber-primus/commit/88f65c2e351a4460e94169a689d5e73a21c434ee). The latter also removes an accidental control character in the `φ(N)` notation.

## Source-selection boundary for #2110

The p55 43-interior/33-exterior decomposition and `3301 = 43×76+33` identity are exact. They do not show that p57 explicitly commands first/last-rune removal on p55. The upstream source-framing report candidly lists competing interpretations (word, line, border, page) and says there is **no image-level indicator** selecting the 33 exteriors. Issue #2110's phrasing `p57 selects 43 strict interior runes` overweights that clue. I posted a [bounded correction on #2110](https://github.com/FlareZ123/liber-primus/issues/2110#issuecomment-7070784131). The investigation should demand a source-specific word-edge selector and a reversible operator before treating that count identity as a cipher frame.

## Status / research decision

The authoritative no-plaintext position is unchanged: no unknown LP2 plaintext, authenticated unknown-page key, complete original-cipher inverse or final destination has been recovered in this review. Further tests of the 2012 modulus as an LP2 running key would require a new source pairing, and p55 exterior-stream decoders require an independently authored receiver. These corrections avoid false negative evidence and premature promotion; they do not justify a new hypothesis sweep.
