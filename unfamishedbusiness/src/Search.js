import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const Search = () => {
  const [ingredient, setIngredient] = useState("");
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAddToPantry = () => {
    if (ingredient.trim() && !pantry.includes(ingredient.toLowerCase())) {
      setPantry([...pantry, ingredient.toLowerCase()]);
      setIngredient("");
    }
  };

  const handleDeleteIngredient = (ingredientToDelete) => {
    setPantry(pantry.filter((item) => item !== ingredientToDelete));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && ingredient.trim()) {
      handleAddToPantry();
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const userFolderRef = collection(db, `users/${user.uid}/saved_recipes`);
      const recipeToSave = {
        userId: user.uid,
        title: recipe.title || recipe.name,
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        savedAt: new Date().toISOString(),
        source: recipe.source || "generated",
      };

      await addDoc(userFolderRef, recipeToSave);
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    }
  };

  const handleSearch = async () => {
    if (pantry.length === 0) {
      setError("Please add at least one ingredient to your pantry.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search Firestore database for matching recipes
      const q = query(
        collection(db, "recipes"),
        where("ingredients", "array-contains-any", pantry)
      );
      const querySnapshot = await getDocs(q);
      const recipesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesList);

      // Generate recipe using OpenAI
      const generatedRecipeData = await generateChatGptRecipe(pantry);
      setGeneratedRecipe(parseRecipe(generatedRecipeData));
    } catch (error) {
      console.error("Error during search:", error);
      setError("Failed to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateChatGptRecipe = async (ingredients) => {
    try {
      const apiUrl = "https://api.openai.com/v1/chat/completions";
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Create a recipe using some or all of these ingredients: ${ingredients.join(
              ", "
            )}. Structure the response exactly as follows:
            Title: <recipe title>
            Description: <brief description>
            Ingredients:
            - <ingredient 1>
            - <ingredient 2>
            ...
            Steps:
            1. <step 1>
            2. <step 2>
            ...`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      const { data } = await axios.post(apiUrl, requestBody, { headers });
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating recipe:", error);
      throw new Error("Failed to generate recipe");
    }
  };

  const parseRecipe = (recipeText) => {
    try {
      const titleMatch = recipeText.match(/Title:\s*(.*?)(?=\n|$)/);
      const descriptionMatch = recipeText.match(/Description:\s*(.*?)(?=\n|$)/);
      const ingredientsMatch = recipeText.match(/Ingredients:\n((?:- .*\n?)*)/);
      const stepsMatch = recipeText.match(/Steps:\n((?:\d+\. .*\n?)*)/);

      const ingredients = ingredientsMatch
        ? ingredientsMatch[1]
            .split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.trim().replace(/^- /, ""))
        : [];

      const steps = stepsMatch
        ? stepsMatch[1]
            .split("\n")
            .filter((line) => line.trim().match(/^\d+\./))
            .map((line) => line.trim().replace(/^\d+\.\s*/, ""))
        : [];

      return {
        title: titleMatch ? titleMatch[1].trim() : "Custom Recipe",
        description: descriptionMatch ? descriptionMatch[1].trim() : "",
        ingredients,
        steps,
        source: "AI Generated",
      };
    } catch (error) {
      console.error("Error parsing recipe:", error);
      return null;
    }
  };

  return (
    <div className="container">
      {/* Navigation Bar */}
      <div className="nav-bar">
        <div className="nav-content">
          <h2>UnfamishedBusiness</h2>
          <div className="nav-links">
            <button
              className="secondary"
              onClick={() => navigate("/saved-recipes")}
            >
              Saved Recipes
            </button>
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="pantry-section">
          <h3>Your Pantry</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter ingredient (press Enter to add)"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleAddToPantry}>Add</button>
          </div>

          <div className="ingredient-list">
            {pantry.map((item, index) => (
              <div key={index} className="ingredient-tag">
                {item}
                <button
                  onClick={() => handleDeleteIngredient(item)}
                  className="delete-ingredient"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="search-actions">
            <button
              onClick={handleSearch}
              disabled={loading || pantry.length === 0}
            >
              {loading ? "Searching..." : "Find Recipes"}
            </button>
            {pantry.length > 0 && (
              <button className="secondary" onClick={() => setPantry([])}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Finding recipes for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {/* AI-Generated Recipe */}
        {!loading && generatedRecipe && (
          <div className="recipe-section">
            <h3>AI-Generated Recipe</h3>
            <div className="recipe-card">
              <div className="recipe-content">
                <h3 className="recipe-title">{generatedRecipe.title}</h3>
                <p className="recipe-description">
                  {generatedRecipe.description}
                </p>

                <div className="recipe-details">
                  <h4>Ingredients</h4>
                  <ul>
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>

                  <h4>Steps</h4>
                  <ol>
                    {generatedRecipe.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="recipe-meta">
                  <span className="recipe-source">Source: AI Generated</span>
                  <button onClick={() => handleSaveRecipe(generatedRecipe)}>
                    Save Recipe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Recipes */}
        {!loading && recipes.length > 0 && (
          <div className="recipe-section">
            <h3>Database Recipes</h3>
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                  <div className="recipe-content">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="recipe-description">{recipe.description}</p>
                    )}

                    <div className="recipe-details">
                      <h4>Ingredients</h4>
                      <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>

                      <h4>Steps</h4>
                      <ol>
                        {recipe.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="recipe-meta">
                      <span className="recipe-source">Source: Database</span>
                      <button onClick={() => handleSaveRecipe(recipe)}>
                        Save Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          recipes.length === 0 &&
          !generatedRecipe &&
          pantry.length > 0 && (
            <div className="no-results">
              <p>
                No recipes found with your ingredients. Try adding more
                ingredients or removing some to get better results.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Search;
