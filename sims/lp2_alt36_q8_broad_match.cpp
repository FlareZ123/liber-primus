#include <array>
#include <algorithm>
#include <fstream>
#include <iostream>
#include <vector>
#include <string>
#include <cstdint>
using namespace std;
int ix(char c){return c<='9'?c-'0':c-'a'+10;}
struct Node { array<int,29> child; bool word=false; int maxDepth=0; Node(){child.fill(-1);} };
struct Trie {
 vector<Node> nodes{Node()};
 void add(const string&w){int n=0;nodes[n].maxDepth=max(nodes[n].maxDepth,(int)w.size());for(int i=0;i<(int)w.size();++i){int p=ix(w[i]),next=nodes[n].child[p];if(next<0){next=nodes.size();nodes[n].child[p]=next;nodes.emplace_back();}n=next;nodes[n].maxDepth=max(nodes[n].maxDepth,(int)w.size()-i-1);}nodes[n].word=true;}
};
struct Machine {
 static constexpr int Q=8,N=Q*37;
 struct Edge {int c,t;};
 array<array<Edge,29>,N> E{};const Trie&trie;
 Machine(string k,const Trie&t):trie(t){for(int s=0;s<N;s++)for(int p=0;p<29;p++){int j=s/37,last=s%37,c=(p+ix(k[j]))%36,retry=0;while(c==last){j=(j+1)%Q;if(++retry>=Q)break;c=(p+ix(k[j]))%36;}E[s][p]=retry>=Q?Edge{-1,-1}:Edge{c,((j+1)%Q)*37+c};}}
 bool visit(int n,int s,const string&C,int i){const auto&z=trie.nodes[n];if((int)C.size()-i>z.maxDepth)return false;if(z.word&&i==(int)C.size())return true;for(int p=0;p<29;p++){int ch=z.child[p];if(ch<0)continue;auto e=E[s][p];if(e.c<0)continue;if(e.c>=29){if(visit(ch,e.t,C,i))return true;}else if(i<(int)C.size()&&e.c==ix(C[i])&&visit(ch,e.t,C,i+1))return true;}return false;}
 bool any(const string&C){for(int j=0;j<Q;j++)if(visit(0,j*37+36,C,0))return true;return false;}
};
int main(int argc,char**argv){if(argc!=4)return 1;ifstream lex(argv[1]),gs(argv[2]),ks(argv[3]);if(!lex||!gs||!ks)return 2;Trie tr;string w;int n=0;while(lex>>w){tr.add(w);++n;}vector<string>C;int runes=0;while(gs>>w){C.push_back(w);runes+=w.size();}if(C.size()!=64||runes!=299)return 3;cerr<<"lex="<<n<<" trie="<<tr.nodes.size()<<" groups="<<C.size()<<" runes="<<runes<<"\n";int k=0,best=64;while(ks>>w){Machine M(w,tr);vector<int>miss;for(int i=0;i<(int)C.size();i++)if(!M.any(C[i]))miss.push_back(i);cout<<w<<' '<<miss.size();for(int i:miss)cout<<' '<<i;cout<<'\n';++k;best=min(best,(int)miss.size());}cerr<<"keys="<<k<<" minimum independently impossible="<<best<<"\n";}
