---
title: "LeetCode 146. LRU Cacheの解説"
date: 2024-03-22
slug: leetcode-146-lru-cache
legacyId: 65fd3bceed9e2fb247d2e84e
---
こんにちは。
本記事ではLeetCode 146のLRU Cacheの解説を行います。
問題には[こちら](https://leetcode.com/problems/lru-cache/description/)から飛べます。
※以下C++の使用を想定して解説を進めます。


この問題はLRU(Least Recently Used)キャッシュを使用した問題で、LRUキャッシュは、データを一定量までしか保持できないメモリ領域であり、最も最近に使用されたデータを優先して保持することで、容量を超えた場合に最も古くに使用されたデータを削除します。この問題の解決策では、双方向連結リスト(Doubly Linked List)とハッシュマップ(unordered_map)を組み合わせることで、要素の追加、削除、検索をO(1)の平均時間計算量で実行することを目指します。

## コード
```
class LRUCache {
  public:
    class Node {
      public:
        int key;
        int val;
        Node* prev;
        Node* next;

        Node(int key, int val) {
            this->key = key;
            this->val = val;
        }
    };

    Node* head = new Node(-1, -1);
    Node* tail = new Node(-1, -1);

    int cap;
    unordered_map<int, Node* > m;

    LRUCache(int capacity) {
        cap = capacity;
        head->next = tail;
        tail->prev = head;
    }

    void addNode(Node* newnode) {
        Node* temp = head->next;

        newnode->next = temp;
        newnode->prev = head;

        head->next = newnode;
        temp->prev = newnode;
    }

    void deleteNode(Node* delnode) {
        Node* prevv = delnode->prev;
        Node* nextt = delnode->next;

        prevv->next = nextt;
        nextt->prev = prevv;
    }

    int get(int key) {
        if (m.find(key) != m.end()) {
            Node* resNode = m[key];
            int ans = resNode->val;

            m.erase(key);
            deleteNode(resNode);
            addNode(resNode);

            m[key] = head->next;
            return ans;
        } else {
            return -1;
        }
    }

    void put(int key, int value) {
        if (m.find(key) != m.end()) {
            Node* curr = m[key];
            m.erase(key);
            deleteNode(curr);
            delete curr;
        }

        if (m.size() == cap) {
            Node* toDelete = tail->prev;
            m.erase(toDelete->key);
            deleteNode(toDelete);
            delete toDelete;
        }

        addNode(new Node(key, value));
        m[key] = head->next;
    }
};
```


### クラスの説明

- Node
→連結リストのノードを表すクラスです。各ノードは、キー('key')、値('val')、前のノードへのポインタ('prev')、次のノードへのポインタ('next')を持ちます。

- LRUCache
→LRUキャッシュの主要な機能を提供するクラスです。内部には双方向連結リストのヘッド('head')とテール('tail')、キャッシュの容量('cap')、そしてキャッシュされたキーと対応するノードへの参照を保持するハッシュマップ('m')が含まれます。


### 主要なメソッドの説明

- LRUCache(int capacity)
→コンストラクタです。キャッシュの容量を設定し、ヘッドとテールをダミーノードで初期化して、双方向連結リストを作成します。

- void addNode(Node* newNode)
→新しいノードを連結リストの先頭に追加します。この操作は新しい要素がキャッシュに追加されるたび、または既存の要素がgetまたはput操作によって最近使用された場合に行われます。

- void deleteNode(Node* delNode)
→指定されたノードを連結リストから削除します。これはキャッシュから要素が削除される際に使用されます。

- int get(int key)
→指定されたキーの値を返します。キーが存在する場合、対応するノードを連結リストの先頭に移動させて、値を返します。キーが存在しない場合は-1を返します。

- void put(int key, int value)
→指定されたキーと値のペアをキャッシュに追加または更新します。キーが既に存在する場合はその値を更新し、存在しない場合は新たに追加します。もしキャッシュが既に最大容量に達している場合、最も古く使用された要素を削除してから新しい要素を追加します。



ちなみにこの問題を解くうえで双方向連結リストとハッシュマップではなく、配列にキーと値のペアを順番に格納する方法を思いつくかもしれませんが、これは下記の理由からバッドプラクティスです。

- 先頭への要素追加
→配列の先頭に新しい要素を追加するためには、既存の全ての要素を一つずつ後ろに移動させる必要があり、O(n)の時間がかかります。
- 要素の削除
→特定の要素を削除した後、削除したインデックスを埋めるために後ろの要素全てを1つ前に移動させる必要があり、O(n)の時間がかかります。
- サイズが固定(arr型の場合)
→配列は固定サイズのため、初期に確保するサイズが実際の使用量と一致しない場合はメモリが無駄になるか、または途中でサイズが不足する可能性があります。サイズ不足の場合、新しい配列を確保してデータをコピーする必要があり、これにはO(n)の時間がかかります。
※std::vector型の場合は動的配列ですのでこの問題はクリアされます。




これに対して、双方向連結リストとハッシュマップを使用する方法は下記の理由からベストプラクティスです。

- 先頭への要素追加
→双方向連結リストでは、新しい要素をリストの先頭に追加するのも、新しいノードを作成して既存の先頭ノードの前に挿入し、ポインタを適切に更新するだけなので、O(1)の時間計算量で済みます。

- 要素の削除
→リストの任意の位置にある要素を削除する際、双方向連結リストではその要素の前後のノードを直接つなぎ替えるだけで済むため、これも操作の時間計算量はO(1)です。

- 各ノードへ高速にアクセス可能
→双方向連結リストでは、任意の位置における要素の追加や削除が容易で、特にリストの先頭や末尾での操作はO(1)で実行できる一方で、特定の要素にアクセスするには、リストを頭からまたは末尾から順にたどる必要があるため最悪O(n)の時間がかかります。ただ、ハッシュマップを使用してキーと双方向連結リストのノードを関連付けることで、双方向連結リストのノードに対しても配列と同様にO(1)の時間計算量でアクセスすることが可能になります。

- サイズが動的
双方向連結リストとハッシュマップは動的にサイズを変更できるため、必要に応じて要素を追加または削除することができます。これにより、メモリの使用をより効率的に管理でき、使用されていないメモリを最小限に抑えることができます。ハッシュマップにおいては、要素の追加に伴い内部のハッシュテーブルがリサイズされることがありますが、この操作も平均して効率的に行われます。



## コードの解説

それでは、コードの説明に入ります。
下記はLRUCache(x);が実行されたときに影響する箇所のコードです。

```
    class Node{
        public: 
            int key;
            int val;
            Node* prev;
            Node* next;

            Node(int key, int val){
                this->key = key;
                this->val = val;
            }
    };

    Node* head = new Node(-1, -1);
    Node* tail = new Node(-1, -1);

    int cap;
    unordered_map<int, Node*> m;

    LRUCache(int capacity) {
        cap = capacity;
        head -> next = tail;
        tail -> prev = head;
    }
```

まず、インスタンスが生成されたタイミングでメンバ変数のメモリが確保されます。Nodeクラスはint型のキー('key')と値('val')、Node型のポインタとしてprevとnextを持ち、コンストラクタで引数に受け取ったkeyとvalueをメンバ変数のkeyとvalに更新します。
Node型のポインタとしてheadとtailという変数名で引数に(-1, -1)を与えて定義します。これはそれぞれが双方向連結リストの始端と終端を表すノードで実際のキャッシュデータを持たない、単なるマーカーとして機能するためです。キーと値に-1を使用することで、これらが無効な値であることを示します。
int型の変数capはLRUキャッシュの容量を保持する変数、unordered_map<int, Node*>型の変数mはint型のキーとノードのポインタを値とする要素を格納できるハッシュマップの形式のコンテナを表します。
LRUCache(x);が実行されるとコンストラクタによって引数で与えたxがキャッシュの容量を表すcapに代入され、双方向連結リストの始端を表すheadの次のノードを示すnextポインタがtailに更新され、終端を表すtailの前のノードを示すprevポインタがheadに代入されます。


次に指定されたキーと値のペアをキャッシュに追加または更新するためのputメソッドを説明します。

```
    void put(int key, int value) {
        if (m.find(key) != m.end()) {
            Node* curr = m[key];
            m.erase(key);
            deleteNode(curr);
            delete curr;
        }

        if (m.size() == cap) {
            Node* toDelete = tail->prev;
            m.erase(toDelete->key);
            deleteNode(toDelete);
            delete toDelete;
        }

        addNode(new Node(key, value));
        m[key] = head->next;
    }
```
putメソッドは引数で受け取ったint型のキーと値を追加/更新するだけですので返り値はなく、voidです。m.find(key)でハッシュマップmから引数のkeyで検索をかけます。もしハッシュマップmに引数keyをキーに持つ要素がない場合はm.end()を返します。m.end()はハッシュマップの終端を指すイテレータであり、実際の要素を指しているわけではありません。これはイテレータがハッシュマップの末尾の次を指しており、ハッシュマップ内のどの要素も指していないことを示しています。そのため、m.find(key) != m.end()の比較は、指定されたkeyがハッシュマップ内に存在するかどうかをチェックするために使用されます。この比較がtrueを返す場合、keyがハッシュマップ内に存在し、その値にアクセスすることができますが逆にfalseを返す場合、keyはハッシュマップ内に存在しないことを意味します。初回のputメソッドではこのif文ではfalseを返すためスキップされます(1≤capacity≤3000のため、容量は最小でも1になり初回スキップは起こらない)。
次にm.size()がcapと等しいかどうかで現在のキャッシュのサイズが容量MAXかどうかを確認しています。容量MAXの場合はこれ以上要素を追加できませんので、古い要素を削除する必要があるのですが、これも初回のputメソッドではスキップされます。
次にputメソッドで引数に受けたキーと値で生成した新しいNodeのインスタンスを引数にaddNodeメソッドを実行します。

```
    void addNode(Node* newnode){
        Node* temp = head -> next;

        newnode -> next = temp;
        newnode -> prev = head;

        head -> next = newnode;
        temp -> prev = newnode;
    }
```

addNodeメソッドは双方向連結リストへの追加を行うためのメソッドです。putメソッド内でaddNodeメソッドを実行する際に引数で与えたNodeインスタンスのアドレスをNode型のポインタ、newnodeとして受け取っています。双方向連結リストの始端であるheadの次のノード(next)をtemp変数でNode型のポインタとして定義します。新しく追加する要素であるnewnodeの次の要素(next)をtempに更新し、前の要素(prev)を始端であるheadに更新します。これでnewnode目線の前後関係が正されました。次はheadとtempの前後関係をnewnodeの追加にあわせて更新します。headの次の要素(next)をnewnodeに更新し、tempの前の要素(prev)をnewnodeに更新します。これによってheadの次のポインタは新しく追加した要素であるnewnodeを指し、newnodeの前の要素は始端であるheadを、次の要素はtempを指し、tempの前の要素はnewnodeを指すようになりました。これで双方向連結リストの位置関係の調整が完了です。呼び出し元のputメソッドに戻ります。addNodeメソッドの処理によってheadの次の要素にnewnode、つまりputメソッドで引数に受けたキーと値を持つ要素を指すことになりましたので、m[key] = head -> next; でheadの次の要素をm[key]に代入することができました。

2回目以降のputメソッドでは引数のキーをすでにハッシュマップmが保持している可能性があります。また、すでにハッシュマップmのサイズが容量MAXになっている可能性もあります。

```
    void put(int key, int value) {
        if (m.find(key) != m.end()) {
            Node* curr = m[key];
            m.erase(key);
            deleteNode(curr);
            delete curr;
        }

        if (m.size() == cap) {
            Node* toDelete = tail->prev;
            m.erase(toDelete->key);
            deleteNode(toDelete);
            delete toDelete;
        }

        addNode(new Node(key, value));
        m[key] = head->next;
    }
```

まずは引数のキーをすでにハッシュマップmが保持している場合の処理を考えます。ハッシュマップmが引数のキーをすでに保持している場合にm.find(key)は要素のイテレータを返し、保持していない場合にm.find(key)はm.end()を返します。引数のキーをすでにハッシュマップmが保持している場合はputメソッド内の1つ目のif文の分岐に入ります。ハッシュマップmが保持するキーに対応する値(ノード)をNode型のポインタの変数currで定義します。m.erase(key);でハッシュマップ内にすでに存在するキーと値のペアを削除してから、currを使用してdeleteNodeメソッドを呼び出してノードの削除を行った後にdelete curr;で不要になったノードのメモリを確実に開放します。delete curr;で不要なノードのメモリ開放を行うことにより、メモリ効率が向上し、長時間の実行や大量のデータを扱うアプリケーションにおいてもシステムリソースを有効に利用できるようになります。  
次にすでにハッシュマップmのサイズが容量MAXになっている場合の処理を考えます。ハッシュマップmの型であるunordered_mapコンテナのsize()メンバ関数はハッシュマップ内の要素数を符号なし整数型であるsize_t型で返します。size_t型は、32ビットシステムでは[0 から 4294967295]の範囲の整数を、64ビットシステムではさらに広い範囲を扱うことができます。一方、int型は[-2147483648 から 2147483647]までの範囲の整数を扱います。size_t型とint型との比較や型キャストでは主に扱う範囲の違いからオーバーフローによるデータの損失が発生する場合がありますが、本問題では制約として(1 ≤ capacity ≤ 3000)を保証していますので、size_t型とint型の比較でオーバーフローによるデータの損失が問題になることはありません。ハッシュマップmの要素数を表すm.size()とLRUキャッシュの最大容量を表すcapの値が同一かどうかの判定を行い、同一であった場合はputメソッドの2つ目のif文の分岐に入ります。双方向連結リストの終端を表すtailの前のノードをNode型のポインタとして変数toDeleteで定義します。m.erase(toDelete->key);でハッシュマップmから削除したいノードのキーを持つ要素を削除します。deleteNode(toDelete);で双方向連結リストから削除したいノードの前後のノードをつないでから、delete toDelete;で不要になったノードのメモリ開放を行えばこの分岐内での処理は完了です。

次に指定されたキーを持つ要素の値を返すgetメソッドを説明します。

```
    int get(int key) {
        if (m.find(key) != m.end()) {
            Node* resNode = m[key];
            int ans = resNode->val;

            m.erase(key);
            deleteNode(resNode);
            addNode(resNode);

            m[key] = head->next;
            return ans;
        } else {
            return -1;
        }
    }
```

まずif文でハッシュマップmに引数で与えられたキーを持つ要素が存在するかの確認を行います。存在しない場合は-1を返します。存在する場合はその要素の値(ノード)をNode型のポインタの変数resNodeで定義します。resNodeの値をint型の変数ansで定義します。getで取得する要素は双方向連結リストの先頭に持ってくる必要があるので、まず現在の位置関係を保持するノードをハッシュマップmからm.erase(key);で削除した後に、deleteNode(resNode);で双方向連結リストの前後のノードをつなぎ合わせます。その後addNode(resNode);で取得するノードを双方向連結リストの先頭に配置して、その位置関係をもったノードをm[key]に定義することでハッシュマップmに最新の位置関係を持ったノードを更新することができました。その後return ans;でノードの値を返せばgetメソッドは完了です。

これで期待される動作をするputメソッドとgetメソッドを備えたLRUCacheクラスの実装が完了しました。
