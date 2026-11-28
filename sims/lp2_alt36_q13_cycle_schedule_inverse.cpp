// Exact q13 crib inverse with bounded rejected draws. First accepted phase gauge.
#include <algorithm>
#include <array>
#include <cstdint>
#include <iostream>
#include <set>
#include <string>
#include <tuple>
#include <vector>
#include <omp.h>
using namespace std;
#ifndef LP_PERIOD
#define LP_PERIOD 13
#endif
constexpr int Q=LP_PERIOD, B=6;
constexpr uint64_t ALL=(1ULL<<36)-1;
constexpr char A[]="0123456789abcdefghijklmnopqrstuvwxyz";
int ix(char c){return c<='9'?c-'0':c-'a'+10;}
vector<int> decode(string s){vector<int> v;for(char c:s)v.push_back(ix(c));return v;}
int mod(int x){x%=36;return x<0?x+36:x;}
struct Hit{int start,visible,retries;string key;bool operator<(const Hit&x)const{return tie(start,visible,retries,key)<tie(x.start,x.visible,x.retries,x.key);}};
struct Edge{int earlier,delta;bool equal;};
struct Schedule{
 int nblock=0, nr=0;
 int p[B][Q],remain[B][Q+1];
 uint64_t hidden[B][Q];
 vector<Edge>edges[Q]; bool feasible=true;
 Schedule(const vector<int>&P,const vector<int>&retries){
  for(int b=0;b<B;b++)for(int j=0;j<Q;j++)p[b][j]=-1;
  int d=0,last=-1,lastp=0;nr=retries.size();
  auto edge=[&](int d0,int p0,int d1,int p1,bool equal){
   int j=d0%Q,k=d1%Q;int delta=mod(p0-p1);
   if(j==k){if((delta==0)!=equal)feasible=false;return;}
   if(j>k){swap(j,k);delta=mod(-delta);}edges[k].push_back({j,delta,equal});
  };
  for(int i=0;i<(int)P.size();i++){
   for(int r:retries)if(r==i){if(last<0)feasible=false;else edge(last,lastp,d,P[i],true);d++;}
   if(last>=0)edge(last,lastp,d,P[i],false);
   p[d/Q][d%Q]=P[i];last=d;lastp=P[i];d++;
  }
  nblock=(d+Q-1)/Q;
  for(int b=0;b<nblock;b++){
   remain[b][Q]=0;
   for(int j=Q-1;j>=0;j--){int x=p[b][j];remain[b][j]=remain[b][j+1]+(x>=0);hidden[b][j]=0;if(x>=0)for(int c=29;c<36;c++)hidden[b][j]|=1ULL<<mod(c-x);}
  }
 }
};
struct Search{
 const vector<int>&C;const Schedule&S;int minv,start=0;int pos[B]{},end[B]{},K[Q]{};
 uint64_t partitions=0,nodes=0;set<Hit>hits;
 Search(const vector<int>&c,const Schedule&s,int m):C(c),S(s),minv(m){}
 void dfs(int j){
  ++nodes;
  if(j==Q){int vis=pos[S.nblock-1]-start;if(vis<minv)return;string key;for(int x:K)key+=A[x];hits.insert({start,vis,S.nr,key});return;}
  uint64_t mask=ALL;
  for(const auto&e:S.edges[j]){uint64_t v=1ULL<<mod(K[e.earlier]+e.delta);mask&=e.equal?v:~v;}
  for(int b=0;b<S.nblock&&mask;b++){
   int p=S.p[b][j];if(p<0)continue;
   int r=(b+1==S.nblock?0:end[b]-pos[b]);
   uint64_t m=(b+1==S.nblock||r<=S.remain[b][j+1])?S.hidden[b][j]:0;
   if(pos[b]<(b+1==S.nblock?(int)C.size():end[b]))m|=1ULL<<mod(C[pos[b]]-p);
   mask&=m;
  }
  while(mask){int k=__builtin_ctzll(mask);mask&=mask-1;K[j]=k;int touched=0;
   for(int b=0;b<S.nblock;b++){int p=S.p[b][j];if(p>=0&&mod(p+k)<29){pos[b]++;touched|=1<<b;}}
   int last=S.nblock-1;
   if(pos[last]-start+S.remain[last][j+1]>=minv)dfs(j+1);
   for(int b=0;b<S.nblock;b++)if(touched&(1<<b))pos[b]--;
  }
 }
 void split(int b,int p){
  pos[b]=p;
  if(b+1==S.nblock){if(p-start+S.remain[b][0]>=minv){partitions++;dfs(0);}return;}
  int left=0;for(int k=b+1;k<S.nblock;k++)left+=S.remain[k][0];
  int lo=max(0,minv-(p-start)-left),hi=min(S.remain[b][0],(int)C.size()-p);
  for(int n=lo;n<=hi;n++){end[b]=p+n;split(b+1,p+n);}
 }
 void run(int s){start=s;split(0,s);}
};
int main(int argc,char**argv){
 if(argc!=7){cerr<<"usage: plain compact-tape min-visible retry-budget start end\n";return 1;}
 auto P=decode(argv[1]),C=decode(argv[2]);int minv=stoi(argv[3]),budget=stoi(argv[4]),a=stoi(argv[5]),b=min(stoi(argv[6]),(int)C.size()-minv+1);
 if(b<a||budget<0||budget>2||P.size()+budget>Q*B||minv<0)return 2;
 vector<Schedule>S;S.emplace_back(P,vector<int>{});
 if(budget>=1)for(int i=1;i<(int)P.size();i++)S.emplace_back(P,vector<int>{i});
 if(budget>=2)for(int i=1;i<(int)P.size();i++)for(int j=i;j<(int)P.size();j++)S.emplace_back(P,vector<int>{i,j});
 uint64_t nodes=0,parts=0,schedules=0;set<Hit>hits;double t=omp_get_wtime();
 #pragma omp parallel for schedule(dynamic,1)
 for(int k=0;k<(int)S.size();k++){
  if(!S[k].feasible)continue;
  Search s(C,S[k],minv);for(int i=a;i<b;i++)s.run(i);
  #pragma omp critical
  {nodes+=s.nodes;parts+=s.partitions;schedules++;hits.insert(s.hits.begin(),s.hits.end());}
 }
 cout<<"starts "<<a<<" "<<b<<" schedules "<<schedules<<" partitions "<<parts<<" nodes "<<nodes<<" hits "<<hits.size()<<" seconds "<<omp_get_wtime()-t<<"\n";
 for(auto&h:hits)cout<<h.start<<" "<<h.visible<<" "<<h.retries<<" "<<h.key<<"\n";
}
