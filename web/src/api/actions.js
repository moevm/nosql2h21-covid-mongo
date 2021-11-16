export const API_ACTIONS = {
    FETCH_START:   'FETCH_START',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_FAILURE: 'FETCH_FAILURE',
}

export const apiActions = {
    fetch: (endpoint, payload) => ({
        type: `${API_ACTIONS.FETCH_START}_${endpoint.toUpperCase()}`,
        payload
    }),
    fetchSuccess: (endpoint, payload) => ({
        type: `${API_ACTIONS.FETCH_SUCCESS}_${endpoint.toUpperCase()}`,
        payload
    }),
    fetchFailure: (endpoint, payload) => ({
        type: `${API_ACTIONS.FETCH_FAILURE}_${endpoint.toUpperCase()}`,
        payload
    })
}