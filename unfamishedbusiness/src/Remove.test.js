import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "./Search";

// Mock Firebase modules
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        onAuthStateChanged: jest.fn((callback) => {
            // Simulate user logged in
            callback({ uid: "test-user-id" });
            return jest.fn();  // Return unsubscribe function
        }),
    })),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
}));

describe("handleDeleteIngredient", () => {
    test("removes the specified ingredient from the pantry", () => {
        // Render the component inside MemoryRouter to provide router context
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        // Simulate adding ingredients to the list
        const input = screen.getByPlaceholderText("Enter ingredient (press Enter to add)");
        const addButton = screen.getByText("Add");

        fireEvent.change(input, { target: { value: "pork" } });
        fireEvent.click(addButton);

        fireEvent.change(input, { target: { value: "beef" } });
        fireEvent.click(addButton);

        // Verify the list contains the added ingredients
        expect(screen.getByText("pork")).toBeInTheDocument();
        expect(screen.getByText("beef")).toBeInTheDocument();

        // Delete an ingredient
        const deleteButton = screen.getAllByText("×")[0];
        fireEvent.click(deleteButton);

        // Verify the list no longer contains the deleted ingredient
        expect(screen.queryByText("pork")).not.toBeInTheDocument(); //testcase #1 output
        expect(screen.getByText("beef")).toBeInTheDocument();//testcase #2 output
    });
});
