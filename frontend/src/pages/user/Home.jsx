import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import MenuCard from "../../components/MenuCard";
import CategoryCard from "../../components/CategoryCard";
import { CardSkeleton, CategorySkeleton } from "../../components/Skeletons";
import { ChevronRight, ArrowRight } from "lucide-react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
    title: "Delicious Food\nDelivered Fresh",
    subtitle: "Order your favorite meals from the best restaurants",
  },
  {
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
    title: "Hot Pizza\nFast Delivery",
    subtitle: "Get hot and fresh pizza delivered in 30 minutes",
  },
  {
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
    title: "Tasty Burgers\nCrispy Fries",
    subtitle: "The best burgers in town, made with premium ingredients",
  },
  {
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200",
    title: "Fresh Salads\nHealthy Living",
    subtitle: "Eat healthy, stay healthy with our fresh salads",
  },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          API.get("/categories"),
          API.get("/menus?available=true"),
        ]);
        setCategories(catRes.data.categories);
        setMenuItems(menuRes.data.menus);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getRowsOfItems = (items, perRow = 4) => {
    const rows = [];
    for (let i = 0; i < Math.min(items.length, 20); i += perRow) {
      rows.push(items.slice(i, i + perRow));
    }
    return rows;
  };

  return (
    <div>
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-6xl font-bold text-white whitespace-pre-line leading-tight mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-gray-200 mb-8">{slide.subtitle}</p>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3.5 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/30"
                  >
                    Order Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary-500 w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Popular Categories
            </h2>
            <p className="text-gray-500 mt-1">Browse our most popular food categories</p>
          </div>
          <Link
            to="/category"
            className="hidden sm:flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            More Categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center gap-8 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-8 overflow-x-auto pb-4 scrollbar-hide">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}

        <div className="sm:hidden text-center mt-6">
          <Link
            to="/category"
            className="inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700"
          >
            More Categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Our Menu
            </h2>
            <p className="text-gray-500 mt-1">Explore our delicious food items</p>
          </div>
          <Link
            to="/menu"
            className="hidden sm:flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {getRowsOfItems(menuItems, 4).map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {row.map((item) => (
                  <MenuCard key={item._id} item={item} />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
