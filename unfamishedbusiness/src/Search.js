import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./App.css";

const Search = () => {
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const handleAddToPantry = () => {
    if (ingredient && !pantry.includes(ingredient)) {
      setPantry([...pantry, ingredient]);
      setIngredient(""); // Clear the input field after adding
    }
  };

  const handleSearch = async () => {
    const q = query(
      collection(db, "recipes"),
      where("ingredients", "array-contains-any", pantry)
    );
    const querySnapshot = await getDocs(q);
    const recipesList = querySnapshot.docs.map((doc) => doc.data());
    setRecipes(recipesList);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Enter ingredient"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
      />
      <button onClick={handleAddToPantry}>Add to Pantry</button>
      <button onClick={handleSearch}>Search Recipes</button>
      <div>
        <h3>Pantry</h3>
        <ul>
          {pantry.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Recipes</h3>
        <ul>
          {recipes.map((recipe, index) => (
            <li key={index}>{recipe.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Search;
