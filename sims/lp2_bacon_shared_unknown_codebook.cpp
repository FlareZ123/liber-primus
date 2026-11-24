// Exact enumeration of stationary GP29 binary partitions, arbitrary injective output labels.
// g++ -O3 -march=native -fopenmp -std=c++17 lp2_bacon_shared_unknown_codebook.cpp -o bacon_gate
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#ifdef __AVX512F__
#include <immintrin.h>
#endif
using namespace std;
using Group=array<uint8_t,5>;
using Groups=vector<Group>;
constexpr uint32_t HALF=1u<<14,FULL=(1u<<29)-1;
const string SYMBOLS="0123456789abcdefghijklmnopqrs";
Groups readGroups(const char* path){ifstream f(path);string s;f>>s;assert(f&&s.size()%5==0);Groups g(s.size()/5);for(size_t i=0;i<s.size();++i){auto x=SYMBOLS.find(s[i]);assert(x<29);g[i/5][i%5]=uint8_t(x);}return g;}
uint8_t code(const Group&g,uint32_t key){uint8_t c=0;for(auto x:g)c=(c<<1)|((key>>x)&1);return c;}
struct Stats{int distinct=0,maximum=0,pairs=0;};
Stats stats(const Groups&g,uint32_t key){array<int,32>h{};for(const auto&t:g)++h[code(t,key)];Stats s;for(int n:h){s.distinct+=(n>0);s.maximum=max(s.maximum,n);s.pairs+=n*(n-1);}return s;}
struct Table{
 size_t n,stride;vector<uint8_t>lo,hi;
 Table(const Groups&g):n(g.size()),stride((n+63)/64*64),lo(HALF*stride),hi(HALF*stride){for(uint32_t k=0;k<HALF;++k)for(size_t i=0;i<stride;++i){const Group&t=g[i%n];lo[k*stride+i]=code(t,k<<1);hi[k*stride+i]=code(t,k<<15);}}
 int distinct(uint32_t a,uint32_t b,bool stop=true)const{
  const uint8_t*l=&lo[a*stride],*h=&hi[b*stride];uint32_t seen=0;
#ifdef __AVX512F__
  const __m512i one=_mm512_set1_epi32(1);
  for(size_t i=0;i<stride;i+=64){__m512i m=_mm512_or_si512(_mm512_loadu_si512(l+i),_mm512_loadu_si512(h+i));
   __m512i v0=_mm512_sllv_epi32(one,_mm512_cvtepu8_epi32(_mm512_castsi512_si128(m)));
   __m512i v1=_mm512_sllv_epi32(one,_mm512_cvtepu8_epi32(_mm512_extracti32x4_epi32(m,1)));
   __m512i v2=_mm512_sllv_epi32(one,_mm512_cvtepu8_epi32(_mm512_extracti32x4_epi32(m,2)));
   __m512i v3=_mm512_sllv_epi32(one,_mm512_cvtepu8_epi32(_mm512_extracti32x4_epi32(m,3)));
   seen|=uint32_t(_mm512_reduce_or_epi32(_mm512_or_si512(_mm512_or_si512(v0,v1),_mm512_or_si512(v2,v3))));if(stop&&__builtin_popcount(seen)>26)return 27;}
#else
  for(size_t i=0;i<n;++i){seen|=1u<<(l[i]|h[i]);if(stop&&(i%32==31)&&__builtin_popcount(seen)>26)return 27;}
#endif
  return __builtin_popcount(seen);
 }
};
// Broad native-letter envelope over every sliding window of three repository controls.
struct Gate{int minDistinct,maxCount,minPairs,maxPairs;};
constexpr Gate TRAIN{20,104,19828,28912},TEST{17,45,2038,3684};
bool histGate(const Stats&s,const Gate&g){return s.distinct>=g.minDistinct&&s.distinct<=26&&s.maximum<=g.maxCount;}
bool pairGate(const Stats&s,const Gate&g){return s.pairs>=g.minPairs&&s.pairs<=g.maxPairs;}
int main(int argc,char**argv){
 assert(argc==3);const auto train=readGroups(argv[1]),test=readGroups(argv[2]);assert(train.size()==600&&test.size()==201);Table t(train),u(test);
 for(uint32_t k=0;k<10000;++k){uint32_t key=((k*2654435761u)&FULL)&~1u;uint32_t a=(key>>1)&(HALF-1),b=(key>>15)&(HALF-1);assert(t.distinct(a,b,false)==stats(train,key).distinct);assert(u.distinct(a,b,false)==stats(test,key).distinct);assert(stats(train,key).pairs==stats(train,key^FULL).pairs);}
 uint64_t cap=0,minD=0,hist=0,pairs=0,jointCap=0,jointHist=0,jointPairs=0;
 int bestMax=601,bestMinDistinct=-1;uint32_t bestMask=0;vector<uint32_t>candidates,trainCandidates;
 #pragma omp parallel for schedule(dynamic,8) reduction(+:cap,minD,hist,pairs,jointCap,jointHist,jointPairs)
 for(int a=0;a<int(HALF);++a){int localMin=601,localDistinct=-1;uint32_t localMask=0;vector<uint32_t>localCandidates,localTrain;
  for(uint32_t b=0;b<HALF;++b){int d=t.distinct(a,b);if(d>26)continue;++cap;if(d<TRAIN.minDistinct)continue;++minD;uint32_t key=(uint32_t(a)<<1)|(b<<15);auto s=stats(train,key);
   if(s.maximum<localMin||(s.maximum==localMin&&d>localDistinct)){localMin=s.maximum;localDistinct=d;localMask=key;}
   if(!histGate(s,TRAIN))continue;++hist;if(!pairGate(s,TRAIN))continue;++pairs;localTrain.push_back(key);
   if(u.distinct(a,b)>26)continue;uint32_t seen=0;for(const auto&g:train)seen|=1u<<code(g,key);for(const auto&g:test)seen|=1u<<code(g,key);if(__builtin_popcount(seen)>26)continue;++jointCap;
   auto z=stats(test,key);if(!histGate(z,TEST))continue;++jointHist;if(!pairGate(z,TEST))continue;++jointPairs;localCandidates.push_back(key);
  }
  #pragma omp critical
  {if(localMin<bestMax||(localMin==bestMax&&localDistinct>bestMinDistinct)){bestMax=localMin;bestMinDistinct=localDistinct;bestMask=localMask;}candidates.insert(candidates.end(),localCandidates.begin(),localCandidates.end());trainCandidates.insert(trainCandidates.end(),localTrain.begin(),localTrain.end());}
 }
 sort(candidates.begin(),candidates.end());cout<<"canonical_masks "<<uint64_t(HALF)*HALF<<"\ntrain_code_cap "<<cap<<"\ntrain_min_distinct "<<minD<<"\ntrain_hist "<<hist<<"\ntrain_ioc "<<pairs<<"\njoint_cap "<<jointCap<<"\njoint_hist "<<jointHist<<"\njoint_ioc "<<jointPairs<<"\nmin_max_count "<<bestMax<<" distinct "<<bestMinDistinct<<" mask "<<bestMask<<"\n";
 sort(trainCandidates.begin(),trainCandidates.end());
 for(auto k:trainCandidates){uint32_t seen=0;for(const auto&g:train)seen|=1u<<code(g,k);for(const auto&g:test)seen|=1u<<code(g,k);auto s=stats(train,k),z=stats(test,k);cout<<"train_candidate "<<k<<" "<<s.distinct<<" "<<s.maximum<<" "<<s.pairs<<" "<<z.distinct<<" "<<z.maximum<<" "<<z.pairs<<" union "<<__builtin_popcount(seen)<<"\n";}
 for(auto k:candidates){auto s=stats(train,k),z=stats(test,k);cout<<"candidate "<<k<<" "<<s.distinct<<" "<<s.maximum<<" "<<s.pairs<<" "<<z.distinct<<" "<<z.maximum<<" "<<z.pairs<<"\n";}
}
