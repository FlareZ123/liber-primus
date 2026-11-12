# Original p40 red8 3000-rune chapter × 32×8 table: frozen columnar/Vigenère composition

**Agent39, 12 November 2026. Director issue [#657](https://github.com/FlareZ123/liber-primus/issues/657), original-cipher result: negative.** The complete, historically motivated and source-fixed inverse was carried out once, without tuning keys, signs, phases, page cuts, or alphabet. No unknown plaintext, authentic stream key, destination, or decoding mechanism was recovered.

## Independent non-additive four-8×8 matrix consumer (Agent41, 12 November 2026)

A distinct source-shaped test interprets the complete 32×8 numerical table as **four consecutive 8×8 matrices** over GF29 (each table byte reduced modulo29), and applies matrix `M_(block mod4)` to each consecutive eight-rune ciphertext block after removing the p40 red heading. This requires no columnar transposition or per-cell repeated additive key: it mixes all eight symbols of each block, and therefore lies outside the static per-cell secret-codebook exclusion. All **four** original matrices are invertible modulo29, so the exact inverse exists with no added secret parameters. Its source motivation is the repeated printed eight-column dimension; no original document specifically prescribes this Hill operation.

Across the complete **3,000-rune** original p40–53 body, the fixed full-rune decoder gives coincidence **0.034594420362343004**, versus ciphertext **0.03454440369011893**. The first 50 output rune tokens are
`H-EA-X-J-EO-A-NG-I-P-X-Y-N-D-IA-Y-N-Y-P-N-L-IA-B-AE-M-B-AE-R-T-EA-IA-X-M-M-E-EA-E-EO-Y-J-D-E-A-J-J-IA-R-M-C-U-EA`.
Every original rune encrypts back exactly (3,000/3,000); a separate native-GP plant built from the **authentic solved p57** plaintext also decrypts exactly (3,000/3,000). This rejects the single, directly printed four-matrix Hill8 consumer as an ordinary native-GP prose decoding. It does not test arbitrary matrix reassignment, secret feedback or a second unknown cipher, none of which is independently instructed by the source. **No unknown plaintext or genuine key** emerges. [Standalone original-source SFT](../sims/lp2_p40_four_hill8_original_gate_sft.cjs).

## Source-visible reason to try this operator

The original physical p40–53 visual chapter contains exactly **3,008 GP29 runes**. Its first eight visibly red runes are **[0,9,19,26,6,23,25,8]**; they are all distinct and sort into classical eight-column rank order **[0,4,7,1,2,5,6,3]**. Removing precisely those eight heading runes leaves **3,000 = 8×375** original ciphertext runes, including the otherwise easy-to-omit p53 closing red51. Inside the same source chapter, the original pp49–51 table has exactly **32 rows and 8 columns**, containing 256 conventional base60 bytes. In 2014 the players demonstrably used both keyed GP29 arithmetic and a columnar transpose on another puzzle stage. Transferring both operations simultaneously is a proposed new cipher, not an authenticated LP2 instruction.

This finite test differs from the prior [all-secret eight-column entropy obstruction](lp2_p40_red8_allsecret_columnar_entropy.md): a **32-row changing per-column GP key** is not a single static output alphabet and is therefore outside that static-alphabet bound. The scope is exactly the frozen combined operation in #657.

## Reversible original-cipher specification

Let `C` be all 3,000 original GP29 indexes after the red eight-rune heading. Read its eight consecutive **375-rune** ciphertext blocks in sorted-key column order **[0,4,7,1,2,5,6,3]**, restoring physical columns 0…7; interleave one glyph per column to form a 375×8 row-major `I`. For every row `r=0…374` and column `c=0…7`, set

`P[8r+c] = (I[8r+c] - (grid[8*(r mod32)+c] mod29)) mod29`.

The exact forward cipher adds the same grid residue to every `P[8r+c]` and concatenates its eight columns in red-heading-sorted order. It **exactly recreates all 3,000 original printed ciphertext indexes**, and a separate 3,000-rune positive plant made by repeating actual solved p57 GP plaintext is recovered **3,000/3,000** after independent encryption. The p56 special-F prime-totient skip does not apply here. The chosen subtractive convention is a new fixed hypothesis: the independently reconstructed exact 2014 Stage04 historical decrypt used **addition**, so this inverse must not be mislabelled as literally its signed-direction opcode.

## Complete original output and difficult terminal span

The unedited original 3,000-rune input has GP29 index of coincidence **0.03454440369011893**. The source-fixed combined inverse produces **0.034579748805157275**. This is still nearly uniform over 29 symbols, unlike solved native-GP p57 at approximately **0.06271**; the complete output below contains no continuous readable phrases or instructions.

The last 51 original p53 ciphertext runes lie at positions **2949–2999**, in the last eight-column block. Because columnar decoding redistributes positions, those glyphs map to decoded row-major positions **2595,2603,…,2995**, not a contiguous final 51-symbol plaintext slice. Read in the same original closing-span ciphertext order, the resulting GP transliteration is:

`GIAGUYRIANGYDOEIWLEAIAOGDTISJMADTYEAEFGOHIIXOINGXMOEIAEAOGCNBH`

This difficult untouched source span likewise supplies no readable instruction, with no missing, trimmed or specially skipped glyphs.

**Full 3,000-rune output** (GP transliteration, with line breaks below solely for display; variable-length GP digraphs remain single runes):

```text
AACOEXIATHUPWEAIASGNIEXGSMEOREAFNGCFNGNIUOOEAOOEMFOETIAAEALWSANEMRHIEGUFOCOEOADAOEDNGSYDNTHICWEAAEATHCJTNGLCROEN
CWAULEFPSEAGRPEYCBIAOEUEPSJWIMEEASLOFEMTHMCUIATHBNGNYEXPMRESEIAPTUIAOEGOTHAEGPUABJEXAEYUDSMECIOLFTHIASWLAECOEROE
MHDWXDRUNGARECBEAJEAMEEMEWDOETSOEAEGTHFHHEOAWOEATHMRGOETRGFHADHNTHERLFAFAEWRSATWMWYETHMINPXREOAEJXFEAHGAEIADSYYU
ANUNAECMAIUDTHEOEPNUFFSAESCNTHXOEHSTHOBROEGMDXTEXTRWEOLNGEAULPUOWDACTMFEOIABSDXEOINWEANHARDYAOJYNENFSUMYTHPNGNHI
SPDPIABWHEAIPIAHEANGTUWRNJEOGFRBEANGYRISDLRSIAXGLNGFIYLRXCEALOETAENHAPUHOTIARGGIAJTAEEBHEOUMRUUXWJEAAEOAEDGNGMEO
OECREOPEWPGNGEASNEAUNMNGTHIAYTEAEAOGPREAJTYXIBEANEOLWJTHXHTHIAXSEFAEIUBTHNEMIAEAFNTEARMDMBGEMNPATPXAEDUMUYIAAEOI
OAEYXTHAWLOEAIMIIAOEHEOIAMOXUNAETLCNGLYNTHGAAOBJHAEFEOSLNGRGTWATHIADTHFTEAWEOGAFBNRREEAXPRPXUAELJWNRPPSIEOEJOEIS
HEPWSOASIAORSAETCAEEANGOEAEMLGWHYORYWRTOFSYXICAPUAPLWHPXWAEAHEAEMSTHJYNIEOBNNGRBNJIAEOTNGCEYMNOMIIATCNGWTJGHRMGT
HJJCWFTHXAEWIIAXXOTHFOESOEIAEOYEEFAEAOENGUTHEOPTEAIAEAOEYTJENGAEAEXESTHGOELSOECHEOMMTBCTHNGEODLJYNXEACXAEIAJTHFD
FRIGOAENUJMBHJFAUUMNGBGATREANGPJNGXUNEAYNGFHNGNGROEIANGLFUCFEBRPGFAPFLEMDEHAIADJOEHAEAOEUEAXOECEHHTHTINGXOEAEPEN
GYPRDEOOEWYEOWEOIWOBYRSOEBEODTGMEAJJDOELIAGYCUDOETHWWBCAEIRANOEOENYGXHORWOAIAHDTHMHNGDEADHNAEDMSHIELBEORUMIARAEA
NPOLCTBOEUNGBNGTECXUEALDCEADIEOHPYIOIAFEAENJFCEANBDITGXAEEAPJSGTCFJBLBHOWRGTEAPTHBIAEJNGGHXSLIXWEOPBUHSNGPOEMXCE
OREAHCRIACIAUXBEAAEYCLPDIMJRSAEJWWGNSNREAMCOECUAEJJGXXCLTHDPJFOEGBXTHNTGTHNDOEWUHPDEAUSIATEEAYEAOTHWGWEADIAXHXTH
HACCEGXDEAMJUSCSCNLWCRSYOENYXFSJOEOEWIEASIAEWEJMNGJBAOEUAOAELCLIAFTHLWEAPIAENJLOEEYICNGMNTHEBIARSDAEGOOACGOLCDYW
MAEEAROULEMOENJGOEAGDEEOWCIADMNMJAMUEMBHEAJOEGAIAXIUWCICXTPUPGUJNGMLOWLJPATHALPWXUODOEASJTWGYOETHAHHYTHTHFOFNLPA
APDOEMNGPTHHGEATHHDBSASDIAODBDHUMFNGRSEUBOECOIAOEOFUNGIJRCCYEAEUBSFYAHIASFGGAEMOEEANGEIAEOBFEOOEOERIANLESEALIAEA
IAWPRXOESAEINGAGEAJEAAEANETANGOMYUXTJYONGIIWTHOBFEONGUIEEAUPEEAEAAYAERNYANPEAJHEYAPAEEAANGNGJDUIGFAECLENGHNGDHOE
EOEERBNXBMEOMRGUBOATHAEANGIPJIAICPOEIAPTYIAOEDPAOEXHXXMCXAWOEHCPEOGOEXIASBJPNTHOFCRAENDDPOEEXMYIREANTHGIAMHAOALJ
URXGHSETNGWOYTPLPRMWIGEABEOINGCNJNOJJIACEANIBUXADARISAALCCDEASPEINGEAWGNAECRJGTHYYMLEAYNNTHXYIAEADXTHCLEAEEADDWP
BTHAEDBTLMCPDNGTHEONBNEOWYBWPTIAMYADPHXDEWNEAWOIACNMRTHCTLEUTHWITNAEBEAEATMRATOJAEYIUOEPINEOROYCEXPDLOSUSRTBUAEF
SOHDEACWSUMNYSOEIYHEOIDEOJUNGFHLUYRTHXLCPGSXIAEOTHPJTPSFMYFNGMMPTHEUTHTHADOIAEAJEOUOENGUPIAEXSGLWINGOEUMEUWBEGBP
CPXHJBADSTHEONIAEOEOTWCUHUCFAEFCDAEOWSNNFPNACYWAOYTHFEAOBEAEARTBEOJSNWNSLYNGOGRYEJTMIAAEWIAJYMMHRWIAEYNGATHANAIA
BNRJDEADOEIIABFEONGBIAYOEIABSSIANEOJCTHOGCGNGCWLSOEIAPETTHONGNGMEEOOPDDLIAMSSGUTHNGEAGALCOEDXIAAEFPBWIEARAPLLAEW
ECEOFOEBNGJEULTOUEEOMJGUIAMFEAANGYXNSWNBGADLBAMHWEOTRJIAGYOHUFIAMSGOBJEAWDAEARTHAHNEAWFBHYIARHEAOEGXOGIAPWEORORP
WOERTIAHCYAEFYJOJINEAYHONEGYBJNJREAIAAOAHWBYAENGYOENNGUHAETHHAELHLTHEAEHOEOECHWAEOYWAEFGIFOEOETIARBTMWEAAAWMOEPE
AUCWMRIXIAYGONGOOONEFOEODGEOPDGNGLIAWEOOEAOEEGDJNHXORHMEADFAFWTFDMOEJUEXDEOCEEONGTCBPFIAUOEBFENRLBIACOEBCIAEOIAM
LXTHWAEIAEPEAMUTHAWESXDOETAEXYRTHEAUDUJHOEBEORRHMEAHEOGHNGXNDJEAOEETHSEEAJTHOPXYUNGFRIAHUAJAABEOOSEOEOENGTHEOISX
TNGSPASXMHJYLDGIADEAPABYRLARFEOJAEBOEIYEGPGRHFSOEIAUULXJAEOEEABMDEYHIDNFNGOENAAEOEAGSEETHAENGIEAOEPIADGJEOMNGCWE
ANGULJIANGHHRAEEASLJBIRGOCCDEODSNSOEIAWEOTOEEOXYJOETSGSITJGIAXIASYNGJJJJGEOGTTYCAUYTAEEIENGYRBIAHIYNRTEOMPFEIAIA
AEDNGIAEOMONGWEOHTHWJCYXCULUMCDSBHFCEAEOEEOEOTIAAEIBEOIOYNRWHSEAARNGHLPGCWMEOGEADTHSYAEEALIAHYLNGINGTHOMNGPTAIAA
GGEOIAYEOLOEDJIANXCNWTHGUHLAXIAECTHIAJUAESTHOEOHMAEUJSNNDEOEAEMSILIAXOCAXYAJPIAYDLETOCIANGTNGFFGMPFYOENIBTHOEMEA
LXXUEAJEEPNHHEOPIFCTHEOFEONGFGAEMOEIACTOAESTHSGROHNGEALOEIANEAINAXCXLIAIEOOYAXTAXNGMECEAEFOCPRATTWILEAEOERNGEANG
TFRMDLAEXWXCLEOAIMXEOAENCPGOEMABEOIABTHIAEEOXCCXSEARCYIBAEXOEAALWSGNGUIWCMAAECLXSFXPPNJIAIDBWOBTDEAGFUDHENGAEEA
```

## Conclusion and reproduction

The **one** original p40 red8 key-ordered classic columnar inverse followed by **r mod32 source-byte grid subtraction** is now excluded as a direct native-GP decipherment of pp40–53: complete ciphertext and positive controls invert exactly but actual output is uniformly distributed gibberish. This finding does **not** rule out alternative authenticated page-specific shifts, a different true keyed 2014 operation, or a non-English intermediate. Those would need a separately visible creator-side selector. Changing phase, grid order or arithmetic sign to rescue the output without such a selector would repeat the streetlight search.

Reproduce exactly with [single-file CommonJS SFT](../sims/lp2_p40_red8_grid32_columnar_inverse_sft.cjs) and [manual-only GitHub Actions workflow](../.github/workflows/lp2-p40-red8-grid32-columnar-manual.yml). The SFT asserts all source lengths and red key, original/source-native roundtrips, both IoCs, and the closing 51-rune span; it prints all 3,000 decoded symbols. No random search or training set is involved. [GitHub Actions run 43317028210](https://github.com/FlareZ123/liber-primus/actions/runs/43317028210) passed on the exact committed original files under Node.js 22.
