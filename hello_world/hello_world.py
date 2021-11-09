from pymongo import MongoClient


def main():
    client = MongoClient('localhost', 27017)
    db = client.hello_world_db
    collection = db.hello_world_collection

    id_ = collection.insert_one(
        {"menu": {
          "id": "file",
          "value": "File",
          "popup": {
            "menuitem": [
              {"value": "New", "onclick": "CreateNewDoc()"},
              {"value": "Open", "onclick": "OpenDoc()"},
              {"value": "Close", "onclick": "CloseDoc()"}
            ]
          }
        }}            
    ).inserted_id
    print(id_)


if __name__ == '__main__':
    main()

