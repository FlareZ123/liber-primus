#include <immintrin.h>
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <vector>
#include <omp.h>
using namespace std;
// Rows: H index, constant, coefficients for H21,H22,H23,H24,H25,H26,H27,H28.
// Regenerated from the pinned source by lp2_terminal_shed_permutation_lexical_sft.cjs.
static constexpr int raw[20][10]={
{1,23,23,0,5,25,21,2,22,7},{2,21,21,0,22,7,4,9,4,6},{3,8,5,0,7,7,21,1,26,19},{4,1,7,0,5,6,12,6,18,14},{5,8,21,0,4,23,17,10,27,26},{6,9,25,0,14,9,17,27,2,24},{7,26,9,0,22,15,28,5,23,12},{8,19,8,0,7,17,11,0,18,9},{9,23,8,0,27,8,18,3,13,25},{10,4,18,0,15,7,28,18,26,7},{11,15,18,0,5,19,28,0,18,23},{12,8,17,28,28,20,8,27,23,0},{13,10,9,0,15,24,17,18,4,26},{14,2,7,0,5,7,11,6,18,14},{15,25,4,0,28,1,13,5,25,15},{16,10,11,0,18,21,8,24,1,16},{17,7,27,0,4,6,11,7,6,7},{18,16,0,0,2,23,8,24,5,0},{19,21,7,0,23,17,1,0,9,9},{20,5,15,0,4,27,7,10,1,1}};
static constexpr int pref[5]={0,2,3,4,6}, A=7,B=5;
static constexpr uint32_t domain=0x1ffffffeU;
struct Solver {
 int eq[20][10];
 alignas(64) uint32_t tab[20][29][32];
 alignas(64) uint32_t bmask[32];
 vector<int> fixed, varying;
 vector<array<int,29>> witnesses;
 uint64_t leaves=0, aChecked=0, survivingPairs=0;
 uint32_t allowed;
 Solver(const int (&rows)[20][10],uint32_t d):allowed(d){
  memcpy(eq,rows,sizeof(eq));
  for(int i=0;i<32;i++)bmask[i]=(i<29)?1U<<i:0U;
  for(int i=0;i<20;i++)if(eq[i][0]!=12){
   assert(eq[i][3]==0);
   (eq[i][2+B]==0?fixed:varying).push_back(i);
   for(int c=0;c<29;c++)for(int b=0;b<32;b++)tab[i][c][b]=1U<<((c+eq[i][2+B]*b)%29);
  }
  assert(eq[11][0]==12&&eq[11][3]==28);
 }
 int eval(int i,const array<int,8>& x) const {int s=eq[i][1];for(int j=0;j<8;j++)s+=eq[i][2+j]*x[j];return s%29;}
 void emit(array<int,8> x,vector<array<int,29>>& found){
  array<int,29> h{};uint32_t seen=1;
  for(int j=0;j<8;j++)if(j!=1){h[21+j]=x[j];assert(!(seen&(1U<<x[j])));seen|=1U<<x[j];}
  for(int i=0;i<20;i++)if(i!=11){int z=eval(i,x);h[eq[i][0]]=z;assert(!(seen&(1U<<z)));seen|=1U<<z;}
  uint32_t missing=0x1fffffffU^seen;assert(__builtin_popcount(missing)==2);
  while(missing){int v=__builtin_ctz(missing);missing&=missing-1;x[1]=v;h[22]=v;h[12]=eval(11,x);
   uint32_t test=0;for(int z:h){assert(z>=0&&z<29);test|=1U<<z;}assert(test==0x1fffffffU);found.push_back(h);
  }
 }
 void leaf(array<int,8>& x,uint32_t used,uint64_t& nA,uint64_t& nPair,vector<array<int,29>>& found){
  int base[20];for(int i=0;i<20;i++){int s=eq[i][1];for(int j:pref)s+=eq[i][2+j]*x[j];base[i]=s%29;}
  if(base[3]==base[13]&&eq[3][2+A]==eq[13][2+A]&&eq[3][2+B]==eq[13][2+B])return;
  uint32_t av=allowed&~used;
  while(av){int a=__builtin_ctz(av);av&=av-1;nA++;x[A]=a;uint32_t u=used|(1U<<a);bool bad=false;
   for(int i:fixed){int z=(base[i]+eq[i][2+A]*a)%29;uint32_t bit=1U<<z;if(u&bit){bad=true;break;}u|=bit;}if(bad)continue;
   const uint32_t bv=allowed&~u;
   if(!bv)continue;
   __mmask16 alive0=bv&0xffffU,alive1=(bv>>16)&0xffffU;
   __m512i m0=_mm512_or_si512(_mm512_set1_epi32(u),_mm512_load_si512(bmask));
   __m512i m1=_mm512_or_si512(_mm512_set1_epi32(u),_mm512_load_si512(bmask+16));
   for(int i:varying){int c=(base[i]+eq[i][2+A]*a)%29;
    if(alive0){__m512i z=_mm512_load_si512(tab[i][c]);alive0&=~_mm512_test_epi32_mask(m0,z);m0=_mm512_or_si512(m0,z);}
    if(alive1){__m512i z=_mm512_load_si512(tab[i][c]+16);alive1&=~_mm512_test_epi32_mask(m1,z);m1=_mm512_or_si512(m1,z);}
    if(!(alive0|alive1))break;
   }
   uint32_t live=(uint32_t)alive0|((uint32_t)alive1<<16);while(live){int b=__builtin_ctz(live);live&=live-1;x[B]=b;nPair++;emit(x,found);}
  }
 }
 void dfs(int d,array<int,8>& x,uint32_t used,uint64_t& nL,uint64_t& nA,uint64_t& nPair,vector<array<int,29>>& found){
  if(d==5){nL++;leaf(x,used,nA,nPair,found);return;}
  uint32_t v=allowed&~used;while(v){int z=__builtin_ctz(v);v&=v-1;x[pref[d]]=z;dfs(d+1,x,used|(1U<<z),nL,nA,nPair,found);}
 }
 void run(){
 #pragma omp parallel for schedule(dynamic,1)
  for(int z=1;z<29;z++)if(allowed&(1U<<z)){
   array<int,8> x{};x[pref[0]]=z;uint64_t nL=0,nA=0,nP=0;vector<array<int,29>> found;
   dfs(1,x,1U|(1U<<z),nL,nA,nP,found);
 #pragma omp critical
   {leaves+=nL;aChecked+=nA;survivingPairs+=nP;witnesses.insert(witnesses.end(),found.begin(),found.end());}
  }
  sort(witnesses.begin(),witnesses.end());assert(witnesses.size()==2*survivingPairs);
 }
 void print(const char* tag){printf("%s: prefix_leaves=%llu A_checked=%llu surviving_pairs=%llu permutations=%zu\n",tag,(unsigned long long)leaves,(unsigned long long)aChecked,(unsigned long long)survivingPairs,witnesses.size());for(const auto& h:witnesses){for(int i=0;i<29;i++)printf("%s%d",i?",":"",h[i]);puts("");}fflush(stdout);}
 vector<array<int,29>> reference(){
  vector<int> pool;for(int z=1;z<29;z++)if(allowed&(1U<<z))pool.push_back(z);assert(pool.size()==7);
  vector<array<int,29>> out;
  do{array<int,8> x{};int k=0;for(int j=0;j<8;j++)if(j!=1)x[j]=pool[k++];for(int v=1;v<29;v++){
   x[1]=v;array<int,29> h{};for(int j=0;j<8;j++)h[21+j]=x[j];for(int i=0;i<20;i++)h[eq[i][0]]=eval(i,x);uint32_t mask=0;for(int z:h)mask|=1U<<z;if(mask==0x1fffffffU)out.push_back(h);
  }}while(next_permutation(pool.begin(),pool.end()));sort(out.begin(),out.end());return out;
 }
};
int main(){
 int rows[20][10];memcpy(rows,raw,sizeof(rows));array<int,29> h{};for(int i=0;i<29;i++)h[i]=(i*11)%29;
 uint32_t small=0;for(int j=0;j<8;j++)if(j!=1)small|=1U<<h[21+j];
 for(int i=0;i<20;i++){int v=h[rows[i][0]];for(int j=0;j<8;j++)v-=rows[i][2+j]*h[21+j];rows[i][1]=(v%29+29)%29;}
 Solver planted(rows,small);planted.run();assert(find(planted.witnesses.begin(),planted.witnesses.end(),h)!=planted.witnesses.end());assert(planted.reference()==planted.witnesses);planted.print("planted restricted exact");
 Solver original(raw,domain);original.run();assert(original.leaves==11793600);original.print("original complete");
}
