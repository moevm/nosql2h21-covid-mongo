from flask import Flask, render_template

from database import DataBase

app = Flask(__name__)
db = DataBase()


@app.route('/')
def home_page():
    return render_template('home.html', **{
        'data': db.get_number_of_new_cases()
    })


# getting info from db
# TODO: need use filters like left/right bound and countries
@app.route('/graph-of-dependence', endpoint='graph-of-dependence')
def get_graph_of_dependence():
    return {'data': db.get_graph_of_dependence_of_cases()}


@app.route('/number-of-new-cases', endpoint='number-of-new-cases')
def get_number_of_new_cases():
    return {'data': db.get_number_of_new_cases()}


@app.route('/max-number-of-new-vaccinated', endpoint='max-number-of-new-vaccinated')
def get_max_number_of_new_vaccinated():
    return {'data': db.get_max_number_of_new_vaccinated()}


@app.route('/diagrams-of-total-number-of-new-cases', endpoint='diagrams-of-total-number-of-new-cases')
def get_diagrams_of_total_number_of_new_cases():
    return {'data': db.get_diagrams_of_total_number_of_new_cases()}


@app.route('/total-number-of-cases', endpoint='total-number-of-cases')
def get_total_number_of_cases():
    return {'data': db.get_total_number_of_cases()}


@app.route("/all-links", endpoint='all-links')
def all_links():
    links = []
    print(app.url_map.iter_rules())
    for rule in app.url_map.iter_rules():
        links.append((rule, rule.endpoint))
    return render_template("all_links.html", links=links)


if __name__ == '__main__':
    app.run(debug=True)
