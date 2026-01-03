package embedding

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Client struct {
	conn   *grpc.ClientConn
	client EmbeddingServiceClient
}

func NewClient(addr string) (*Client, error) {
	return NewClientWithRetry(addr, 5*time.Minute, 5*time.Second)
}

func NewClientWithRetry(addr string, timeout time.Duration, retryInterval time.Duration) (*Client, error) {
	deadline := time.Now().Add(timeout)

	for {
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)

		conn, err := grpc.DialContext(ctx, addr,
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			grpc.WithBlock(),
		)
		cancel()

		if err == nil {
			return &Client{
				conn:   conn,
				client: NewEmbeddingServiceClient(conn),
			}, nil
		}

		if time.Now().After(deadline) {
			return nil, fmt.Errorf("connect to embedding service after %v: %w", timeout, err)
		}

		fmt.Printf("Embedding service not ready, retrying in %v...\n", retryInterval)
		time.Sleep(retryInterval)
	}
}

func (c *Client) Close() error {
	return c.conn.Close()
}

func (c *Client) Embed(ctx context.Context, text string) ([]float32, error) {
	resp, err := c.client.Embed(ctx, &EmbedRequest{Text: text})
	if err != nil {
		return nil, fmt.Errorf("embed text: %w", err)
	}
	return resp.Vector, nil
}

func (c *Client) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
	resp, err := c.client.EmbedBatch(ctx, &EmbedBatchRequest{Texts: texts})
	if err != nil {
		return nil, fmt.Errorf("embed batch: %w", err)
	}

	result := make([][]float32, len(resp.Vectors))
	for i, v := range resp.Vectors {
		result[i] = v.Vector
	}
	return result, nil
}

func (c *Client) Health(ctx context.Context) (*HealthResponse, error) {
	return c.client.Health(ctx, &HealthRequest{})
}

type EmbeddingServiceClient interface {
	Embed(ctx context.Context, in *EmbedRequest, opts ...grpc.CallOption) (*EmbedResponse, error)
	EmbedBatch(ctx context.Context, in *EmbedBatchRequest, opts ...grpc.CallOption) (*EmbedBatchResponse, error)
	Health(ctx context.Context, in *HealthRequest, opts ...grpc.CallOption) (*HealthResponse, error)
}

type embeddingServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewEmbeddingServiceClient(cc grpc.ClientConnInterface) EmbeddingServiceClient {
	return &embeddingServiceClient{cc}
}

func (c *embeddingServiceClient) Embed(ctx context.Context, in *EmbedRequest, opts ...grpc.CallOption) (*EmbedResponse, error) {
	out := new(EmbedResponse)
	err := c.cc.Invoke(ctx, "/embedding.EmbeddingService/Embed", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *embeddingServiceClient) EmbedBatch(ctx context.Context, in *EmbedBatchRequest, opts ...grpc.CallOption) (*EmbedBatchResponse, error) {
	out := new(EmbedBatchResponse)
	err := c.cc.Invoke(ctx, "/embedding.EmbeddingService/EmbedBatch", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *embeddingServiceClient) Health(ctx context.Context, in *HealthRequest, opts ...grpc.CallOption) (*HealthResponse, error) {
	out := new(HealthResponse)
	err := c.cc.Invoke(ctx, "/embedding.EmbeddingService/Health", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

type EmbedRequest struct {
	Text string `protobuf:"bytes,1,opt,name=text,proto3" json:"text,omitempty"`
}

type EmbedResponse struct {
	Vector []float32 `protobuf:"fixed32,1,rep,packed,name=vector,proto3" json:"vector,omitempty"`
}

type EmbedBatchRequest struct {
	Texts []string `protobuf:"bytes,1,rep,name=texts,proto3" json:"texts,omitempty"`
}

type EmbedBatchResponse struct {
	Vectors []*EmbedResponse `protobuf:"bytes,1,rep,name=vectors,proto3" json:"vectors,omitempty"`
}

type HealthRequest struct{}

type HealthResponse struct {
	Healthy    bool   `protobuf:"varint,1,opt,name=healthy,proto3" json:"healthy,omitempty"`
	ModelName  string `protobuf:"bytes,2,opt,name=model_name,json=modelName,proto3" json:"model_name,omitempty"`
	VectorSize int32  `protobuf:"varint,3,opt,name=vector_size,json=vectorSize,proto3" json:"vector_size,omitempty"`
}

func (m *EmbedRequest) Reset()         { *m = EmbedRequest{} }
func (m *EmbedRequest) String() string { return fmt.Sprintf("EmbedRequest{Text: %s}", m.Text) }
func (m *EmbedRequest) ProtoMessage()  {}

func (m *EmbedResponse) Reset() { *m = EmbedResponse{} }
func (m *EmbedResponse) String() string {
	return fmt.Sprintf("EmbedResponse{Vector: [%d floats]}", len(m.Vector))
}
func (m *EmbedResponse) ProtoMessage() {}

func (m *EmbedBatchRequest) Reset() { *m = EmbedBatchRequest{} }
func (m *EmbedBatchRequest) String() string {
	return fmt.Sprintf("EmbedBatchRequest{Texts: %d}", len(m.Texts))
}
func (m *EmbedBatchRequest) ProtoMessage() {}

func (m *EmbedBatchResponse) Reset() { *m = EmbedBatchResponse{} }
func (m *EmbedBatchResponse) String() string {
	return fmt.Sprintf("EmbedBatchResponse{Vectors: %d}", len(m.Vectors))
}
func (m *EmbedBatchResponse) ProtoMessage() {}

func (m *HealthRequest) Reset()         { *m = HealthRequest{} }
func (m *HealthRequest) String() string { return "HealthRequest{}" }
func (m *HealthRequest) ProtoMessage()  {}

func (m *HealthResponse) Reset() { *m = HealthResponse{} }
func (m *HealthResponse) String() string {
	return fmt.Sprintf("HealthResponse{Healthy: %v}", m.Healthy)
}
func (m *HealthResponse) ProtoMessage() {}
