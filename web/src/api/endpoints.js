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


const ENDPOINTS = {
    [CASES_PER_DAY]: {
        uri: "/cases-per-day",
        method: "GET"
    },

    [CASES_PER_DAY_COMP]: {
        uri: "/cases-per-day-comp",
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