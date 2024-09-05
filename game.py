#Kiara was here - kim200001

import random

def get_user_choice():
    choice = input("Enter Rock, Paper, or Scissors: ").lower()
    if choice not in ['rock', 'paper', 'scissors']:
        print("Invalid choice. Try again.")
        return get_user_choice()
    return choice

def get_computer_choice():
    return random.choice(['rock', 'paper', 'scissors'])

def determine_winner(user, computer):
    if user == computer:
        return "It's a tie!"
    
    if (user == 'rock' and computer == 'scissors') or \
       (user == 'paper' and computer == 'rock') or \
       (user == 'scissors' and computer == 'paper'):
        return "You win!"
    else:
        return "You lose!"

def play_game():
    print("Welcome to Rock, Paper, Scissors!")
    user_choice = get_user_choice()
    computer_choice = get_computer_choice()

    print(f"\nYou chose: {user_choice.capitalize()}")
    print(f"Computer chose: {computer_choice.capitalize()}")

    result = determine_winner(user_choice, computer_choice)
    print(f"\n{result}")

if __name__ == "__main__":
    play_game()
