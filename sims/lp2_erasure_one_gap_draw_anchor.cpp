#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <map>
#include <string>
#include <tuple>
#include <vector>
#include <omp.h>
using namespace std;
constexpr char A[]="0123456789abcdefghijklmnopqrstuvwxyz";
int ix(char c){return c<='9'?c-'0':c-'a'+10;}
vector<int> decode(const string& s){vector<int> out;for(char c:s)out.push_back(ix(c));return out;}
string encode(const vector<int>& x){string s;for(int v:x)s+=A[v];return s;}
struct Event{int c,j,retry;};
struct Witness{string key,phaseKey,kept,phases;int a,t,g,kind,missing,left,right;};
struct Counts{uint64_t seeds=0,keys=0,passes=0,replays=0;Counts& operator+=(const Counts& o){seeds+=o.seeds;keys+=o.keys;passes+=o.passes;replays+=o.replays;return *this;}};
using HitMap=map<tuple<string,int,int>,Witness>;
template<int N,int Q> struct Search{
 const vector<int>& P;const vector<int>& T;const vector<int>& eq;
 const int L,M,m;array<int,Q>K{};vector<int> rev;Counts counts;HitMap hits;
 int a=0,t=0,g=0,kind=0,missing=0,right=0;
 Search(const vector<int>&p,const vector<int>&c,const vector<int>&e,int minVisible):P(p),T(c),eq(e),L(p.size()),M(c.size()),m(minVisible),rev(p.size()){}
 static int add(int x,int y){int z=x+y;return z>=N?z-N:z;}
 static int sub(int x,int y){int z=x-y;return z<0?z+N:z;}
 static int inc(int j){return j+1==Q?0:j+1;}
 static int dec(int j){return j?j-1:Q-1;}
 string keystr()const{string s;for(int k:K)s+=A[k];return s;}
 string canon()const{string s=keystr(),b=s;for(int j=1;j<Q;j++)b=min(b,s.substr(j)+s.substr(0,j));return b;}
 void replay(int left){
  vector<Event>E;int j=a?rev[0]:0,last=-1;
  for(int p:P){int c,retry=0;while((c=add(p,K[j]))==last){j=inc(j);if(++retry==Q)abort();}E.push_back({c,j,retry});last=c;j=inc(j);}
  if(E[a].j!=0)abort();
  const int span=Q-kind,h=Q-1,end=a+span;
  vector<int> keep(L,0);int pos=t;
  for(int k=0;k<span;k++){
   if(E[a+k].retry!=(k&&kind==1&&k==g?1:0)&&k)abort();
   if(kind==0&&k==g){if(E[a+k].c!=missing)abort();continue;}
   keep[a+k]=1;if(E[a+k].c!=T[pos++])abort();
  }
  if(pos!=t+h)abort();
  pos=t;for(int k=a-1;k>=0;k--){int c=E[k].c;bool v=N==36?c<29:pos>0&&T[pos-1]==c;if(v){if(!pos||T[--pos]!=c)abort();keep[k]=1;}}
  if(pos!=left)abort();
  pos=t+h;for(int k=end;k<L;k++){int c=E[k].c;bool v=N==36?c<29:pos<M&&T[pos]==c;if(v){if(pos>=M||T[pos++]!=c)abort();keep[k]=1;}}
  if(pos!=right)abort();
  string mask,phases;for(int i=0;i<L;i++){if(N==36&&keep[i]!=(E[i].c<29))abort();mask+=char('0'+keep[i]);phases+=A[E[i].j];}
  counts.replays++;string key=canon();hits.emplace(make_tuple(key,left,right),Witness{key,keystr(),mask,phases,a,t,g,kind,missing,left,right});
 }
 void back(int i,int nextPhase,int nextC,int left){
  if(right-left+i+1<m)return;
  if(i<0){if(right-left>=m)replay(left);return;}
  const int k1=dec(nextPhase),c1=add(P[i],K[k1]);
  // Immediate preceding draw: no retry. Longer backwards gaps require every
  // intervening key value equal, since the same next plaintext is retried.
  if(c1!=nextC)branch(i,k1,c1,left);
  const int repKey=K[k1],rep=add(P[i+1],repKey);
  if(rep==nextC)return;
  int k=k1;
  for(int d=2;d<=Q;d++){
   k=dec(k);if(add(P[i],K[k])==rep)branch(i,k,rep,left);
   if(K[k]!=repKey)break;
  }
 }
 void branch(int i,int k,int c,int left){
  bool v=N==36?c<29:left>0&&T[left-1]==c;
  if(v&&(!left||T[left-1]!=c))return;
  if(right-left+int(v)+i<m)return;
  rev[i]=k;back(i-1,k,c,left-int(v));
 }
 void check(){
  counts.keys++;const int h=Q-1,end=a+Q-kind,pre=min(a,t);int j=0,last=T[t+h-1],r=t+h;
  for(int i=end;i<L;i++){
   if(pre+r-t+L-i<m)return;
   int c,retry=0;while((c=add(P[i],K[j]))==last){j=inc(j);if(++retry==Q)return;}
   if constexpr(N==36){if(c<29){if(r>=M||T[r]!=c)return;++r;}}
   else if(r<M&&T[r]==c)++r;
   last=c;j=inc(j);
  }
  if(pre+r-t<m)return;
  counts.passes++;right=r;back(a-1,0,T[t],t);
 }
 void run(int ap,int gp,int tp,int lo,int hi){
  a=ap;g=gp;kind=tp;const int h=Q-1,span=Q-kind;
  if(a+span>L)return;
  for(t=lo;t<hi;t++){
   if(min(a,t)+h+min(L-a-span,M-t-h)<m)continue;
   if(kind==0){
    if(eq[t]!=-1&&eq[t]!=g)continue;
    counts.seeds++;
    for(int j=0;j<Q;j++)if(j!=g)K[j]=sub(T[t+j-(j>g)],P[a+j]);
    int before=T[t+g-1],after=T[t+g];
    for(missing=N==36?29:0;missing<N;missing++){if(missing==before||missing==after)continue;K[g]=sub(missing,P[a+g]);check();}
   }else{
    if(eq[t]!=-1)continue;
    counts.seeds++;missing=-1;
    for(int j=0;j<Q;j++)K[j]=sub(T[t+j-(j>=g)],P[a+j-(j>g)]);
    check();
   }
  }
 }
};
template<int N,int Q> int solve(const vector<int>&P,const vector<int>&C,int m,int lo,int hi){
 const int h=Q-1,L=P.size(),M=C.size();hi=min(hi,M-h+1);if(lo<0||hi<lo||m>int(P.size())||m<Q)return 2;
 vector<int> eq(M,-2);for(int t=lo;t<hi;t++){int e=-1;for(int j=1;j<h;j++)if(C[t+j]==C[t+j-1]){if(e!=-1){e=-2;break;}e=j;}eq[t]=e;}
 Counts counts;HitMap hits;double start=omp_get_wtime();
 #pragma omp parallel
 {
  Search<N,Q>s(P,C,eq,m);
  #pragma omp for schedule(dynamic,1)
  for(int job=0;job<2*(L-Q+2)*(Q-2);job++){
   int kind=job%2,a=job/(2*(Q-2)),g=job/2%(Q-2)+1;s.run(a,g,kind,lo,hi);
  }
  #pragma omp critical
  {counts+=s.counts;hits.insert(s.hits.begin(),s.hits.end());}
 }
 cout<<"{\"N\":"<<N<<",\"q\":"<<Q<<",\"length\":"<<L<<",\"minimum\":"<<m<<",\"start\":"<<lo<<",\"end\":"<<hi<<",\"seeds\":"<<counts.seeds<<",\"keys\":"<<counts.keys<<",\"passes\":"<<counts.passes<<",\"replays\":"<<counts.replays<<",\"seconds\":"<<omp_get_wtime()-start<<",\"hits\":[";
 bool comma=false;for(auto& [id,x]:hits){if(comma)cout<<',';comma=true;cout<<"{\"key\":\""<<x.key<<"\",\"phaseKey\":\""<<x.phaseKey<<"\",\"start\":"<<x.left<<",\"end\":"<<x.right<<",\"anchor\":["<<x.a<<','<<x.t<<','<<x.g<<"],\"kind\":"<<x.kind<<",\"missing\":"<<x.missing<<",\"phases\":\""<<x.phases<<"\",\"kept\":\""<<x.kept<<"\"}";}
 cout<<"]}\n";return 0;
}
int main(int argc,char**argv){
 if(argc!=8){cerr<<"usage: one_gap N q plaintext visible_tape minimum anchor_start anchor_end\n";return 1;}
 int n=stoi(argv[1]),q=stoi(argv[2]),m=stoi(argv[5]),a=stoi(argv[6]),b=stoi(argv[7]);auto P=decode(argv[3]),C=decode(argv[4]);
 if(n==36&&q==13)return solve<36,13>(P,C,m,a,b);if(n==29&&q==13)return solve<29,13>(P,C,m,a,b);
 if(n==36&&q==8)return solve<36,8>(P,C,m,a,b);if(n==29&&q==8)return solve<29,8>(P,C,m,a,b);return 2;
}
