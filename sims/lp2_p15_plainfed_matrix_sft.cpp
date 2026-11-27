#include <algorithm>
#include <array>
#include <cassert>
#include <climits>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29,N=Q*Q*Q*Q,W[4]={1,29,841,24389};
int M[4][4]={{10,3,20,22},{1,22,21,25},{11,17,19,7},{21,17,12,22}};
int mod(int x){return (x%Q+Q)%Q;}
array<vector<uint8_t>,4> d; vector<int> transition(N);
int pack(array<int,4> a){int v=0;for(int j=0;j<4;j++)v+=W[j]*a[j];return v;}
void init(){for(auto &a:d)a.resize(N);for(int v=0;v<N;v++){for(int j=0;j<4;j++)d[j][v]=(v/W[j])%Q;int z=0;for(int j=0;j<4;j++){int s=-d[j][v];for(int k=0;k<4;k++)s+=M[j][k]*d[k][v];z+=W[j]*mod(s);}transition[v]=z;}}
int add(int a,int b){int z=0;for(int j=0;j<4;j++){int x=d[j][a]+d[j][b];z+=W[j]*(x>=Q?x-Q:x);}return z;}
struct State{int v,h,part,prev;};
State advance(State s,int c,int p){s.part+=W[s.h]*c;if(++s.h==4){s.v=add(transition[s.v],s.part);s.h=0;s.part=0;}s.prev=p;return s;}
vector<int> enc(const vector<int>&p,int seed,bool hold){vector<int> c;array<int,4> v{},buf{};for(int j=0;j<4;j++)v[j]=d[j][seed];int h=0;for(int x:p){if(hold&&x==0){c.push_back(0);continue;}c.push_back(mod(x+v[h]));buf[h++]=x;if(h==4){array<int,4> z{};for(int j=0;j<4;j++){int y=buf[j];for(int k=0;k<4;k++)y+=M[j][k]*v[k];z[j]=mod(y);}v=z;h=0;}}return c;}
int L[30][29];
void train(const vector<vector<int>>&s){int n[30][29]={};for(int j:{0,1,2,5,6,7,8}){int prev=29;for(int x:s[j]){n[prev][x]++;prev=x;}}for(int i=0;i<30;i++){int sum=0;for(int x:n[i])sum+=x;for(int j=0;j<29;j++)L[i][j]=lround(1000*log((n[i][j]+.5)/(sum+14.5)));}}
long long score(const vector<int>&p,int prev=29){long long s=0;for(int x:p){s+=L[prev][x];prev=x;}return s;}
double ioc(const vector<int>&p){int f[29]={};for(int x:p)f[x]++;double z=0;for(int x:f)z+=x*(x-1);return z/(p.size()*(p.size()-1));}
struct Search{
 const vector<int>&c;bool hold;int end;uint64_t cap,nodes=0,paths=0,seeds=0,ties=0,better=0;int maxReached=0;bool stopped=false;long long best=LLONG_MIN,oracle=LLONG_MAX;int seed=-1;State state{};vector<int> path,winner;int start;
 Search(const vector<int>&c,bool hold,int start,int end,uint64_t cap):c(c),hold(hold),end(end),cap(cap),path(end-start),start(start){}
 void dfs(int i,State s,long long sc,int iv){if(stopped)return;if(++nodes>cap){stopped=true;return;}maxReached=max(maxReached,i);if(i==end){paths++;if(sc>oracle)better++;if(sc>best){best=sc;ties=1;seed=iv;state=s;winner=path;}else if(sc==best)ties++;return;}
 int x=c[i];if(hold&&x==0){path[i-start]=0;auto t=s;t.prev=0;dfs(i+1,t,sc+L[s.prev][0],iv);}int p=x-d[s.h][s.v];if(p<0)p+=Q;if(!hold||p){path[i-start]=p;dfs(i+1,advance(s,x,p),sc+L[s.prev][p],iv);}}
 void all(){for(int iv=0;iv<N&&!stopped;iv++){auto before=paths;dfs(start,{iv,0,0,29},0,iv);if(paths>before)seeds++;}}
};
string compact(const vector<int>&v,int lim=100){string s;for(int i=0;i<(int)v.size()&&i<lim;i++)s+="0123456789ABCDEFGHIJKLMNOPQRS"[v[i]];return s;}
void run(string name,const vector<int>&c,bool hold,const vector<int>*truth=nullptr,int key=-1){constexpr int split=267;Search t(c,hold,0,split,2500000000ULL);if(truth){vector<int> p(truth->begin(),truth->begin()+split);t.oracle=score(p);}t.all();cout<<name<<" hold="<<hold<<" prefixComplete="<<!t.stopped<<" nodes="<<t.nodes<<" legalSeeds="<<t.seeds<<" paths="<<t.paths<<" bestSeed="<<t.seed<<" ties="<<t.ties<<" trainNLL="<<-double(t.best)/1000/split<<" trainIOC="<<ioc(t.winner);if(truth)cout<<" trueSeed="<<key<<" trueRankLower="<<t.better+1<<" correctPrefix="<<equal(t.winner.begin(),t.winner.end(),truth->begin());cout<<endl;if(t.seed<0)return;
 Search h(c,hold,split,c.size(),50000000ULL);h.dfs(split,t.state,0,t.seed);cout<<"  heldComplete="<<!h.stopped<<" nodes="<<h.nodes<<" paths="<<h.paths;if(h.paths){vector<int> p=t.winner;p.insert(p.end(),h.winner.begin(),h.winner.end());assert(enc(p,t.seed,hold)==c);cout<<" heldNLL="<<-double(h.best)/1000/h.winner.size()<<" heldIOC="<<ioc(h.winner)<<" fullReencrypt=1";if(truth)cout<<" fullTruth="<<(p==*truth);cout<<" prefix="<<compact(p)<<" heldPrefix="<<compact(h.winner);}cout<<endl;
}
int main(int argc,char**argv){string z;vector<vector<int>> a;while(cin>>z){vector<int> v;for(char ch:z){int x=string("0123456789ABCDEFGHIJKLMNOPQRS").find(ch);assert(x>=0&&x<29);v.push_back(x);}a.push_back(v);}assert(a.size()==10&&a[0].size()==1744);if(argc>2&&string(argv[2])=="signed"){M[3][0]=8;M[3][1]=12;}init();vector<vector<int>> s(a.begin()+1,a.end());train(s);bool hold=argc>1&&string(argv[1])=="hold";if(argc>1&&string(argv[1])=="full"){Search f(a[0],true,0,a[0].size(),1500000000ULL);f.all();cout<<"fullF complete="<<!f.stopped<<" nodes="<<f.nodes<<" legalSeeds="<<f.seeds<<" paths="<<f.paths<<" bestSeed="<<f.seed<<" ties="<<f.ties<<" maxPrefix="<<f.maxReached<<endl;if(f.paths){assert(enc(f.winner,f.seed,true)==a[0]);cout<<" fullNLL="<<-double(f.best)/1000/f.winner.size()<<" fullIOC="<<ioc(f.winner)<<" prefix="<<compact(f.winner)<<endl;}return 0;}run("native-koan",enc(s[3],pack({3,5,7,11}),hold),hold,&s[3],pack({3,5,7,11}));run("native-divinity",enc(s[4],pack({19,2,23,14}),hold),hold,&s[4],pack({19,2,23,14}));run("original-p16-22",a[0],hold);}
