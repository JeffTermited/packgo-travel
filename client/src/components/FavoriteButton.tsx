import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocale } from "@/contexts/LocaleContext";

interface FavoriteButtonProps {
  tourId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  showText?: boolean;
}

export function FavoriteButton({
  tourId,
  className,
  size = "md",
  variant = "icon",
  showText = false,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();
  const utils = trpc.useUtils();

  // Get user's favorite IDs
  const { data: favoriteIds = [] } = trpc.favorites.getIds.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isFavorite = favoriteIds.includes(tourId);

  // Toggle favorite mutation
  const toggleMutation = trpc.favorites.toggle.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.favorites.getIds.cancel();
      const previousIds = utils.favorites.getIds.getData() || [];
      
      if (isFavorite) {
        utils.favorites.getIds.setData(undefined, previousIds.filter(id => id !== tourId));
      } else {
        utils.favorites.getIds.setData(undefined, [...previousIds, tourId]);
      }
      
      return { previousIds };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousIds) {
        utils.favorites.getIds.setData(undefined, context.previousIds);
      }
      toast.error(t('favorites.toggleFailed'), {
        description: error.message,
      });
    },
    onSuccess: (data) => {
      if (data.isFavorite) {
        toast.success(t('favorites.addedToFavorites'), {
          description: t('favorites.viewInProfile'),
        });
      } else {
        toast.success(t('favorites.removedFromFavorites'));
      }
    },
    onSettled: () => {
      utils.favorites.getIds.invalidate();
      utils.favorites.list.invalidate();
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error(t('favorites.loginRequired'), {
        description: t('favorites.loginToFavorite'),
        action: {
          label: t('favorites.goToLogin'),
          onClick: () => {
            window.location.href = getLoginUrl();
          },
        },
      });
      return;
    }

    toggleMutation.mutate({ tourId });
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200",
          isFavorite
            ? "bg-red-50 border-red-500 text-red-600 hover:bg-red-100"
            : "bg-white border-gray-300 text-gray-600 hover:border-black hover:text-black",
          toggleMutation.isPending && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all duration-200",
            isFavorite && "fill-red-500 text-red-500"
          )}
        />
        {showText && (
          <span className="font-medium text-sm">
            {isFavorite ? t('favorites.saved') : t('favorites.save')}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={cn(
        sizeClasses[size],
        "flex items-center justify-center rounded-full transition-all duration-200",
        "bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg",
        "hover:scale-110 active:scale-95",
        isFavorite
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-600 hover:text-red-500 hover:bg-white",
        toggleMutation.isPending && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isFavorite ? t('favorites.removeFavorite') : t('favorites.addFavorite')}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorite && "fill-red-500"
        )}
      />
    </button>
  );
}

export default FavoriteButton;
