/**
 * CostExplanationSection Component
 * 費用說明區塊 - 顯示包含/不包含項目、額外費用、注意事項
 */

import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export interface CostExplanation {
  included?: string[];
  excluded?: string[];
  additionalCosts?: string[];
  notes?: string;
}

export interface CostExplanationSectionProps {
  costExplanation: CostExplanation;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const CostExplanationSection: React.FC<CostExplanationSectionProps> = ({
  costExplanation,
  colorTheme,
}) => {
  if (!costExplanation) {
    return null;
  }

  const { included = [], excluded = [], additionalCosts = [], notes } = costExplanation;

  return (
    <section id="cost" className="w-full py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
          style={{ color: colorTheme.primary }}
        >
          費用說明
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Included */}
          {included.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2
                  className="h-6 w-6"
                  style={{ color: colorTheme.accent }}
                />
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  費用包含
                </h3>
              </div>
              <ul className="space-y-3">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#10B981" }}
                    />
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Excluded */}
          {excluded.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <XCircle
                  className="h-6 w-6"
                  style={{ color: "#EF4444" }}
                />
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  費用不包含
                </h3>
              </div>
              <ul className="space-y-3">
                {excluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#EF4444" }}
                    />
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Additional Costs */}
        {additionalCosts.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle
                className="h-6 w-6"
                style={{ color: "#F59E0B" }}
              />
              <h3
                className="text-xl font-bold"
                style={{ color: colorTheme.primary }}
              >
                額外費用說明
              </h3>
            </div>
            <ul className="space-y-3">
              {additionalCosts.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    style={{ color: "#F59E0B" }}
                  />
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: colorTheme.accent + "10",
              borderLeft: `4px solid ${colorTheme.accent}`,
            }}
          >
            <div className="flex items-start gap-3">
              <Info
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: colorTheme.accent }}
              />
              <div>
                <h4
                  className="font-bold mb-2"
                  style={{ color: colorTheme.primary }}
                >
                  重要提醒
                </h4>
                <p className="text-gray-700 leading-relaxed">{notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
