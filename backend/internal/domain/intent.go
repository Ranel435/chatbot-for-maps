package domain

type Intent string

const (
	IntentSearch       Intent = "SEARCH"
	IntentRoute        Intent = "ROUTE"
	IntentInfo         Intent = "INFO"
	IntentCategoryList Intent = "CATEGORY_LIST"
)

type IntentResult struct {
	Intent     Intent            `json:"intent"`
	Confidence float64           `json:"confidence"`
	Entities   map[string]string `json:"entities,omitempty"`
}

type ChatRequest struct {
	Query    string      `json:"query"`
	Location *Coordinate `json:"location,omitempty"`
	Context  []string    `json:"context,omitempty"`
}

type ChatResponse struct {
	Intent  Intent      `json:"intent"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

