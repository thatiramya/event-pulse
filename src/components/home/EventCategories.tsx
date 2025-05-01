
import { motion } from "framer-motion";
import GlassCard from "../ui-elements/GlassCard";
import { Music, Film, Theater, Mic, BookOpen, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Concert",
    icon: Music,
    color: "from-blue-400 to-purple-500",
  },
  {
    name: "Film",
    icon: Film,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Theater",
    icon: Theater,
    color: "from-pink-500 to-red-500",
  },
  {
    name: "Comedy",
    icon: Mic,
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Education",
    icon: BookOpen,
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Food & Drink",
    icon: Utensils,
    color: "from-amber-500 to-yellow-500",
  },
];

const EventCategories = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Browse by Category</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Discover events based on your interests and preferences.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={item}>
              <Link to={`/events?category=${category.name}`}>
                <GlassCard className="text-center h-full card-hover">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <category.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EventCategories;
