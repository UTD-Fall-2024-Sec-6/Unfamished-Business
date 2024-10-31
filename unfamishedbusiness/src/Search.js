import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Search = () => {
  const [ingredient, setIngredient] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    const q = query(
      collection(db, "recipes"),
      where("ingredients", "array-contains", ingredient)
    );
    const querySnapshot = await getDocs(q);
    const recipesList = querySnapshot.docs.map((doc) => doc.data());
    setRecipes(recipesList);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter ingredient"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {recipes.map((recipe, index) => (
          <li key={index}>{recipe.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
