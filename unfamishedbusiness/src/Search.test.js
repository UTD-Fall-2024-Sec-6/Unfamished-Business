import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
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

describe('Search Component', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('redirects to login if user is not authenticated', async () => {
		const mockNavigate = jest.fn();
		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback(null); // Simulate user not logged in
			return jest.fn(); // Mock unsubscribe
		});

		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

		await waitFor(() =>
			expect(mockNavigate).toHaveBeenCalledWith('/login')
		);
	});

	test('renders pantry section and allows adding ingredients', async () => {
		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: 'testUser' }); // Simulate user logged in
			return jest.fn(); // Mock unsubscribe
		});

		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'Tomato' } });
		fireEvent.click(addButton);

		expect(screen.getByText('Tomato')).toBeInTheDocument();
	});

	test('allows deleting an ingredient from the pantry', async () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'Onion' } });
		fireEvent.click(addButton);

		const deleteButton = screen.getByText('×');
		fireEvent.click(deleteButton);

		await waitFor(() =>
			expect(screen.queryByText('Onion')).not.toBeInTheDocument()
		);
	});

	test('fetches recipes and displays them', async () => {
		axios.post.mockResolvedValue({
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

		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

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
			expect(
				screen.getByText('A quick and easy pasta recipe.')
			).toBeInTheDocument();
		});
	});

	test('shows error when no ingredients are added', async () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

		const searchButton = screen.getByText('Find Recipes');
		fireEvent.click(searchButton);

		await waitFor(() =>
			expect(
				screen.getByText(
					'Please add at least one ingredient to your pantry.'
				)
			).toBeInTheDocument()
		);
	});

	test('handles API errors gracefully', async () => {
		axios.post.mockRejectedValue(new Error('Failed to fetch recipes'));

		render(
			<MemoryRouter initialEntries={['/']}>
				<Search />
			</MemoryRouter>
		);

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
