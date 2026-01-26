interface MealSectionProps {
  title: string;
  description: string;
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  highlights: string[];
  details: Array<{
    day: number;
    meals: Array<{
      type: string;
      name: string;
      description: string;
      restaurant?: string;
      image?: string;
    }>;
  }>;
  notes: string[];
}

export default function LionMealSection({
  title,
  description,
  mealPlan,
  highlights,
  details,
  notes,
}: MealSectionProps) {
  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "breakfast":
        return "早餐";
      case "lunch":
        return "午餐";
      case "dinner":
        return "晚餐";
      default:
        return type;
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        {/* 標題區塊 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>

        {/* 餐食計劃概覽 */}
        {mealPlan && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-lion-primary mb-2">
                早餐
              </h3>
              <p className="text-gray-700">{mealPlan.breakfast}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-lion-primary mb-2">
                午餐
              </h3>
              <p className="text-gray-700">{mealPlan.lunch}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-lion-primary mb-2">
                晚餐
              </h3>
              <p className="text-gray-700">{mealPlan.dinner}</p>
            </div>
          </div>
        )}

        {/* 餐飲亮點 */}
        {highlights && highlights.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">餐飲亮點</h3>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-lion-primary font-bold">★</span>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 每日餐飲詳情 */}
        {details && details.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              每日餐飲安排
            </h3>
            <div className="space-y-6">
              {details.map((dayDetail) => (
                <div
                  key={dayDetail.day}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h4 className="text-lg font-bold text-lion-primary mb-4">
                    第 {dayDetail.day} 天
                  </h4>
                  <div className="space-y-4">
                    {dayDetail.meals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="border-l-4 border-lion-primary pl-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* 餐點圖片 */}
                          {meal.image && (
                            <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* 餐點資訊 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-bold text-lion-secondary bg-lion-secondary/10 px-3 py-1 rounded">
                                {getMealTypeLabel(meal.type)}
                              </span>
                              {meal.restaurant && (
                                <span className="text-sm text-gray-600">
                                  @ {meal.restaurant}
                                </span>
                              )}
                            </div>
                            <h5 className="text-lg font-bold text-gray-900 mb-2">
                              {meal.name}
                            </h5>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {meal.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 注意事項 */}
        {notes && notes.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              ⚠️ 注意事項
            </h3>
            <ul className="space-y-2">
              {notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
