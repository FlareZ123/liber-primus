# Stage10 participant callback capture search

## Decision

**No authentic participant-side HTTP response body for the 2 May 2014 callback was recovered in the public sources searched. Retire this candidate unless a new byte-preserving HTTP exchange or original CGI output is supplied.**

The key distinction is between (a) Cicada's signed message uploaded *to* the participant's hidden service as the POST request payload and (b) the HTTP response body returned *by* the participant's CGI endpoint. The first survives; the second does not in the sources examined.

## Best participant-side artifact found

[iBotPeaches/cicada_3301 — `messages/2014/hello-your-enlightenment.asc`](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2014/hello-your-enlightenment.asc) is a participant-preserved clear-signed Cicada message associated with the early-May callback described in [Connor Tumbleson's first-hand account](https://connortumbleson.com/2024/12/23/cicada-3301/).

- Exact file size: **1,010 bytes**
- Git blob SHA-1: `5bfaaeaf5364291e8a38d27222946f9db93cd50b`
- SHA-256: `967990fd9415a13d18830e4159d8228b4c3ef443b712c293d56f04a28415cb18`
- SHA-512: `7d16d89d18194cc66c5e1b10f9738e0ac9f773b807e19db8012032299b63cd355bf6b151482e25650486a8ea2c748cacb56ff9626e15cfcfa909ace51f1410e4`

This file is the **POST request payload sent by Cicada to the participant**, not the participant CGI's HTTP response body. Its exact-file SHA-512 does not equal the LP2 p56 target below. SHA3-512, BLAKE2b-512 and Whirlpool of the exact file also do not match.

## p56 target

The p56 image's 128-hex target, as transcribed in `im-results/lp2-p56-source-defined-hash-semantics-gate.md`, is:

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

The already-known 152-byte and 168-byte square-submission acknowledgement variants are separately documented in `im-results/cicada2014-stage10-to-stage11-original-operator-gate.md`; their digest checks fail. They are not the missing participant CGI response.

## Archive search

A reproducible search was added at `sims/stage10_participant_irc_capture_search.py`. It downloads the pinned public IRC export from `cicada-solvers/neuroretransmit-cicada` commit `b13600373d3400d75ec4208198019f3d92a304dd` and searches the complete `irc-logs/#33012014.freenode.log` byte stream for Stage10/squares, callback paths, `key.asc`, the observed Cicada user-agent strings, HTTP exchanges, onion references, response language, and long digests.

Source file facts: **8,629,610 bytes**, SHA-256 `e442ece859af483c3a69a9cdca8a60605a3867aef311deef57d3f12b7617e1fb`, **112,133 lines**. The full scan found zero Stage10 mentions and zero exact callback markers (`cgi-bin/upload`, `key.asc`, `Cicada/33.01`, `CicaDOS`, `Cic/DOS`). A date-scoped 1–4 May pass produced no matching callback/response evidence. The log contains generic earlier discussion of squares and hidden services, but no captured 2 May transaction.

The following public repository trees were also checked for WARC, HAR, PCAP/PCAPNG, EML/MBOX/MSG, HTTP dumps, access-log, response-body, or callback-capture artifacts: `cicada-solvers/neuroretransmit-cicada`, `iBotPeaches/cicada_3301`, `krisyotam/cicada3301`, and `Dukotah/cicada3301`. **No such capture files were present.** The Fandom/Forumwarz material surfaced by targeted searches preserves discussion and an access-log excerpt, not the participant CGI response bytes.

## Reproduction and stop rule

Run the pinned archive search through `.github/workflows/manual-readonly-python-image-sft.yml` with script `sims/stage10_participant_irc_capture_search.py`. The search script and workflow artifact preserve the method and output.

Do not synthesize the participant CGI response from the access log, infer it from the Cicada-sent PGP payload, or guess an HTTP body. Reopen only if a primary-source participant capture supplies the actual response bytes (ideally with request/response headers and timestamp); then hash the exact bytes against p56 before considering any further interpretation.
