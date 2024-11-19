import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./App.css";

const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        fetchSavedRecipes(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchSavedRecipes = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Reference the user-specific folder
      const userFolderRef = collection(db, `users/${userId}/saved_recipes`);
      const querySnapshot = await getDocs(userFolderRef);

      const recipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSavedRecipes(recipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      setError("Failed to load saved recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to delete recipes.");
        return;
      }

      // Delete from the user-specific folder
      const recipeRef = doc(db, `users/${user.uid}/saved_recipes`, recipeId);
      await deleteDoc(recipeRef);

      setSavedRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipeId)
      );
      alert("Recipe deleted successfully!");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  return (
    <div className="container">
      {/* Navigation Bar */}
      <div className="nav-bar">
        <div className="nav-content">
          <h2>UnfamishedBusiness</h2>
          <div className="nav-links">
            <button className="secondary" onClick={() => navigate("/search")}>
              Search Recipes
            </button>
            <button onClick={() => auth.signOut()}>Logout</button>
          </div>
        </div>
      </div>

      {/* Saved Recipes Section */}
      <div className="saved-recipes-container">
        <div className="saved-recipes-header">
          <h2>Your Saved Recipes</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Loading your recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => fetchSavedRecipes(auth.currentUser?.uid)}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && savedRecipes.length === 0 && (
          <div className="empty-state">
            <p>You haven't saved any recipes yet.</p>
            <button className="secondary" onClick={() => navigate("/search")}>
              Find Recipes
            </button>
          </div>
        )}

        {/* Display Saved Recipes */}
        {!loading && !error && savedRecipes.length > 0 && (
          <div className="recipe-grid">
            {savedRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-description">{recipe.description}</p>

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
                    <span className="saved-date">
                      Saved: {new Date(recipe.savedAt).toLocaleDateString()}
                    </span>
                    <div className="recipe-actions">
                      <button
                        className="secondary"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        Delete Recipe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipes;
