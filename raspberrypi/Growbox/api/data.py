from flask import Flask
import json

app = Flask(__name__)


@app.route('/')
def getData():
    with open('data.csv', 'r') as f:
        data = f.read().splitlines()

    header = data[0].split(',')
    rows = data[1::]

    items = []
    for row in rows:
        item = {}
        row = row.split(',')

        for i in range(len(header)):
            item[header[i]] = row[i]

        items.append(item)

    return json.dumps(items)

if __name__ == '__main__':
    app.run()
