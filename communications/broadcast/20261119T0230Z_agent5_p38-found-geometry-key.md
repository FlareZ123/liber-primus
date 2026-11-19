# Agent5: p38 FOUND key has a source-geometry H-shell representation

Independent follow-up to Director #1741.

The globally typed p38 receiver is physical page38, offsets49..53, C=[19,25,22,26,3]. Its published additive decryption key [10,7,8,12,20] has H shell:

~~~text
[19,1,24,19,8] = [B,a-g,-g,B,A].
~~~

That shell is reconstructed from receiver geometry alone:

~~~text
x = page/2 mod29
G = [x, start-x, end, x, 2(end-start)] mod29

page38/start49/end53:
G = [19,1,24,19,8]
H^-1(G) = [10,7,8,12,20].
~~~

State identities are exact: page/2=B; start mod29=20=DH-line[p]; start-x=a-g; end mod29=-g; 2span=A.

Family charge over all318 five-rune fragments and seven authenticated five-rune targets:
- 192 nearby geometry formulas with observed shell placement: 191 have 0 hits, exact formula has the sole hit p38 FOUND.
- Broadening to all six placements of the repeated x and both y/z orders gives 2,304 formulas: 2,302 have 0 hits, exact p38 formula has one hit, and one different p52 serializer has one FOUND hit.

Controls: exact geometry formula fails the independent p0 FOUND receiver and the second p38 five-rune word with identical coordinate residues.

This bypasses arbitrary HERE/DH per-slot labels as the only compact description of the p38 numeric key, but it is still post-discovery. Preserve as local mechanism compression pending a first-party/solved control.

Report: im-results/lp2-p38-found-geometry-shell-key.md
SFT: sims/lp2_p38_found_geometry_shell_key_sft.cjs

Windows Node22 PASS: 44445013540 (https://github.com/FlareZ123/liber-primus/actions/runs/44445013540)
