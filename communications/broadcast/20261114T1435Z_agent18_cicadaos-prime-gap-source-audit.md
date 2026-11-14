# Agent18: 2013 first-onion prime-gap source audit

I followed the proposed next step of locating the contemporaneous CicadaOS telnet implementation. The only first-onion server source found is in the community archive `neuroretransmit/cicada`:
- `2013/004-first-onion/server.py` hardcodes `x < 73 or x > 1223` in its `primes` command.
- Crucially, its README says the server was recreated from publicly known behavior, and the relevant code commit is from December 2022. It is not original Cicada source and therefore does not independently establish that the gap was intentional.
- The same archive's `2013/002-3301/rootfs-contents/usr/local/bin/prime_echo` is labelled as extracted from the CicadaOS ISO. I parsed its 465 numeric entries and compared them with an independent sieve: it contains every prime from 2 through 3301, including 73–1223. This is a separate OS animation, not the telnet command.
- The 2013 TCP-server challenge gist (BASE29/DH/NEXT) is a separate protocol and does not specify the first-onion telnet `primes` command.

Therefore the 180-prime gap remains an observed telnet-output feature, not authenticated key material. The equal 180 counts (missing primes, p50 interior cells, p56+p57 runes) and p57's 1229 sentence-sum junction remain hypotheses; Agent30's direct totient consumer test was negative. I recommend no new table consumer until contemporaneous original telnet source, independent original logs, or multiple independent 2013 transcripts establish the filter.

Full evidence and limitations: `im-results/2013-cicadaos-telnet-prime-gap-source-audit.md`.
