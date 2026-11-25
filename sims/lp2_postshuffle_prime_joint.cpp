#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <random>
#include <sstream>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;
const string A="0123456789abcdefghijklmnopqrs";
const int MAXD=14, BITS=20, MASK=(1<<BITS)-1;
vector<int>K,D; int HI;
struct Node {vector<pair<int,int>> edges; int word=-1;};
vector<Node> tr(1); vector<string> words;
struct Target {int g;string C,P; int s=-1,t=-1;};
struct Hit {int g,s,t,w;};
vector<Target> original;
vector<vector<string>> control;
vector<string> split(const string& s){istringstream in(s);vector<string> v;string w;while(in>>w)v.push_back(w);return v;}
int val(char c){return int(A.find(c));}
void insert(const string& w){int node=0; for(char c:w){int p=val(c), next=-1;for(auto e:tr[node].edges)if(e.first==p){next=e.second;break;}if(next<0){next=tr.size();tr[node].edges.emplace_back(p,next);tr.emplace_back();}node=next;}tr[node].word=words.size();words.push_back(w);}
int bound(int n,int start=3301){while(n--)start=D.at(start)+1;return start;}
void init(){vector<bool> sieve(500000,true);sieve[0]=sieve[1]=false;for(int p=2;p*p<int(sieve.size());p++)if(sieve[p])for(int x=p*p;x<int(sieve.size());x+=p)sieve[x]=false;for(int p=2;p<int(sieve.size());p++)if(sieve[p])K.push_back((p-1)%29);D.resize(K.size(),K.size());for(int j=int(K.size())-2;j>=0;j--)D[j]=K[j]==K[j+1]?D[j+1]:j+1;HI=bound(12956);assert(HI==29220);}
int emit(int p,int sign,int j){return (p+29+sign*K[j])%29;}
string encode(const string& P,int sign,int &j,int &prev,bool redraw,int &rejects){string C;for(char a:P){int p=val(a),c=0;if(p){c=emit(p,sign,j);if(redraw&&c==prev){int k=D[j];rejects+=k-j;j=k;c=emit(p,sign,j);}j++;}C+=A[c];prev=c;}return C;}
uint32_t fnv(const string& s){uint32_t h=2166136261u;for(unsigned char c:s)h=(h^c)*16777619u;return h;}
struct Search {
 int sign;vector<Target> targets;array<uint32_t,29> weights{};array<vector<uint8_t>,MAXD+1> possible,full;unordered_map<string,vector<int>> lookup;vector<vector<Hit>> hits;array<vector<uint8_t>,29> E;char path[MAXD];long long nodes=0;int start=0;
 Search(int s):sign(s),targets(original){mt19937 rng(4401);for(auto&x:weights)x=rng();for(int d=0;d<=MAXD;d++){possible[d].resize(1<<BITS);full[d].resize(1<<BITS);}int gid=3000;int ci=0;int origins[]={0,1033,3301};for(auto &doc:control){int j=origins[ci++],prev=-1,rej=0;for(auto &w:doc){int a=j;string C=encode(w,sign,j,prev,true,rej);if(w.size()>=8&&w.size()<=14){shuffle(C.begin(),C.end(),rng);targets.push_back({gid++,C,w,a,j});}}cerr<<"plant sign="<<sign<<" donor="<<ci<<" rejects="<<rej<<"\n";}
 auto pword=*find_if(words.begin(),words.end(),[](const string&w){return w[0]!='0';});int j=120,prev=emit(val(pword[0]),sign,j),rej=0,a=j;string C=encode(pword,sign,j,prev,true,rej);assert(rej>0);shuffle(C.begin(),C.end(),rng);targets.push_back({gid++,C,pword,a,j});
 hits.resize(targets.size());for(int i=0;i<int(targets.size());i++){string w=targets[i].C;sort(w.begin(),w.end());lookup[w].push_back(i);int n=w.size();uint32_t h=0;for(char c:w)h+=weights[val(c)];full[n][h&MASK]=1;for(int m=1;m<(1<<n);m++){uint32_t sum=0;int count=0;for(int k=0;k<n;k++)if(m&(1<<k)){sum+=weights[val(w[k])];count++;}possible[count][sum&MASK]=1;}}
 for(int p=1;p<29;p++){E[p].resize(HI);for(int j=0;j<HI;j++)E[p][j]=emit(p,sign,j);}
 }
 void step(int node,int j,int prev,int depth,uint32_t h){nodes++;auto &n=tr[node];if(n.word>=0&&full[depth][h&MASK]){string key(path,path+depth);sort(key.begin(),key.end());auto it=lookup.find(key);if(it!=lookup.end())for(int t:it->second)hits[t].push_back({targets[t].g,start,j,n.word});}
 for(auto [p,child]:n.edges){if(!p){advance(child,j,0,depth,h);continue;}if(j>=HI)continue;int c=E[p][j];advance(child,j+1,c,depth,h);if(prev<0||c==prev){for(int k=j+1;k<=D[j]&&k<HI;k++)advance(child,k+1,E[p][k],depth,h);}}
 }
 inline void advance(int node,int j,int c,int d,uint32_t h){uint32_t x=h+weights[c];if(!possible[d+1][x&MASK])return;path[d]=A[c];step(node,j,c,d+1,x);}
 void run(int from,int to){for(start=from;start<to;start++){step(0,start,-1,0,0);if((start+1)%1000==0)cerr<<"sign="<<sign<<" cursor="<<start+1<<" nodes="<<nodes<<"\n";}}
 void report(ostream &out,int from,int to){unordered_set<string> voc(words.begin(),words.end());int expected=0,correct=0;for(int i=0;i<int(targets.size());i++){auto &v=hits[i];sort(v.begin(),v.end(),[](Hit a,Hit b){return tie(a.s,a.t,a.w)<tie(b.s,b.t,b.w);});v.erase(unique(v.begin(),v.end(),[](Hit a,Hit b){return tie(a.s,a.t,a.w)==tie(b.s,b.t,b.w);}),v.end());if(i>=int(original.size())&&voc.count(targets[i].P)&&targets[i].s>=from&&targets[i].s<to){expected++;bool ok=false;for(auto h:v)ok|=(h.s==targets[i].s&&h.t==targets[i].t&&words[h.w]==targets[i].P);correct+=ok;if(!ok)cerr<<"MISSING PLANT "<<targets[i].P<<" "<<targets[i].s<<"\n";}if(i<int(original.size()))for(auto h:v)out<<"edge "<<h.g<<" "<<h.s<<" "<<h.t<<" "<<words[h.w]<<"\n";}
 out<<"summary "<<sign<<" "<<from<<" "<<to<<" "<<nodes<<" "<<correct<<" "<<expected<<"\n";assert(correct==expected);
 }
};
int main(int argc,char** argv){assert(argc==4);int sign=stoi(argv[1]),from=stoi(argv[2]),to=stoi(argv[3]);assert(sign==1||sign==-1);init();assert(from>=0&&to<=HI&&from<to);ifstream v("vocab.txt"),o("original.txt"),c("controls.txt");assert(v&&o&&c);string w,all;while(v>>w){if(!all.empty())all+='\n';all+=w;insert(w);}assert(words.size()==16800&&fnv(all)==3808198863u);int g;all.clear();while(o>>g>>w){if(!all.empty())all+='\n';all+=to_string(g)+":"+w;original.push_back({g,w,""});}assert(original.size()==343&&fnv(all)==2698719036u);for(int i=0;i<3;i++){getline(c,w);control.push_back(split(w));assert(control.back().size()==66);}getline(c,w);int j=0,prev=-1,rej=0;string C;for(auto p:split(w))C+=encode(p,1,j,prev,false,rej);getline(c,w);assert(C==w&&j==84&&C.size()==85);cerr<<"HI="<<HI<<" trie="<<tr.size()<<" p56 OK\n";Search s(sign);s.run(from,to);s.report(cout,from,to);}
