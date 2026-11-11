# Literal original LP2 printed-line acrostic and terminal-rune gate

**11 November 2026 · Agent16 · Director Issue #336.** Fixed source-layout extraction completed; **no plaintext, authentic key or actionable original instruction was recovered**. The direct line-edge hypothesis is a limited negative, not a verdict on illustrated marginalia or encrypted acrostics.

## Source-fixed readout and controls

The canonical original-page transcript `resources/lp2-transcription.txt` contains **594 printed rune lines** covering exactly **12,956 unsolved rune positions**. Physical p50 has no runes, leaving 55 original ciphertext pages. The source-delimited nine-body units, including p33's independent 91-rune title/interlude, have rune lengths `[729,1145,1738,1894,1021,1433,91,1589,3316]` and **line counts `[33,55,80,85,46,65,5,75,150]`**. All nine unit endpoints coincide with exact printed-line endpoints: no boundary crosses a line.

An acrostic would be visible directly to a contemporary reader without the unknown encryption key. The finite model therefore reads only the **first** or **last original rune** of every printed line, in forward printed order, separately for every unit or concatenated over the book. The table uses the unchanged standard Gematria Primus transliteration. Digraphs such as `TH` and `NG` encode one rune each. Joining the output does not imply missing spaces.

| Unit | Original lines | First-rune extraction | Last-rune extraction | Matched shuffle p, first / last |
| ---: | ---: | --- | --- | --- |
| 0 | 33 | `SOPSAEIAEBOENGEOTAIAMLUPIDMJYSOEDPDECDTHC` | `OEIAFIAENGJNEAOEWTHHNGPOFRIAWCXIEOJJLBXGJW` | 0.545366 / 0.201951 |
| 1 | 55 | `LYBOEWBPUOCXLMUFTHEMXEIWPRGEOPCPAXEAHDNGXWGOAXCXPUHMDEADTHEWOED` | `GMFNMTTHXIUHJOEIFMNGPREAPDUUIAEOOYEAMYATJTLTUEADJHJLSEAEHLOAEDHAM` | 0.145366 / 0.624390 |
| 2 | 80 | `XPJYOEYAXFFTHOEYIAOEOEFLWEOGOSGCOEDXYEAOXYHUXIAGLHOXEOUWEASPCGNYGHSAIPHJGNGTNNGIALPHTUTEOAECXHOEF` | `XOTHHNGUPBLEBEOXJYXEAEADLITHUTHNXMEACPNGAEONOEIUWALDTHXBTPLUTHPLTAOECUEOXFOEYEWFGXOITSFOEIAYGGELHA` | 0.310244 / 0.002927 |
| 3 | 85 | `LGATHIAIAIAEMNGIMPJXEOCTYLLEANGPXEAEYTHEAYEAAOEEAOEFJCPTURNJXEAEAEDLNGMNAPHOECIAMASIAEDECPTOEFPULIATWYNGCOEATHW` | `UNOISOEPTHIBGAETHEALOELIGAEMRTBTHHCOEHFFGICIACNEODFTNGGEACIATSWJOESWOEEOLWUNGTHMYFPLOEEBLWOEAOFCAEGWOJWRJEX` | 0.191220 / 0.675122 |
| 4 | 46 | `UPNGDDMYIAOUDNIAXAEYFLAEEEASHYIUUFSGEOXAERIAULEATHJDCPSLS` | `AEYXNWUMAEGTHANGUCNOEXOEXTJIASEOAINSWRIEAUIAGCLIIALJEIAYNG` | 0.926829 / 0.277073 |
| 5 | 65 | `MHAEIAEEAITUAEPPEAEDJDABIAEAJXTHTHDSCWAEIACLHPDEEAEOETHEAXFHYBTHHIALBMRNGEAOEOIALIALAMF` | `NPFGXTOESOIFYIAEDBLJOEFMEATNGOENGJRXNGFNGJEAMYGGEAEOEBNGAEHMEORLCIPGUYGHJOBIAXOTEO` | 0.894634 / 0.207805 |
| 6 | 5 | `DIADTP` | `AYTHDL` | 0.361951 / 0.937561 |
| 7 | 75 | `NGMEONGEOJMHUCEATRNEOCPEANGJLTHFPDYOEJMMYNTHFDLTDCEONNJEAFDJHAENGEAUAEWHHCNGCNGAEEASDIAOEGMIAEODTUM` | `EFEALNGBHFAEOSRDWGGDPDYENGXGTHEONGLIEOXPYJHDSOFPAIRABDEADIWYCDYMMMTNIACOEDNGOPWHGHXNNJ` | 0.580488 / 0.351220 |
| 8 | 150 | `FEAAEYDTCNNFFEAHBEOHEAHMFEOEAXDLUMDYHEAAJXSHFEGEAAEEEAIAFNGNGEAIANGMEPOEAEUTHOEACMIAAWMIAYPRYDHNGIAOEOEPNGAEBCMEAPOEAEBUNGCEOUEAGHNGAEWXNGTHEAHPBAEIANTHWMNGBPGBEUTHHOEXOEIAEAEOOEIEOYDPEAUANGOOJOEYOEIASEANGEAEOC` | `NGNBLSEMLTTHIAGAOEOXLBCOERJJYLTHAEIATDXPYEOAEOEJDEAEAEOMWOEPFTLOEYSUDYLSGXSEADRXBASNXXEANGMXIAXETUNGTHOIAAEWEIDGAERPMHEAAEBLRJOEWCOIJOEFTEDWDOFTACNGFXEOJTEHDEMAECTEOCNAWRUXRTYPHYBCMI` | 0.431220 / 0.316098 |

The two **594-line global readings** are the exact row-concatenations of all nine unit columns in order. Their normalized GP29 English-trigram log scores are **−13.42954** (first) and **−13.11034** (last), compared with **−7.84096** for an independent 594-rune native-English GP control window. They contain no recognizable English instruction. The 85-rune historically solved p56 ciphertext has five original lines, yielding first/last `AEOPCNG`/`XTAEUS`; the 95-rune known plaintext p57 has five lines, yielding `PUWIE`/`TECTHE`. These correctly reproduce the source formatting and demonstrate that arbitrary printed first/last letters of solved prose need not form instructions.

## Familywise original-layout null

The fixed source parser and independent GP29-English trigram model score each of the **20 predeclared rune readings** (two globals and 18 unit readings). The model is trained only on the initial 180,000 GP symbols of the checked-in Shakespeare control; 1024 seeded, **nine-unit-preserving random line shuffles** jointly calibrate the complete 20-reading set (seed `0x3362016`). Within a source unit the shuffles permute complete printed lines, preserving exact line contents, marginal frequencies, and title boundaries; they alter the proposed extraction order.

The strongest pointwise result is **unit2:last**, 80 source-ordered runes `XOTHHNGUPBLEBEOXJYXEAEADLITHUTHNXMEACPNGAEONOEIUWALDTHXBTPLUTHPLTAOECUEOXFOEYEWFGXOITSFOEIAYGGELHA`, with **2 of 1024** shuffled streams scoring at least as high. Its one-sided add-one empirical p-value is **3/1025 = 0.00292683**, rising to **0.0585366 under a conservative 20-reading Bonferroni correction**, and the actual output is nonlinguistic. Every other tested reading has a pointwise shuffle p-value at least **0.0585366**. No candidate identifies a precise further action or makes a withheld original-rune prediction. A nearest-threshold score by itself is no plaintext recovery.

**Complete printed-word endpoints.** The script also extracts the first and last *complete original canonical rune-word contained on each line*, excluding a word if it straddles that line. Exactly **two of 594 lines** lack a complete word (one in unit1, one in unit7), and the complete first/last word arrays are reproduced verbatim by the SFT. These words remain visually nonlinguistic ciphertext, with no repeated semantic instruction. This is a distinct grammar from first/last rune extraction; the same line ordering is retained.

## Decision and scope

**Close #336 as negative for direct first/last-source-line rune and complete-word readout under the existing canonical line registration.** Literal source alignment supplies no instructions, key, or English crib. Avoid escalating to unconstrained line permutations, rotations, shifts, cipher layers, or text-generated interpretations. **Subsequent source-image resolution:** Director #332's image-native exhaustive minimum-cost line mapping proves the eight apparent ties were duplicate DP skip histories, not different glyph-row placements. All 594 transcribed printed lines have a unique original-page row registration among the tested candidates; this fixed acrostic reading needs no alternative line alignment. This does not exclude finer glyph-pixel payloads or transcription mistakes. See [unique eight-page registration audit](../im-results/lp2-full-source-rune-assignment-audit.md) and [source control](../sims/lp2_eight_page_line_registration_uniqueness_sft.py).

[Reproducer](../sims/lp2_literal_line_acrostic_sft.cjs) reads the original-source rune transcription, 29-symbol alphabet and fixed Shakespeare control; asserts every source count, all source-unit line bounds, p56/p57 formatting witnesses, and emits every literal rune/complete-word reading, per-reading scores and shuffle p-values. Historical full corpus situation: [authoritative synthesis](../results/README.md). No change to established plaintext status is justified.
