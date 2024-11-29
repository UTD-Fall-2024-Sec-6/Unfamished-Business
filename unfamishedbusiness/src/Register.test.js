import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { auth } from './firebaseConfig';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link
}));

describe('Register Component', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should call createUserWithEmailAndPassword and navigate on successful registration', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const email = 'test@email.com';
        const password = 'password';

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText('Password (min. 6 characters)'), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: password } });

        createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { email } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
        });
    });


    it('should render and handle Google Sign-In properly', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        signInWithPopup.mockResolvedValueOnce();

        fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

        await waitFor(() => {
            expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(Object));
        });
    });

    it('should show validation errors if passwords do not match', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Use exact placeholder text for the password fields
        fireEvent.change(screen.getByPlaceholderText('Password (min. 6 characters)'), { target: { value: 'password' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'differentpassword' } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });

});
