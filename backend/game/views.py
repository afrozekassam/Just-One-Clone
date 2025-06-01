from .models import Game, Player
from .serializers import GameSerializer, PlayerSerializer
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

@api_view(['POST'])
def create_game(request):
    game= Game.objects.create()
    serializer=GameSerializer(game)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
@api_view(['GET'])
def list_games(request):
    games = Game.objects.all()
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
@api_view(['POST'])
def add_player(request):
    # Deserialize the incoming data
    serializer = PlayerSerializer(data=request.data)

    # Check if data is valid
    if serializer.is_valid():
        # Save the new player
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # If invalid, return errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def list_players(request):
    players = Player.objects.all()
    serializer = PlayerSerializer(players, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)