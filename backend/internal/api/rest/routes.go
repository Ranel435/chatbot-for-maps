package rest

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(handler *Handler, routeHandler *RouteHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))

	r.Get("/health", handler.Health)

	r.Route("/api", func(r chi.Router) {
		r.Post("/search", handler.Search)
		r.Post("/chat", handler.Chat)
		r.Get("/poi/{id}", handler.GetPOI)
		r.Get("/categories", handler.GetCategories)

		r.Post("/route", routeHandler.BuildRoute)
		r.Post("/route/pois", routeHandler.BuildRouteFromPOIs)
		r.Post("/route/query", routeHandler.BuildRouteFromQuery)
	})

	return r
}
