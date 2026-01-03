import grpc
from concurrent import futures
import logging
import os
from sentence_transformers import SentenceTransformer

import embedding_pb2
import embedding_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
GRPC_PORT = os.getenv("GRPC_PORT", "50051")
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))


class EmbeddingServicer(embedding_pb2_grpc.EmbeddingServiceServicer):
    def __init__(self):
        logger.info(f"Loading model: {MODEL_NAME}")
        self.model = SentenceTransformer(MODEL_NAME)
        self.vector_size = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded. Vector size: {self.vector_size}")

    def Embed(self, request, context):
        try:
            embedding = self.model.encode(request.text, convert_to_numpy=True)
            return embedding_pb2.EmbedResponse(vector=embedding.tolist())
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return embedding_pb2.EmbedResponse()

    def EmbedBatch(self, request, context):
        try:
            texts = list(request.texts)
            logger.info(f"EmbedBatch received {len(texts)} texts")

            embeddings = self.model.encode(texts, convert_to_numpy=True)
            logger.info(f"EmbedBatch produced shape: {embeddings.shape}")

            responses = [
                embedding_pb2.EmbedResponse(vector=emb.tolist())
                for emb in embeddings
            ]
            logger.info(f"EmbedBatch returning {len(responses)} vectors")
            return embedding_pb2.EmbedBatchResponse(vectors=responses)
        except Exception as e:
            logger.error(f"Error batch embedding: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return embedding_pb2.EmbedBatchResponse()

    def Health(self, request, context):
        return embedding_pb2.HealthResponse(
            healthy=True,
            model_name=MODEL_NAME,
            vector_size=self.vector_size
        )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=MAX_WORKERS))
    embedding_pb2_grpc.add_EmbeddingServiceServicer_to_server(
        EmbeddingServicer(), server
    )
    server.add_insecure_port(f"[::]:{GRPC_PORT}")
    logger.info(f"Starting gRPC server on port {GRPC_PORT}")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()




