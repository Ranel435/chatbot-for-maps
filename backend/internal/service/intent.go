package service

import (
	"regexp"
	"strings"

	"github.com/dremotha/mapbot/internal/domain"
)

type IntentClassifier struct {
	patterns map[domain.Intent][]*regexp.Regexp
	keywords map[domain.Intent][]string
}

func NewIntentClassifier() *IntentClassifier {
	c := &IntentClassifier{
		patterns: make(map[domain.Intent][]*regexp.Regexp),
		keywords: make(map[domain.Intent][]string),
	}

	c.patterns[domain.IntentRoute] = []*regexp.Regexp{
		regexp.MustCompile(`(?i)постро[йи]\s+маршрут`),
		regexp.MustCompile(`(?i)как\s+(до[йе]ти|добраться|попасть)`),
		regexp.MustCompile(`(?i)проложи\s+(путь|маршрут|дорогу)`),
		regexp.MustCompile(`(?i)маршрут\s+(до|к|в|по|через)`),
		regexp.MustCompile(`(?i)хочу\s+пройти`),
	}

	c.patterns[domain.IntentInfo] = []*regexp.Regexp{
		regexp.MustCompile(`(?i)расскажи\s+(про|о|об)`),
		regexp.MustCompile(`(?i)что\s+(такое|это|за)`),
		regexp.MustCompile(`(?i)история\s+`),
		regexp.MustCompile(`(?i)когда\s+(построен|основан|создан)`),
		regexp.MustCompile(`(?i)информация\s+(о|об|про)`),
	}

	c.patterns[domain.IntentCategoryList] = []*regexp.Regexp{
		regexp.MustCompile(`(?i)какие\s+(есть\s+)?(типы|виды|категории)`),
		regexp.MustCompile(`(?i)(список|перечень)\s+(категорий|типов)`),
		regexp.MustCompile(`(?i)что\s+можно\s+посмотреть`),
	}

	c.keywords[domain.IntentRoute] = []string{
		"маршрут", "путь", "дорога", "добраться", "дойти", "доехать", "пройти",
	}

	c.keywords[domain.IntentInfo] = []string{
		"расскажи", "история", "информация", "описание", "подробнее",
	}

	c.keywords[domain.IntentCategoryList] = []string{
		"категории", "типы", "виды",
	}

	c.keywords[domain.IntentSearch] = []string{
		"найди", "покажи", "где", "найти", "поиск", "ищу", "хочу посмотреть",
	}

	return c
}

func (c *IntentClassifier) Classify(query string) domain.IntentResult {
	query = strings.ToLower(query)

	for intent, patterns := range c.patterns {
		for _, p := range patterns {
			if p.MatchString(query) {
				return domain.IntentResult{
					Intent:     intent,
					Confidence: 0.9,
				}
			}
		}
	}

	scores := make(map[domain.Intent]int)
	for intent, keywords := range c.keywords {
		for _, kw := range keywords {
			if strings.Contains(query, kw) {
				scores[intent]++
			}
		}
	}

	maxScore := 0
	bestIntent := domain.IntentSearch
	for intent, score := range scores {
		if score > maxScore {
			maxScore = score
			bestIntent = intent
		}
	}

	confidence := 0.5
	if maxScore > 0 {
		confidence = 0.6 + float64(maxScore)*0.1
		if confidence > 0.85 {
			confidence = 0.85
		}
	}

	return domain.IntentResult{
		Intent:     bestIntent,
		Confidence: confidence,
	}
}




