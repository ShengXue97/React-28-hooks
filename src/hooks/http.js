import { useReducer, useCallback } from 'react';

const httpReducer = (httpState, action) => {
    switch (action.type) {
        case 'SEND':
            return { loading: true, error: null };
        case 'RESPONSE':
            return { ...httpState, loading: false };
        case 'ERROR':
            return { loading: false, error: action.errorMessage };
        case 'CLEAR':
            return { ...httpState, error: null };
        default:
            throw new Error('Should not get there!');
    }
}

const useHttp = (dispatchIngredient) => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });

    const clearError = useCallback(() => {
        dispatchHttp({ type: "CLEAR" })
    }, []);

    const sendRequest = useCallback((url, method, body, extra) => {
        dispatchHttp({ type: 'SEND' });
        fetch(url, {
            method: method,
            body: body,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(responseData => {
            switch (method) {
                case 'POST':
                    dispatchIngredient({
                        type: 'ADD',
                        ingredient: {
                            id: responseData.name,
                            ...extra
                        }
                    });
                    break;
                case 'DELETE':
                    dispatchIngredient({
                        type: 'DELETE',
                        id: extra
                    });
                    break;

                case 'GET':
                    const loadedIngredients = [];
                    for (const key in responseData) {
                        loadedIngredients.push({
                            id: key,
                            title: responseData[key].title,
                            amount: responseData[key].amount
                        })
                    }
                    dispatchIngredient({
                        type: 'SET',
                        ingredients: loadedIngredients
                    });
                    break;
                default:
                    break;
            };

            dispatchHttp({ type: "RESPONSE" });

        }).catch(error => {
            dispatchHttp({ type: "ERROR", errorMessage: error.message });
        });
    }, []);

    return {
        isLoading: httpState.loading,
        error: httpState.error,
        sendRequest: sendRequest,
        clearError: clearError,
    };
};

export default useHttp;