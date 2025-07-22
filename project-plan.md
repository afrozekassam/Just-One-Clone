# project-plan

Sure! Let's break it down clearly:

What does a typical Django app need?

Each Django app usually consists of these core parts:

1. models.py

Defines the structure of your database tables.

Example: Game, Player, Clue

2. serializers.py (when using Django REST Framework)

Translates between Django models and JSON so the frontend can talk to the backend.

Think of it as a "translator" between your database and API.

3. views.py

Contains the logic for each API endpoint.

Example: Creating a game, adding a player, submitting a clue, getting a list of players, etc.

4. urls.py

Maps URL paths to the appropriate view functions.

Example: /api/games/ points to the create_game view.

5. admin.py

Registers your models so you can manage them from Django Admin.

What is REST?

"REST" stands for Representational State Transfer. It's a standard for building APIs.

In your case, your frontend (React) communicates with Django using REST APIs. For example:

POST /api/games/ to create a new game

GET /api/players/?game=1 to list players in a game

Each HTTP method (GET, POST, PUT, DELETE) has a specific purpose.

Plan for Your Game App (Tentative)

Models:

Game (id, created_at)

Player (id, name, game [ForeignKey])

Clue (id, word, player [FK], game [FK])

API Views:

POST /api/games/ - Create a game

POST /api/players/ - Add player

GET /api/players/?game=1 - List players in a game

POST /api/clues/ - Submit a clue

GET /api/clues/?game=1 - List clues

Let me know if you want to go ahead and create the models.py file or make changes to this plan!



Sure! Let's define the data schema for the Just One game backend. This will help us create the Django models, serializers, and API endpoints properly.

Here's a starting point:

Data Schema for Just One Game

1. Game

Represents a game room.

id: Auto-generated unique ID

created_at: Date and time the game was created

started: Boolean, whether the game has started

mystery_word: The word players are trying to guess (optional at first)

guesser: ForeignKey to Player (optional until game starts)

2. Player

Represents a user in a specific game.

id: Auto-generated unique ID

name: Name or nickname

game: ForeignKey to Game

3. Clue (Optional until needed)

Represents a clue submitted by a player.

id: Auto-generated unique ID

word: The clue text

player: ForeignKey to Player

game: ForeignKey to Game

4. Guess (Optional until needed)

Represents the guess submitted by the guesser.

id: Auto-generated unique ID

word: The guessed word

game: ForeignKey to Game

player: ForeignKey to Player

correct: Boolean if it was correct or not

