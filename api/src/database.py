"""
docstring
database helper
"""

import itertools
import json
import operator
from datetime import datetime
from typing import List

import pymongo
from pymongo import MongoClient

DATABASE_NAME = 'covid'


class DataBase:
    """
    docstring
    class database
    """

    def __init__(self, username, password):
        self.__client = MongoClient(
            f'mongodb://{username}:{password}@mongodb:27017/{DATABASE_NAME}?authSource=admin'
        )
        self.__db = self.__client.covid
        self.__cases = self.__db.cases
        self.__vaccinations = self.__db.vaccinations
        self.__countries = self.__db.countries

    @staticmethod
    def __get_first_stage_of_aggregate(
            countries: List[str] = None,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        date_bounds = {}
        if date_from:
            date_bounds['$gte'] = date_from
        if date_to:
            date_bounds['$lte'] = date_to
        dates = {}
        if date_bounds:
            dates['date'] = date_bounds

        countries_query = {}
        if countries:
            countries_query['iso_code'] = {
                '$in': countries
            }

        return {
            '$match': {
                **countries_query,
                **dates
            }
        }

    @staticmethod
    def parse_range(x: str) -> dict:
        x = x.split('|')
        if len(x) == 1:
            return {'$gte': float(x[0])}
        if len(x) == 2:
            if x[0] == '':
                return {'$lte': float(x[1])}
            if x[1] == '':
                return {'$gte': float(x[0])}
            return {'$gte': float(x[0]), '$lte': float(x[1])}
        return {}

    @staticmethod
    def parse_date(x):
        x = x.split('|')
        if len(x) == 1:
            return {'$gte': datetime.strptime(x[0], '%Y-%m-%d')}
        if len(x) == 2:
            if x[0] == '':
                return {'$lte': datetime.strptime(x[1], '%Y-%m-%d')}
            if x[1] == '':
                return {'$gte': datetime.strptime(x[0], '%Y-%m-%d')}
            return {'$gte': datetime.strptime(x[0], '%Y-%m-%d'),
                    '$lte': datetime.strptime(x[1], '%Y-%m-%d')}
        return {}

    def get_collection_by_query(self, collection, query, extra_fields=None):
        if extra_fields is None:
            extra_fields = ['iso_code', 'date']

        sort = query.pop('sort')
        order_by = query.pop('order_by')
        for key in query.keys():
            if key in extra_fields:
                if key == 'date':
                    query[key] = self.parse_date(query[key])
            elif query.get(key, None) is not None:
                query[key] = self.parse_range(query[key])
        if sort == 'asc':
            return list(collection.find(query, {'_id': 0}).sort(order_by, pymongo.ASCENDING))
        if sort == 'desc':
            return list(collection.find(query, {'_id': 0}).sort(order_by, pymongo.DESCENDING))

    def get_countries(self, query):
        return self.get_collection_by_query(self.__countries, query, ['iso_code', 'location', 'continent'])

    def get_cases(self, query):
        return self.get_collection_by_query(self.__cases, query)

    def get_vaccinations(self, query):
        return self.get_collection_by_query(self.__vaccinations, query)

    def aggregate(self, collection, field_name, agg_func, query):
        iso_code = query.get('iso_code', None)
        date_from = query.get('date_from', None)
        date_to = query.get('date_to', None)
        if agg_func is None:
            return []
        if agg_func == 'total':
            agg_func = 'sum'
        first_stage = self.__get_first_stage_of_aggregate([iso_code] if iso_code else None, date_from, date_to)
        d = list(collection.aggregate([
            first_stage, {
                '$group': {
                    '_id': '$iso_code',
                    'value': {
                        f'${agg_func}': f'${field_name}'
                    },
                }
            }, {
                '$project': {
                    '_id': 0,
                }
            }
        ]))[0]

        day = collection.find_one({field_name: d['value']})
        date = None
        if day:
            date = day.get('date', None)
        if date:
            d['date'] = date.strftime('%Y-%m-%d')
        else:
            d['date'] = None

        if iso_code is None:
            result = list(collection.aggregate([
                first_stage, {
                    '$group': {
                        '_id': '$date',
                        'value': {'$sum': f'${field_name}'},
                    }
                }
            ]))
            dates = [d['_id'] for d in result]
            print(dates, flush=True)
            result = [d['value'] for d in result]
            print(result, flush=True)

            if agg_func == 'avg':
                d = dict(value=sum(result) / len(result))
                d['date'] = None
            elif agg_func == 'sum':
                d = dict(value=sum(result))
                d['date'] = None
            elif agg_func == 'max':
                d = dict(value=max(result))
                print(result.index(d['value']), flush=True)
                d['date'] = dates[result.index(d['value'])].strftime('%Y-%m-%d')
            elif agg_func == 'min':
                d = dict(value=min(result))
                d['date'] = dates[result.index(d['value'])].strftime('%Y-%m-%d')
        return d

    def aggregate_cases(self, *args):
        return self.aggregate(self.__cases, 'new_cases', *args)

    def aggregate_vax(self, *args):
        return self.aggregate(self.__vaccinations, 'new_vaccinations', *args)

    def get_cases_on_density(self, query):
        first_stage = self.__get_first_stage_of_aggregate(
            date_from=query.get('date_from', None), date_to=query.get('date_to', None)
        )
        result = list(self.__cases.aggregate([
            first_stage, {
                '$match': {
                    'new_cases': {'$gte': 0}
                }
            }, {
                '$group': {
                    '_id': '$iso_code',
                    'total_cases': {
                        '$sum': '$new_cases'
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$_id',
                    'total_cases': '$total_cases',
                    '_id': 0
                }
            }, {
                '$lookup': {
                    'from': 'countries',
                    'localField': 'iso_code',
                    'foreignField': 'iso_code',
                    'as': 'countries'
                }
            }, {
                '$project': {
                    'iso_code': '$iso_code',
                    'total_cases': '$total_cases',
                    'country': {
                        '$arrayElemAt': [
                            '$countries', 0
                        ]
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$iso_code',
                    'cases': '$total_cases',
                    'density': '$country.population_density'
                }
            }, {
                '$match': {
                    'density': {'$ne': None}
                }
            }
        ]))
        result.sort(key=operator.itemgetter('density'))
        return result

    def get_cases_per_day(
            self,
            iso_code,
            date_from,
            date_to
    ):
        first_stage = self.__get_first_stage_of_aggregate([iso_code] if iso_code else None, date_from, date_to)
        result = list(self.__cases.aggregate([
            first_stage, {
                '$group': {
                    '_id': '$date',
                    'new_cases': {'$sum': '$new_cases'},
                    'new_cases_smoothed': {'$sum': '$new_cases_smoothed'}
                }
            }, {
                '$project': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$_id'}},
                    'new_cases': '$new_cases',
                    'new_cases_smoothed': '$new_cases_smoothed',
                    '_id': 0
                }
            }
        ]))
        result.sort(key=operator.itemgetter('date'))
        return result

    def get_cases_per_day_compare(
            self,
            iso_codes,
            date_from,
            date_to
    ):
        first_stage = self.__get_first_stage_of_aggregate(iso_codes, date_from, date_to)
        dates = list(self.__cases.aggregate([
            first_stage, {
                '$group': {
                    '_id': '$date',
                    'count': {'$sum': 1}
                }
            }, {
                '$match': {
                    'count': len(set(iso_codes))
                }
            }
        ]))
        dates = [x['_id'] for x in dates]
        result = list(self.__cases.aggregate([
            {
                '$match': {
                    'date': {'$in': dates},
                    'iso_code': {'$in': iso_codes}
                }
            },
            {
                '$group': {
                    '_id': {'date': '$date', 'iso_code': '$iso_code'},
                    'new_cases': {'$sum': '$new_cases'},
                    'new_cases_smoothed': {'$sum': '$new_cases_smoothed'}
                }
            }, {
                '$project': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$_id.date'}},
                    'iso_code': '$_id.iso_code',
                    'new_cases': '$new_cases',
                    'new_cases_smoothed': '$new_cases_smoothed',
                    '_id': 0
                }
            }
        ]))
        field = 'iso_code'
        result.sort(key=operator.itemgetter(field))
        d = {}
        for k, items in itertools.groupby(result, key=operator.itemgetter(field)):
            d[k] = list(items)
            for x in d[k]:
                x.pop(field, None)
            d[k].sort(key=operator.itemgetter('date'))
        return d

    def get_vax_per_day(
            self,
            iso_code,
            date_from,
            date_to
    ):
        first_stage = self.__get_first_stage_of_aggregate([iso_code] if iso_code else None, date_from, date_to)
        result = list(self.__vaccinations.aggregate([
            first_stage, {
                '$group': {
                    '_id': '$date',
                    'new_vaccinations': {'$sum': '$new_vaccinations'},
                    'new_vaccinations_smoothed': {'$sum': '$new_vaccinations_smoothed'},
                    'people_vaccinated': {'$sum': '$people_vaccinated'},
                    'people_fully_vaccinated': {'$sum': '$people_fully_vaccinated'},
                }
            }, {
                '$project': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$_id'}},
                    'new_vaccinations': '$new_vaccinations',
                    'new_vaccinations_smoothed': '$new_vaccinations_smoothed',
                    'people_vaccinated': '$people_vaccinated',
                    'people_fully_vaccinated': '$people_fully_vaccinated',
                    '_id': 0
                }
            }
        ]))
        result.sort(key=operator.itemgetter('date'))
        return result

    def get_meta_countries(self):
        return list(self.__countries.find({}, {
            'iso_code': 1,
            'location': 1,
            '_id': 0
        }))

    def get_country_info(self, iso_code):
        return self.__countries.find_one(
            {'iso_code': iso_code},
            {'_id': 0}
        )

    def get_countries_info(self, iso_codes):
        return self.__countries.find_one(
            {'iso_code': {'$in': iso_codes}},
            {'_id': 0}
        )

    def get_number_of_new_cases(
            self,
            countries: List[str] = None,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        """
        минимальное/среднее/максимальное количество новых заболевших
        в сутки за весь/заданный период пандемии
        :param countries:
        :param date_from:
        :param date_to:
        :return:
        """
        first_stage = self.__get_first_stage_of_aggregate(countries, date_from, date_to)
        return list(self.__cases.aggregate([
            first_stage, {
                '$match': {
                    'new_cases': {'$gte': 0}
                }
            }, {
                '$group': {
                    '_id': '$iso_code',
                    'max_disease_new_cases': {
                        '$max': '$new_cases'
                    },
                    'min_disease_new_cases': {
                        '$min': '$new_cases'
                    },
                    'avg_disease_new_cases': {
                        '$avg': '$new_cases'
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$_id',
                    'max_disease_new_cases': '$max_disease_new_cases',
                    'min_disease_new_cases': '$min_disease_new_cases',
                    'avg_disease_new_cases': '$avg_disease_new_cases',
                    '_id': 0
                }
            }
        ]))

    def get_max_number_of_new_vaccinated(
            self,
            countries: List[str] = None,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        """
        максимальное количество новых вакцинированных
        в сутки за весь/заданный период вакцинации
        :param countries:
        :param date_from:
        :param date_to:
        :return:
        """
        first_stage = self.__get_first_stage_of_aggregate(countries, date_from, date_to)
        return list(
            self.__vaccinations.aggregate([
                first_stage, {
                    '$group': {
                        '_id': '$iso_code',
                        'max_new_vaccinations': {
                            '$max': '$new_vaccinations'
                        }
                    }
                }, {
                    '$project': {
                        'iso_code': '$_id',
                        'max_new_vaccinations': '$max_new_vaccinations',
                        '_id': 0
                    }
                }
            ])
        )

    def get_total_number_of_cases(
            self,
            countries: List[str] = None,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        """
        общее количество заболевших по миру/стране
        за весь/заданный период пандемии
        :param countries:
        :param date_from:
        :param date_to:
        :return:
        """
        first_stage = self.__get_first_stage_of_aggregate(countries, date_from, date_to)
        return list(self.__cases.aggregate([
            first_stage, {
                '$match': {
                    'new_cases': {'$gte': 0}
                }
            }, {
                '$group': {
                    '_id': '$iso_code',
                    'total_cases': {
                        '$sum': '$new_cases'
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$_id',
                    'total_cases': '$total_cases',
                    '_id': 0
                }
            }
        ]))

    def get_diagrams_of_total_number_of_new_cases(
            self,
            countries: List[str] = None,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        """
        диаграммы общего количества новых заболевших
        в сутки за определённый период пандемии
        :param countries:
        :param date_from:
        :param date_to:
        :return:
        """
        first_stage = self.__get_first_stage_of_aggregate(countries, date_from, date_to)
        return list(self.__cases.aggregate([
            first_stage, {
                '$match': {
                    'new_cases': {'$gte': 0}
                }
            }, {
                '$group': {
                    '_id': '$date',
                    'sum_disease_new_cases': {
                        '$sum': '$new_cases'
                    }
                }
            }, {
                '$project': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$_id'}},
                    'sum_disease_new_cases': '$sum_disease_new_cases',
                    '_id': 0
                }
            }
        ]))

    def get_graph_of_dependence_of_cases(
            self,
            date_from: datetime = None,
            date_to: datetime = None
    ):
        """
        график зависимости заболевших в стране от плотности населения
        :param date_from:
        :param date_to:
        :return:
        """
        first_stage = self.__get_first_stage_of_aggregate(
            date_from=date_from, date_to=date_to
        )
        return list(self.__cases.aggregate([
            first_stage, {
                '$match': {
                    'new_cases': {'$gte': 0}
                }
            }, {
                '$group': {
                    '_id': '$iso_code',
                    'total_cases': {
                        '$sum': '$new_cases'
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$_id',
                    'total_cases': '$total_cases',
                    '_id': 0
                }
            }, {
                '$lookup': {
                    'from': 'countries',
                    'localField': 'iso_code',
                    'foreignField': 'iso_code',
                    'as': 'countries'
                }
            }, {
                '$project': {
                    'iso_code': '$iso_code',
                    'total_cases': '$total_cases',
                    'country': {
                        '$arrayElemAt': [
                            '$countries', 0
                        ]
                    }
                }
            }, {
                '$project': {
                    'iso_code': '$iso_code',
                    'total_cases': '$total_cases',
                    'population_density': '$country.population_density'
                }
            }
        ]))

    def __clear_db(self):
        self.__cases.drop()
        self.__countries.drop()
        self.__vaccinations.drop()

    def __add_countries(self, countries):
        return self.__countries.insert_many(countries)

    def __add_cases(self, cases):
        return self.__cases.insert_many(cases)

    def __add_vaccinations(self, vaccinations):
        return self.__vaccinations.insert_many(vaccinations)

    def parse_data(self, data):
        def is_dict_null(d):
            dict_is_null = True
            for dict_value in d.values():
                dict_is_null &= dict_value is None
            return dict_is_null

        def cast_to_int(number):
            if number:
                return int(number)
            return number

        self.__clear_db()
        countries = []
        cases = []
        vaccinations = []
        for iso_code, value in data.items():
            if iso_code.startswith('OWID'):
                continue
            country = dict(
                iso_code=iso_code,
                continent=value.get('continent', None),
                location=value.get('location', None),
                population=value.get('population', None),
                population_density=value.get('population_density', None),
                median_age=value.get('median_age', None),
                aged_65_older=value.get('aged_65_older', None),
                aged_70_older=value.get('aged_70_older', None),
            )
            if not is_dict_null(country):
                countries.append(country)
            data = value.get('data', None)
            if data:
                for row in data:
                    date = row.get('date', None)
                    if date is None:
                        continue
                    date = datetime.strptime(date, '%Y-%m-%d')

                    total_cases = cast_to_int(row.get('total_cases', None))
                    new_cases = cast_to_int(row.get('new_cases', None))
                    new_cases_smoothed = row.get('new_cases_smoothed', None)
                    total_cases_per_million = row.get('total_cases_per_million', None)
                    new_cases_per_million = row.get('new_cases_per_million', None)
                    new_cases_smoothed_per_million = row.get('new_cases_smoothed_per_million', None)
                    case = dict(
                        total_cases=total_cases,
                        new_cases=new_cases,
                        new_cases_smoothed=new_cases_smoothed,
                        total_cases_per_million=total_cases_per_million,
                        new_cases_per_million=new_cases_per_million,
                        new_cases_smoothed_per_million=new_cases_smoothed_per_million
                    )
                    if not is_dict_null(case):
                        cases.append({
                            **dict(date=date, iso_code=iso_code),
                            **case
                        })

                        people_vaccinated = cast_to_int(row.get(
                            'people_vaccinated', None
                        ))
                        people_fully_vaccinated = cast_to_int(row.get(
                            'people_fully_vaccinated', None
                        ))
                        new_vaccinations = cast_to_int(row.get(
                            'new_vaccinations', None
                        ))
                        new_vaccinations_smoothed = row.get(
                            'new_vaccinations_smoothed', None
                        )
                        total_vaccinations_per_hundred = row.get(
                            'total_vaccinations_per_hundred', None
                        )
                        people_vaccinated_per_hundred = row.get(
                            'people_vaccinated_per_hundred', None
                        )
                        people_fully_vaccinated_per_hundred = row.get(
                            'people_fully_vaccinated_per_hundred', None
                        )
                        new_vaccinations_smoothed_per_million = row.get(
                            'new_vaccinations_smoothed_per_million', None
                        )
                        vaccination = dict(
                            people_vaccinated=people_vaccinated,
                            people_fully_vaccinated=people_fully_vaccinated,
                            new_vaccinations=new_vaccinations,
                            new_vaccinations_smoothed=new_vaccinations_smoothed,
                            total_vaccinations_per_hundred=total_vaccinations_per_hundred,
                            people_vaccinated_per_hundred=people_vaccinated_per_hundred,
                            people_fully_vaccinated_per_hundred=people_fully_vaccinated_per_hundred,
                            new_vaccinations_smoothed_per_million=new_vaccinations_smoothed_per_million
                        )
                        if not is_dict_null(vaccination):
                            vaccinations.append({
                                **dict(date=date, iso_code=iso_code),
                                **vaccination
                            })

        if countries:
            self.__add_countries(countries)
        if cases:
            self.__add_cases(cases)
        if vaccinations:
            self.__add_vaccinations(vaccinations)

    def dump_data(self):
        countries = {}
        for country in list(self.__countries.find({})):
            countries[country.get('iso_code')] = dict(
                continent=country.get('continent', None),
                location=country.get('location', None),
                population=country.get('population', None),
                population_density=country.get('population_density', None),
                median_age=country.get('median_age', None),
                aged_65_older=country.get('aged_65_older', None),
                aged_70_older=country.get('aged_70_older', None),
                dict_data={}
            )

        for case in list(self.__cases.find({})):
            iso_code = case.get('iso_code')
            date = case.get('date').strftime('%Y-%m-%d')
            countries[iso_code]['dict_data'][date] = dict(
                total_cases=case.get('total_cases'),
                new_cases=case.get('new_cases'),
                new_cases_smoothed=case.get('new_cases_smoothed'),
                total_cases_per_million=case.get('total_cases_per_million'),
                new_cases_per_million=case.get('new_cases_per_million'),
                new_cases_smoothed_per_million=case.get('new_cases_smoothed_per_million')
            )
        for vaccination in list(self.__vaccinations.find({})):
            iso_code = vaccination.get('iso_code')
            date = vaccination.get('date').strftime('%Y-%m-%d')
            countries[iso_code]['dict_data'][date].update(
                dict(
                    people_vaccinated=vaccination.get('people_vaccinated'),
                    people_fully_vaccinated=vaccination.get('people_fully_vaccinated'),
                    new_vaccinations=vaccination.get('new_vaccinations'),
                    new_vaccinations_smoothed=vaccination.get('new_vaccinations_smoothed'),
                    total_vaccinations_per_hundred=vaccination.get('total_vaccinations_per_hundred'),
                    people_vaccinated_per_hundred=vaccination.get('people_vaccinated_per_hundred'),
                    people_fully_vaccinated_per_hundred=vaccination.get('people_fully_vaccinated_per_hundred'),
                    new_vaccinations_smoothed_per_million=vaccination.get('new_vaccinations_smoothed_per_million')
                )
            )
        for iso_code, country in countries.items():
            dict_data = country['dict_data']
            replaced_data = []
            for date, value in dict_data.items():
                replaced_data.append({**{'date': date}, **value})
            country['data'] = replaced_data
            country.pop('dict_data', None)
        return countries


def main():
    """
    function main
    :return:
    """
    database = DataBase('username', 'password')
    with open('owid-covid-data.json', encoding='utf-8') as file:
        data = json.load(file)
    database.parse_data(data)


if __name__ == '__main__':
    main()
