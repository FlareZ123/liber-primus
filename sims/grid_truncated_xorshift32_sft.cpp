// LP2 original 256-byte table as consecutive truncated 32-bit generator output.
// Exhausts 31^3 shift triples, two xorshift forms, four byte lanes,
// and twelve source-fixed original table traversals. C++17, no dependencies.
#include <array>
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>
using Bytes=std::array<uint8_t,256>;
using Masks=std::array<std::array<uint32_t,48>,4>;

// Row-major source is resources/liber-primus/base60-grid.json; all 256 bytes.
// SHA256: 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290
constexpr const char *GRID_HEX="cbe7a7ba61ed7eb75cf99cdef704b7d479ca0f2166893b576dc6ad1996428d857372c5273650850550541c49e66bc74cfd102f3b56ab9c50fe7692456ac47c337aff19c0c749a96ca44fcdb172902e528e3ac9c1ad1c6f41d3dcc631ec543823de96482253e520ce7a3f1fda0eb82073498fc5f736ab23b82aed56360d14a3c1c9b35678a98d48ab0a81e90df52ea0987dd25cadf6ae99bde7210e7034fbf9f8e9d9c0526912faf8f0e4fe369475d112eb83a6af9028a751809c135126c0aa21009b9f59b073692f6e4ad144c24c7f1539af063d4696fb548edb943b3a343397443449f9900075af6aeac479ee2081ad908d2ad61638c6c0719eace6b424bd50";

uint32_t step(uint32_t s,int a,int b,int c,int form){
 if(form==0){s^=s<<a;s^=s>>b;s^=s<<c;}
 else {s^=s>>a;s^=s<<b;s^=s>>c;}
 return s;
}
int hexvalue(char c){return c>='a' ? c-'a'+10:c-'0';}
Bytes from_hex(const char *s){Bytes b{};for(int i=0;i<256;i++)b[i]=(hexvalue(s[2*i])<<4)|hexvalue(s[2*i+1]);assert(s[512]=='\0');return b;}
std::array<Bytes,12> make_views(const Bytes&b){
 std::array<Bytes,12> v{};
 for(int i=0;i<256;i++){
    v[0][i]=b[i];
    const int r=i/8,c=i%8;
    v[1][i]=b[r*8+(r%2?7-c:c)];
    v[2][i]=b[(i%32)*8+i/32];
    v[3][i]=b[((i/32)%2 ? 31-i%32:i%32)*8+i/32];
 }
 int at=0;
 // Printed original grid occupies p49 ten rows, p50 thirteen, p51 nine.
 for(const auto& [start,height]: std::array<std::pair<int,int>,3>{{{0,10},{10,13},{23,9}}}){
   for(int c=0;c<8;c++)for(int r=0;r<height;r++){
      v[4][at]=b[(start+r)*8+c];
      v[5][at]=b[(start+(c%2?height-1-r:r))*8+c];
      at++;
   }
 }
 assert(at==256);
 for(int m=0;m<6;m++)for(int i=0;i<256;i++)v[m+6][i]=v[m][255-i];
 return v;
}
Masks make_masks(int a,int b,int c,int form){
 Masks mask{};
 std::array<uint32_t,32> basis{};
 for(int j=0;j<32;j++)basis[j]=1u<<j;
 for(int t=0;t<6;t++){
   for(int k=0;k<32;k++){
      uint32_t row=0;
      for(int j=0;j<32;j++)if((basis[j]>>k)&1u)row|=1u<<j;
      mask[k/8][t*8+(k%8)]=row;
   }
   for(uint32_t& s:basis)s=step(s,a,b,c,form);
 }
 return mask;
}
bool validate(uint32_t seed,const Bytes&data,int a,int b,int c,int form,int lane){
 uint32_t s=seed;
 for(int t=0;t<256;t++){
    if(((s>>(8*lane))&255u)!=data[t])return false;
    s=step(s,a,b,c,form);
 }
 return true;
}
// Solve the 32 hidden state bits over GF(2), using exact source bytes.
// For low-rank six-byte observations, extend the system to all 256 bytes.
bool recover(const Bytes&data,const Masks& masks,int lane,int a,int b,int c,int form,uint32_t &seed,int &rank){
 uint32_t rows[32]{};
 uint8_t rhs[32]{};
 rank=0;
 const auto&mask=masks[lane];
 for(int t=0;t<6;t++)for(int k=0;k<8;k++){
    uint32_t m=mask[8*t+k];
    int bit=(data[t]>>k)&1;
    for(;;){
      if(m==0){if(bit)return false;break;}
      int p=31-__builtin_clz(m);
      if(rows[p]){m^=rows[p];bit^=rhs[p];}
      else {rows[p]=m;rhs[p]=bit;rank++;break;}
    }
 }
 if(rank<32){
    std::array<uint32_t,32> basis{};
    for(int j=0;j<32;j++)basis[j]=1u<<j;
    for(int t=0;t<256;t++){
      if(t>=6){
        for(int k=0;k<8;k++){
          uint32_t m=0;
          for(int j=0;j<32;j++)if((basis[j]>>(8*lane+k))&1u)m|=1u<<j;
          int bit=(data[t]>>k)&1;
          for(;;){
            if(m==0){if(bit)return false;break;}
            int p=31-__builtin_clz(m);
            if(rows[p]){m^=rows[p];bit^=rhs[p];}
            else {rows[p]=m;rhs[p]=bit;rank++;break;}
          }
        }
      }
      for(uint32_t&s:basis)s=step(s,a,b,c,form);
    }
 }
 seed=0;
 for(int p=0;p<32;p++){
   if(rows[p]&&(rhs[p]^__builtin_parity(rows[p]&seed)))seed|=1u<<p;
 }
 return validate(seed,data,a,b,c,form,lane);
}
int main(){
 const Bytes source=from_hex(GRID_HEX);
 assert(source[0]==203 && source[255]==80);
 auto views=make_views(source);
 const uint32_t plantedSeed=0x3301u;
 Bytes plant{};uint32_t s=plantedSeed;
 for(auto &b:plant){b=(s>>16)&255;s=step(s,13,17,5,0);}
 auto pm=make_masks(13,17,5,0);
 uint32_t found=0;int rank=0;
 assert(recover(plant,pm,2,13,17,5,0,found,rank));
 assert(found==plantedSeed && rank==32);
 assert(!recover(source,pm,2,13,17,5,0,found,rank));
 printf("CONTROL pass: planted xorshift32(13,17,5), lane2, seed 0x3301, 256/256 recovered.\n");
 uint64_t tests=0, entireMatches=0;
 for(int form=0;form<2;form++)for(int a=1;a<32;a++)for(int b=1;b<32;b++)for(int c=1;c<32;c++){
   const auto masks=make_masks(a,b,c,form);
   for(int view=0;view<12;view++)for(int lane=0;lane<4;lane++){
     ++tests;
     uint32_t seed=0;int rank=0;
     if(recover(views[view],masks,lane,a,b,c,form,seed,rank)){
       ++entireMatches;
       printf("HIT: form=%d shifts=%d,%d,%d view=%d lane=%d seed=%08x rank=%d\n",form,a,b,c,view,lane,seed,rank);
     }
   }
 }
 assert(tests==2ull*31*31*31*12*4);
 printf("source triple tests=%llu, complete 256-byte matches=%llu\n",(unsigned long long)tests,(unsigned long long)entireMatches);
 // Positive for an arbitrary affine LCG's low byte.
 Bytes lcgPlant{};uint32_t lcgState=17u;
 for(auto& v:lcgPlant){v=lcgState&255u;lcgState=(73u*lcgState+41u)&255u;}
 int lcgPlantMatches=0;
 for(int aa=0;aa<256;aa++){
   int bb=(lcgPlant[1]-aa*lcgPlant[0])&255;
   bool match=true;
   for(int t=1;t<255;t++)if(((aa*lcgPlant[t]+bb)&255)!=lcgPlant[t+1]){match=false;break;}
   if(match && aa==73 && bb==41)lcgPlantMatches++;
 }
 assert(lcgPlantMatches==1);
 printf("CONTROL pass: planted affine low8 LCG a=73 b=41, 256/256 recovered.\n");
 uint64_t lcgMatches=0,lcgTests=0;
 for(int view=0;view<12;view++){
   const auto& a=views[view];
   for(int mult=0;mult<256;mult++){
     const int add=(a[1]-mult*a[0])&255;
     lcgTests++;
     bool okay=true;
     for(int i=1;i<255;i++)if(((mult*a[i]+add)&255)!=a[i+1]){okay=false;break;}
     if(okay){lcgMatches++;printf("LCG LOW8 HIT view=%d a=%d b=%d\n",view,mult,add);}
   }
 }
 assert(lcgTests==12ull*256);
 printf("source LCG-low8 tests=%llu, exact matches=%llu\n",(unsigned long long)lcgTests,(unsigned long long)lcgMatches);
 if(entireMatches==0 && lcgMatches==0)printf("SOURCE NEGATIVE in exact declared family; no original plaintext or key.\n");
 return (entireMatches||lcgMatches)?1:0;
}
