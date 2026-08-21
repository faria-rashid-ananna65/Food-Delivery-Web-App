import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/menu?category=${category._id}`}
      className="flex flex-col items-center gap-3 group"
    >
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <img
          src={category.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"}
          alt={category.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
          }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors text-center">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryCard;
