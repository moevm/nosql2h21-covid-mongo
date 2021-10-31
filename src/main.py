from flask import Flask
from database import DataBase
from datetime import datetime
app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    #app.run(debug=True)
    db = DataBase()
    print(db.get_number_of_new_cases(countries=['RU'], left_bound=datetime(2021, 10, 8), right_bound=datetime(2021, 10, 9)))
    print(db.get_graph_of_dependence_of_cases(left_bound=datetime(2021, 10, 8), right_bound=datetime(2021, 10, 9)))
    print(db.get_max_number_of_new_vaccinated(countries=['RU'], left_bound=datetime(2021, 10, 8), right_bound=datetime(2021, 10, 9)))
    print(db.get_diagrams_of_total_number_of_new_cases(countries=['RU'], left_bound=datetime(2021, 10, 8), right_bound=datetime(2021, 10, 9)))
    print(db.get_total_number_of_cases(countries=['RU'], left_bound=datetime(2021, 10, 8), right_bound=datetime(2021, 10, 9)))
