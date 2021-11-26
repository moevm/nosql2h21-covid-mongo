import json

def json_generator(data, chunk_length):
    json_string = json.dumps(data, indent=2)

    def inner():
        for i in range(0, len(json_string), chunk_length):
            yield json_string[i:i+chunk_length]

    return inner()