import React, { useReducer, useState, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';

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

function Ingredients() {
  const [originalIngredients, dispatchIngredient] = useReducer(ingredientReducer, []);
  const { isLoading, error, sendRequest, clearError } = useHttp(dispatchIngredient);
  const [ingredients, setIngredients] = useState([]);
  const [enteredFilter, setEnteredFilter] = useState('');

  useEffect(() => {
    sendRequest('https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients.json', 'GET', null, []);
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
    sendRequest('https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients.json', 'POST', JSON.stringify(ingredient), ingredient);
  }, []);

  const removeIngredientHandler = useCallback(ingredientId => {
    sendRequest(`https://react-getting-started-4c1f1-default-rtdb.asia-southeast1.firebasedatabase.app/ingredients/${ingredientId}.json`, 'DELETE', null, ingredientId);
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList ingredients={ingredients} onRemoveItem={removeIngredientHandler} />
    )
  }, [ingredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>
        {error}
      </ErrorModal>}

      <IngredientForm
        addIngredientHandler={addIngredientHandler}
        isLoading={isLoading}
      />

      <section>
        <Search filteredIngredientsHandler={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );

}
export default Ingredients;
