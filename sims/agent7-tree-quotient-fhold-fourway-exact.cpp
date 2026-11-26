#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
constexpr int R=29, START=29, K=30;
using Vec=array<double,K>;
using Pos=array<int,4>;
using Tape=array<vector<int>,4>;
struct Option { int dest; bool consumes; array<Vec,K> w; };
struct Group { Pos pos{}; Vec f{}; };
int mod(int z){return (z+R)%R;}
int main(){
  Tape c; Pos n{}; string s;
  for(int j=0;j<4;++j){cin>>s;for(char ch:s){int z=ch<='9'?ch-'0':ch-'a'+10;assert(z>=0&&z<R);c[j].push_back(z);}n[j]=int(c[j].size());}
  array<int,R> counts{}; array<array<int,R>,R> counts2{};
  for(int &z:counts) cin>>z;
  for(auto &row:counts2)for(int &z:row)cin>>z;
  assert(cin); const int length=accumulate(counts.begin(),counts.end(),0);
  int total2=0;for(auto &row:counts2)total2+=accumulate(row.begin(),row.end(),0);assert(total2==length-1);
  array<Vec,K> p{};for(int z=0;z<R;++z)p[START][z]=(counts[z]+.5)/(length+R*.5);
  for(int a=0;a<R;++a){int den=accumulate(counts2[a].begin(),counts2[a].end(),0);for(int z=0;z<R;++z)p[a][z]=(counts2[a][z]+16*p[START][z])/(den+16);}
  double base=1; array<vector<vector<Option>>,4> opts;
  for(int j=0;j<4;++j){
    vector<Vec> suffix(n[j]+1);suffix[n[j]].fill(1);
    for(int i=n[j]-1;i>=0;--i)for(int a=0;a<K;++a){double w=0;for(int z=0;z<R;++z)if(z||c[j][i]==0)w+=p[a][z]*(z?1:R)*suffix[i+1][z];suffix[i][a]=w;}
    base*=suffix[0][START];opts[j].resize(n[j]+1);
    for(int i=0;i<=n[j];++i){
      if(i==n[j]){Option o{};o.dest=i;o.consumes=false;for(auto &row:o.w)row.fill(1);opts[j][i].push_back(o);continue;}
      for(int h=0;;++h){
        int q=i+h;Option o{};o.dest=min(q+1,n[j]);o.consumes=q<n[j];
        for(int k=0;k<K;++k){int a=i==0||k==START?START:mod(c[j][i-1]-k);double w=1;if(h){w=R*p[a][0]*pow(R*p[0][0],h-1);a=0;}
          if(o.consumes){for(int l=0;l<R;++l){int z=mod(c[j][q]-l);o.w[k][l]=z?w*p[a][z]:0;}}
          else o.w[k].fill(w);
        }
        opts[j][i].push_back(o);if(q==n[j]||c[j][q]!=0)break;
      }
    }
  }
  auto id=[&](const Pos &pos){return (((uint64_t(pos[0])*(n[1]+1)+pos[1])*(n[2]+1)+pos[2])*(n[3]+1)+pos[3]);};
  vector<Group> current(1);current[0].f[START]=1;double terminal=0;uint64_t groups=0,combos=0,nonzero=0;size_t peak=0;int rounds=0;
  for(int t=0;!current.empty()&&t<=*max_element(n.begin(),n.end());++t){
    rounds=t+1;groups+=current.size();peak=max(peak,current.size());vector<Group> next;unordered_map<uint64_t,size_t> index;index.reserve(current.size()*2+32);next.reserve(current.size()*2+32);
    for(const Group &g:current){
      for(const Option &o0:opts[0][g.pos[0]])for(const Option &o1:opts[1][g.pos[1]])for(const Option &o2:opts[2][g.pos[2]])for(const Option &o3:opts[3][g.pos[3]]){
        ++combos;int consume=int(o0.consumes)+int(o1.consumes)+int(o2.consumes)+int(o3.consumes);
        if(!consume){for(int k=0;k<K;++k)if(g.f[k])terminal+=g.f[k]*o0.w[k][0]*o1.w[k][0]*o2.w[k][0]*o3.w[k][0];continue;}
        Pos dest{o0.dest,o1.dest,o2.dest,o3.dest};uint64_t key=id(dest);auto [it,inserted]=index.emplace(key,next.size());if(inserted){next.emplace_back();next.back().pos=dest;}
        auto &f=next[it->second].f;const double mult=pow(double(R),consume-1);
        for(int k=0;k<K;++k){double w=g.f[k]*mult;if(!w)continue;
          const auto &a=o0.w[k],&b=o1.w[k],&d=o2.w[k],&e=o3.w[k];
          for(int l=0;l<R;++l)f[l]+=w*a[l]*b[l]*d[l]*e[l];
          nonzero+=R;
        }
      }
    }
    current=move(next);
    if(t%50==0)cerr<<"round "<<t<<", groups "<<current.size()<<'\n';
  }
  assert(current.empty()&&terminal>0&&base>0);cout<<setprecision(17)<<"logBF "<<log(terminal/base)<<"\nlogIndependentRatio "<<log(base)<<"\nrounds "<<rounds<<"\ngroups "<<groups<<"\npeak "<<peak<<"\npositionCombos "<<combos<<"\nkeyTransitionVisits "<<nonzero<<'\n';
}
