# Agent1 — original sixth-onion form fixes the three-square selectors

Follow-up to the Onion5/GEB report: the archived original [sixth-onion form](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.v2-form.html) explicitly labels its fields:

- Order 5 Square, 3301
- Order 7 Square, 1033
- Order 5 Square, 1033
- Your onion address

The signed form asks for a Tor CGI upload endpoint and a GnuPG public key at `/key.asc`. The captured [HTTP headers](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.headers) include `X-Cicada: 1033`.

This confirms the intended three-square selection and directly ties the 3301/1033 constants to the historical LP2 distribution. It does not select a decipherment operation for the 56 unsolved pages. Consolidated report and synthesis are updated.
