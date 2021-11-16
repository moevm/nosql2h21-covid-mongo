"""
docstring
main app
"""
import datetime

from flask import Flask, render_template, request
from flask_cors import CORS, cross_origin

import settings
from database import DataBase

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
db = DataBase(username=settings.MONGODB_USERNAME, password=settings.MONGODB_PASSWORD)


@app.route('/')
@cross_origin()
def home_page():
    """
    :return: rendered template
    """
    return render_template('home.html', **{
        'data': db.get_number_of_new_cases()
    })


# getting info from db
# need use filters like left/right bound and countries

# params : left / right bound, iso_code, offset limit
def get_query_params():
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 10))
    iso_code = request.args.get('iso_code', None)
    left_bound = request.args.get('left_bound', None)
    right_bound = request.args.get('right_bound', None)
    if left_bound:
        left_bound = datetime.datetime.strptime(left_bound, '%Y-%m-%d')
    if right_bound:
        right_bound = datetime.datetime.strptime(right_bound, '%Y-%m-%d')
    return offset, limit, iso_code, left_bound, right_bound


@app.route('/country', endpoint='country')
@cross_origin()
def get_country():
    iso_code = request.args.get('iso_code')
    if iso_code is None:
        return 'ISO code is required', 400
    country = db.get_country_info(iso_code)
    if country is None:
        return 'ISO code not found', 404
    return {'data': country}


@app.route('/country-list', endpoint='country-list')
@cross_origin()
def get_meta_countries():
    return {'data': db.get_meta_countries()}


@app.route('/cases-per-day', endpoint='cases-per-day')
@cross_origin()
def get_cases_per_day():
    return {'data': db.get_cases_per_day(*get_query_params())}


@app.route('/vax-per-day', endpoint='vax-per-day')
@cross_origin()
def get_vax_per_day():
    return {'data': db.get_vax_per_day(*get_query_params())}


@app.route('/graph-of-dependence', endpoint='graph-of-dependence')
@cross_origin()
def get_graph_of_dependence():
    """
    :return: json data
    """
    return {'data': db.get_graph_of_dependence_of_cases()}


@app.route('/number-of-new-cases', endpoint='number-of-new-cases')
@cross_origin()
def get_number_of_new_cases():
    """
    :return: json data
    """
    return {'data': db.get_number_of_new_cases()}


@app.route('/max-number-of-new-vaccinated', endpoint='max-number-of-new-vaccinated')
@cross_origin()
def get_max_number_of_new_vaccinated():
    """
    :return: json data
    """
    return {'data': db.get_max_number_of_new_vaccinated()}


@app.route('/diagrams-of-total-number-of-new-cases',
           endpoint='diagrams-of-total-number-of-new-cases')
@cross_origin()
def get_diagrams_of_total_number_of_new_cases():
    """
    :return: json data
    """
    return {'data': db.get_diagrams_of_total_number_of_new_cases()}


@app.route('/total-number-of-cases', endpoint='total-number-of-cases')
@cross_origin()
def get_total_number_of_cases():
    """
    :return: json data
    """
    return {'data': db.get_total_number_of_cases()}


@app.route("/all-links", endpoint='all-links')
@cross_origin()
def all_links():
    """
    :return: rendered template
    """
    links = []
    for rule in app.url_map.iter_rules():
        links.append((rule, rule.endpoint))
    return render_template("all_links.html", links=links)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
