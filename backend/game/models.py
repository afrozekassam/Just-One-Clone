from django.db import models

class Game(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    started = models.BooleanField(default=False)
    current_round = models.IntegerField(default=1)
    score = models.IntegerField(default=0)
    mystery_word = models.CharField(max_length=100, blank=True, null=True)
    word_options = models.JSONField(default=list)  # List of 5 words for current round
    guesser = models.ForeignKey('Player', null=True, blank=True, on_delete=models.SET_NULL, related_name='guesser_in')
    round_complete = models.BooleanField(default=False)
    game_complete = models.BooleanField(default=False)

    def __str__(self):
        return f"Game {self.id} (Round {self.current_round}/13)"

    class Meta:
        ordering = ['-created_at']

class Player(models.Model):
    # This model represents a player in the game.
    # It has a name and a foreign key to the Game model.
    name = models.CharField(max_length=100)
    game = models.ForeignKey(Game, null=True, blank=True, on_delete=models.SET_NULL, related_name='players')
    score = models.IntegerField(default=0)  # Individual player score

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Guess(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    guess = models.CharField(max_length=100)
    correct = models.BooleanField(default=False)
    round_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guess '{self.guess}' by {self.player.name} (Round {self.round_number})"

    class Meta:
        ordering = ['-created_at']

class Clue(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    word = models.CharField(max_length=100)
    round_number = models.IntegerField(default=1)
    is_valid = models.BooleanField(default=True)
    invalid_reason = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Clue '{self.word}' by {self.player.name} (Round {self.round_number})"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['player', 'game', 'round_number']  # One clue per player per round

    