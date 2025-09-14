import json

with open("metadata.csv", "w") as f:
    f.write("match_id,home_team,away_team,matchday_date\n")
    with open("matches.json") as j:
        data = json.load(j)
        for day in data['matches']:
            for match in data['matches'][day]:
                f.write(f"{match['id']},{match['homeTeam']},{match['awayTeam']},{day}\n")
