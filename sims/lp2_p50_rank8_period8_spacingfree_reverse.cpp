#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <limits>
#include <memory>
#include <stdexcept>
#include <set>
#include <vector>
using namespace std;
using Bits=uint32_t;
using Dom=array<Bits,8>;
using Key=array<int,8>;
constexpr Bits ALL=(1u<<29)-1;
constexpr double NEG=-numeric_limits<double>::infinity();
struct Mask {Dom d; int q; int mask; array<int,256> ph;};
int pop(Bits x){return __builtin_popcount(x);} // GCC/Clang C++17
int dec(int c,int k){return (c-k+29)%29;}
vector<Mask> enumerate(const vector<int>& c){
 array<int,256> z;z.fill(-1);int nz=0;
 for(int i=0;i<256;i++)if(!c[i])z[i]=nz++;
 if(nz>20)throw runtime_error("zero mask limit");
 vector<Mask> out;out.reserve(1u<<nz);
 for(int mask=0;mask<(1<<nz);mask++){
  Mask a;a.d.fill(ALL);a.q=0;a.mask=mask;
  for(int i=0;i<256;i++){
   if(z[i]>=0&&(mask&(1<<z[i]))){a.ph[i]=-1;continue;}
   const int q=a.q++&7;a.ph[i]=q;a.d[q]&=~(1u<<c[i]);
  }
  a.q&=7;
  if(all_of(a.d.begin(),a.d.end(),[](Bits b){return b!=0;}))out.push_back(a);
 }
 return out;
}
struct Solver {
 double u[8][29],e[8][8][29][29],bg[29][29],uni[29];
 double cur[9][8][29],rem[9],edgeMax[8][8];
 int vals[8][29],len[8],order[8];
 Key key{},bestKey{};double constant,best=NEG;
 int bestMask=-1,bestPhase=-1,mask,phase;
 uint64_t nodes=0,leaves=0,intersections=0,nonempty=0,optimized=0,pruned=0,prefix=0;
 void factors(const vector<int>& c,const vector<int>& m,const Mask& a){
  for(int x=0;x<8;x++){fill(u[x],u[x]+29,0);for(int y=0;y<8;y++)for(int k=0;k<29;k++)fill(e[x][y][k],e[x][y][k]+29,0);}
  constant=0;mask=a.mask;phase=a.q;
  const int p=m[0],q=a.ph[p];
  if(q<0)constant+=uni[0];else for(int k=0;k<29;k++)if(a.d[q]&(1u<<k))u[q][k]+=uni[dec(c[p],k)];
  for(int i=1;i<256;i++){
   const int x=m[i-1],y=m[i],s=a.ph[x],t=a.ph[y];
   if(s<0&&t<0){constant+=bg[0][0];continue;}
   if(s<0){for(int k=0;k<29;k++)if(a.d[t]&(1u<<k))u[t][k]+=bg[0][dec(c[y],k)];continue;}
   if(t<0){for(int k=0;k<29;k++)if(a.d[s]&(1u<<k))u[s][k]+=bg[dec(c[x],k)][0];continue;}
   if(s==t){for(int k=0;k<29;k++)if(a.d[s]&(1u<<k))u[s][k]+=bg[dec(c[x],k)][dec(c[y],k)];continue;}
   for(int k=0;k<29;k++)if(a.d[s]&(1u<<k))for(int l=0;l<29;l++)if(a.d[t]&(1u<<l)){
    const double v=bg[dec(c[x],k)][dec(c[y],l)];e[s][t][k][l]+=v;e[t][s][l][k]+=v;
   }
  }
 }
 void dfs(int d,double score,double unaryBound){
  nodes++;
  if(score+unaryBound+rem[d]+1e-8<best)return;
  if(d==8){leaves++;if(score>best){best=score;bestKey=key;bestMask=mask;bestPhase=phase;}return;}
  const int a=order[d];
  // Rank immediate choices by their fully assigned contribution; all choices remain searched.
  array<int,29> choices;for(int i=0;i<len[a];i++)choices[i]=vals[a][i];
  sort(choices.begin(),choices.begin()+len[a],[&](int k,int l){return cur[d][a][k]>cur[d][a][l];});
  for(int ii=0;ii<len[a];ii++){
   const int k=choices[ii];key[a]=k;const double s=score+cur[d][a][k];
   if(d==7){dfs(8,s,0);continue;}
   double ub=0;
   for(int t=d+1;t<8;t++){
    const int b=order[t];double mx=NEG;
    for(int j=0;j<len[b];j++){const int l=vals[b][j];const double v=cur[d][b][l]+e[a][b][k][l];cur[d+1][b][l]=v;mx=max(mx,v);}
    ub+=mx;
   }
   if(s+ub+rem[d+1]+1e-8>=best)dfs(d+1,s,ub);
  }
 }
 void optimize(const Dom& d){
  double ub=0;
  for(int a=0;a<8;a++){
   len[a]=0;double mx=NEG;
   for(int k=0;k<29;k++)if(d[a]&(1u<<k)){vals[a][len[a]++]=k;cur[0][a][k]=u[a][k];mx=max(mx,u[a][k]);}
   ub+=mx;order[a]=a;
  }
  sort(order,order+8,[&](int a,int b){return len[a]<len[b];});
  for(int a=0;a<8;a++)for(int b=a+1;b<8;b++){
   double mx=NEG;for(int i=0;i<len[a];i++)for(int j=0;j<len[b];j++)mx=max(mx,e[a][b][vals[a][i]][vals[b][j]]);edgeMax[a][b]=edgeMax[b][a]=mx;
  }
  rem[8]=0;for(int j=7;j>=0;j--){rem[j]=rem[j+1];for(int t=j+1;t<8;t++)rem[j]+=edgeMax[order[j]][order[t]];}
  if(constant+ub+rem[0]+1e-8<best){pruned++;return;}
  optimized++;dfs(0,constant,ub);
 }
};
int main(int argc,char** argv){
 ios::sync_with_stdio(false);cin.tie(nullptr);
 vector<int> c(512),m(512);for(int& x:c)cin>>x;for(int& x:m)cin>>x;
 auto solver=make_unique<Solver>();for(double& x:solver->uni)cin>>x;for(auto& row:solver->bg)for(double& x:row)cin>>x;
 vector<int> p(c.begin(),c.begin()+256),h(c.begin()+256,c.end());
 const auto fits=enumerate(p),holds=enumerate(h);set<Dom> suffix;for(const auto& a:holds)suffix.insert(a.d);
 cerr<<"fit masks "<<fits.size()<<" suffix domain products "<<suffix.size()<<"\n";
 auto t=chrono::steady_clock::now();
 for(const auto& a:fits){
  solver->prefix++;solver->factors(p,m,a);set<Dom> unique;
  for(const auto& b:suffix){
   solver->intersections++;Dom d;bool ok=true;
   for(int q=0;q<8;q++){d[q]=a.d[q]&b[(q-a.q+8)&7];if(!d[q]){ok=false;break;}}
   if(ok){solver->nonempty++;unique.insert(d);}
  }
  for(const auto& d:unique)solver->optimize(d);
  if(solver->prefix%128==0)cerr<<solver->prefix<<"/"<<fits.size()<<" nodes="<<solver->nodes<<" best="<<solver->best/256<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<"\n";
 }
 cout.precision(17);cout<<"{\"score\":"<<solver->best/256<<",\"mask\":"<<solver->bestMask<<",\"phase\":"<<solver->bestPhase<<",\"key\":[";
 for(int j=0;j<8;j++){if(j)cout<<',';cout<<solver->bestKey[j];}
 cout<<"],\"fitMasks\":"<<fits.size()<<",\"suffixMasks\":"<<holds.size()<<",\"suffixUnique\":"<<suffix.size()<<",\"intersections\":"<<solver->intersections<<",\"nonempty\":"<<solver->nonempty<<",\"optimized\":"<<solver->optimized<<",\"pruned\":"<<solver->pruned<<",\"nodes\":"<<solver->nodes<<",\"leaves\":"<<solver->leaves<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<"}\n";
}
