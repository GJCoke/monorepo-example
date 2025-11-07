from fastapi import FastAPI
from .api import wrold

app = FastAPI(title="OmniDesk Backend Example")

# 注册路由
app.include_router(wrold.router, prefix="/api/hello", tags=["hello"])
