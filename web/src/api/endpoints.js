export const CASES_PER_DAY = "cases_per_day"
export const VACCS_PER_DAY = "vaccs_per_day"
export const COUNTRY_LIST = "country_list"

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
}

export default ENDPOINTS;