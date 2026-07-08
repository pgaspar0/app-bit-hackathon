import requests
import json

webhook_url = "http://127.0.0.1:8000/webhook"

data = {
  "consulta": "Onde faltam antenas mas há muita gente?",
  "filtros": { "regiao": "FLORIANOPOLIS", "indicador": "conectividade" },
  "idioma": "pt"
}

r = requests.post(webhook_url, data = json.dumps(data), headers = {'Content-Type': 'application/json'})