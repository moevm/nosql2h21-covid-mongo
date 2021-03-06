"""
docstring
main app
"""
import datetime
import json
from json import JSONDecodeError

from flask import Flask, render_template, request, Response
from flask_cors import CORS, cross_origin

import settings
from database import DataBase
from utils import json_generator

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


def get_query_params():
    iso_code = request.args.get('iso_code', None)
    date_from = request.args.get('date_from', None)
    date_to = request.args.get('date_to', None)
    if date_from:
        date_from = datetime.datetime.strptime(date_from, '%Y-%m-%d')
    if date_to:
        date_to = datetime.datetime.strptime(date_to, '%Y-%m-%d')
    return iso_code, date_from, date_to


@app.route('/reset-db', methods=['POST'], endpoint='reset-db')
@cross_origin()
def reset_db():
    try:
        with open('/app/owid-covid-data.json', encoding='utf-8') as file:
            data = json.load(file)
        db.parse_data(data)
        return {'status': 'success'}, 200
    except JSONDecodeError as err:
        return f'JSONDecodeError | {err}', 400


@app.route('/import-database', methods=['POST'], endpoint='import-database')
@cross_origin()
def import_database():
    try:
        data = json.loads(request.data.decode('utf-8'))
        db.parse_data(data)
        return {'status': 'success'}, 200
    except JSONDecodeError as err:
        return f'JSONDecodeError | {err}', 400


@app.route('/export-database', endpoint='export-database')
@cross_origin()
def export_database():
    data = db.dump_data()
    return Response(
        json_generator(data, 100),
        headers={"Content-Disposition": "attachment; filename=database.json"},
        mimetype="text/json"
    )


@app.route('/aggregate-<type_>-<agg>', endpoint='aggregate-<type_>-<agg>')
@cross_origin()
def get_aggregations(type_, agg):
    if agg not in ['total', 'min', 'max', 'avg']:
        return {'error': {
            'agg': agg,
            'message': "Only ['total', 'min', 'max', 'avg'] are available",
            'query': request.args.to_dict(),
        }}, 400
    if type_ == 'cases':
        return {'data': db.aggregate_cases(agg, request.args.to_dict())}
    if type_ == 'vaccinations':
        return {'data': db.aggregate_vax(agg, request.args.to_dict())}
    return {'error': {
        'type': type_,
        'message': "Only ['cases', 'vaccinations'] are available",
        'query': request.args.to_dict()
    }}, 400


@app.route('/cases-on-density', endpoint='cases-on-density')
@cross_origin()
def get_cases_on_density():
    return {'data': db.get_cases_on_density(request.args.to_dict())}


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


def save_getting_data_from_db(f):
    try:
        query = request.args.to_dict()
        query.setdefault('sort', 'asc')
        query.setdefault('order_by', 'iso_code')
        return {'data': f(query)}
    except ValueError as err:
        return {'error': {
            'message': str(err),
            'query': request.args.to_dict()
        }}, 400


@app.route('/data-countries', endpoint='data-countries')
@cross_origin()
def get_countries():
    return save_getting_data_from_db(db.get_countries)


@app.route('/data-cases', endpoint='data-cases')
@cross_origin()
def get_cases():
    return save_getting_data_from_db(db.get_cases)


@app.route('/data-vaccinations', endpoint='data-vaccinations')
@cross_origin()
def get_vaccinations():
    return save_getting_data_from_db(db.get_vaccinations)


@app.route('/country-list', endpoint='country-list')
@cross_origin()
def get_meta_countries():
    return {'data': db.get_meta_countries()}


@app.route('/cases-per-day', endpoint='cases-per-day')
@cross_origin()
def get_cases_per_day():
    iso_code, date_from, date_to = get_query_params()
    country = db.get_country_info(iso_code)
    if iso_code is not None and country is None:
        return 'ISO code not found', 404
    return {'data': db.get_cases_per_day(iso_code, date_from, date_to)}


@app.route('/cases-per-day-comp', endpoint='cases-per-day-comp')
@cross_origin()
def get_cases_per_day_compare():
    iso_codes, date_from, date_to = get_query_params()
    if iso_codes is not None:
        iso_codes = iso_codes.split('|')
        countries = db.get_countries_info(iso_codes)
        if countries is None:
            return 'ISO codes not found', 404
    return {'data': db.get_cases_per_day_compare(iso_codes, date_from, date_to)}


@app.route('/vax-per-day', endpoint='vax-per-day')
@cross_origin()
def get_vax_per_day():
    iso_code, date_from, date_to = get_query_params()
    country = db.get_country_info(iso_code)
    if iso_code is not None and country is None:
        return 'ISO code not found', 404
    return {'data': db.get_vax_per_day(iso_code, date_from, date_to)}


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
