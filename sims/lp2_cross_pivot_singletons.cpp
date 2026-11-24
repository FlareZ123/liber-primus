#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
#include <omp.h>
#if defined(__AVX512VPOPCNTDQ__) || defined(__BMI2__)
#include <immintrin.h>
#endif
using namespace std;
constexpr uint32_t FULL=(1u<<29)-1;
struct State{uint32_t g,tags;int a,b;};
struct Survivor{uint32_t g;int a,b,start,flags;};
struct Tape{
 vector<int> c,anchors,first;vector<uint8_t> anchor;uint32_t active=0;int firstrepeat,last;
 Tape(vector<int> a,vector<int> p):c(move(a)),anchors(move(p)),anchor(c.size()),firstrepeat(c.size()),last(anchors.back()) {for(int t:anchors)if(t)anchor[t]=1;for(int i=0;i<int(c.size());++i){uint32_t bit=1u<<c[i];if(!(active&bit)){active|=bit;first.push_back(i);}if(i&&c[i]==c[i-1])firstrepeat=min(firstrepeat,i);}}
 static inline void step(State&s,int v,int flags,bool tagged){uint32_t bit=1u<<v;int q=bool(s.g&bit),p=q;bool cross=((q?s.b:s.a)==v)&&((flags>>q)&1);if(cross)p^=1;int old=p?s.b:s.a;uint32_t oldbit=1u<<old,flip=bit|oldbit;if(tagged&&bool(s.tags&bit)!=bool(s.tags&oldbit))s.tags^=flip;if(cross)s.g^=flip;if(p){if(cross)s.a=old;s.b=v;}else{if(cross)s.b=old;s.a=v;}}
 bool scalar(State s,int start,int flags,int bound=3)const{bool tagged=false;for(int i=start;i<=last;++i){int v=c[i];if(anchor[i]){s.tags|=1u<<v;tagged=true;if(__builtin_popcount(s.tags)>bound)return false;}step(s,v,flags,tagged);}return true;}
 void check(mt19937&rng)const{for(int j=0;j<1001;++j){array<int,29>A; iota(A.begin(),A.end(),0);shuffle(A.begin(),A.end(),rng);uint32_t rankClass=rng()&FULL;int flags=1+(rng()%3);rankClass=(rankClass&~3u)|((flags&1)?1u:0u)|((flags&2)?0u:2u);uint32_t g=1u<<A[1];for(int r=2;r<29;++r)if(rankClass&(1u<<r))g|=1u<<A[r];State s{g,0,A[0],A[1]};uint32_t tagged=0;for(int i=0;i<int(c.size());++i){int v=c[i],r=find(A.begin(),A.end(),v)-A.begin();if(anchor[i]){tagged|=1u<<r;s.tags|=1u<<v;}step(s,v,flags,true);int q=(rankClass>>r)&1;swap(A[r],A[q]);assert(s.a==A[0]&&s.b==A[1]);uint32_t expect=1u<<A[1],tags=0;for(int k=0;k<29;++k){if(k>=2&&(rankClass&(1u<<k)))expect|=1u<<A[k];if(tagged&(1u<<k))tags|=1u<<A[k];}assert(s.g==expect&&s.tags==tags);}}}
#ifdef __AVX512VPOPCNTDQ__
 inline uint16_t vector16(const State*st,int start,int flags,uint16_t valid)const{alignas(64) uint32_t g[16],a[16],b[16],tags[16];for(int i=0;i<16;++i){g[i]=st[i].g;a[i]=st[i].a;b[i]=st[i].b;tags[i]=st[i].tags;}__m512i G=_mm512_load_si512(g),A=_mm512_load_si512(a),B=_mm512_load_si512(b),T=_mm512_load_si512(tags);const __m512i one=_mm512_set1_epi32(1),three=_mm512_set1_epi32(3);__mmask16 live=valid;bool tagged=false;
 for(int i=start;i<=last;++i){int v=c[i];const __m512i V=_mm512_set1_epi32(v),bit=_mm512_set1_epi32(1u<<v);if(anchor[i]){T=_mm512_or_si512(T,bit);tagged=true;live&=_mm512_cmple_epi32_mask(_mm512_popcnt_epi32(T),three);if(!live)return 0;}const __mmask16 cross=((flags&1)?_mm512_cmpeq_epi32_mask(A,V):0)|((flags&2)?_mm512_cmpeq_epi32_mask(B,V):0),q=_mm512_test_epi32_mask(G,bit),s=q^cross;const __m512i old=_mm512_mask_blend_epi32(s,A,B),oldbit=_mm512_sllv_epi32(one,old),flip=_mm512_or_si512(bit,oldbit);if(tagged){__mmask16 diff=_mm512_test_epi32_mask(T,bit)^_mm512_test_epi32_mask(T,oldbit);T=_mm512_mask_xor_epi32(T,diff,T,flip);}G=_mm512_mask_xor_epi32(G,cross,G,flip);A=_mm512_mask_mov_epi32(A,cross&s,old);B=_mm512_mask_mov_epi32(B,cross&~s,old);A=_mm512_mask_mov_epi32(A,~s,V);B=_mm512_mask_mov_epi32(B,s,V);}return live;
 }
#endif
};
static inline uint32_t deposit(uint32_t x,uint32_t m){
#ifdef __BMI2__
 return _pdep_u32(x,m);
#else
 uint32_t a=0;for(;m;m&=m-1,x>>=1)if(x&1)a|=m&-m;return a;
#endif
}
struct Job{uint32_t fixed,free,lo,hi;int t,flags,branch;};
int main(int argc,char**argv){ios::sync_with_stdio(false);cin.tie(nullptr);int n,k,b;cin>>n>>k>>b;vector<int>c(n),at(k);for(auto&v:c)cin>>v;for(auto&v:at)cin>>v;Tape t(move(c),move(at));mt19937 rng(3301);t.check(rng);cerr<<"1001 complete rank/tag state checks passed\n";const int flagsOnly=argc>1?atoi(argv[1]):0;uint64_t cap=argc>2?strtoull(argv[2],nullptr,10):0;vector<Job>jobs;uint64_t possible=0;const uint32_t block=1u<<15;uint32_t seen=1u<<t.c[0];
 // WLOG after the first emitted rune, pivot0 contains c[0]. Group initial
 // class masks by their first observed class1 glyph. Before this event,
 // no pivot0 cross can occur unless adjacent ciphertext repeats occur.
 for(int f=1;f<=3;++f){if(flagsOnly&&f!=flagsOnly)continue;seen=1u<<t.c[0];for(size_t ix=1;ix<t.first.size();++ix){int pos=t.first[ix],v=t.c[pos];uint32_t fixed=1u<<v,free=FULL&~(seen|fixed);seen|=fixed;uint32_t count=1u<<__builtin_popcount(free);bool late=(f&1)&&pos>=t.firstrepeat;for(int branch=0;branch<(late?1:((f&2)?2:1));++branch){int kind=late?2:branch;possible+=count;for(uint32_t x=0;x<count;x+=block)jobs.push_back({fixed,free,x,min(count,x+block),pos,f,kind});}}
 uint32_t unseen=FULL&~t.active; if(unseen){for(uint32_t s=unseen;s;s=(s-1)&unseen){jobs.push_back({s,0,0,1,0,f,2});possible++;}}
 }
 if(cap){uint64_t used=0;vector<Job> limited;for(auto j:jobs){if(used>=cap)break;if(used+j.hi-j.lo>cap)j.hi=j.lo+(cap-used);used+=j.hi-j.lo;limited.push_back(j);}jobs=move(limited);}cerr<<"jobs="<<jobs.size()<<" candidate masks="<<possible<<" firstrepeat="<<t.firstrepeat<<"\n";uint64_t tested=0;array<uint64_t,4> counts{},survcounts{};vector<Survivor>survivors;auto start=chrono::steady_clock::now();
 #pragma omp parallel
 {uint64_t local=0;array<uint64_t,4> lc{},ls{};vector<Survivor> kept;
 #pragma omp for schedule(dynamic,1)
 for(size_t ji=0;ji<jobs.size();++ji){auto j=jobs[ji];if(j.branch==2){for(uint32_t x=j.lo;x<j.hi;++x){uint32_t m=j.fixed|deposit(x,j.free);for(uint32_t s=m;s;s&=s-1){int h=__builtin_ctz(s);State st{m,0,t.c[0],h};local++;lc[j.flags]++;if(t.scalar(st,1,j.flags)){ls[j.flags]++;if(kept.size()<100000)kept.push_back({m,st.a,st.b,1,j.flags});}}}continue;}
 for(uint32_t x=j.lo;x<j.hi;x+=16){State st[16]{};uint16_t valid=0;int startpos=j.t+1;for(int lane=0;lane<16&&x+lane<j.hi;++lane){uint32_t m=j.fixed|deposit(x+lane,j.free);if(j.branch==0&&(j.flags&2)&&__builtin_popcount(m)==1)continue;valid|=1u<<lane;int a=t.c[j.t-1],b=t.c[j.t];if(j.branch==1){m^=(1u<<a)|(1u<<b);swap(a,b);}st[lane]={m,0,a,b};}if(!valid)continue;local+=__builtin_popcount(valid);lc[j.flags]+=__builtin_popcount(valid);uint16_t live=0;
#ifdef __AVX512VPOPCNTDQ__
 live=t.vector16(st,startpos,j.flags,valid);
#else
 for(int lane=0;lane<16;++lane)if((valid&(1u<<lane))&&t.scalar(st[lane],startpos,j.flags))live|=1u<<lane;
#endif
 ls[j.flags]+=__builtin_popcount(live);for(int lane=0;lane<16;++lane)if((live&(1u<<lane))&&kept.size()<100000)kept.push_back({st[lane].g,st[lane].a,st[lane].b,startpos,j.flags});}}
 #pragma omp critical
 {tested+=local;for(int f=1;f<=3;++f){counts[f]+=lc[f];survcounts[f]+=ls[f];}survivors.insert(survivors.end(),kept.begin(),kept.end());}}
 cout<<"{\"tested\":"<<tested<<",\"candidateMasks\":"<<possible<<",\"cap\":"<<cap<<",\"counts\":["<<counts[1]<<","<<counts[2]<<","<<counts[3]<<"],\"survcounts\":["<<survcounts[1]<<","<<survcounts[2]<<","<<survcounts[3]<<"],\"survivors\":[";for(size_t i=0;i<survivors.size();++i){auto s=survivors[i];cout<<(i?",":"")<<"["<<s.g<<","<<s.a<<","<<s.b<<","<<s.start<<","<<s.flags<<"]";}cout<<"],\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"}\n";
}
