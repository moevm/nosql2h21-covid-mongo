import camelCase from 'camelcase'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useMemo } from 'react'

import { apiActions } from 'api/actions'

const useFetch = (endpoint) => {
    const dispatch = useDispatch();
    const apiState = useSelector(state => state.api);
    const performFetch = useCallback(data => dispatch(apiActions.fetch(endpoint, data)), [endpoint, dispatch]);
    const response = useMemo(() => apiState[camelCase(endpoint)], [apiState, endpoint]);

    return [response, performFetch];
}

export default useFetch;