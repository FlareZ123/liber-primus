// Original-source all-secret GP29 nonlinear output study for two exact
// source-constrained fourth-order state clocks. The sole dependency is the
// previously committed standalone original-source singleton SFT in sims/.
// Compile this translation unit as C++17 from the repository root.
#define main previous_original_order4_gate_main
#include "lp2_all_order4_singletons_original_sft.cpp"
#undef main
#include <cstdint>

struct Scope {const char* name;V coeff;int begin,end;int expected,expectedBijection,last;};
struct Scan {int total=0,bijective=0,lastFailure=0;};
static bool perfectMatching(const uint32_t allowed[29],const bool used[29]){
 int match[29];std::fill(match,match+29,-1);
 for(int z=0;z<29;z++)if(used[z]){
  bool visited[29]={false};
  const auto augment=[&](auto&&self,int state)->bool{
   for(int k=0;k<29;k++)if((allowed[state]&(1u<<k))&&!visited[k]){
    visited[k]=true;
    if(match[k]<0||self(self,match[k])){match[k]=state;return true;}
   }
   return false;
  };
  if(!augment(augment,z))return false;
 }
 return true;
}
static Scan measure(const Scope&scope){
 std::vector<V> rows;std::vector<int> cipher;
 Poly poly(scope.coeff);
 int first=-1;
 for(int i=0;i<N;i++){
  const int global=POSITION[i]+176;
  if(global<scope.begin||global>=scope.end)continue;
  if(first<0)first=global;
  rows.push_back(poly.row(global-first));cipher.push_back(SYMBOL[i]);
 }
 if(rows.empty())throw std::runtime_error("empty original scope");
 const uint32_t maskAll=(1u<<29)-1;
 Scan result;
 // For a fixed recurrence state, every observed z must share the same
 // unknown additive key F(z). Intersect all three allowable A/I/O keys.
 // This condition is exact even for an arbitrary *nonbijective* F.
 for(int a=0;a<29;a++)for(int b=0;b<29;b++)for(int c=0;c<29;c++)for(int d=0;d<29;d++){
  uint32_t mask[29];std::fill(mask,mask+29,maskAll);
  bool used[29]={false};bool okay=true;
  for(int i=0;i<int(rows.size());i++){
   const V&r=rows[i];const int z=fm(r[0]*a+r[1]*b+r[2]*c+r[3]*d);
   used[z]=true;
   mask[z]&=(1u<<fm(cipher[i]-24))|(1u<<fm(cipher[i]-10))|(1u<<fm(cipher[i]-3));
   if(mask[z]==0){result.lastFailure=std::max(result.lastFailure,i+1);okay=false;break;}
  }
  if(okay){result.total++;if(perfectMatching(mask,used))result.bijective++;}
 }
 // Source-shaped positive: known nonlinear lookup F(z)=z*z+7z+11,
 // exact native-GP A/I/O singleton words and free unknown recurrent state.
 const V originalSeed={7,2,11,25};
 uint32_t planted[29];std::fill(planted,planted+29,maskAll);
 for(int i=0;i<int(rows.size());i++){
  const V&r=rows[i];const int z=fm(r[0]*originalSeed[0]+r[1]*originalSeed[1]+r[2]*originalSeed[2]+r[3]*originalSeed[3]);
  const int p=i%3==0?24:(i%3==1?10:3);
  const int c=fm(p+z*z+7*z+11);
  planted[z]&=(1u<<fm(c-24))|(1u<<fm(c-10))|(1u<<fm(c-3));
  if(!planted[z])throw std::runtime_error("Nonlinear GP29 source A/I/O plant failed");
 }
 std::printf("SBOX %-22s symbols=%zu seeds=%d bijectiveSeeds=%d lastContradiction=%d (plant passed)\n",scope.name,rows.size(),result.total,result.bijective,result.lastFailure);
 if(result.total!=scope.expected||result.bijective!=scope.expectedBijection||result.lastFailure!=scope.last)
  throw std::runtime_error("Original nonlinear output cipher gate discrepancy");
 return result;
}
int main(){
 verifySource();
 // The signed p15 4x4 matrix has charpoly (x-8)(x-17)(x-24)^2.
 // The 2013 signed BASE29 / original p39 red H*G source polynomial is
 // monic x^4+28x^3+13x^2+9x+14.
 // The four initial z values are unrestricted, granting every hidden
 // state and fixed linear readout, including unrealizable sequences.
 for(const Scope&s:std::array<Scope,4>{
  Scope{"p15-global",V{19,2,15,28},0,12956,0,0,27},
  Scope{"p15-chapter",V{19,2,15,28},3603,5506,10052,9772,18},
  Scope{"HG-global",V{15,20,16,1},0,12956,0,0,35},
  Scope{"HG-chapter",V{15,20,16,1},3603,5506,10556,10248,18}
 }){measure(s);}
 return 0;
}
