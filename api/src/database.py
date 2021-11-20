"""
docstring
database helper
"""

import json
import operator
from datetime import datetime
from typing import List

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
                    'new_vaccinations_smoothed': {'$sum': '$new_vaccinations_smoothed'}
                }
            }, {
                '$project': {
                    'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$_id'}},
                    'new_vaccinations': '$new_vaccinations',
                    'new_vaccinations_smoothed': '$new_vaccinations_smoothed',
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

    def parse_data(self):
        if __name__ != '__main__':
            raise Exception("Do not call this function outside database.py")

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
        with open('owid-covid-data.json', encoding='utf-8') as file:
            data = json.load(file)
        countries = []
        cases = []
        vaccinations = []
        for iso_code, value in data.items():
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

        self.__add_countries(countries)
        self.__add_cases(cases)
        self.__add_vaccinations(vaccinations)


def main():
    """
    function main
    :return:
    """
    database = DataBase('username', 'password')
    database.parse_data()


if __name__ == '__main__':
    main()
