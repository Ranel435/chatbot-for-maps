import { Link } from 'react-router-dom';
import { Card, Rating } from '../../../shared/ui';
import { CategoryIcon, MapPinIcon, RouteIcon, UsersIcon, ChurchIcon } from '../../../shared/ui/icons';
import { PresetRouteCard } from '../../../entities/preset-route';
import { mockPOIs, mockPresetRoutes, mockTestimonials, mockStats } from '../../../shared/api/mock';

// Популярные места (топ 6 по popularity_score)
const popularPOIs = [...mockPOIs].sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 6);

// Топ маршруты
const topRoutes = mockPresetRoutes.slice(0, 3);

export function HomePage() {
  return (
    <div className="bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-bg-1.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />

        <header className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-20 gap-8 md:gap-16">
              <Link
                to="/explore"
                className="text-white text-base md:text-lg font-medium hover:text-white/80 transition-colors"
              >
                Поиск
              </Link>
              <Link to="/" className="text-white text-xl md:text-2xl font-bold">
                MapBot
              </Link>
              <Link
                to="/chat"
                className="text-white text-base md:text-lg font-medium hover:text-white/80 transition-colors"
              >
                Чат
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Путешествие
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              в историю
            </span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mb-12">
            Откройте для себя скрытые исторические места Москвы и Подмосковья.
            От древних храмов до секретных бункеров.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/chat"
              className="bg-white text-black px-8 py-4 text-lg font-semibold tracking-wider hover:bg-white/90 transition-colors rounded-lg"
            >
              Начать чат
            </Link>
            <Link
              to="/explore"
              className="border-2 border-white/30 text-white px-8 py-4 text-lg font-semibold tracking-wider hover:bg-white/10 transition-colors rounded-lg"
            >
              Исследовать карту
            </Link>
          </div>
        </main>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <MapPinIcon size={24} className="text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{mockStats.totalPOIs.toLocaleString()}</p>
              <p className="text-sm text-white/60">Мест на карте</p>
            </Card>
            <Card className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <RouteIcon size={24} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{mockStats.totalRoutes}</p>
              <p className="text-sm text-white/60">Готовых маршрутов</p>
            </Card>
            <Card className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <ChurchIcon size={24} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{mockStats.totalCategories}</p>
              <p className="text-sm text-white/60">Категорий</p>
            </Card>
            <Card className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <UsersIcon size={24} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{mockStats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-white/60">Исследователей</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Places Section */}
      <section className="py-20 px-4 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Популярные места
              </h2>
              <p className="text-white/60">Самые интересные объекты по мнению наших пользователей</p>
            </div>
            <Link
              to="/explore"
              className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              Смотреть все
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPOIs.map((poi) => (
              <Link key={poi.id} to={`/poi/${poi.id}`}>
                <Card className="h-full hover:bg-white/15 transition-all hover:scale-[1.02] group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                      <CategoryIcon category={poi.subcategory || poi.category} size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 group-hover:text-amber-200 transition-colors">{poi.name}</h3>
                      <p className="text-sm text-white/60 line-clamp-2 mb-2">{poi.short_description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-white/10 text-white/70 rounded">{poi.category}</span>
                        {poi.year_built && <span className="text-white/50">{poi.year_built} г.</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              Смотреть все места
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Готовые маршруты
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Тематические маршруты для однодневных поездок. Просто выберите и отправляйтесь в путь.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRoutes.map((route) => (
              <PresetRouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Почему MapBot?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Мы создали инструмент для тех, кто ищет настоящие приключения, а не туристические маршруты.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                <MapPinIcon size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Точные координаты</h3>
              <p className="text-white/60 text-sm">
                Приведём вас прямо к объекту, даже если это ДОТ в глухом лесу или руины в поле.
              </p>
            </Card>
            <Card className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                <ChurchIcon size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Нишевые объекты</h3>
              <p className="text-white/60 text-sm">
                Только исторические места — без раскрученных достопримечательностей и толп туристов.
              </p>
            </Card>
            <Card className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <RouteIcon size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Готовые маршруты</h3>
              <p className="text-white/60 text-sm">
                Поездки на день с учётом вашего транспорта и интересов. Просто выбрать и ехать.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Отзывы исследователей
            </h2>
            <p className="text-white/60">Что говорят наши пользователи</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col">
                <Rating value={testimonial.rating} size="sm" className="mb-4" />
                <p className="text-white/80 text-sm leading-relaxed flex-1 mb-4">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-white/50 text-xs">{new Date(testimonial.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#111] to-[#0a0a0a] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готовы к приключению?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Начните исследовать прямо сейчас. Чат-бот поможет найти интересные места и построить маршрут.
          </p>
          <Link
            to="/chat"
            className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-black px-10 py-4 text-lg font-bold tracking-wider hover:from-amber-300 hover:to-amber-400 transition-all rounded-lg shadow-lg shadow-amber-500/20"
          >
            Начать путешествие
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">MapBot</h2>
              <p className="text-white/50 text-sm">Ваш проводник в историю</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to="/explore" className="text-white/70 hover:text-white transition-colors">Исследовать</Link>
              <Link to="/chat" className="text-white/70 hover:text-white transition-colors">Чат</Link>
              <Link to="/favorites" className="text-white/70 hover:text-white transition-colors">Избранное</Link>
              <Link to="/route" className="text-white/70 hover:text-white transition-colors">Маршрут</Link>
            </nav>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">© 2024 MapBot. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
