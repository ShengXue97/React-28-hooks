import React, { useReducer, useState, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ingredient => ingredient.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

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

function Ingredients() {
  const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });
  const [originalIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [ingredients, setIngredients] = useState([]);
  const [enteredFilter, setEnteredFilter] = useState('');

  useEffect(() => {
    fetch('https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients.json')
      .then(response => response.json())
      .then(responseData => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount
          })
        }
        dispatch({ type: 'SET', ingredients: loadedIngredients });
      })
  }, [])

  useEffect(() => {
    if (enteredFilter !== '') {
      const filterValue = enteredFilter.toLowerCase();
      const filteredIngredients = originalIngredients.filter(ingredient => ingredient.title.toLowerCase().includes(filterValue));
      setIngredients(filteredIngredients);
    } else {
      setIngredients(originalIngredients);
    }
  }, [enteredFilter, originalIngredients]);

  const filteredIngredientsHandler = filterString => {
    setEnteredFilter(filterString);
  };

  const addIngredientHandler = useCallback(ingredient => {
    dispatchHttp({ type: 'SEND' });
    fetch('https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({ type: "RESPONSE" });
      return response.json();
    }).then(responseData => {
      ingredient.id = responseData.name;
      dispatch({ type: 'ADD', ingredient });
    }).catch(error => {
      dispatchHttp({ type: "ERROR", errorMessage: error.message });
    });

  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    dispatchHttp({ type: 'SEND' });
    fetch(`https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients/${ingredientId}.json`, {
      method: 'DELETE',
    }).then(response => {
      dispatchHttp({ type: "RESPONSE" });
      return response.json();
    }).then(responseData => {
      dispatch({ type: 'DELETE', id: ingredientId });
    }).catch(error => {
      dispatchHttp({ type: "ERROR", errorMessage: error.message });
    });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: "CLEAR" })
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
    )
  }, [ingredients, removeIngredientHandler]);

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>
        {httpState.error}
      </ErrorModal>}

      <IngredientForm
        addIngredientHandler={addIngredientHandler}
        isLoading={httpState.loading}
      />

      <section>
        <Search filteredIngredientsHandler={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );

}
export default Ingredients;
