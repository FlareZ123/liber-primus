"""Run the exact receiver against genuine LP1 ciphertext without supplying a key."""
import json,pathlib,subprocess,sys
root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(sys.argv[1]);exe=pathlib.Path(sys.argv[2]).resolve()
g=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
runes=g['runes']
def encode(s):return [runes.index(x) for x in s if x in runes]
s=(root/'resources/transcriptions/lp1_wulfic_canonical.txt').read_text(encoding='utf8').split('$')
p=json.loads((root/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))['sections']
for name,i,q,blocks,key in [('welcome',1,8,[172,172,171],[23,10,1,10,9,10,16,26]),('koan',5,13,[160,159],[0,10,4,0,1,19,0,18,4,18,9,0,18])]:
 C=encode(s[i]);P=encode(p[i]['source_text']);assert len(C)==len(P)==sum(blocks)
 j=0;replay=[]
 for x in P:
  if x:replay.append((x+key[j%q])%29);j+=1
  else:replay.append(0)
 assert replay==C
 f=out/f'{name}-cipher.csv';f.write_text(','.join(map(str,C)),encoding='ascii')
 a=0
 for n in blocks:
  v=subprocess.run([str(exe),str(out/'model.bin'),str(f),str(q),str(a),str(n),'1','0'],capture_output=True,text=True,check=True).stdout
  rows=v.splitlines();plain=list(map(int,rows[2].strip(',').split(',')))
  assert plain==P[a:a+n];print(name,rows[0],rows[1],f'{n}/{n}',flush=True);a+=n
