from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import random
import uvicorn
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель запроса
class DiceRollRequest(BaseModel):
    count: int = 2  # Количество кубиков (по умолчанию 2)
    sides: int = 6   # Количество граней (по умолчанию 6)

# Модель ответа
class DiceRollResponse(BaseModel):
    values: List[int]
    total: int
    count: int
    sides: int
    message: str

# Эндпоинт для броска кубиков с параметрами
@app.post("/api/roll-dice", response_model=DiceRollResponse)
async def roll_dice(request: DiceRollRequest):
    # Валидация
    count = max(1, min(10, request.count))  # От 1 до 10 кубиков
    sides = max(2, min(100, request.sides)) # От 2 до 100 граней

    # Генерируем случайные числа на сервере
    values = [random.randint(1, sides) for _ in range(count)]
    total = sum(values)

    # Формируем сообщение
    if count == 1:
        message = f"Выпало: {values[0]}"
    else:
        values_str = ", ".join(map(str, values))
        message = f"Выпало: {values_str}. Сумма: {total}"

    return DiceRollResponse(
        values=values,
        total=total,
        count=count,
        sides=sides,
        message=message
    )

# Раздача статических файлов
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def serve_frontend():
    return FileResponse("templates/index.html")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse("templates/index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)