gunicorn main:app \
  -k uvicorn.workers.UvicornWorker \
  -w 8 \
  -b 0.0.0.0:8000 \
  --timeout 120