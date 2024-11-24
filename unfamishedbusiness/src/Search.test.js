import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import Search from './Search';
import axios from 'axios';

// Mock Firebase functions
jest.mock('./firebaseConfig', () => ({
	auth: {
		onAuthStateChanged: jest.fn(),
		currentUser: { uid: 'testUser' },
		signOut: jest.fn(),
	},
	db: {
		collection: jest.fn(),
	},
}));

// Mock Axios
jest.mock('axios');

jest.mock('react-router-dom', () => ({
	useNavigate: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
	query: jest.fn(),
	collection: jest.fn(),
	getDocs: jest.fn(),
	where: jest.fn(),
}));

describe('Search Component', () => {
	test('redirects to login if user is not authenticated', async () => {
		const navigate = jest.fn();
		useNavigate.mockReturnValue(navigate); // Mock the navigate function

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback(null); // Simulate user not logged in
			return jest.fn(); // Mock unsubscribe
		});

		render(<Search />);
		await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
	});

	test('fetches recipes from database and displays them', async () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		const navigate = jest.fn();
		useNavigate.mockReturnValue(navigate); // Mock the navigate function

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: 'testUser' }); // Simulate user not logged in
			return jest.fn(); // Mock unsubscribe
		});

		const mockQuerySnapshot = {
			docs: [
				{
					id: '1',
					data: () => ({
						title: 'Mock Recipe 1',
						ingredients: ['pasta', 'sauce'],
						steps: ['boil water', 'step 2'],
					}),
				},
				{
					id: '2',
					data: () => ({
						title: 'Mock Recipe 2',
						ingredients: ['bread', 'cheese'],
						steps: ['toast bread', 'heat cheese'],
					}),
				},
			],
		};

		getDocs.mockResolvedValueOnce(mockQuerySnapshot);

		// Firestore `collection` and `query` mocks
		collection.mockReturnValue('mockCollection');
		query.mockReturnValue('mockQuery');
		getDocs;

		axios.post.mockReturnValue({
			data: {
				choices: [
					{
						message: {
							content: `
                Title: AI Pasta
                Description: A quick and easy pasta recipe.
                Ingredients:
                - Pasta
                - Tomato Sauce
                Steps:
                1. Boil the pasta.
                2. Add tomato sauce.
              `,
						},
					},
				],
			},
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');
		const searchButton = screen.getByText('Find Recipes');

		fireEvent.change(input, { target: { value: 'Pasta' } });
		fireEvent.click(addButton);
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(screen.getByText('Mock Recipe 1')).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(screen.getByText('Mock Recipe 2')).toBeInTheDocument();
		});
	});

	test('fetches recipes from openai api and displays them', async () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		const navigate = jest.fn();
		useNavigate.mockReturnValue(navigate); // Mock the navigate function

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: 'testUser' }); // Simulate user not logged in
			return jest.fn(); // Mock unsubscribe
		});

		const mockQuerySnapshot = {
			docs: [
				{
					id: '1',
					data: () => ({
						title: 'Mock Recipe 1',
						ingredients: ['pasta', 'sauce'],
						steps: ['boil water', 'step 2'],
					}),
				},
				{
					id: '2',
					data: () => ({
						title: 'Mock Recipe 2',
						ingredients: ['bread', 'cheese'],
						steps: ['toast bread', 'heat cheese'],
					}),
				},
			],
		};

		getDocs.mockResolvedValueOnce(mockQuerySnapshot);

		// Firestore `collection` and `query` mocks
		collection.mockReturnValue('mockCollection');
		query.mockReturnValue('mockQuery');

		axios.post.mockReturnValue({
			data: {
				choices: [
					{
						message: {
							content: `
                Title: AI Pasta
                Description: A quick and easy pasta recipe.
                Ingredients:
                - Pasta
                - Tomato Sauce
                Steps:
                1. Boil the pasta.
                2. Add tomato sauce.
              `,
						},
					},
				],
			},
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');
		const searchButton = screen.getByText('Find Recipes');

		fireEvent.change(input, { target: { value: 'Pasta' } });
		fireEvent.click(addButton);
		fireEvent.click(searchButton);

		await waitFor(() => {
			expect(screen.getByText('AI Pasta')).toBeInTheDocument();
		});
	});

	test('handles API errors gracefully', async () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		const navigate = jest.fn();
		useNavigate.mockReturnValue(navigate); // Mock the navigate function

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: 'testUser' }); // Simulate user not logged in
			return jest.fn(); // Mock unsubscribe
		});
		render(<Search />);

		axios.post.mockRejectedValue(new Error('Failed to fetch recipes'));
		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');
		const searchButton = screen.getByText('Find Recipes');

		fireEvent.change(input, { target: { value: 'Egg' } });
		fireEvent.click(addButton);
		fireEvent.click(searchButton);

		await waitFor(() =>
			expect(
				screen.getByText('Failed to fetch recipes. Please try again.')
			).toBeInTheDocument()
		);
	});
});
