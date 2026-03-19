# from flask import Flask, render_template
# import random

# app = Flask(__name__)

# # def roll_dice():
# #     return [random.randint(1,6) for _ in range(5)]

# @app.route("/", methods=["GET"])
# def index():

#     return render_template("game.html")

# # @app.route("/")
# # def index():
# #     return "<h1>WORK</h1>"

# if __name__ == "__main__":
#     app.run('0.0.0.0', port=8000,debug=True)


from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import random

import uvicorn
from pydantic import BaseModel
from typing import List
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        "game.html",
        {"request": request}
    )


class DiceRollResponse(BaseModel):
    values: List[int]
    total: int
    message: str
    dice:int
class DiceRollRequest(BaseModel):
    dice: int  # Список, где каждый элемент - количество граней для каждого кубика
# Эндпоинт для броска кубиков
@app.post("/api/roll-dice")
async def roll_dice(request: DiceRollRequest):
    # Получаем dice из request
    dice = request.dice
    roll_res = []

    roll_res = [random.randint(1, 6) for _ in range(dice if dice>0 else 5)]

    return {"results": roll_res}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8008)