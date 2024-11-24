import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Search from './Search'; // Import the Register component
import { auth } from './firebaseConfig';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
	getAuth: jest.fn(),
	onAuthStateChanged: jest.fn(),
}));

jest.mock('./firebaseConfig', () => ({
	auth: {
		onAuthStateChanged: jest.fn(),
		currentUser: {
			uid: '1234', // Provide a mock user ID
		},
	},
}));

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
	useNavigate: jest.fn(),
}));

describe('Add ingredient functionality', () => {
	const navigate = jest.fn();

	beforeEach(() => {
		useNavigate.mockReturnValue(navigate); // Mock the navigate function
		jest.clearAllMocks(); // Clear mocks before each test
	});

	it('Add 1 ingredient and display', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			// Simulate user being authenticated
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);
		const mockUser = { uid: '123' };

		onAuthStateChanged(mockUser);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'tomato' } });
		fireEvent.click(addButton);

		expect(screen.getByText('tomato')).toBeInTheDocument();
		expect(typeof unsubscribeMock).toBe('function');
		expect(auth.onAuthStateChanged).toHaveBeenCalledTimes(1);
	});
	it('Add 2 ingredients of the same name; only one shows', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'tomato' } });
		fireEvent.click(addButton);

		fireEvent.change(input, { target: { value: 'tomato' } });
		fireEvent.click(addButton);

		expect(screen.getByText('tomato')).toBeInTheDocument();
		expect(screen.getAllByText('tomato')).toHaveLength(1);
	});

	it('Add 2 ingredients with different capitalization; only one shows', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'Tomato' } });
		fireEvent.click(addButton);

		fireEvent.change(input, { target: { value: 'tomato' } });
		fireEvent.click(addButton);

		expect(screen.getByText('tomato')).toBeInTheDocument();
		expect(screen.getAllByText('tomato')).toHaveLength(1);
	});

	it('Add empty spaces; should not add to the pantry', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: '   ' } });
		fireEvent.click(addButton);

		expect(screen.queryByText('   ')).not.toBeInTheDocument();
	});

	it('Add very long strings; should be added', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);

		const longIngredient = 'a'.repeat(1000); // Generate a long string
		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: longIngredient } });
		fireEvent.click(addButton);

		expect(screen.getByText(longIngredient)).toBeInTheDocument();
	});

	it('Try to add an ingredient without being logged in; should redirect to login', () => {
		const unsubscribeMock = jest.fn();

		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback(null); // Simulate user not being logged in
			return unsubscribeMock;
		});

		render(<Search />);

		expect(navigate).toHaveBeenCalledWith('/login'); // Check if redirected to login
	});

	it('Should allow adding an ingredient with special characters', () => {
		// Simulate a logged-in user
		const unsubscribeMock = jest.fn();
		auth.onAuthStateChanged.mockImplementation((callback) => {
			callback({ uid: '1234' });
			return unsubscribeMock;
		});

		render(<Search />);

		const input = screen.getByPlaceholderText(
			'Enter ingredient (press Enter to add)'
		);
		const addButton = screen.getByText('Add');

		fireEvent.change(input, { target: { value: 'tomato!' } });
		fireEvent.click(addButton);

		expect(screen.getByText('tomato!')).toBeInTheDocument();
	});

	// it('Should not allow numeric strings as ingredients', () => {
	// 	// Simulate a logged-in user
	// 	const unsubscribeMock = jest.fn();
	// 	auth.onAuthStateChanged.mockImplementation((callback) => {
	// 		callback({ uid: '1234' });
	// 		return unsubscribeMock;
	// 	});
	// 	render(<Search />);

	// 	const input = screen.getByPlaceholderText(
	// 		'Enter ingredient (press Enter to add)'
	// 	);
	// 	const addButton = screen.getByText('Add');

	// 	fireEvent.change(input, { target: { value: '123' } });
	// 	fireEvent.click(addButton);

	// 	expect(screen.queryByText('123')).not.toBeInTheDocument();
	// });

	// it('Should prevent duplicate ingredients regardless of trailing spaces', () => {
	// 	// Simulate a logged-in user
	// 	const unsubscribeMock = jest.fn();
	// 	auth.onAuthStateChanged.mockImplementation((callback) => {
	// 		callback({ uid: '1234' });
	// 		return unsubscribeMock;
	// 	});

	// 	render(<Search />);

	// 	const input = screen.getByPlaceholderText(
	// 		'Enter ingredient (press Enter to add)'
	// 	);
	// 	const addButton = screen.getByText('Add');

	// 	fireEvent.change(input, { target: { value: 'tomato' } });
	// 	fireEvent.click(addButton);

	// 	fireEvent.change(input, { target: { value: 'tomato ' } }); // With trailing space
	// 	fireEvent.click(addButton);

	// 	expect(screen.getAllByText('tomato')).toHaveLength(1);
	// });
});
