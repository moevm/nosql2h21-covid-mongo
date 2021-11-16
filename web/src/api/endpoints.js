export const CASES_PER_DAY = "cases_per_day"
export const VACCS_PER_DAY = "vaccs_per_day"

const ENDPOINTS = {
    [CASES_PER_DAY]: {
        uri: "/cases-per-day",
        method: "GET"
    },

    [VACCS_PER_DAY]: {
        uri: "/vax-per-day",
        method: "GET"
    }
}

export default ENDPOINTS;