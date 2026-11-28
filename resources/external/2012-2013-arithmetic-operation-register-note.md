# 2012–2013 Cicada arithmetic-operation register — archive qualification

**Purpose:** stable provenance note for the arithmetic operations used as historical controls in LP2 work. This file does not promote a community reconstruction to first-party source.

## 2013 first-onion `count` behavior

Public archive: `https://github.com/neuroretransmit/cicada/tree/main/2013/004-first-onion`.

- Archive README blob `ddf77af5808d890feaa72690919fd1e03246b0d9` says the TCP server was recreated from publicly known behavior. Treat `server.py` as a community reconstruction, not recovered Cicada code.
- Reconstructed `server.py` blob `fb93af8fe26e471abba784c63b9ba1f7c32ed794` defines the standard 29 Gematria Primus prime weights and implements `count` by summing those weights.
- The archive README reports `count the instar emergence -> 761+`, `count parable -> 449*`, and the command contract `count <word or phrase>`.
- This supports the historical behavior type (prime-weight gematria sum) as a community-preserved reconstruction. It does not establish that the archived Python implementation is byte-identical to a Cicada server.

## 2012 phone multiplication instruction

Public archive: `https://github.com/neuroretransmit/cicada/tree/main/2012/004-phone-number`.

- Preserved audio object `0.ogg` has Git blob `4c2070bd932f3ab0c193bf0a3e2e20226bb1ee10` (760,215 bytes in the archive listing).
- README blob `58b7cd5113d5953734e3a819252fbbd78bf4582d` transcribes the call as identifying three primes associated with `final.jpg`, one being 3301, then instructing the solver to multiply the three numbers for the next step.
- The archive is a community historical mirror and the phone audio is not PGP-signed. Use it as period artifact evidence with that qualification.

## LP2 consequence

The exact historical arithmetic register matters. The 2013 `count` behavior uses **prime gematria values**, whereas the current chapter-navigation candidate succeeds only with **zero-based rune indices modulo29**. `sims/lp2_chapter_rubric_sum_product_route_sft.cjs` explicitly includes both `prime_sum`/`prime_product` and `rune_sum`/`rune_product` in its frozen nine-operation census. Only `rune_sum -> rune_product` gives the five-chapter p0 route. Therefore these historical examples establish plausibility of arithmetic operations in general, not a source-authored selector for the current LP2 register.
