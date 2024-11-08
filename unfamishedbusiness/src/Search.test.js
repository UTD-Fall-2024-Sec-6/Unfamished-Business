// Search.test.js

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Search from './Search';

test('adds 0 ingredients to pantry and displays it', async () => {
	render(<Search />);

	const recipeItems = await screen.queryAllByRole('listitem');

	expect(recipeItems).toHaveLength(0);
});

test('adds 1 ingredient to pantry and displays it', () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, { target: { value: 'tomato' } });
	fireEvent.click(addButton);

	// Check if the ingredient appears in the pantry list
	expect(screen.getByText('tomato')).toBeInTheDocument();
});

test('adds 2 ingredients to pantry and displays it', () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, { target: { value: 'onion' } });
	fireEvent.click(addButton);
	fireEvent.change(input, { target: { value: 'tomato' } });
	fireEvent.click(addButton);

	// Check if the ingredient appears in the pantry list
	expect(screen.getByText('onion')).toBeInTheDocument();
	expect(screen.getByText('tomato')).toBeInTheDocument();
});

test('searches for recipes based on pantry ingredients', async () => {
	// Mock the response from getDocs to simulate Firestore results
	const mockRecipes = [
		{
			id: 1,
			name: 'Tomato Soup',
			ingredients: ['tomato', 'carrot', 'onion'],
		},
		{
			id: 2,
			name: 'Fettuccine Alfredo',
			ingredients: ['fettuccine', 'alfredo', 'chicken'],
		},
	];

	const pantry = ['onion', 'tomato', 'carrot'];

	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');
	const searchButton = screen.getByText('Search Recipes');

	// Simulate adding ingredients to pantry
	for (let ingredient in pantry) {
		fireEvent.change(input, { target: { value: ingredient } });
		fireEvent.click(addButton);
	}

	fireEvent.click(searchButton);

	// Wait for the recipes to appear after the search
	const recipeItems = await screen.findAllByRole('listitem');

	// Verify that recipes returned from Firestore are displayed
	expect(recipeItems).toHaveLength(3);

	// Will not pass because there are not actual recipes in the firebase as of now
	// expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
});

// Adds numbers to pantry, no input handling yet
test('adds integers to pantry and displays it', () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, { target: { value: 11 } });
	fireEvent.click(addButton);

	// Check if the ingredient appears in the pantry list
	expect(screen.getByText(11)).toBeInTheDocument();
});

// Adds empty strings as ingredients to pantry, no input handling yet
// Fails, no input handling yet
test('adds empty ingredients to pantry and displays it', async () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, { target: { value: '' } });
	fireEvent.click(addButton);

	const recipeItems = await screen.findAllByRole('listitem');

	// Check if the ingredient appears in the pantry list
	expect(recipeItems).toHaveLength(0);
});

// Adds ingredients with only spaces to pantry
// Fails, no input handling
test('adds " " to pantry and displays it', async () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, { target: { value: ' ' } });
	fireEvent.click(addButton);

	const recipeItems = await screen.findAllByRole('listitem');

	// Verify that recipes returned from Firestore are displayed
	expect(recipeItems).toHaveLength(0);
});

// Adds very long ingredients
test('adds very long ingredients to pantry and displays it', async () => {
	render(<Search />);

	const input = screen.getByPlaceholderText('Enter ingredient');
	const addButton = screen.getByText('Add to Pantry');

	// Simulate entering an ingredient and clicking 'Add to Pantry'
	fireEvent.change(input, {
		target: { value: 'abcdefghijklmnopqrstuvwxyz12345678910' },
	});
	fireEvent.click(addButton);

	// Verify that recipes returned from Firestore are displayed
	expect(
		screen.getByText('abcdefghijklmnopqrstuvwxyz12345678910')
	).toBeInTheDocument();
});
