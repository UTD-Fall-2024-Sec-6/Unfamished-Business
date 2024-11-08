import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Register from './Register'; // Import the Register component
import { auth } from './firebaseConfig';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
}));

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('Register Component', () => {
    const navigate = jest.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(navigate); // Mock the navigate function
        createUserWithEmailAndPassword.mockClear(); // Clear mocks before each test
    });
    // Test Case #1
    it('should call createUserWithEmailAndPassword and navigate on successful registration', async () => {
        render(<Register />);

        const email = 'test@email.com';
        const password = 'password';

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: password } });

        // Mock the response from Firebase
        createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { email } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
        });
    });
    //Test Case #2
    it('should show an error if Firebase registration fails', async () => {
        render(<Register />);

        const email = 'test@email.com';
        const password = 'password';

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: password } });

        // Mock the response from Firebase to simulate an error
        createUserWithEmailAndPassword.mockRejectedValueOnce({
            code: 'auth/email-already-in-use',
        });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/this email is already registered/i)).toBeInTheDocument();
        });
    });
    //Test Case #3
    it('should show an error if the password is too short', async () => {
        render(<Register />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test3@email.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i), { target: { value: '123' } });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
        });
    });
    // Test Case #4
    it('should show an error if passwords do not match', async () => {
        render(<Register />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test4@email.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password \(min\. 6 characters\)/i), { target: { value: 'password' } });
        fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'password123' } });


        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });


});
