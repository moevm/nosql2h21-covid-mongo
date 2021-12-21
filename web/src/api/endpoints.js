export const CASES_PER_DAY = "cases_per_day"
export const CASES_PER_DAY_COMP = "cases_per_day_comparison"
export const VACCS_PER_DAY = "vaccs_per_day"

export const COUNTRY_LIST = "country_list"

export const DATA_COUNTRIES = "data_countries"
export const DATA_CASES = "data_cases"
export const DATA_VACCS = "data_vaccs"

export const RESET_DB = "reset_db"
export const EXPORT_DB = "export_database"
export const IMPORT_DB = "import_database"

export const AGGREGATE_CASES_MAX   = "aggregate_cases_min"
export const AGGREGATE_CASES_MIN   = "aggregate_cases_max"
export const AGGREGATE_CASES_AVG   = "aggregate_cases_avg"
export const AGGREGATE_CASES_TOTAL = "aggregate_cases_total"

export const AGGREGATE_VACCS_MAX   = "aggregate_vaccs_min"
export const AGGREGATE_VACCS_MIN   = "aggregate_vaccs_max"
export const AGGREGATE_VACCS_AVG   = "aggregate_vaccs_avg"
export const AGGREGATE_VACCS_TOTAL = "aggregate_vaccs_total"

export const CASES_ON_DENSITY = "cases_on_density"


const ENDPOINTS = {
    [CASES_PER_DAY]: {
        uri: "/cases-per-day",
        method: "GET"
    },

    [CASES_PER_DAY_COMP]: {
        uri: "/cases-per-day-comp",
        method: "GET"
    },

    [CASES_ON_DENSITY]: {
        uri: "/cases-on-density",
        method: "GET"
    },

    [VACCS_PER_DAY]: {
        uri: "/vax-per-day",
        method: "GET"
    },

    [COUNTRY_LIST]: {
        uri: "/country-list",
        method: "GET"
    },

    [AGGREGATE_CASES_MIN]: {
        uri: "/aggregate-cases-min",
        method: "GET"
    },

    [AGGREGATE_CASES_MAX]: {
        uri: "/aggregate-cases-max",
        method: "GET"
    },

    [AGGREGATE_CASES_AVG]: {
        uri: "/aggregate-cases-avg",
        method: "GET"
    },

    [AGGREGATE_CASES_TOTAL]: {
        uri: "/aggregate-cases-total",
        method: "GET"
    },

    [AGGREGATE_VACCS_MIN]: {
        uri: "/aggregate-vaccinations-min",
        method: "GET"
    },

    [AGGREGATE_VACCS_MAX]: {
        uri: "/aggregate-vaccinations-max",
        method: "GET"
    },

    [AGGREGATE_VACCS_AVG]: {
        uri: "/aggregate-vaccinations-avg",
        method: "GET"
    },

    [AGGREGATE_VACCS_TOTAL]: {
        uri: "/aggregate-vaccinations-total",
        method: "GET"
    },

    [DATA_COUNTRIES]: {
        uri: "/data-countries",
        method: "GET"
    },

    [DATA_CASES]: {
        uri: "/data-cases",
        method: "GET"
    },

    [DATA_VACCS]: {
        uri: "/data-vaccinations",
        method: "GET"
    },

    [RESET_DB]: {
        uri: "/reset-db",
        method: "POST"
    },

    [EXPORT_DB]: {
        uri: "/export-database",
        method: "GET"
    },

    [IMPORT_DB]: {
        uri: "/import-database",
        method: "POST"
    }
}

export default ENDPOINTS;