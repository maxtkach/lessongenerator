import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Subject {
  _id: string;
  name: string;
  shortName: string;
  hoursPerWeek: number;
}

interface Props {
  id: string;
  subject: Subject;
  usedHours: number;
}

export function SortableItem({ id, subject, usedHours }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: id,
    data: subject,
    disabled: usedHours >= subject.hoursPerWeek
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  const getHoursColor = () => {
    if (usedHours >= subject.hoursPerWeek) return 'text-green-500 dark:text-green-400';
    if (usedHours > 0) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 
        ${usedHours >= subject.hoursPerWeek ? 'cursor-not-allowed opacity-70' : 'cursor-move hover:shadow-lg'} 
        transition-shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{subject.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subject.shortName}
          </p>
        </div>
        <div className={`text-lg font-bold ${getHoursColor()}`}>
          {usedHours}/{subject.hoursPerWeek}
        </div>
      </div>
    </div>
  );
} 