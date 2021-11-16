export const CASES = symbol("cases")
export const VACCINATIONS = symbol("cases")

const ENDPOINTS = {
    [CASES]: {
        url: "/number-of-new-cases",
        method: "GET"
    },

    [VACCINATIONS]: {
        url: ""
    }
}