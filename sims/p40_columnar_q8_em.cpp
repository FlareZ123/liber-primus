// Exact Viterbi for a fixed key and exact cycle MAP for a fixed hold mask.
// Alternating optimization, not a global key-space proof.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <limits>
#include <random>
#include <stdexcept>
#include <vector>
using namespace std;
constexpr int Q=8,R=29;constexpr double INF=-1e100;
using Key=array<int,Q>;using Row=array<double,R>;using Mat=array<Row,R>;
struct Model{Row u;Mat b;};
struct Path{double score=INF;vector<int> p,hold;int phase=0,last=0,violations=0;};
int mod(int x){return (x+R)%R;}
Path viterbi(const vector<int>& c,const Key& k,const Model& m,double penalty,int start=0,int previous=-1){
 const int n=c.size();array<double,2*Q> dp{},ndp{};dp.fill(INF);
 vector<array<int,2*Q>> back(n); // A=2*q, H=2*q+1
 auto edge=[&](int prev,int p){return prev<0?m.u[p]:m.b[prev][p];};
 for(int i=0;i<n;i++){
  ndp.fill(INF);back[i].fill(-1);const int x=c[i];
  auto add=[&](int s,double score,int q,int prev){
   const int p=mod(x-k[q]);
   if(p||penalty>=0){const int t=2*((q+1)%Q);const double v=score+edge(prev,p)-(p==0?penalty:0);if(v>ndp[t])ndp[t]=v,back[i][t]=s;}
   if(x==0){const int t=2*q+1;const double v=score+edge(prev,0);if(v>ndp[t])ndp[t]=v,back[i][t]=s;}
  };
  if(i==0)add(-1,0,start,previous);
  else for(int s=0;s<2*Q;s++)if(dp[s]>INF/2){const int q=s/2;const int prev=(s%2)?0:mod(c[i-1]-k[(q+Q-1)%Q]);add(s,dp[s],q,prev);}
  dp=ndp;
 }
 Path out;int s=max_element(dp.begin(),dp.end())-dp.begin();out.score=dp[s];if(out.score<INF/2)return out;
 out.phase=s/2;out.p.resize(n);out.hold.resize(n);
 for(int i=n-1;i>=0;i--){out.hold[i]=s%2;out.p[i]=(s%2)?0:mod(c[i]-k[(s/2+Q-1)%Q]);if(out.p[i]==0&&!out.hold[i])out.violations++;s=back[i][s];}
 out.last=out.p.back();return out;
}
struct Fit{Key key;double score;};
Fit fixedMask(const vector<int>& c,const vector<int>& h,const Model& m,double penalty){
 array<Row,Q> u{};array<Mat,Q> e{};vector<int> phase(c.size(),-1);int q=0;
 for(size_t i=0;i<c.size();i++)if(!h[i]){phase[i]=q;q=(q+1)%Q;for(int k=0;k<R;k++)if(c[i]==k)u[phase[i]][k]-=penalty;}
 double constant=0;
 for(size_t i=0;i<c.size();i++){
  const int a=phase[i],b=i?phase[i-1]:-1;
  if(i==0){if(a<0)constant+=m.u[0];else for(int k=0;k<R;k++)u[a][k]+=m.u[mod(c[i]-k)];continue;}
  if(a<0&&b<0){constant+=m.b[0][0];continue;}
  if(a<0){for(int k=0;k<R;k++)u[b][k]+=m.b[mod(c[i-1]-k)][0];continue;}
  if(b<0){for(int k=0;k<R;k++)u[a][k]+=m.b[0][mod(c[i]-k)];continue;}
  if(a!=(b+1)%Q)throw runtime_error("clock");
  for(int x=0;x<R;x++)for(int y=0;y<R;y++)e[b][x][y]+=m.b[mod(c[i-1]-x)][mod(c[i]-y)];
 }
 Fit best{{},INF};
 for(int k0=0;k0<R;k0++){
  Row d;d.fill(INF);d[k0]=u[0][k0];array<array<int,R>,Q> back{};
  for(int p=1;p<Q;p++){
   Row nd;nd.fill(INF);
   for(int x=0;x<R;x++)for(int y=0;y<R;y++){const double s=d[x]+e[p-1][x][y]+u[p][y];if(s>nd[y])nd[y]=s,back[p][y]=x;}
   d=nd;
  }
  for(int k=0;k<R;k++){const double s=d[k]+e[Q-1][k][k0]+constant;if(s>best.score){best.score=s;best.key[Q-1]=k;for(int p=Q-1;p>0;p--)best.key[p-1]=back[p][best.key[p]];}}
 }
 return best;
}
int main(int argc,char** argv){
 ios::sync_with_stdio(false);cin.tie(nullptr);int n,fitN,starts,iters;uint64_t seed;cin>>n>>fitN>>starts>>iters>>seed;
 vector<int> c(n);for(int&x:c)cin>>x;Model m;for(double&x:m.u)cin>>x;for(auto&row:m.b)for(double&x:row)cin>>x;
 vector<int> train(c.begin(),c.begin()+fitN),test(c.begin()+fitN,c.end());
 mt19937_64 rng(seed);uniform_int_distribution<int> U(0,R-1);uniform_real_distribution<double> B(0,1);
 Key bestKey{};Path best;double bestSoft=INF;Key softKey{};Path soft;
 int legalStarts=0,cycles=0;const vector<double> penalties={2,7,25,120};
 for(int r=0;r<starts;r++){
  Key k;for(int&x:k)x=U(rng); // Seed with randomized hold pattern, exact key MAP.
  vector<int> h(fitN);for(int i=0;i<fitN;i++)h[i]=train[i]==0&&B(rng)<0.5;
  k=fixedMask(train,h,m,penalties[0]).key;
  for(double penalty:penalties){
   Path p=viterbi(train,k,m,penalty);
   for(int t=0;t<iters;t++){
    const Fit f=fixedMask(train,p.hold,m,penalty);if(f.score+1e-6<p.score)throw runtime_error("mask step nonmonotone");
    auto np=viterbi(train,f.key,m,penalty);if(np.score+1e-6<f.score)throw runtime_error("key step nonmonotone");
    const double gain=np.score-p.score;cycles++;k=f.key;p=move(np);if(gain<1e-7)break;
   }
  }
  auto p=viterbi(train,k,m,-1);if(p.score>INF/2){legalStarts++;if(p.score>best.score)best=move(p),bestKey=k;}
  auto sp=viterbi(train,k,m,120);if(sp.score>bestSoft)bestSoft=sp.score,soft=move(sp),softKey=k;
  if((r+1)%16==0)cerr<<"starts "<<r+1<<" legal "<<legalStarts<<" best "<<best.score/fitN<<" soft "<<bestSoft/fitN<<" violations "<<soft.violations<<"\n";
 }
 bool legal=best.score>INF/2;if(!legal){best=soft;bestKey=softKey;}
 auto h=viterbi(test,bestKey,m,-1,best.phase,best.last);
 auto hs=viterbi(test,bestKey,m,120,best.phase,best.last);
 auto arrayOut=[](const auto& a){cout<<'[';bool first=true;for(int x:a){if(!first)cout<<',';first=false;cout<<x;}cout<<']';};
 cout<<setprecision(16)<<"{\"legalFit\":"<<(legal?"true":"false")<<",\"legalStarts\":"<<legalStarts<<",\"cycles\":"<<cycles<<",\"key\":";arrayOut(bestKey);
 cout<<",\"fitScore\":"<<best.score/fitN<<",\"fitPhase\":"<<best.phase<<",\"fitViolations\":"<<best.violations<<",\"fit\":";arrayOut(best.p);cout<<",\"fitHolds\":";arrayOut(best.hold);
 cout<<",\"legalHoldout\":"<<(h.score>INF/2?"true":"false")<<",\"holdoutScore\":"<<(h.score>INF/2?h.score/test.size():hs.score/test.size())<<",\"holdoutViolations\":"<<(h.score>INF/2?h.violations:hs.violations)<<",\"holdout\":";arrayOut(h.score>INF/2?h.p:hs.p);cout<<",\"holdoutHolds\":";arrayOut(h.score>INF/2?h.hold:hs.hold);cout<<"}\n";
}
