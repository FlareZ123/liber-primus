#!/usr/bin/env python3
"""Original p54 source-key dihedral test with a fully fixed canonical GP29 chart.

P54 original eight red heading runes are a visible proposed q8 key. Test both
canonical index signs and BOTH natural orders of key addition/reflection,
then EVERY static assignment of
rotation/reflection to its eight phases (256 sign masks). Each printed complete
p54 black-body group may choose any of eight independent initial phases.
Literal plaintext-F holds are optional exactly when ciphertext is F, and hold
the phase; consuming non-F never maps to plaintext F. No other key/chart,
permutation, plaintext, word segmentation, phase history or OOV budget is
fitted. The final ten-rune p54 carry is withheld until a candidate passes
44/47 training groups. The physical p55 suffix is never used to optimize.

This is a small finite original family suggested by the displayed eight-red
heading and the authors' documented reflected GP29 operations, NOT evidence
that these signs are an authored instruction. It cannot exclude secret charts,
clock-continuous models, alternate red indexing, non-words or source carriers.
"""
import json,pathlib,sys,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'sims'))
import lp2_shared_gp29_q8_smt as smt
SRC=ROOT/'resources/liber-primus/lp2-page-groups-54-55-derived.json'
LEX=ROOT/'resources/control/english_wordfreq_textblob.txt'
SYM='0123456789abcdefghijklmnopqrs'
MOD=29

def decode_group(group,key,mask,start,dictionary,order):
    # Returns exact candidates under independent word-reset and plaintext-F bypass.
    states={(start,())}
    for ch in group:
        c=SYM.index(ch)
        nxt=set()
        for phase,plain in states:
            if c==0:
                # Genuine transparent plaintext F, does not advance.
                nxt.add((phase,plain+(0,)))
            # Consuming letter maps by C=(s*P + key_j) mod29.
            s=-1 if ((mask>>phase)&1) else 1
            shift=key[phase] if order=='reflect-first' else (s*key[phase])%MOD
            p=(c-shift)*s % MOD
            if p:
                nxt.add(((phase+1)%8,plain+(p,)))
        states=nxt
        if not states:return ()
    return tuple(sorted({plain for _,plain in states if plain in dictionary}))

def forward_group(plain,key,mask,start,order):
    out=[]
    phase=start
    for p in plain:
        if p==0:
            out.append(SYM[0]); continue
        a=-1 if ((mask>>phase)&1) else 1
        shift=key[phase] if order=='reflect-first' else (a*key[phase])%MOD
        out.append(SYM[(a*p+shift)%MOD])
        phase=(phase+1)%8
    return ''.join(out)

def native_source_model_controls(plantwords,key,mask,dictionary,order):
    # 47 freeze-chosen source-register forms, with the actual original length
    # profile and alternating literal-F inclusion to test the whole decoder.
    for i,chosen in enumerate(plantwords):
        phase=(7*i+11)%8
        cipher=forward_group(chosen,key,mask,phase,order)
        assert chosen in decode_group(cipher,key,mask,phase,dictionary,order),('plant failed',i,mask)
    return True


def evaluate():
    original=json.loads(SRC.read_text(encoding='utf-8'))
    body=original['p54']['body_groups']
    assert len(body)==48 and sum(map(len,body))==223
    complete=body[:-1]
    carry=body[-1]+original['p55']['groups'][0]
    assert len(complete)==47 and sum(map(len,complete))==213
    assert body[-1]=='63g2eis46q' and carry=='63g2eis46ql'
    red=original['red8_key']['gp29_indices']
    assert len(red)==8 and ''.join(SYM[x] for x in red)=='jlnr2eaj'
    D=smt.load_dictionary(LEX,'')
    assert len(D)==38910
    bylen=collections.defaultdict(list)
    for word in D:bylen[len(word)].append(word)
    for length in bylen:bylen[length].sort()
    plantwords=[]
    for i,c in enumerate(complete):
        forms=bylen[len(c)]
        assert forms
        preferred=[w for w in forms if (0 in w)==bool(i%2)]
        chosen=(preferred or forms)[i%len(preferred or forms)]
        plantwords.append(chosen)
    assert len(plantwords)==47
    bylen=collections.Counter(map(len,D))
    all_best=[]
    positive_models=0
    distribution=collections.Counter()
    total_cases=0
    for order in ('reflect-first','shift-first'):
        for sign in (1,-1):
            key=[(sign*v)%MOD for v in red]
            for mask in range(256):
                native_source_model_controls(plantwords,key,mask,D,order)
                positive_models+=1
                counts=[]
                for g in complete:
                    n=sum(bool(decode_group(g,key,mask,start,D,order))
                          for start in range(8))
                    counts.append(n)
                n=sum(bool(x) for x in counts)
                total_cases+=1
                distribution[n]+=1
                all_best.append((n,order,sign,mask,counts))
    all_best.sort(key=lambda x:(-x[0],x[1],x[2],x[3]))
    best=all_best[0]
    follow=[]
    for fit,order,sign,mask,counts in all_best:
        if fit<44:break
        key=[(sign*v)%MOD for v in red]
        carry_candidate=set()
        for start in range(8):
            carry_candidate.update(decode_group(carry,key,mask,start,D,order))
        holdout=original['p55']['groups'][1:]
        held=[bool({w for start in range(8)
                    for w in decode_group(word,key,mask,start,D,order)})
              for word in holdout]
        follow.append({'order':order,'key_sign':sign,'mask':mask,'fit':fit,
                       'carry_candidates':len(carry_candidate),
                       'held_supported':sum(held),'held_count':len(held)})
    out={'experiment':'source-fixed-GP29-red8-dihedral-word-local-Fhold',
         'status':'original finite-family test, not source-authenticated key',
         'original_source':str(SRC.relative_to(ROOT)),
         'dictionary_size':len(D),'completed_training_groups':47,
         'training_runes':213,
         'carry_unseen_in_fitting':carry,
         'red8_gp_indices':red,'variants':total_cases,'positive_plants_recovered':positive_models,
         'family_parameterization':'two natural key-addition/reflection orders times two global key signs times all 2^8 per-phase rotation/reflection vectors; 8 independent word phases; optional literal F holds',
         'maximum_supported_complete_words':best[0],
         'best':[
            {'fit':n,'order':order,'key_sign':sign,'mask':f'{mask:08b}',
             'supported_word_indices':[i for i,x in enumerate(counts) if x],
             'unsupported_word_indices':[i for i,x in enumerate(counts) if not x],
             'per_word_supported_starts':counts}
            for n,order,sign,mask,counts in all_best if n==best[0]
         ],
         'support_distribution':dict(sorted(distribution.items())),
         'accepted_fit_threshold':44,'accepted_count':sum(x[0]>=44 for x in all_best),
         'held_after_freeze':follow,
         'limitations':'canonical GP chart, source-red GP key, static per-phase sign, per-word starts, intact word groups and <=3 original OOV; no secret pi or rearrangement'}
    print(json.dumps(out,separators=(',',':')),flush=True)
    assert total_cases==1024 and positive_models==1024
    if best[0]<44:
        print('PASS: all 1024 source-red fixed-key dihedral order/mask variants require >3 OOV; no p55 key/decoder; original ciphertext unchanged.',flush=True)
    else:
        print('CANDIDATE_FORK: report full 11-rune carry and withheld p55 without choosing by holdout.',flush=True)
if __name__=='__main__':evaluate()
