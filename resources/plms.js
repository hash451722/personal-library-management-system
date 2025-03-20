// Personal library management system


// ==== jsonファイルの選択と読み取り ====
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileSelect);
function handleFileSelect(event) {
  const file = event.target.files[0]; // 選択されたファイルを取得
  if (file) {
    const reader = new FileReader(); // FileReader オブジェクトを作成
    reader.onload = function(e) {
      try {
        const jsonData = JSON.parse(e.target.result); // JSON 文字列をオブジェクトに変換
        // ====== JSONデータが正常に読み取られた場合の処理 ======
        insert_document_list(jsonData);

      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.onerror = function(error) {
      console.error('Error reading file:', error);
    };
    reader.readAsText(file); // ファイルをテキストとして読み込む
  }
}


window.addEventListener('load', function() {
  // すべてのリソースがロードされた後に実行されるコード
  loadJson();
});

function loadJson() {
  fetch('database/documents.json')
    .then(response => response.json())
    .then(jsonData => {
      console.log('JSONファイルの内容:');
      console.log(jsonData);
      insert_document_list(jsonData);
    })
    .catch(error => {
      console.error('エラー:', error);
    });
}




// [document.json]に記載の全てのdocument要素を挿入
function insert_document_list(jsonData) {
    const element_parent = document.getElementById("document-list");
    let tags = [];
    for (const d of jsonData) {
        // documentカード要素の作成
        const newHTML = `
            <article id=${d["id"]}>
              <a href="database/documents/${d["filename"]}" target="_blank">
                <div class="article-thumbnail">
                </div>
                <div class="article-text">
                </div>
                <p> ${d["title"]} </p>  
              </a>
            </article>
        `;
        // 要素内部の末尾に挿入
        element_parent.insertAdjacentHTML('beforeend', newHTML);

        // 全てのtagを取得
        tags.push(...d["tags"]);  // d["tags"]の要素をtagsに追加 (スプレッド構文「...」)
    }

    // 全てのtagボタン要素を設置（重複なし）
    insert_tags(tags);

    // tagボタンを押したときの処理の登録
    const tag_buttons = document.querySelectorAll('.tag-button');
    tag_buttons.forEach(button => {
      button.addEventListener('click', () => {
        // console.log(button.id + 'が押されました');
        toggleVisibilityDocument(jsonData, button.id);
      });
    });
}

// 全てのtagボタン要素を設置（重複なし）
function insert_tags(tags) {
  const tags_element = document.getElementById("tags-container");

  // 各tagの出現回数をカウント
  const tags_count = {}; // ここで空のオブジェクト(連想配列)を作成, ex) { a: 3, b: 2, c: 1 }
  for (const arr_element of tags) {
    tags_count[arr_element] = (tags_count[arr_element] || 0) + 1;
  }

  // tags = [...new Set(tags)];  // 重複を削除
  for (const tag of Object.keys(tags_count)) {
    const newHTML = `
      <button id="${tag}" class="tag-button" type="button"> ${tag} (${tags_count[tag]}) </button>
    `;
    tags_element.insertAdjacentHTML('beforeend', newHTML);
  }
}



// 押されたtagボタン（ボタン要素のidで判別）に応じてdocument要素の表示・非表示の切り替え
function toggleVisibilityDocument(documentJson, pushedTag) {
  // console.log(pushedTag + 'が押されました');
  let all_tags = false;
  if ("all-tags" === pushedTag) {
    all_tags = true;
  }
  for (const d of documentJson) {
    const article_element = document.getElementById(d["id"].toString());
    if (d["tags"].includes(pushedTag) || all_tags) {
      article_element.style.display = "block";
    } else {
      article_element.style.display = "none";
    }
  }
}
