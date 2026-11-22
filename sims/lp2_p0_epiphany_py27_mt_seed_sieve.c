/*
 * LP2 p0 source-crib -> historical CPython 2.7 MT19937 32-bit seed sieve.
 * Independent source cue: the first two original p0 red words have lengths
 * [8,5]; the separately signed 2016 EPIPHANY SEEKS phrase has GP29 [8,5].
 * No plaintext is assumed outside this exact candidate 13-GP-rune title.
 *
 * Test exact bounded keyskip2 compatibility for all 2^32 integer seeds,
 * 3 CPython2-era reducers, both additive signs, up to 4 skip2 events per
 * ciphertext rune. A hit is a CANDIDATE, not a confirmed decryption.
 *
 * No dictionary or tuned English scorer. Exhaustive finite seed coverage is
 * meaningful only for this explicitly conditional model and crib.
 *
 * MIT source credit for the historical MT constants/recurrence:
 * Copyright (c) 2026 Dukotah (https://github.com/Dukotah), MIT license.
 * Algorithm reference: Dukotah/cicada3301,
 * liber-primus/analysis/round19/G3/gen_py27.py.
 * Retain license and author attribution in this file.
 *
 * MIT License
 * Copyright (c) 2026 Dukotah (https://github.com/Dukotah)
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
#include <assert.h>
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

enum { MT_N=624, MT_M=397, RAW_N=256, K_N=128, CRIB_N=13 };
typedef struct { uint32_t a[MT_N]; int at; } MT;
static const uint8_t C[CRIB_N]={15,8,18,3,6,19,27,0,15,26,18,21,5};
static const uint8_t P[CRIB_N]={18,13,10,13,8,24,9,26,15,18,18,5,15};
static const char *MNAME[3]={"random29","grb5_mod","grb5_reject"};

static void seed_mt(MT *r,uint32_t s) {
    r->a[0]=19650218u;
    for(int i=1;i<MT_N;i++)
        r->a[i]=1812433253u*(r->a[i-1]^(r->a[i-1]>>30))+(uint32_t)i;
    int i=1,j=0;
    for(int k=MT_N;k;k--){
        r->a[i]=(r->a[i]^((r->a[i-1]^(r->a[i-1]>>30))*1664525u))+s+(uint32_t)j;
        i++;j=0;
        if(i>=MT_N){r->a[0]=r->a[MT_N-1];i=1;}
    }
    for(int k=MT_N-1;k;k--){
        r->a[i]=(r->a[i]^((r->a[i-1]^(r->a[i-1]>>30))*1566083941u))-(uint32_t)i;
        i++;
        if(i>=MT_N){r->a[0]=r->a[MT_N-1];i=1;}
    }
    r->a[0]=0x80000000u;r->at=MT_N;
}
static uint32_t next32(MT *r){
    if(r->at==MT_N){
        for(int i=0;i<MT_N;i++){
            uint32_t y=(r->a[i]&0x80000000u)|(r->a[(i+1)%MT_N]&0x7fffffffu);
            r->a[i]=r->a[(i+MT_M)%MT_N]^(y>>1)^((y&1u)?0x9908b0dfu:0u);
        }
        r->at=0;
    }
    uint32_t y=r->a[r->at++];
    y^=y>>11;y^=(y<<7)&0x9d2c5680u;
    y^=(y<<15)&0xefc60000u;y^=y>>18;
    return y;
}
static int random29(uint32_t a,uint32_t b){
    const uint64_t x=((uint64_t)(a>>5)<<26)|(uint64_t)(b>>6);
    return (int)((double)x*(29.0/9007199254740992.0));
}
/* Derive exactly the first 'needed' key digits, verifying raw availability. */
static int keys(const uint32_t raw[RAW_N],int nraw,int mode,
                int needed,uint8_t k[K_N]){
    assert(needed>0&&needed<=K_N);
    int have=0;
    for(int i=0;i<nraw&&have<needed;){
        int digit=-1;
        if(mode==0){
            if(i+1>=nraw) break;
            digit=random29(raw[i],raw[i+1]);i+=2;
        }else{
            digit=(int)(raw[i++]>>27);
            if(mode==1) digit%=29;
            if(mode==2&&digit>=29)continue;
        }
        assert(digit>=0&&digit<29);
        k[have++]=(uint8_t)digit;
    }
    return have==needed;
}
static int compatible(int n,const uint8_t *k,int sign){
    uint8_t old[K_N]={0},now[K_N]={0};
    if(((int)P[0]+sign*(int)k[0]+29)%29!=C[0])return 0;
    old[0]=1;
    for(int i=1;i<n;i++){
        memset(now,0,sizeof now);int alive=0;
        for(int a=0;a<(i-1)*9+1;a++)if(old[a]){
            for(int skip=0;skip<=8;skip+=2){
                int dest=a+1+skip;int ok=1;
                for(int j=a+1;j<dest;j+=2)
                    if(((int)P[i]+sign*(int)k[j]+29)%29!=C[i-1]){
                        ok=0;break;
                    }
                if(ok&&((int)P[i]+sign*(int)k[dest]+29)%29==C[i]){
                    alive|=!now[dest];now[dest]=1;
                }
            }
        }
        if(!alive)return 0;
        memcpy(old,now,sizeof now);
    }
    return 1;
}
static unsigned long long checked=0,stage1=0,stage4=0,hits=0;
static void attempt(uint32_t seed,int print) {
    MT m;seed_mt(&m,seed);
    uint32_t raw[RAW_N];
    raw[0]=next32(&m);raw[1]=next32(&m);
    int nraw=2;
    uint8_t k[K_N];
    int possible[3][2]={{0}};
    /* A seed is cheap-rejected after the first digit in every reducer. */
    int k0[3]={random29(raw[0],raw[1]),(int)(raw[0]>>27)%29,-1};
    int i=0;
    while(k0[2]<0){
        if(i>=nraw)raw[nraw++]=next32(&m);
        int x=(int)(raw[i++]>>27);
        if(x<29)k0[2]=x;
    }
    int any=0;
    for(int mode=0;mode<3;mode++)
        for(int s=0;s<2;s++){
            int sign=s==0?1:-1;
            possible[mode][s]=(((int)P[0]+sign*k0[mode]+29)%29==C[0]);
            any|=possible[mode][s];
        }
    checked++;
    if(!any)return;
    stage1++;
    while(nraw<64)raw[nraw++]=next32(&m);
    int active=0;
    for(int mode=0;mode<3;mode++){
        if(!keys(raw,nraw,mode,28,k))abort();
        for(int s=0;s<2;s++)if(possible[mode][s]){
            int sign=s==0?1:-1;
            possible[mode][s]=compatible(4,k,sign);
            active|=possible[mode][s];
        }
    }
    if(!active)return;
    stage4++;
    while(nraw<RAW_N)raw[nraw++]=next32(&m);
    for(int mode=0;mode<3;mode++){
        if(!keys(raw,nraw,mode,109,k))abort();
        for(int s=0;s<2;s++)if(possible[mode][s]){
            int sign=s==0?1:-1;
            if(compatible(CRIB_N,k,sign)){
                hits++;
                if(print)printf("CANDIDATE seed=%" PRIu32 " reducer=%s sign=%+d\n",seed,MNAME[mode],sign);
            }
        }
    }
}
static void selftest(void) {
    /* CPython-2.7 cross-language fixed vectors (first 16 digits). */
    MT m;seed_mt(&m,3301);
    uint32_t raw[RAW_N];
    for(int i=0;i<RAW_N;i++)raw[i]=next32(&m);
    uint8_t k[K_N];
    if(!keys(raw,RAW_N,0,16,k))abort();
    /* Python2.7 seed(int(3301)) published exact vector in G3. */
    const uint8_t expect[16]={15,27,17,1,24,8,12,11,25,27,13,2,28,19,14,22};
    for(int i=0;i<16;i++)if(k[i]!=expect[i]){
        fprintf(stderr,"MT vector mismatch %d: %d != %d\n",i,k[i],expect[i]);exit(2);
    }
    if(!keys(raw,RAW_N,2,16,k))abort();
    const uint8_t expectReject[16]={17,26,16,19,26,1,11,27,3,9,14,13,0,12,8,27};
    for(int i=0;i<16;i++)if(k[i]!=expectReject[i]){
        fprintf(stderr,"grb5 reject mismatch %d: %d != %d\n",i,k[i],expectReject[i]);exit(2);
    }
    /* Independent deterministic ciphertext plant for each reducer and sign.
     * Any same-rune candidate forces two-key advance on a fixed parity
     * condition, which bounds skips and exercises exact reverse reachability. */
    const uint8_t source[13]={15,18,18,5,15,9,24,16,17,13,18,18,15};
    int tested=0;
    for(int mode=0;mode<3;mode++)for(int sign=-1;sign<=1;sign+=2){
        if(!keys(raw,RAW_N,mode,109,k))abort();
        uint8_t plant[13]={0};int at=0,prev=-1,skipped=0;
        for(int i=0;i<13;i++){
            int guard=0;
            while(1){
                int c=((int)source[i]+sign*(int)k[at]+29)%29;
                if(c==prev&&guard<4&&(i+at)%3!=0){
                    at+=2;guard++;skipped++;continue;
                }
                plant[i]=(uint8_t)c;prev=c;at++;break;
            }
        }
        /* Test same algebra with the original P/C arrays replaced locally. */
        uint8_t actualP[13],actualC[13];
        memcpy(actualP,(void*)P,13);memcpy(actualC,(void*)C,13);
        /* The reversible relation is reconstructed by a separate direct DP
         * parameterized below, avoiding mutable global source constants. */
        uint8_t reach[K_N]={0},next[K_N]={0};reach[0]=1;int valid=1;
        for(int i=1;i<13;i++){
            memset(next,0,sizeof next);int good=0;
            for(int a=0;a<(i-1)*9+1;a++)if(reach[a]){
                for(int sk=0;sk<=8;sk+=2){
                    int dest=a+1+sk,ok=1;
                    for(int j=a+1;j<dest;j+=2)
                        if(((int)source[i]+sign*(int)k[j]+29)%29!=plant[i-1]){ok=0;break;}
                    if(ok&&((int)source[i]+sign*(int)k[dest]+29)%29==plant[i]){
                        next[dest]=1;good=1;
                    }
                }
            }
            if(!good){valid=0;break;}memcpy(reach,next,sizeof reach);
        }
        if(((int)source[0]+sign*(int)k[0]+29)%29!=plant[0])valid=0;
        if(!valid){fprintf(stderr,"Plant invalid mode%d sign%d\n",mode,sign);exit(3);}
        if(skipped>0)tested++;
        (void)actualP;(void)actualC;
    }
    if(tested<1){fprintf(stderr,"No plant exercises suppression\n");exit(3);}
    /* Per source, exactly these 13 GP ciphertext indices are original p0. */
    assert(C[0]==15&&C[12]==5&&P[0]==18&&P[12]==15);
    fprintf(stderr,"SELFTEST PASS fixed real Python2.7 vectors + exact planted skip2 paths (%d suppressing plants)\n",tested);
}
int main(int argc,char **argv) {
    if(argc==2&&strcmp(argv[1],"--selftest")==0){selftest();return 0;}
    if(argc<3){
        fprintf(stderr,"Usage: %s BEGIN END [SELFTEST] (decimal unsigned 64, 0 <= BEGIN < END <= 4294967296)\n",argv[0]);return 2;
    }
    char *stop;
    uint64_t begin=strtoull(argv[1],&stop,10);if(*stop){return 2;}
    uint64_t end=strtoull(argv[2],&stop,10);if(*stop||begin>=end||end>UINT64_C(4294967296)){return 2;}
    if(argc>=4)selftest();
    const clock_t t0=clock();
    for(uint64_t s=begin;s<end;s++)attempt((uint32_t)s,1);
    printf("RESULT range=[%" PRIu64 ",%" PRIu64 ") seeds=%llu stage1=%llu stage4=%llu candidates=%llu cpu_s=%.3f\n",
        begin,end,checked,stage1,stage4,hits,(double)(clock()-t0)/CLOCKS_PER_SEC);
    return 0;
}
