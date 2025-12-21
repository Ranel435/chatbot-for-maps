FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY embedding.proto ./
RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. embedding.proto

COPY main.py ./

ENV GRPC_PORT=50051
ENV MAX_WORKERS=4
ENV MODEL_NAME=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

EXPOSE 50051

CMD ["python", "main.py"]




