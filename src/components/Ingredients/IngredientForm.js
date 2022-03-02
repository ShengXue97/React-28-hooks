import React from 'react';

import Card from '../UI/Card';
import './IngredientForm.css';
import LoadingIndicator from '../UI/LoadingIndicator';
import { useState } from 'react';

const IngredientForm = React.memo(props => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  console.log('IngredientForm rendered');

  const submitHandler = event => {
    event.preventDefault();
    props.addIngredientHandler({ title, amount });
  };

  return (
    <section className="ingredient-form">
      <Card>
        <form onSubmit={submitHandler}>
          <div className="form-control">
            <label htmlFor="title">Name</label>
            <input type="text" id="title" value={title} onChange={
              event => {
                const newTitle = event.target.value;
                setTitle(newTitle);
              }
            } />
          </div>
          <div className="form-control">
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" value={amount} onChange={
              event => {
                const newAmount = event.target.value;
                setAmount(newAmount);
              }
            } />
          </div>
          <div className="ingredient-form__actions">
            <button type="submit">Add Ingredient</button>
            {props.isLoading && <LoadingIndicator />}
          </div>
        </form>
      </Card>
    </section>
  );
});

export default IngredientForm;
