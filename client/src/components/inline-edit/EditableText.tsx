import React, { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean; // 全局編輯模式
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export function EditableText({
  value,
  onSave,
  isEditing,
  className = "",
  inputClassName = "",
  placeholder = "點擊編輯...",
  multiline = false,
  maxLength,
  as: Component = "span",
}: EditableTextProps) {
  const [isActive, setIsActive] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsActive(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // 非編輯模式：直接顯示文字
  if (!isEditing) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  // 編輯模式但未激活：顯示可點擊的文字
  if (!isActive) {
    return (
      <Component
        className={cn(
          className,
          "cursor-pointer relative group transition-all",
          "hover:bg-yellow-100/50 hover:outline hover:outline-2 hover:outline-yellow-400 hover:outline-dashed rounded"
        )}
        onClick={() => setIsActive(true)}
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
        <Pencil className="absolute -right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Component>
    );
  }

  // 編輯模式且激活：顯示輸入框
  return (
    <div className="inline-flex items-center gap-2 bg-yellow-50 rounded-lg p-1 border-2 border-yellow-400">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          maxLength={maxLength}
          className={cn(
            "bg-transparent border-none outline-none resize-none min-h-[60px] w-full",
            inputClassName
          )}
          placeholder={placeholder}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          maxLength={maxLength}
          className={cn(
            "bg-transparent border-none outline-none min-w-[100px]",
            inputClassName
          )}
          placeholder={placeholder}
        />
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          className="p-1 hover:bg-green-100 rounded text-green-600"
          title="儲存"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-red-100 rounded text-red-600"
          title="取消"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default EditableText;
