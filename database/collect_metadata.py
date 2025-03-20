import datetime
from pathlib import Path
import json
import shutil


def list_all_files_in_directory(directory_path: Path) -> list[Path]:
    """
    指定されたディレクトリとそのサブディレクトリ内のファイルを全て列挙する。

    Args:
        directory_path (Path): ファイルを列挙するディレクトリのパス。

    Returns:
        list: ディレクトリとそのサブディレクトリ内のファイルパスのリスト。
    """

    if not directory_path.is_dir():
        raise ValueError(f"指定されたパス'{directory_path}'はディレクトリではありません。")

    files = [p for p in directory_path.rglob("*") if p.is_file()]
    return files



def extract_string_between_words(text, word1, word2):
  """
  テキストの中から2つの単語の間の文字列を抽出する。

  Args:
    text: 文字列。
    word1: 最初の単語。
    word2: 2番目の単語。

  Returns:
    word1とword2の間の文字列。
    word1またはword2が見つからない場合はNone。
  """

  index1 = text.find(word1)
  index2 = text.find(word2)

  if index1 == -1 or index2 == -1:
    return None

  start_index = index1 + len(word1)
  end_index = index2

  return text[start_index:end_index].strip()



def json_to_dict(json_path: Path) -> list[dict]:
    with json_path.open('r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def find_unregistered_files(file_paths:list[Path], json_data:list[dict]) -> list[Path]:
    filename_list = []

    for json in json_data:
        filename_list.append(json["filename"])

    # Locate files that are not included in the list
    unregistered_files = []
    for file in file_paths:
        if not (file.name in filename_list):
            unregistered_files.append(file)

    return unregistered_files


def insert_files(unregistered_files: list[Path], json_data:list[dict]) -> list[dict]:

    # Set the initial value of the id
    max_id = 0
    for d in json_data:
        if d["id"] > max_id:
            max_id = d["id"]

    n = 0
    for file in unregistered_files:
        n = n + 1
        
        # Get the current time
        now = datetime.datetime.now()
        # Convert to an ISO 8601 string
        iso_format = now.isoformat(timespec="seconds")
        d = {
            "id": max_id + n,
            "filename": file.name,
            "filetype": file.suffix,
            "title": None,
            "thumbnail": None,
            "created": iso_format,
            "updated": None,
            "tags": []
            }
        json_data.append(d)

    return json_data


def save_json(json_data:list[dict], json_file_path:Path) -> None:
    """
    JSON データをファイルに保存する。

    Args:
        data (dict): 保存する JSON データ。
        file_path (pathlib.Path): 保存先のファイルパス。
    """

    # 既存のdocuments.jsonを別名で保存
    if json_path.exists():
        old_json_file_path = json_file_path.with_name("document_old.json")
        shutil.copy2(json_file_path, old_json_file_path)
        

    # JSON データをファイルに書き込む
    with json_file_path.open('w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=4, ensure_ascii=False)




if __name__ == '__main__':
    directory_path = Path(__file__).parent.joinpath("documents")
    try:
        file_paths = list_all_files_in_directory(directory_path)
        for file in file_paths:
            print(file)
    except ValueError as e:
        print(e)


    json_path = Path(__file__).parent.joinpath("documents.json")

    if json_path.exists():
        json_data = json_to_dict(json_path)
    else:
        json_data = []


    unregistered_files = find_unregistered_files(file_paths, json_data)
    print(unregistered_files)

    if len(unregistered_files) > 0:
        json_data = insert_files(unregistered_files, json_data)
        save_json(json_data, json_path)
