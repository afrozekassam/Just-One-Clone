from django.urls import path
from . import views

urlpatterns = [
    path('games/create/', views.create_game, name='create-game'),
    path('games/', views.list_games, name='list-games'),
    path('players/add/', views.add_player, name='add-player'),
    path('players/', views.list_players, name='list-players'),
    path('games/<int:game_id>/start/', views.start_game, name='start-game'),
    path('games/<int:game_id>/select-word/', views.select_word, name='select-word'),
    path('games/<int:game_id>/next-round/', views.next_round, name='next-round'),
    path('games/<int:game_id>/state/', views.get_game_state, name='get-game-state'),
    path('clues/', views.submit_clue, name='submit-clue'),
    path('guess/', views.submit_guess, name='submit-guess'),
]
