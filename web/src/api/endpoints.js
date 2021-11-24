export const CASES_PER_DAY = "cases_per_day"
export const VACCS_PER_DAY = "vaccs_per_day"
export const COUNTRY_LIST = "country_list"

export const DATA_COUNTRIES = "data_countries"
export const DATA_CASES = "data_cases"
export const DATA_VACCS = "data_vaccs"


const ENDPOINTS = {
    [CASES_PER_DAY]: {
        uri: "/cases-per-day",
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
    }
}

export default ENDPOINTS;