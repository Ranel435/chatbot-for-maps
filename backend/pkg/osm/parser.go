package osm

import (
	"github.com/dremotha/mapbot/internal/domain"
)

type Parser struct{}

func NewParser() *Parser {
	return &Parser{}
}

func (p *Parser) ParseElements(elements []Element) []domain.POI {
	pois := make([]domain.POI, 0, len(elements))

	for _, el := range elements {
		poi := p.parseElement(el)
		if poi != nil {
			pois = append(pois, *poi)
		}
	}

	return pois
}

func (p *Parser) parseElement(el Element) *domain.POI {
	lat, lng := p.getCoordinates(el)
	if lat == 0 && lng == 0 {
		return nil
	}

	name := p.getName(el)
	if name == "" {
		return nil
	}

	category, subcategory := p.getCategory(el)

	poi := &domain.POI{
		Name:             name,
		Description:      p.getDescription(el),
		ShortDescription: p.getShortDescription(el),
		Lat:              lat,
		Lng:              lng,
		Address:          p.getAddress(el),
		Category:         category,
		Subcategory:      subcategory,
		Tags:             p.getTags(el),
		HistoricalPeriod: p.getHistoricalPeriod(el),
		Source:           "osm",
		OsmID:            &el.ID,
	}

	return poi
}

func (p *Parser) getCoordinates(el Element) (float64, float64) {
	if el.Lat != 0 && el.Lon != 0 {
		return el.Lat, el.Lon
	}
	if el.Center != nil {
		return el.Center.Lat, el.Center.Lon
	}
	return 0, 0
}

func (p *Parser) getName(el Element) string {
	if name, ok := el.Tags["name"]; ok {
		return name
	}
	if name, ok := el.Tags["name:ru"]; ok {
		return name
	}
	if name, ok := el.Tags["name:en"]; ok {
		return name
	}
	return ""
}

func (p *Parser) getDescription(el Element) string {
	if desc, ok := el.Tags["description"]; ok {
		return desc
	}
	if desc, ok := el.Tags["description:ru"]; ok {
		return desc
	}
	return ""
}

func (p *Parser) getShortDescription(el Element) string {
	if desc, ok := el.Tags["note"]; ok {
		return desc
	}
	return ""
}

func (p *Parser) getAddress(el Element) string {
	parts := []string{}

	if street, ok := el.Tags["addr:street"]; ok {
		parts = append(parts, street)
	}
	if house, ok := el.Tags["addr:housenumber"]; ok {
		parts = append(parts, house)
	}
	if city, ok := el.Tags["addr:city"]; ok {
		parts = append(parts, city)
	}

	if len(parts) == 0 {
		return ""
	}

	result := parts[0]
	for i := 1; i < len(parts); i++ {
		result += ", " + parts[i]
	}
	return result
}

func (p *Parser) getCategory(el Element) (string, string) {
	if historic, ok := el.Tags["historic"]; ok {
		switch historic {
		case "church", "cathedral", "chapel":
			return "religious", historic
		case "monastery":
			return "religious", "monastery"
		case "memorial", "monument":
			return "military", "memorial"
		case "battlefield":
			return "military", "battlefield"
		case "fort", "castle", "fortress":
			return "military", "fortress"
		case "manor":
			return "architecture", "manor"
		case "palace":
			return "architecture", "palace"
		case "ruins":
			return "architecture", "ruins"
		case "tower":
			return "architecture", "tower"
		default:
			return "architecture", ""
		}
	}

	if building, ok := el.Tags["building"]; ok {
		switch building {
		case "church":
			return "religious", "church"
		case "cathedral":
			return "religious", "cathedral"
		case "chapel":
			return "religious", "chapel"
		}
	}

	if amenity, ok := el.Tags["amenity"]; ok {
		if amenity == "place_of_worship" {
			if el.Tags["building"] == "cathedral" {
				return "religious", "cathedral"
			}
			return "religious", "church"
		}
		if amenity == "monastery" {
			return "religious", "monastery"
		}
	}

	if military, ok := el.Tags["military"]; ok {
		switch military {
		case "bunker":
			return "military", "bunker"
		default:
			return "military", ""
		}
	}

	return "architecture", ""
}

func (p *Parser) getTags(el Element) []string {
	tags := []string{}

	relevantKeys := []string{
		"historic", "religion", "denomination", "building",
		"amenity", "tourism", "military", "heritage",
	}

	for _, key := range relevantKeys {
		if val, ok := el.Tags[key]; ok {
			tags = append(tags, key+"="+val)
		}
	}

	return tags
}

func (p *Parser) getHistoricalPeriod(el Element) string {
	if period, ok := el.Tags["start_date"]; ok {
		return period
	}
	if period, ok := el.Tags["year_of_construction"]; ok {
		return period
	}
	return ""
}
